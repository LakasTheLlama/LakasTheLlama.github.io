let allData = [];
let currentWeekOffset = 0;

Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-3DKvDXHoK-BU_Xwh8ibQStF-8qPcS-xE5ioUaaikpSp99tEBNVMMDlvFdVKInzKhFTPR4vW6jpC6/pub?gid=0&single=true&output=csv",
    {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const rows = results.data;

            rows.forEach(row => {
                // Normalise keys — trim whitespace
                const trimmed = Object.fromEntries(
                    Object.entries(row).map(([k, v]) => [k.trim(), v.trim()])
                );

                const rawDate = trimmed["Date"] || "";
                const time    = trimmed["Time"] || "";
                const court1  = trimmed["Court 1 (near entrance)"] || trimmed["Court 1"] || "";
                const court2  = trimmed["Court 2"] || "";
                const court3  = trimmed["Court 3"] || "";

                // Parse d/m/yy or d/m/yyyy
                const parsedDate = parseDate(rawDate);

                if (parsedDate) {
                    allData.push({
                        date: parsedDate,
                        slots: [{ time, court1, court2, court3 }]
                    });
                } else if (allData.length > 0 && time) {
                    // Continuation row — belongs to the last date
                    allData.at(-1).slots.push({ time, court1, court2, court3 });
                }
            });

            // After allData is populated, before renderTimetable()
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find the first date that is today or in the future
            currentWeekOffset = allData.findIndex(week => week.date >= today);

            // If no future dates found, default to last entry
            if (currentWeekOffset === -1) currentWeekOffset = allData.length - 1;

            renderTimetable();
            updateNavigationButtons();
        },
        error: function (err) {
            console.error("CSV fetch failed:", err);
        }
    }
);

// Handles d/m/yy and d/m/yyyy
function parseDate(str) {
    if (!str) return null;
    const parts = str.split("/");
    if (parts.length !== 3) return null;

    let [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    // 2-digit year: assume 2000s
    if (year < 100) year += 2000;

    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
}

// =====================
// Match Card Parser
// =====================
function parseMatch(text) {
    if (!text) return null;
    // Matches: "Team1 v Team2 duty DutyTeam" (case-insensitive)
    const match = text.match(/^(.+?)\s+v\s+(.+?)\s+duty\s+(.+)$/i);
    if (!match) return null;
    return {
        team1: match[1].trim(),
        team2: match[2].trim(),
        duty: match[3].trim()
    };
}

function renderMatchCard(text) {
    const parsed = parseMatch(text);
    if (!parsed) return `<span class="unparsed-match">${text}</span>`;

    return `
        <div class="match-card">
            <div class="match-teams">
                <div class="team team1">${parsed.team1}</div>
                <div class="team team2">${parsed.team2}</div>
            </div>
            <div class="duty-bar">
                <span class="duty-label"></span> ${parsed.duty}
            </div>
        </div>
    `;
}


// =====================
// Render
// =====================
function renderTimetable() {
    const tbody = document.querySelector("#schedule tbody");
    tbody.innerHTML = "";

    if (allData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #999;">No schedule available</td></tr>`;
        return;
    }

    const week = allData[currentWeekOffset];

    document.getElementById("dateTitle").textContent = week.date.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    week.slots.forEach(slot => {
        const tr = document.createElement("tr");

        const timeCell = document.createElement("td");
        timeCell.textContent = slot.time;
        timeCell.classList.add("time-column");
        tr.appendChild(timeCell);

        [slot.court1, slot.court2, slot.court3].forEach(text => {
            const td = document.createElement("td");
            td.innerHTML = renderMatchCard(text);
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

// =====================
// Navigation
// =====================
function updateNavigationButtons() {
    $('#prevWeek').prop('disabled', currentWeekOffset <= 0);
    $('#nextWeek').prop('disabled', currentWeekOffset >= allData.length - 1);
}

$('#prevWeek').click(() => {
    if (currentWeekOffset > 0) {
        currentWeekOffset--;
        renderTimetable();
        updateNavigationButtons();
    }
});

$('#nextWeek').click(() => {
    if (currentWeekOffset < allData.length - 1) {
        currentWeekOffset++;
        renderTimetable();
        updateNavigationButtons();
    }
});