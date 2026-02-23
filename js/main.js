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

	$(function() {
		$("#footer-placeholder").load("footer.html");
	}); 
	
	$(function() {
		$("#navbar-placeholder").load("navbar.html");
	}); 
});
