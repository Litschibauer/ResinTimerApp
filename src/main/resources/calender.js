/* calendar.js */

function generateICSContent(refill_time) {
    const formattedStart = refill_time.format("YYYYMMDDTHHmmss");
    const formattedEnd = refill_time.clone().add(1, 'minutes').format("YYYYMMDDTHHmmss");

    return `BEGIN:VCALENDAR
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

function downloadICSFile(icsContent) {
    if (icsContent === "") {
        alert("Bitte berechne zuerst das Harz und versuche es erneut.");
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
