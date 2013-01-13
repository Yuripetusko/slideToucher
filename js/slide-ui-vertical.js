/**
 * @projectDescription: jQuery plugin for full screen webkit, touch enabled, vertical sliding
 * @author: Yuri Petusko <yuripetusko@gmail.com>
 * @version: 1.0
 */
 
(function ($) {

	var verticalSlider = function($el, options) {
		var plugin = this;
		
		var sliding = 0,
			startClientY = 0,
			startPixelOffset = 0,
			slideCount = $el.find('.row').length,
			slide_height = $el.height(),
			currentSlide = Math.abs($el.position().top / slide_height),
			pixelOffset = currentSlide * -slide_height;
			
			
		var	down_y = "";
		var	up_y = "";
		var	down_y_time = "";
		
		$el.find(".row.current-row").removeClass("current-row");
		$el.find(".row").eq(currentSlide).addClass("current-row");
		$("#slides-x").trigger('webkitTransitionEnd');
		
		shireReplagal.vertical_sliding = false;
		
		function bindEvents() {
			$el.live('touchstart', slideStart);
			$el.live('touchend', slideEnd);
			$el.live('touchmove', slide);
			
			$el.bind('webkitTransitionEnd', function(event){
				event.stopPropagation();
				if (event.target !== $(this)[0]) return;
				
				$el.find(".row.current-row").removeClass("current-row");
				$el.find(".row").eq(currentSlide).addClass("current-row");
				$("#slides-x").trigger('webkitTransitionEnd');
			});
		}
		
		function get_transition_time() {
			/*
			calculates the transition time from the speed of the swipe, ceiling of 1s
			*/
			var distance_delta = Math.abs(down_y - up_y);
			var time_delta = up_y_time - down_y_time;			
			var transition_time = 1 / (distance_delta / time_delta);
	        return Math.min(transition_time, 1);
		}
		
		function slideStart(event) {
			/*
			Register position on touch start
			*/
			if (event.originalEvent.touches) {
				$el.css({
					'-webkit-transition-duration': ''
				});

				down_y = parseInt(event.originalEvent.touches[0].pageY, 10);
				up_y = down_y;
				down_y_time = new Date().getTime();

				event = event.originalEvent.touches[0];
			}

			if (sliding == 0) {
				sliding = 1;
				startClientY = event.clientY;
			}
		}
		
		function slide(event) {
			if (shireReplagal.horizontal_sliding) return;
			/*
			Drag slide on touchmove
			*/
			event.preventDefault();
			if (event.originalEvent.touches) {
				up_y = parseInt(event.originalEvent.touches[0].pageY, 10);
	    		up_y_time = new Date().getTime();
				event = event.originalEvent.touches[0];
			}		
			var deltaSlide = event.clientY - startClientY;
			
			if (sliding == 1 && deltaSlide != 0 && Math.abs(deltaSlide) > 15) {
				sliding = 2;
				shireReplagal.vertical_sliding = true;
				startPixelOffset = pixelOffset;
			}

			if (sliding == 2 && !shireReplagal.horizontal_sliding) {
				var touchPixelRatio = 1;
				if ((currentSlide == 0 && event.clientY > startClientY) || (currentSlide == slideCount - 1 && event.clientY < startClientY)) {
					touchPixelRatio = 3;
				}

				pixelOffset = startPixelOffset + deltaSlide / touchPixelRatio;
				$el.attr("class", "").css('-webkit-transform', 'translate3d(0,' + pixelOffset + 'px, 0)');
			}
		}
		
		function slideEnd(event) {
			/*
			Finish slide transition on touchend
			*/
			if (sliding == 2 && !shireReplagal.horizontal_sliding) {
				sliding = 0;
				shireReplagal.vertical_sliding = false;
				currentSlide = pixelOffset < startPixelOffset ? currentSlide + 1 : currentSlide - 1;
				currentSlide = Math.min(Math.max(currentSlide, 0), slideCount - 1);
				pixelOffset = currentSlide * -slide_height;
				var transition_time = get_transition_time();		
				$el.css({
					'-webkit-transform': 'translate3d(0,' + pixelOffset + 'px, 0)',
					'-webkit-transition-duration': transition_time + 's'
				}).addClass('animate');
			} else {
				sliding = 0;
				shireReplagal.vertical_sliding = false;
			}
		}
		
		bindEvents();

	};

	$.fn.verticalSlider = function(options) {
		return this.each(function () {
			var $this = $(this);
			verticalSlider($this, options);
		});
	}
		
})(jQuery);