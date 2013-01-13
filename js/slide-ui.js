/**
 * @projectDescription: jQuery plugin for full screen webkit, touch enabled, horizontal sliding
 * @author: Yuri Petusko <yuripetusko@gmail.com>
 * @version: 1.0
 */
 
(function ($) {

	var horizontalSlider =  function($el, options) {
		var plugin = this;
		
		var sliding = 0,
			startClientX = 0,
			startPixelOffset = 0,
			slideCount = $el.find('.row').eq(0).find('.slide').length,
			slide_width = 1024,
			horiz_current_slide = Math.abs($el.position().left / slide_width),
			vertical_current_slide = Math.abs($el.position().top / slide_height),
			horiz_pixel_offset = currentSlide * -slide_width,
			vertical_pixel_offset = currentSlide * -slide_height;

		var	down_x = "";
		var	up_x = "";
		var	down_x_time = "";
		
		shireReplagal.horizontal_sliding = false;
		
		function bindEvents() {
			$el.live('touchstart', slideStart);
			$el.live('touchend', slideEnd);
			$el.live('touchmove', slide);
			
			$el.bind('webkitTransitionEnd', function(event){
				event.stopPropagation();
				if (event.target !== $(this)[0]) return;
			
				$el.find(".slide.current").removeClass("current");
				$el.find(".current-row").find(".slide").eq(currentSlide).addClass("current");
				
				var slide = $(".current-row").find(".slide.current");
				
				SignalBus.dispatch("slideTransitionCompleted", slide);
			});
			
			if (!$("#slides-y").length) {
				$el.trigger('webkitTransitionEnd');
			}
		}
		
		function get_transition_time() {
			/*
			calculates the transition time from the speed of the swipe, ceiling of 1s
			*/
			var distance_delta = Math.abs(down_x - up_x);
			var time_delta = up_x_time - down_x_time;			
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

				down_x = parseInt(event.originalEvent.touches[0].pageX, 10);
				up_x = down_x;
				down_x_time = new Date().getTime();

				event = event.originalEvent.touches[0];
			}
			
			if (sliding == 0) {
				sliding = 1;
				startClientX = event.clientX;
			}
		}
		
		function slide(event) {
			if (shireReplagal.vertical_sliding) return;
			/*
			Drag slide on touchmove
			*/
			event.preventDefault();
			if (event.originalEvent.touches) {
				up_x = parseInt(event.originalEvent.touches[0].pageX, 10);
	    		up_x_time = new Date().getTime();
				event = event.originalEvent.touches[0];
			}		
			var deltaSlide = event.clientX - startClientX;
			
			if (sliding == 1 && deltaSlide != 0 && Math.abs(deltaSlide) > 15) {
				sliding = 2;
				shireReplagal.horizontal_sliding = true;
				startPixelOffset = pixelOffset;
			}
			
			if (sliding == 2 && !shireReplagal.vertical_sliding) {
				var touchPixelRatio = 1;

				if ((currentSlide == 0 && event.clientX > startClientX) || (currentSlide == slideCount - 1 && event.clientX < startClientX)) {
					touchPixelRatio = 3;
				}

				pixelOffset = startPixelOffset + deltaSlide / touchPixelRatio;
				$el.attr("class", "").css('-webkit-transform', 'translate3d(' + pixelOffset + 'px,0,0)');
			}
		}
		
		function slideEnd(event) {
			/*
			Finish slide transition on touchend
			*/
			if (sliding == 2 && !shireReplagal.vertical_sliding) {
				sliding = 0;
				shireReplagal.horizontal_sliding = false;
				currentSlide = pixelOffset < startPixelOffset ? currentSlide + 1 : currentSlide - 1;
				currentSlide = Math.min(Math.max(currentSlide, 0), slideCount - 1);
				
				pixelOffset = currentSlide * -slide_width;
				
				var transition_time = get_transition_time();
				$el.css({
					'-webkit-transform': 'translate3d(' + pixelOffset + 'px,0,0)',
					'-webkit-transition-duration': transition_time + 's'
				}).addClass('animate');
			} else {
				sliding = 0;
				shireReplagal.horizontal_sliding = false;
			}
		}
		
		bindEvents();

	};

	$.fn.horizontalSlider = function(options) {
		return this.each(function () {
			var $this = $(this);
			horizontalSlider($this, options);
		});
	}
		
})(jQuery);