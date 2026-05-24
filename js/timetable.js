/* =============================================================
   CCVC TIMETABLE  –  js/timetable.js
   Weekly session timetable for play.html.
   Edit TT_DEFAULT_SCHEDULE at the bottom to update sessions.
   ============================================================= */

let ttWeekOffset = 0;

/* ── Date helpers ────────────────────────────────────────── */
function ttGetWeekKey(date) { return date.toISOString().split('T')[0]; }

function ttGetWeekDates(offset) {
  const today  = new Date();
  const day    = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
  });
}

function ttFormatRange(dates) {
  const f = d => d.getDate() + '/' + (d.getMonth() + 1);
  return f(dates[0]) + ' – ' + f(dates[6]) + ', ' + dates[0].getFullYear();
}

/* ── Time helpers ────────────────────────────────────────── */
function ttTo24(time) {
  const [t, mod] = time.split(' ');
  let [h, m] = t.split(':').map(Number);
  if (mod === 'PM' && h !== 12) h += 12;
  if (mod === 'AM' && h === 12) h = 0;
  return h * 60 + (m || 0);
}

function ttFromMin(min) {
  let h = Math.floor(min / 60), m = min % 60;
  const mod = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12; if (h === 0) h = 12;
  return h + ':' + String(m).padStart(2, '0') + ' ' + mod;
}

/* ── Schedule helpers ────────────────────────────────────── */
function ttGetSchedule(date) {
  return TT_WEEKLY_SCHEDULES[ttGetWeekKey(date)] || TT_DEFAULT_SCHEDULE;
}

function ttIsEmpty(schedule) {
  return !schedule || !Object.values(schedule).some(d => d && d.length);
}

function ttGenSlots(schedule) {
  const set = new Set();
  Object.values(schedule).forEach(day => (day || []).forEach(s => {
    const st = ttTo24(s.time), en = ttTo24(s.endTime);
    for (let m = st; m < en; m += 30) set.add(m);
  }));
  return Array.from(set).sort((a,b) => a-b).map(m => ({ minutes: m, time: ttFromMin(m) }));
}

function ttSlotSpan(slots, start, end) {
  return slots.filter(s => s.minutes >= start && s.minutes < end).length;
}

function ttColor(s) {
  const n = s.session.toLowerCase();
  if (n.includes('women') || n.includes('beginner') || n.includes('scrim')) return 'session-color-1';
  return 'session-color-2';
}

/* ── Render ──────────────────────────────────────────────── */
function ttRender() {
  const weekDates = ttGetWeekDates(ttWeekOffset);
  const labelEl   = document.getElementById('weekDisplay') || document.getElementById('weekLabel');
  if (labelEl) labelEl.textContent = ttFormatRange(weekDates);

  const schedule   = ttGetSchedule(weekDates[0]);
  const tbody      = document.getElementById('timetableBody');
  const eventLayer = document.getElementById('eventLayer');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (eventLayer) eventLayer.innerHTML = '';

  if (ttIsEmpty(schedule)) {
    tbody.innerHTML = `<tr><td colspan="8" style="padding:60px 20px;text-align:center;">
      <div style="font-size:36px;margin-bottom:12px;">📅</div>
      <h4 style="color:#333;margin-bottom:8px;">No sessions scheduled this week</h4>
      <p style="color:#777;">Check back later or <a href="contact.html" style="color:var(--blue)">contact us</a>.</p>
    </td></tr>`;
    return;
  }

  const DAYS  = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const slots = ttGenSlots(schedule);

  /* Grid rows */
  slots.forEach(() => {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td class="time-slot-cell"></td>' + DAYS.map(() => '<td class="time-slot-cell"></td>').join('');
    tbody.appendChild(tr);
  });
  Array.from(tbody.querySelectorAll('tr')).forEach((tr, i) => {
    tr.cells[0].textContent = slots[i].time;
    tr.cells[0].className   = 'time-cell';
  });

  if (eventLayer) setTimeout(() => ttRenderEvents(schedule, DAYS, slots, weekDates, eventLayer, tbody), 0);
}

