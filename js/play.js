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

		
		// Popup Form Init
		var i = 0;
		var interval = 0.15;
		$('.popup-form .dropdown-menu li').each(function() {
			$(this).css('animation-delay', i + "s");
			i += interval;
		});

		$('.popup-form .dropdown-menu li a').click(function(event) {
			event.preventDefault();
			
			// Get the selected text
			var selectedText = $(this).text();
			
			// Update the button text (traverse up to ul, then to button)
			$(this).closest('.dropdown-menu').siblings('#dLabel').text(selectedText);
			
			// Close the dropdown
			$(this).closest('.dropdown').removeClass('open');
			
			// Optional: Add visual feedback on mobile
			$(this).parent().addClass('active');
			setTimeout(() => {
				$('.dropdown-menu li').removeClass('active');
			}, 300);
		});

		// MOBILE NAV MENU

		$('body').on('click', '.mobile-menu-toggle', function() {
			$('nav.navbar .navbar-nav').addClass('active');
			$('.mobile-menu-toggle').addClass('active');
		});

		$('body').on('click', '.mobile-menu-toggle.active', function() {
			$('nav.navbar .navbar-nav').removeClass('active');
			$('.mobile-menu-toggle').removeClass('active');
		});
	

		// Window Resize
		$(window).resize(function() {
			$('header').height($(window).height());
		});

	
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



	document.getElementById("warning").addEventListener("click", () => {
		document.getElementById("warning").classList.toggle("hide");
	});

	$(".play-dropdown").on("click", function (e) {
		e.stopPropagation();

		const section = $(this).closest(".play-section");
		const wasActive = section.hasClass("active");

		// close everything
		$(".play-section").removeClass("active");

		// only reopen if it wasn't already active
		if (!wasActive) {
			section.addClass("active");
			section[0].scrollIntoView({ behavior: "smooth", block: "start" });
		}
	});

	$(function() {
		$("#footer-placeholder").load("footer.html");
	}); 
	
	$(function() {
		$("#navbar-placeholder").load("navbar.html");
	}); 

});
