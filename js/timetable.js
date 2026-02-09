// =====================
// State
// =====================
let currentWeekOffset = 0;
const SLOT_HEIGHT = 64; // must match .time-slot-cell height in CSS

// =====================
// Date helpers
// =====================
function getWeekKey(date) {
    return date.toISOString().split('T')[0];
}

function getWeekDates(offset) {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setDate(monday.getDate() + offset * 7);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function formatDateRange(dates) {
    return `${dates[0].getDate()}/${dates[0].getMonth() + 1} - ${dates[6].getDate()}/${dates[6].getMonth() + 1}, ${dates[0].getFullYear()}`;
}

// =====================
// Time helpers
// =====================
function convertTo24Hour(time) {
    const [t, mod] = time.split(' ');
    let [h, m] = t.split(':').map(Number);
    if (mod === 'PM' && h !== 12) h += 12;
    if (mod === 'AM' && h === 12) h = 0;
    return h * 60 + (m || 0);
}

function convertFromMinutes(min) {
    let h = Math.floor(min / 60);
    const m = min % 60;
    const mod = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${String(m).padStart(2, '0')} ${mod}`;
}

// =====================
// Schedule helpers
// =====================
function repeatScheduleForWeeks(startDate, weeks, schedule) {
    const out = {};
    const start = new Date(startDate);
    for (let i = 0; i < weeks; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i * 7);
        out[getWeekKey(d)] = schedule;
    }
    return out;
}

function getScheduleForWeek(date) {
    return weeklySchedules[getWeekKey(date)] || defaultSchedule;
}

function isScheduleEmpty(schedule) {
    return !schedule || !Object.values(schedule).some(d => d && d.length);
}

// =====================
// Time slot generation
// =====================
function generateTimeSlots(schedule) {
    const set = new Set();

    Object.values(schedule).forEach(day => {
        (day || []).forEach(c => {
            const s = convertTo24Hour(c.time);
            const e = convertTo24Hour(c.endTime);
            for (let m = s; m < e; m += 30) set.add(m);
        });
    });

    return Array.from(set)
        .sort((a, b) => a - b)
        .map(m => ({ minutes: m, time: convertFromMinutes(m) }));
}

function getSlotSpan(slots, start, end) {
    let count = 0;
    for (const s of slots) {
        if (s.minutes >= start && s.minutes < end) count++;
    }
    return count;
}

// =====================
// Rendering helpers
// =====================
function getClassType(cls) {
    const name = cls.session.toLowerCase();
    if (name.includes('women')) return 'session-color-1';
    if (name.includes('men')) return 'session-color-2';
    if (name.includes('beginner')) return 'session-color-1';
    if (name.includes('abc')) return 'session-color-2';
    if (name.includes('scrim')) return 'session-color-1';
    if (name.includes('social')) return 'session-color-2';
    
    return 'other';
}

// =====================
// Render timetable
// =====================
function renderTimetable() {
    const weekDates = getWeekDates(currentWeekOffset);
    $('#weekDisplay').text(formatDateRange(weekDates));

    const schedule = getScheduleForWeek(weekDates[0]);
    const tbody = $('#timetableBody').empty();
    const eventLayer = $('#eventLayer').empty();

    if (isScheduleEmpty(schedule)) {
        tbody.append(`
            <tr>
                <td colspan="8" class="empty-schedule">
                    <div class="empty-schedule-message">
                        <div class="empty-calendar-icon">📅</div>
                        <h4>No sessions scheduled</h4>
                        <p>There are currently no sessions scheduled for this week.</p>
                        <p>Check back later or contact us for more information.</p>
                    </div>
                </td>
            </tr>
        `);
        return;
    }

    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const slots = generateTimeSlots(schedule);

    // Step 1: Render the grid (just empty cells)
    slots.forEach(slot => {
        const row = $('<tr>');
        row.append(`<td class="time-cell">${slot.time}</td>`);

        days.forEach(() => {
            row.append('<td class="time-slot-cell"></td>');
        });

        tbody.append(row);
    });

    // Step 2: Calculate positions and render event blocks
    // Wait for DOM to update so we can measure cell positions
    setTimeout(() => {
        renderEventLayer(schedule, days, slots, weekDates);
    }, 0);
}

function renderEventLayer(schedule, days, slots, weekDates) {
    const eventLayer = $('#eventLayer');
    const tbody = $('#timetableBody');
    const firstRow = tbody.find('tr').first();
    
    if (firstRow.length === 0) return;

    const rowHeight = firstRow.outerHeight();
    const tableTop = tbody.position().top;

    days.forEach((day, dayIndex) => {
        const daysessiones = schedule[day] || [];
        const dateStr = weekDates[dayIndex].getDate() + '/' + (weekDates[dayIndex].getMonth() + 1);
        
        // Get the column position
        const headerCell = $('thead th').eq(dayIndex + 1);
        const colLeft = headerCell.position().left;
        const colWidth = headerCell.outerWidth();

        // Track which sessiones overlap at each time slot
        const overlaps = new Map();
        
        daysessiones.forEach(cls => {
            const startMin = convertTo24Hour(cls.time);
            const endMin = convertTo24Hour(cls.endTime);
            
            slots.forEach((slot, slotIndex) => {
                if (slot.minutes >= startMin && slot.minutes < endMin) {
                    if (!overlaps.has(slotIndex)) {
                        overlaps.set(slotIndex, []);
                    }
                    const existing = overlaps.get(slotIndex);
                    if (!existing.find(c => c.time === cls.time)) {
                        existing.push(cls);
                    }
                }
            });
        });

        // Render each session
        daysessiones.forEach((cls, sessionIndex) => {
            const startMin = convertTo24Hour(cls.time);
            const endMin = convertTo24Hour(cls.endTime);
            
            const startSlotIndex = slots.findIndex(s => s.minutes === startMin);
            if (startSlotIndex === -1) return;

            const spanSlots = getSlotSpan(slots, startMin, endMin);
            
            // Check for overlaps at start time
            const overlappingsessiones = overlaps.get(startSlotIndex) || [];
            const isOverlapping = overlappingsessiones.length > 1;
            
            
            // Calculate base position and size
            const blockTop = tableTop + (startSlotIndex * rowHeight);
            const blockHeight = spanSlots * rowHeight;
            const blockLeft = colLeft + 2;
            const blockWidth = colWidth - 4;
            
            // Create the main container block
            const block = $(`
                <div class="session-block ${getClassType(cls)}" 
                     style="position: absolute; 
                            top: ${blockTop}px; 
                            left: ${blockLeft}px; 
                            width: ${blockWidth}px; 
                            height: ${blockHeight}px;">
                </div>
            `);
            
            // If overlapping, create L-shape
            if (isOverlapping) {
                const sessionIndexInOverlap = overlappingsessiones.findIndex(c => c.time === cls.time);
                const numOverlapping = overlappingsessiones.length;
                
                // Calculate overlap duration
                const overlapEndMin = Math.min(...overlappingsessiones.map(c => convertTo24Hour(c.endTime)));
                const overlapSlots = getSlotSpan(slots, startMin, overlapEndMin);
                const overlapHeight = overlapSlots * rowHeight;
                
                // Calculate dimensions for split section (horizontal top part of L)
                const splitWidth = blockWidth / numOverlapping;
                const splitLeft = sessionIndexInOverlap * splitWidth;
                
                // Non-overlap height (vertical part of L)
                const fullWidthTop = overlapHeight;
                const fullWidthHeight = blockHeight - overlapHeight;
                
                // Create the overlap section (top horizontal bar of L - narrow)

                const wrapper = $(`
                    <div class="session-block-wrapper">
                    </div>
                `);

                const overlapSection = $(`
                    <div class="session-block-part ${getClassType(cls)}" 
                         style="position: absolute; 
                                top: 0; 
                                left: ${splitLeft}px; 
                                width: ${splitWidth}px; 
                                height: ${overlapHeight + rowHeight}px;">
                    </div>
                `);
                
                // Create the non-overlap section (bottom vertical bar of L - full width)
                const fullSection = $(`
                    <div class="session-block-part ${getClassType(cls)}" 
                         style="position: absolute; 
                                top: ${fullWidthTop}px; 
                                left: 0; 
                                width: 100%; 
                                height: ${fullWidthHeight}px;">
                        <div class="session-info">
                            <strong>${cls.session}</strong>
                            <span class="time-range">${cls.time} - ${cls.endTime}</span>
                            <span class="location-label">${cls.location}</span>
                            <span class="date-label">${dateStr}</span>
                        </div>
                    </div>
                `);

                block.removeClass(getClassType(cls));
                
                wrapper.append(overlapSection);
                wrapper.append(fullSection);
                block.append(wrapper);
            } else {
                // No overlap - just add info directly to block
                block.append(`
                    <div class="session-info">
                        <strong>${cls.session}</strong>
                        <span class="time-range">${cls.time} - ${cls.endTime}</span>
                        <span class="location-label">${cls.location}</span>
                        <span class="date-label">${dateStr}</span>
                    </div>
                `);
            }
            
            block.data('cls', cls);
            block.data('dayIndex', dayIndex);
            block.click(() => window.location.href = cls.link);
            
            eventLayer.append(block);
        });

    });
}

// =====================
// Navigation
// =====================
$('#prevWeek').click(() => {
    currentWeekOffset--;
    renderTimetable();
    updateNavigationButtons();
});

$('#nextWeek').click(() => {
    currentWeekOffset++;
    renderTimetable();
    updateNavigationButtons();
});

function updateNavigationButtons() {
    $('#prevWeek').prop('disabled', currentWeekOffset <= 0);
    if (currentWeekOffset <= 0) {
        $('#prevWeek').addClass('disabled');
    } else {
        $('#prevWeek').removeClass('disabled');
    }
}

// =====================
// Data
// =====================
const defaultSchedule = {
    monday: [
        { time: '5:30 PM', endTime: '8:00 PM', session: 'Womens & Girls Reps', location: 'Niagara Park Stadium', link: '#womens' },
        { time: '7:30 PM', endTime: '10:00 PM', session: 'Mens & Boys Reps', location: 'Niagara Park Stadium', link: '#mens' }
    ],
    thursday: [
        { time: '5:30 PM', endTime: '7:00 PM', session: 'Beginner Training', location: 'Niagara Park Stadium', link: '#beginner' },
        { time: '7:00 PM', endTime: '10:00 PM', session: 'ABC Grade Training', location: 'Niagara Park Stadium', link: '#abc' }
    ],
    friday: [
        { time: '7:00 PM', endTime: '9:00 PM', session: 'Scrim Games', location: 'Niagara Park Stadium', link: '#scrim' }
    ],
    sunday: [
        { time: '5:00 PM', endTime: '9:00 PM', session: 'Social Comp', location: 'Terrigal Stadium', link: '#social' }
    ]
};

const summerSchedule = {};

const weeklySchedules = {
    ...repeatScheduleForWeeks('2026-02-02', 1, summerSchedule)
};

// =====================
// Window resize handler
// =====================
$(window).on('resize', () => {
    const schedule = getScheduleForWeek(getWeekDates(currentWeekOffset)[0]);
    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const slots = generateTimeSlots(schedule);
    const weekDates = getWeekDates(currentWeekOffset);
    
    // Re-render event layer with updated positions
    $('#eventLayer').empty();
    renderEventLayer(schedule, days, slots, weekDates);
});

// =====================
// Init
// =====================
renderTimetable();
updateNavigationButtons();