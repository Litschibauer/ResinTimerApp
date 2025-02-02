const DEBUG = false;
const RESIN_LIMIT = 200;
const RECHARGE_INTERVAL = 8; //minutes
let icsContent = ""; // Global variable to store the ICS content

// Update HTML
document.querySelector("#resin").setAttribute("max", RESIN_LIMIT);
document.querySelector("#basic-addon1").innerHTML = `Aktuelles Harz (0 - ${RESIN_LIMIT})`;

// Main
document.querySelector("#resin").focus();
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

    // Set locale to German and format the date
    zurich_time.locale('de'); // Set moment.js to German locale
    document.querySelector("#refill_date").innerHTML = zurich_time.format("DD. MMMM YYYY, HH:mm:ss");
    document.title = cur_res + " Resin | " + H_cur + "h " + M_cur + "m " + " left";

    let titles = document.getElementsByClassName("title_top");
    for (let i = 0; i < titles.length; i++) {
        titles[i].style.visibility = "visible";
    }

    generateICSContent(zurich_time); // Generate ICS content
}

function generateICSContent(refill_time) {
    const formattedStart = refill_time.format("YYYYMMDDTHHmmss");
    const formattedEnd = refill_time.add(1, 'minutes').format("YYYYMMDDTHHmmss");

    icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Resin Full
DESCRIPTION:Your resin in Genshin Impact will be fully refilled.
DTSTART:${formattedStart}
DTEND:${formattedEnd}
LOCATION:Zurich
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

function downloadICS() {
    if (icsContent === "") {
        alert("Bitte berechne zuerst das Harz und versuche es erneut."); // Alert if ICS content is not generated yet
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

// Loop
var refresh;
function calculateInit() {
    let resin_obj = document.querySelector("#resin");
    const resin = resin_obj.value;
    if (resin < 0 || resin > RESIN_LIMIT || resin == "") return;

    clearInterval(refresh);
    const start_time = new Date();
    calculate(resin, start_time);
    refresh = setInterval(function () { calculate(resin, start_time) }, 1000);
    resin_obj.value = "";
}

// On enter key press 
document.querySelector("#resin").onkeypress = function (e) {
    if (e.keyCode == 13) {
        calculateInit();
    }
}