function ttRenderEvents(schedule, days, slots, weekDates, layer, tbody) {
  const rows       = tbody.querySelectorAll('tr');
  const rowH       = rows[0] ? rows[0].offsetHeight : 64;
  const tableTop   = tbody.getBoundingClientRect().top - layer.getBoundingClientRect().top;
  const headerCells = document.querySelectorAll('.timetable-grid thead th');

  days.forEach((day, di) => {
    const daySessions = schedule[day] || [];
    const dateStr     = weekDates[di].getDate() + '/' + (weekDates[di].getMonth() + 1);
    const hCell       = headerCells[di + 1];
    if (!hCell) return;

    const colLeft  = hCell.offsetLeft;
    const colWidth = hCell.offsetWidth;

    /* Overlap map */
    const overlaps = new Map();
    daySessions.forEach(s => {
      const sMin = ttTo24(s.time), eMin = ttTo24(s.endTime);
      slots.forEach((slot, si) => {
        if (slot.minutes >= sMin && slot.minutes < eMin) {
          if (!overlaps.has(si)) overlaps.set(si, []);
          const arr = overlaps.get(si);
          if (!arr.find(x => x.time === s.time)) arr.push(s);
        }
      });
    });

    daySessions.forEach(s => {
      const sMin = ttTo24(s.time), eMin = ttTo24(s.endTime);
      const si   = slots.findIndex(sl => sl.minutes === sMin);
      if (si === -1) return;

      const span       = ttSlotSpan(slots, sMin, eMin);
      const overlapping = overlaps.get(si) || [];
      const isOverlap   = overlapping.length > 1;
      const top  = tableTop + si * rowH;
      const h    = span * rowH;

      const block = document.createElement('div');
      block.className = 'session-block ' + ttColor(s);
      block.style.cssText = `position:absolute;top:${top}px;left:${colLeft+2}px;width:${colWidth-4}px;height:${h}px;`;

      if (isOverlap) {
        const oi        = overlapping.findIndex(x => x.time === s.time);
        const n         = overlapping.length;
        const overlapEnd = Math.min(...overlapping.map(x => ttTo24(x.endTime)));
        const oSpan     = ttSlotSpan(slots, sMin, overlapEnd);
        const oH        = oSpan * rowH;
        const splitW    = (colWidth - 4) / n;

        block.classList.remove(ttColor(s));
        const wrapper  = document.createElement('div');
        wrapper.className = 'session-block-wrapper';

        const top1 = document.createElement('div');
        top1.className = 'session-block-part ' + ttColor(s);
        top1.style.cssText = `position:absolute;top:0;left:${oi*splitW}px;width:${splitW}px;height:${oH+rowH}px;`;

        const bot = document.createElement('div');
        bot.className = 'session-block-part ' + ttColor(s);
        bot.style.cssText = `position:absolute;top:${oH}px;left:0;width:100%;height:${h-oH}px;`;
        bot.innerHTML = `<div class="session-info"><strong>${s.session}</strong><span class="time-range">${s.time} – ${s.endTime}</span><span class="location-label">${s.location}</span><span class="date-label">${dateStr}</span></div>`;

        wrapper.appendChild(top1);
        wrapper.appendChild(bot);
        block.appendChild(wrapper);
      } else {
        block.innerHTML = `<div class="session-info"><strong>${s.session}</strong><span class="time-range">${s.time} – ${s.endTime}</span><span class="location-label">${s.location}</span><span class="date-label">${dateStr}</span></div>`;
      }

      block.addEventListener('click', () => {
        window.location.href = 'play.html' + s.link;
        const t = document.querySelector(s.link);
        if (t) t.classList.add('active');
      });
      layer.appendChild(block);
    });
  });
}

/* ── Navigation ──────────────────────────────────────────── */
function ttUpdateNav() {
  const prev = document.getElementById('prevWeek');
  if (prev) { prev.disabled = ttWeekOffset <= 0; prev.classList.toggle('disabled', ttWeekOffset <= 0); }
}

document.addEventListener('DOMContentLoaded', () => {
  const prev = document.getElementById('prevWeek');
  const next = document.getElementById('nextWeek');
  if (prev) prev.addEventListener('click', () => { if (ttWeekOffset > 0) { ttWeekOffset--; ttRender(); ttUpdateNav(); } });
  if (next) next.addEventListener('click', () => { ttWeekOffset++; ttRender(); ttUpdateNav(); });

  window.addEventListener('resize', () => {
    const layer = document.getElementById('eventLayer');
    const tbody = document.getElementById('timetableBody');
    if (!layer || !tbody) return;
    layer.innerHTML = '';
    const schedule  = ttGetSchedule(ttGetWeekDates(ttWeekOffset)[0]);
    const DAYS      = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const slots     = ttGenSlots(schedule);
    const weekDates = ttGetWeekDates(ttWeekOffset);
    ttRenderEvents(schedule, DAYS, slots, weekDates, layer, tbody);
  });

  ttRender();
  ttUpdateNav();
});



/* ── DATA  ── edit sessions here ────────────────────────── */
const TT_DEFAULT_SCHEDULE = {
  monday: [
    { time: '5:30 PM', endTime: '8:00 PM',  session: 'Womens & Girls Reps', location: 'Niagara Park Stadium', link: '#womens' },
    { time: '7:30 PM', endTime: '10:00 PM', session: 'Mens & Boys Reps',    location: 'Niagara Park Stadium', link: '#mens'   }
  ],
  thursday: [
    { time: '5:30 PM', endTime: '7:00 PM',  session: 'Beginner Training',   location: 'Niagara Park Stadium', link: '#beginner' },
    { time: '7:00 PM', endTime: '10:00 PM', session: 'ABC Grade Training',  location: 'Niagara Park Stadium', link: '#abc'      }
  ],
  friday: [
    { time: '7:00 PM', endTime: '9:00 PM',  session: 'Scrim Games',         location: 'Niagara Park Stadium', link: '#scrimmage' }
  ],
  sunday: [
    { time: '5:00 PM', endTime: '9:00 PM',  session: 'Social Comp',         location: 'Terrigal Stadium',     link: '#social' }
  ]
};

/* Add date-specific week overrides here, e.g.:
   const TT_WEEKLY_SCHEDULES = { '2026-06-01': { thursday: [...] } }; */
const TT_WEEKLY_SCHEDULES = {};