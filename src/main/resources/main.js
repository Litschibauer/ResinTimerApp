const DEBUG = false;
const RESIN_LIMIT = 200;
const RECHARGE_INTERVAL = 8; // Minuten
let icsContent = ""; // Globale Variable f?r den ICS-Inhalt

// Variablen f?r Sprachumschaltung
let currentLanguage = "de"; // Standardsprache
let langData = {};

// Funktion zum Laden der Sprachdatei
function setLanguage() {
    currentLanguage = document.getElementById('language_selector').value;
    fetch('lang/' + currentLanguage + '.json')
        .then(response => response.json())
        .then(data => {
            langData = data;
            updateUIText();
        })
        .catch(error => console.error('Fehler beim Laden der Sprachdatei:', error));
}

// Aktualisiert statische Texte der Benutzeroberfl?che
function updateUIText() {
    document.title = langData.page_title || document.title;
    document.getElementById("basic-addon1").innerText =
        (langData.resin_input_label || "Aktuelles Harz (0 - 200)").replace("200", RESIN_LIMIT);
    document.getElementById("resin_button").innerText = langData.calculate_button || "Berechnen";

    let titles = document.getElementsByClassName("title_top");
    if (titles.length >= 3) {
        titles[0].innerText = langData.current_resin_title || "Aktuelles Harz";
        titles[1].innerText = langData.refill_time_title || "Vollst?ndig aufgef?llt in";
        titles[2].innerText = langData.refill_date_title || "um";
    }
    document.getElementById("download_button").innerText = langData.download_button || "Download Reminder";
}

// Sprachdatei beim Laden der Seite initial laden
document.addEventListener("DOMContentLoaded", function() {
    setLanguage();
});

// Setzt den Maximalwert f?r das Harz-Feld
document.querySelector("#resin").setAttribute("max", RESIN_LIMIT);
document.querySelector("#basic-addon1").innerHTML = `Aktuelles Harz (0 - ${RESIN_LIMIT})`;

// Fokus auf das Eingabefeld setzen
document.querySelector("#resin").focus();

// Hauptfunktion: Berechnung
function calculate(resin, start_time) {
    const time_diff = parseInt(Math.abs(new Date().getTime() - start_time.getTime()) / 1000);
    const minutes_to_refill = (RESIN_LIMIT - resin) * RECHARGE_INTERVAL;

    const H_start = parseInt(minutes_to_refill / 60);
    const M_start = parseInt(minutes_to_refill % 60);
    const cur_res = parseInt(time_diff / (60 * RECHARGE_INTERVAL) + parseInt(resin));
    const H_cur = parseInt((minutes_to_refill - time_diff / 60) / 60);
    const M_cur = parseInt((minutes_to_refill - time_diff / 60) % 60);
    const S_cur = (cur_res < RESIN_LIMIT ? parseInt((minutes_to_refill * 60 - time_diff) % 60) : 0);

    if (DEBUG) console.log({ minutes_to_refill }, { time_diff });
    if (H_start < 0 || M_start < 0 || H_cur < 0 || M_cur < 0 || cur_res > RESIN_LIMIT) return;

    document.querySelector("#current_resin").innerHTML = cur_res;
    document.querySelector("#refill_time").innerHTML = H_cur + "h " + M_cur + "m " + S_cur + "s";

    const zurich_time = moment.tz(start_time, "Europe/Zurich").add(H_start, "hours").add(M_start, "minutes");

    // Setze das Moment.js-Locale basierend auf der gew?hlten Sprache
    if (currentLanguage === "de") {
        zurich_time.locale('de');
    } else {
        zurich_time.locale('en');
    }
    document.querySelector("#refill_date").innerHTML = zurich_time.format("DD. MMMM YYYY, HH:mm:ss");
    document.title = cur_res + " Resin | " + H_cur + "h " + M_cur + "m " + " left";

    let titles = document.getElementsByClassName("title_top");
    for (let i = 0; i < titles.length; i++) {
        titles[i].style.visibility = "visible";
    }

    generateICSContent(zurich_time);
}

// ICS-Inhalt generieren
function generateICSContent(refill_time) {
    const formattedStart = refill_time.format("YYYYMMDDTHHmmss");
    const formattedEnd = refill_time.clone().add(1, 'minutes').format("YYYYMMDDTHHmmss");

    icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${langData.resin_full_summary || "Resin Full"}
DESCRIPTION:${langData.resin_full_description || "Your resin in Genshin Impact will be fully refilled."}
DTSTART:${formattedStart}
DTEND:${formattedEnd}
LOCATION:${langData.location || "Zurich"}
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:${langData.reminder || "Reminder"}
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

// ICS-Datei herunterladen
function downloadICS() {
    if (icsContent === "") {
        alert(langData.alert_no_calculation || "Bitte berechne zuerst das Harz und versuche es erneut.");
        return;
    }

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Resin_Full_Reminder.ics';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Schleife zur fortlaufenden Berechnung
var refresh;
function calculateInit() {
    let resin_obj = document.querySelector("#resin");
    const resin = resin_obj.value;
    if (resin < 0 || resin > RESIN_LIMIT || resin === "") return;

    clearInterval(refresh);
    const start_time = new Date();
    calculate(resin, start_time);
    refresh = setInterval(function () { calculate(resin, start_time) }, 1000);
    resin_obj.value = "";
}

// Berechnung per Enter-Taste ausl?sen
document.querySelector("#resin").onkeypress = function (e) {
    if (e.keyCode === 13) {
        calculateInit();
    }
}
