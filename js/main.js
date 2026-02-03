jQuery(function($) {
	"use strict";
	// Author Code Here

	var owlPricing;
	var ratio = 2;

	// Window Load
	$(window).load(function() {
		// Preloader
		$('.intro-tables, .parallax, header').css('opacity', '0');
		$('.preloader').addClass('animated fadeOut').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$('.preloader').hide();
			$('.parallax, header').addClass('animated fadeIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				$('.intro-tables').addClass('animated fadeInUp').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
			});
		});


		// Sliders Init
		$('.owl-schedule').owlCarousel({
			singleItem: true,
			pagination: true,
			autoPlay: true,
			autoPlayTimeout: 3000,  // Time in milliseconds (3 seconds)
			autoPlayHoverPause: true  // Pause on hover (optional)
		});
		$('.owl-facebook').owlCarousel({
			singleItem: true,
			pagination: true,
			autoPlay: true,
			autoPlayTimeout: 3000,  // Time in milliseconds (3 seconds)
			autoPlayHoverPause: true  // Pause on hover (optional)
		});
		$('.owl-twitter').owlCarousel({
			singleItem: true,
			pagination: true
		});

		// Navbar Init
		$('nav').addClass('original').clone().insertAfter('nav').addClass('navbar-fixed-top').css('position', 'fixed').css('top', '0').css('margin-top', '0').removeClass('original');
		
		

		// Typing Intro Init
		$(".typed").typewriter({
			speed: 60
		});

		// Popup Form Init
		var i = 0;
		var interval = 0.15;
		$('.popup-form .dropdown-menu li').each(function() {
			$(this).css('animation-delay', i + "s");
			i += interval;
		});
		$('.popup-form .dropdown-menu li a').click(function(event) {
			event.preventDefault();
			$(this).parent().parent().prev('button').html($(this).html());
		});

		// Onepage Nav
		$('.navbar.navbar-fixed-top .navbar-nav').onePageNav({
			currentClass: 'active',
			changeHash: false,
			scrollSpeed: 400,
			scrollOffset: - 1000,
			filter: ':not(.btn)'
		});
	
		$(window).scroll(function() {
			if ($(window).scrollTop() > 50 && $(window).width() > 900) {
				$('nav.navbar').addClass('scrolled');
			} else {
				$('nav.navbar').removeClass('scrolled');
			}
		});
	



		// Timetable functionality
		let currentWeekOffset = 0;
		
		function getWeekKey(date) {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}
		
		// Helper function to repeat a schedule for multiple consecutive weeks
		function repeatScheduleForWeeks(startDate, numberOfWeeks, schedule) {
			const schedules = {};
			const start = new Date(startDate);
			
			for (let i = 0; i < numberOfWeeks; i++) {
				const weekDate = new Date(start);
				weekDate.setDate(start.getDate() + (i * 7));
				const weekKey = getWeekKey(weekDate);
				schedules[weekKey] = schedule;
			}
			
			return schedules;
		}
		
		// Define reusable schedule templates
		const summerSchedule = {
			monday: [
				{ time: '5:30 PM', endTime: '8:00 PM', class: 'Womens/Girls Representative', location: 'Niagara Park Stadium', link: '#beginner' },
				{ time: '7:30 PM', endTime: '10:00 PM', class: 'Mens/Boys Representative', location: 'Niagara Park Stadium', link: '#beginner' }
			],
			thursday: [
				{ time: '5:30 PM', endTime: '7:00 PM', class: 'Beginner Training', location: 'Niagara Park Stadium', link: '#beginner' },
				{ time: '7:00 PM', endTime: '10:00 PM', class: 'ABC Grade Training', location: 'Niagara Park Stadium', link: '#beginner' }
			],
			friday: [
				{ time: '7:00 PM', endTime: '9:00 PM', class: 'Scrimmage', location: 'Niagara Park Stadium', link: '#openplay' }
			],
			sunday: [
				{ time: '5:00 PM', endTime: '9:00 PM', class: 'Social Competition', location: 'Terrigal Stadium', link: '#alllevels' }
			]
		};
		
		
		// Build the weekly schedules by combining different periods
		const weeklySchedules = {
			// Repeat summer schedule from Feb 2 for 8 weeks
			...repeatScheduleForWeeks('2026-02-02', 8, summerSchedule),
			
			// You can still override specific weeks if needed
			'2026-02-09': {}
		};
		
		// Default schedule for weeks not specifically defined
		const defaultSchedule = {
			monday: [
				{ time: '5:30 PM', endTime: '8:00 PM', class: 'Womens/Girls Representative', location: 'Niagara Park Stadium', link: '#beginner' },
				{ time: '7:30 PM', endTime: '10:00 PM', class: 'Mens/Boys Representative', location: 'Niagara Park Stadium', link: '#beginner' }
			],
			thursday: [
				{ time: '5:30 PM', endTime: '7:00 PM', class: 'Beginner Training', location: 'Niagara Park Stadium', link: '#beginner' },
				{ time: '7:00 PM', endTime: '10:00 PM', class: 'ABC Grade Training', location: 'Niagara Park Stadium', link: '#beginner' }
			],
			friday: [
				{ time: '7:00 PM', endTime: '9:00 PM', class: 'Scrimmage', location: 'Niagara Park Stadium', link: '#openplay' }
			],
			sunday: [
				{ time: '5:00 PM', endTime: '9:00 PM', class: 'Social Competition', location: 'Terrigal Stadium', link: '#alllevels' }
			]
		};
		
		// Set to null or empty object {} if you want weeks to be empty by default
		// const defaultSchedule = null;
		
		function getWeekDates(offset) {
			const today = new Date();
			const currentDay = today.getDay();
			const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Start on Monday
			const monday = new Date(today.setDate(diff));
			monday.setDate(monday.getDate() + (offset * 7));
			
			const dates = [];
			for (let i = 0; i < 7; i++) {
				const date = new Date(monday);
				date.setDate(monday.getDate() + i);
				dates.push(date);
			}
			return dates;
		}
		
		function formatDateRange(dates) {
			const start = dates[0].getDate() + '/' + (dates[0].getMonth() + 1);
			const end = dates[6].getDate() + '/' + (dates[6].getMonth() + 1);
			const year = dates[0].getFullYear();
			return `${start} - ${end}, ${year}`;
		}
		
		function getScheduleForWeek(weekStartDate) {
			const weekKey = getWeekKey(weekStartDate);
			return weeklySchedules[weekKey] || defaultSchedule;
		}
		
		function isScheduleEmpty(schedule) {
			if (!schedule) return true;
			
			// Check if any day has classes
			for (const day in schedule) {
				if (schedule[day] && schedule[day].length > 0) {
					return false;
				}
			}
			return true;
		}
		
		function generateTimeSlots(schedule) {
			const times = new Set();
			Object.values(schedule).forEach(dayClasses => {
				if (dayClasses) {
					dayClasses.forEach(classInfo => {
						// Add start time and end time
						const startMinutes = convertTo24Hour(classInfo.time);
						const endMinutes = convertTo24Hour(classInfo.endTime);
						
						// Generate all 30-minute slots between start and end
						for (let m = startMinutes; m <= endMinutes; m += 30) {
							times.add(m);
						}
					});
				}
			});
			
			// Sort times chronologically
			const minutesArray = Array.from(times).sort((a, b) => a - b);
			const result = [];
			
			for (let i = 0; i < minutesArray.length; i++) {
				result.push({
					time: convertFromMinutes(minutesArray[i]),
					minutes: minutesArray[i],
					isBreak: false
				});
				
				// Check gap to next slot
				if (i < minutesArray.length - 1) {
					const gap = minutesArray[i + 1] - minutesArray[i];
					
					// Add a break indicator if gap is more than 3 hours (180 minutes)
					if (gap > 180) {
						result.push({
							time: '---',
							minutes: minutesArray[i] + 30,
							isBreak: true
						});
					}
				}
			}
			
			return result;
		}
		
		function convertTo24Hour(time) {
			const [timePart, modifier] = time.split(' ');
			let [hours, minutes] = timePart.split(':');
			hours = parseInt(hours);
			minutes = minutes ? parseInt(minutes) : 0;
			
			if (modifier === 'PM' && hours !== 12) {
				hours += 12;
			} else if (modifier === 'AM' && hours === 12) {
				hours = 0;
			}
			
			return hours * 60 + minutes;
		}
		
		function convertFromMinutes(totalMinutes) {
			let hours = Math.floor(totalMinutes / 60);
			const minutes = totalMinutes % 60;
			const modifier = hours >= 12 ? 'PM' : 'AM';
			
			if (hours > 12) hours -= 12;
			if (hours === 0) hours = 12;
			
			return `${hours}:${String(minutes).padStart(2, '0')} ${modifier}`;
		}
		
		function getClassSpan(classInfo, slots) {
			const startMinutes = convertTo24Hour(classInfo.time);
			const endMinutes = convertTo24Hour(classInfo.endTime);
			
			let startIndex = -1;
			let span = 0;
			
			for (let i = 0; i < slots.length; i++) {
				if (!slots[i].isBreak) {
					if (slots[i].minutes === startMinutes) {
						startIndex = i;
					}
					if (startIndex !== -1 && slots[i].minutes >= startMinutes && slots[i].minutes < endMinutes) {
						span++;
					}
				}
			}
			
			return { startIndex, span: Math.max(1, span) };
		}
		
		function renderTimetable() {
			const weekDates = getWeekDates(currentWeekOffset);
			$('#weekDisplay').text(formatDateRange(weekDates));
			
			const schedule = getScheduleForWeek(weekDates[0]);
			const tbody = $('#timetableBody');
			tbody.empty();
			
			// Check if schedule is empty
			if (isScheduleEmpty(schedule)) {
				const row = $('<tr>');
				row.append(`
					<td colspan="8" class="empty-schedule">
						<div class="empty-schedule-message">
							<div class="empty-calendar-icon">📅</div>
							<h4>No sessions scheduled</h4>
							<p>There are currently no sessions scheduled for this week.</p>
							<p>Check back later or contact us for more information.</p>
						</div>
					</td>
				`);
				tbody.append(row);
				return;
			}
			
			const timeSlots = generateTimeSlots(schedule);
			const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
			
			// Track which cells have been rendered for each day
			const renderedCells = days.map(() => new Set());
			
			timeSlots.forEach((slot, slotIndex) => {
				const row = $('<tr>');
				
				if (slot.isBreak) {
					row.addClass('time-break-row');
					row.append(`<td class="time-break" colspan="8">
						<div class="break-indicator">
							<span class="break-dots">• • •</span>
						</div>
					</td>`);
				} else {
					row.append(`<td class="time-cell">${slot.time}</td>`);
					
					days.forEach((day, dayIndex) => {
						// Skip if this cell was already rendered as part of a rowspan
						if (renderedCells[dayIndex].has(slotIndex)) {
							return;
						}
						
						const dayClasses = schedule[day] || [];
						const classAtTime = dayClasses.find(c => convertTo24Hour(c.time) === slot.minutes);
						const dateStr = weekDates[dayIndex].getDate() + '/' + (weekDates[dayIndex].getMonth() + 1);
						
						if (classAtTime) {
							const spanInfo = getClassSpan(classAtTime, timeSlots);
							
							// Mark all cells this class will span as rendered
							for (let i = 0; i < spanInfo.span; i++) {
								renderedCells[dayIndex].add(slotIndex + i);
							}
							
							const cell = $(`
								<td class="class-cell class-button" rowspan="${spanInfo.span}" data-link="${classAtTime.link}">
									<div class="class-info">
										<strong>${classAtTime.class}</strong>
										<span class="time-range">${classAtTime.time} - ${classAtTime.endTime}</span>
										<span class="location-label">${classAtTime.location}</span>
										<span class="date-label">${dateStr}</span>
									</div>
								</td>
							`);
							
							cell.click(function() {
								window.location.href = $(this).data('link');
							});
							
							row.append(cell);
						} else {
							renderedCells[dayIndex].add(slotIndex);
							row.append(`<td class="empty-cell"></td>`);
						}
					});
				}
				
				tbody.append(row);
			});
		}
		
		$('#prevWeek').click(function() {
			currentWeekOffset--;
			renderTimetable();
			updateNavigationButtons();
		});
		
		$('#nextWeek').click(function() {
			currentWeekOffset++;
			renderTimetable();
			updateNavigationButtons();
		});
		
		function updateNavigationButtons() {
			// Disable previous button if we're at the current week or earlier
			if (currentWeekOffset <= 0) {
				$('#prevWeek').prop('disabled', true).addClass('disabled');
			} else {
				$('#prevWeek').prop('disabled', false).removeClass('disabled');
			}
		}
		
		// Initial render
		renderTimetable();
		updateNavigationButtons();
	});
	
	// Window Scroll
	function onScroll() {
		if ($(window).scrollTop() > 50) {
			$('nav.original').css('opacity', '0');
			$('nav.navbar-fixed-top').css('opacity', '1');
		} else {
			$('nav.original').css('opacity', '1');
			$('nav.navbar-fixed-top').css('opacity', '0');
		}
	}

	window.addEventListener('scroll', onScroll, false);

	// Window Resize
	$(window).resize(function() {
		$('header').height($(window).height());
	});

	// Pricing Box Click Event
	$('.pricing .box-main').click(function() {
		$('.pricing .box-main').removeClass('active');
		$('.pricing .box-second').removeClass('active');
		$(this).addClass('active');
		$(this).next($('.box-second')).addClass('active');
		$('#pricing').css("background-image", "url(" + $(this).data('img') + ")");
		$('#pricing').css("background-size", "cover");
	});

	// Mobile Nav
	$('body').on('click', '.mobile-menu-toggle', function() {
		$('nav.navbar .navbar-nav').addClass('active');
		$('.mobile-menu-toggle').addClass('active');
		

	});

	$('body').on('click', '.mobile-menu-toggle.active', function() {
		$('nav.navbar .navbar-nav').removeClass('active');
		$('.mobile-menu-toggle').removeClass('active');
		

	});


	function centerModal() {
		$(this).css('display', 'block');
		var $dialog = $(this).find(".modal-dialog"),
			offset = ($(window).height() - $dialog.height()) / 2,
			bottomMargin = parseInt($dialog.css('marginBottom'), 10);

		// Make sure you don't hide the top part of the modal w/ a negative margin
		// if it's longer than the screen height, and keep the margin equal to 
		// the bottom margin of the modal
		if (offset < bottomMargin) offset = bottomMargin;
		$dialog.css("margin-top", offset);
	}

	$('.modal').on('show.bs.modal', centerModal);

	$('.modal-popup .close-link').click(function(event){
		event.preventDefault();
		$('#modal1').modal('hide');
	});

	$(window).on("resize", function() {
		$('.modal:visible').each(centerModal);
	});
});
