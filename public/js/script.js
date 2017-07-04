$("#header__button").click(function() {
	$(this).toggleClass("hamburger--open");
});
$(function () {
	$('[href="#top"], [href="#sport-1"], [href="#sport-2"], [href="#sport-3"]').click(function () {
		if ($(this).attr('href') == '#') {} else {
			$('html, body').animate({
				scrollTop: $($(this).attr('href')).offset().top - 50
			}, 500);
			return false;
		}
	});
	$('.slider').slick({
		infinite: false,
		speed: 300,
		slidesToShow: 4,
		slidesToScroll: 4,
		responsive: [
//			{
//				breakpoint: 1200,
//				settings: {
//					slidesToShow: 4,
//					slidesToScroll: 4,
//					infinite: true,
//					dots: true
//				}
//    },
//			{
//				breakpoint: 992,
//				settings: {
//					slidesToShow: 4,
//					slidesToScroll: 4,
//					infinite: true,
//					dots: true
//				}
//    },
			{
				breakpoint: 640,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 3
				}
    },
			
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 2
				}
    }
  ]
	});
});
$(function () {
	var addClass = function (elem, className) {
		if (elem.classList) {
			elem.classList.add(className);
		} else {
			elem.className += ' ' + className;
		}
	};

	var removeClass = function (elem, className) {
		if (elem.classList) {
			elem.classList.remove(className);
		} else {
			elem.className = elem.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	};

	var hasClass = function (elem, className) {
		return new RegExp('(\\s|^)' + className + '(\\s|$)').test(elem.className);
	};

	var cartIcon = document.getElementById('cart-icon') ? document.getElementById('cart-icon') : false;

	var cartIconCount = document.getElementById('cart-icon-count') ? document.getElementById('cart-icon-count') : false;

	var cartContainer = document.getElementById('cart-container') ? document.getElementById('cart-container') : false;

	var cartSummary = document.getElementById('cart-summary') ? document.getElementById('cart-summary') : false;

	var cartSummaryItem = document.getElementById('cart-summary-item') ? document.getElementById('cart-summary-item') : false;

	var cartSummaryCountInput = document.getElementById('cart-summary-count-input') ? document.getElementById('cart-summary-count-input') : false;

	var cartSummaryNoItems = document.getElementById('cart-summary-no-items') ? document.getElementById('cart-summary-no-items') : false;

	var cartSummaryRemove = document.getElementById('cart-summary-remove') ? document.getElementById('cart-summary-remove') : false;

	var checkoutButton = document.getElementById('checkout-button') ? document.getElementById('checkout-button') : false;

	var checkIfZero = function (num) {
		if (num === 0) {
			return true;
		} else {
			return false;
		}
	};

	if (cartContainer) {
		cartContainer.addEventListener('click', function () {
			console.log(this.style.display);
			if (cartSummary.style.display != "block") {
				Velocity(cartSummary, "slideDown");
			} else {
				Velocity(cartSummary, "slideUp");
			}
		});
	}

	if (cartSummaryRemove) {
		cartSummaryRemove.addEventListener('click', function () {
			Velocity(cartSummaryItem, "fadeOut", {
				complete: function () {
					Velocity(cartSummaryNoItems, "fadeIn");
				}
			});
			checkoutButton.style.display = "none";
		});
	}

	if (checkoutButton) {
		checkoutButton.addEventListener('click', function () {
			alert("Order Placed");
		});
	}
});
/*
$(".carousel").swipe({
  swipe: function(event, direction, distance, duration, fingerCount, fingerData) {

    if (direction == 'left') $(this).carousel('next');
    if (direction == 'right') $(this).carousel('prev');

  },
  allowPageScroll:"vertical"

});
window.onscroll = function(){
	var target = document.body;	
	var top_btn = document.querySelector('#top-btn');	
	var y = target.scrollTop,
    offset = 200; 
        
	if( y >= offset){
		top_btn.setAttribute('class', 'fixed');
      
	} else {
		top_btn.removeAttribute('class');
	}
}
*/
