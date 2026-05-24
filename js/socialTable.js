/* =============================================================
   CCVC SOCIAL TABLE  –  js/socialTable.js
   Loads the social comp schedule from a published Google Sheet
   CSV and renders it as a match-card timetable on index.html.
   Preserves original PapaParse logic, cleaned and namespaced.
   ============================================================= */

/* ─────────────────────────────────────────
   CONFIG  – update the CSV URL here only
───────────────────────────────────────── */
const SOCIAL_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vQ-3DKvDXHoK-BU_Xwh8ibQStF-8qPcS-xE5ioUaaikpSp99tEBNVMMDlvFdVKInzKhFTPR4vW6jpC6' +
  '/pub?gid=0&single=true&output=csv';

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
let stAllData          = [];
let stCurrentWeekIndex = 0;

/* ─────────────────────────────────────────
   DATE PARSER  d/m/yy or d/m/yyyy
───────────────────────────────────────── */
function stParseDate(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  let [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? null : d;
}

/* ─────────────────────────────────────────
   MATCH CARD PARSER
   Expects: "Team1 v Team2 duty DutyTeam"
───────────────────────────────────────── */
function stParseMatch(text) {
  if (!text) return null;
  const m = text.match(/^(.+?)\s+v\s+(.+?)\s+duty\s+(.+)$/i);
  if (!m) return null;
  return { team1: m[1].trim(), team2: m[2].trim(), duty: m[3].trim() };
}

function stRenderMatchCard(text) {
  const parsed = stParseMatch(text);
  if (!parsed) {
    return text ? `<span class="st-unparsed">${text}</span>` : '';
  }
  return `
    <div class="match-card">
      <div class="match-teams">
        <div class="team team1">${parsed.team1}</div>
        <div class="team team2">${parsed.team2}</div>
      </div>
      <div class="duty-bar">${parsed.duty}</div>
    </div>`;
}

/* ─────────────────────────────────────────
   RENDER TIMETABLE
───────────────────────────────────────── */
function stRender() {
  const tbody   = document.querySelector('#schedule tbody');
  const titleEl = document.getElementById('dateTitle');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!stAllData.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;color:#999;">No schedule available.</td></tr>`;
    return;
  }

  const week = stAllData[stCurrentWeekIndex];
  if (titleEl) {
    titleEl.textContent = week.date.toLocaleDateString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  week.slots.forEach(slot => {
    const tr = document.createElement('tr');
    const timeCell = document.createElement('td');
    timeCell.textContent = slot.time;
    timeCell.className   = 'time-column';
    tr.appendChild(timeCell);

    [slot.court1, slot.court2, slot.court3].forEach(text => {
      const td   = document.createElement('td');
      td.innerHTML = stRenderMatchCard(text);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

/* ─────────────────────────────────────────
   NAVIGATION BUTTONS
───────────────────────────────────────── */
function stUpdateNav() {
  const prev = document.getElementById('prevWeek');
  const next = document.getElementById('nextWeek');
  if (prev) prev.disabled = stCurrentWeekIndex <= 0;
  if (next) next.disabled = stCurrentWeekIndex >= stAllData.length - 1;
}

/* ─────────────────────────────────────────
   INIT – fetch CSV + wire buttons
───────────────────────────────────────── */
function stInit() {
  const scheduleEl = document.getElementById('schedule');
  if (!scheduleEl) return; /* not on a page that uses this */

  /* Bind nav buttons */
  const prev = document.getElementById('prevWeek');
  const next = document.getElementById('nextWeek');
  if (prev) prev.addEventListener('click', () => {
    if (stCurrentWeekIndex > 0) { stCurrentWeekIndex--; stRender(); stUpdateNav(); }
  });
  if (next) next.addEventListener('click', () => {
    if (stCurrentWeekIndex < stAllData.length - 1) { stCurrentWeekIndex++; stRender(); stUpdateNav(); }
  });

  /* Show loading state */
  const tbody = scheduleEl.querySelector('tbody');
  if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;color:#999;">Loading schedule…</td></tr>`;

  /* Fetch CSV */
  if (typeof Papa === 'undefined') {
    console.warn('PapaParse not loaded – social table cannot fetch CSV.');
    return;
  }

  Papa.parse(SOCIAL_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete(results) {
      stAllData = [];

      results.data.forEach(row => {
        const r = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k.trim(), (v || '').trim()])
        );

        const rawDate = r['Date'] || '';
        const time    = r['Time'] || '';
        const court1  = r['Court 1 (near entrance)'] || r['Court 1'] || '';
        const court2  = r['Court 2'] || '';
        const court3  = r['Court 3'] || '';

        const date = stParseDate(rawDate);

        if (date) {
          stAllData.push({ date, slots: [{ time, court1, court2, court3 }] });
        } else if (stAllData.length && time) {
          stAllData.at(-1).slots.push({ time, court1, court2, court3 });
        }
      });

      /* Jump to current / next date */
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const idx   = stAllData.findIndex(w => w.date >= today);
      stCurrentWeekIndex = idx === -1 ? Math.max(0, stAllData.length - 1) : idx;

      stRender();
      stUpdateNav();
    },
    error(err) {
      console.error('CSV fetch failed:', err);
      const tb = scheduleEl.querySelector('tbody');
      if (tb) tb.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;color:#999;">Could not load schedule.</td></tr>`;
    }
  });
}

/* Boot after DOM ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', stInit);
} else {
  stInit();
}