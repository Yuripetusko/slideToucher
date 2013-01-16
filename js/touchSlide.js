// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    function touchSlide( el, options ) {
		var plugin = this;
		
        plugin.el = el;
		plugin.$el = $(el);
		
		var sliding = 0;
		var startClientX = 0;
		var startClientY = 0;
		var startPixelOffset = 0;
		var $slide = plugin.$el.find('.slide');
		var $row = plugin.$el.find('.row');
		var slideWidth = $slide.width();
		var slideHeight = $row.height();
		
		var	downX = "";
		var	upX = "";
		var	downXtime = "";
		var	upXtime = "";
		
		var	downY = "";
		var	upY = "";
		var	downYtime = "";
		var upYtime = "";
		
		var slideType = "";
		var offset = "";
		var start_offset = plugin.$el.offset();
		
		var defaults = {

		}
		
		plugin.vertical = {
			slideCount: $row.length,
			slideSize: slideHeight,
			currentSlide: Math.round(Math.abs(plugin.$el.position().top / slideHeight))
		}
		
		plugin.horizontal = {
			slideCount: $row.eq(0).find('.slide').length,
			slideSize: slideWidth,
			currentSlide: Math.round(Math.abs(plugin.$el.position().left / slideWidth))
		}
		
		plugin.vertical.pixelOffset = plugin.vertical.currentSlide * -slideHeight;
		plugin.horizontal.pixelOffset = plugin.horizontal.currentSlide * -slideWidth;
		
		
		plugin.init = function () {
            plugin.options = $.extend({
            	vertical: false,
            	horizontal: true
            }, options);

            plugin.setWidth();

			plugin.bindEvents();
        };

		plugin.getTransitionTime = function(downPos, upPos, downPosTime, upPosTime) {
			/*
			calculates the transition time from the speed of the swipe, ceiling of 1s
			*/
			var distance_delta = Math.abs(downPos - upPos);
			var time_delta = upPosTime - downPosTime;
			var transition_time = 1 / (distance_delta / time_delta);
			console.log(distance_delta, time_delta, transition_time)
	        return Math.min(transition_time, 1);
		};

		plugin.setWidth = function() {
			var slideWidth = $slide.eq(0).outerWidth(true);
			plugin.$el.css("width", slideWidth* $row.eq(0).find(".slide").length);
			$slide.css("width", slideWidth);
		};

		plugin.bindEvents = function() {
			plugin.$el.live('touchstart', plugin.slideStart);
			plugin.$el.live('touchmove', plugin.slide);			
			plugin.$el.live('touchend', plugin.slideEnd);

			/*
			plugin.$el.bind('webkitTransitionEnd', function(event){
				event.stopPropagation();
				if (event.target !== $(this)[0]) return;

				plugin.$el.find(".slide.current").removeClass("current");
				plugin.$el.find(".current-row").find(".slide").eq(currentSlide).addClass("current");

				var slide = $(".current-row").find(".slide.current");

				SignalBus.dispatch("slideTransitionCompleted", slide);
			});
			

			if (!$("#slides-y").length) {
				$el.trigger('webkitTransitionEnd');
			}
			*/
		};
		
		plugin.slideStart = function(event) {
			/*
			Register position on touch start
			*/
			if (event.originalEvent.touches) {
				plugin.$el.css({
					'-webkit-transition-duration': ''
				});

				downX = parseInt(event.originalEvent.touches[0].pageX, 10);
				upX = downX;
				downXtime = new Date().getTime();
				
				downY = parseInt(event.originalEvent.touches[0].pageY, 10);
				upY = downY;
				downYtime = new Date().getTime();

				event = event.originalEvent.touches[0];
			}

			if (sliding == 0) {
				sliding = 1;
				offset = plugin.$el.offset();
				startClientX = event.clientX;
				startClientY = event.clientY;
			}	
		};
		
		plugin.slide = function(event) {
			/*
			Drag slide on touchmove
			*/
			event.preventDefault();
			if (event.originalEvent.touches) {
				upX = parseInt(event.originalEvent.touches[0].pageX, 10);
	    		upXtime = new Date().getTime();
	
				upY = parseInt(event.originalEvent.touches[0].pageY, 10);
	    		upYtime = new Date().getTime();
	
				event = event.originalEvent.touches[0];
			}
			
			var deltaSlideX = event.clientX - startClientX;
			var deltaSlideY = event.clientY - startClientY;
			
			if (sliding == 1 && deltaSlideX != 0 && Math.abs(deltaSlideX) > 15) {
				sliding = 2;
				slideType = "horizontal";
				
				startPixelOffset = plugin.horizontal.pixelOffset;
			} else if (sliding == 1 && deltaSlideY != 0 && Math.abs(deltaSlideY) > 15) {
				sliding = 2;
				slideType = "vertical";
				
				startPixelOffset = plugin.vertical.pixelOffset;
			}
			
			if (slideType === "horizontal") {
				var deltaSlide = deltaSlideX,
					startClienPos = startClientX,
					eventPos = event.clientX;
			} else if (slideType === "vertical"){
				var deltaSlide = deltaSlideY,
					startClienPos = startClientY,
					eventPos = event.clientY;
			}
			
			if (sliding == 2) {
				var touchPixelRatio = 1;
				if ((plugin[slideType].currentSlide == 0 && eventPos > startClienPos) || (plugin[slideType].currentSlide == plugin[slideType].slideCount - 1 && eventPos < startClienPos)) {
					touchPixelRatio = 3;
				}

				plugin[slideType].pixelOffset = startPixelOffset + deltaSlide / touchPixelRatio;
				
				if (slideType === "horizontal") {
					plugin.el.style.WebkitTransform = "translateX("+ plugin[slideType].pixelOffset + "px) translateY(" + (offset.top-start_offset.top)+"px)";
					//plugin.$el.attr("class", "").css('-webkit-transform', 'translate3d(' + plugin[slideType].pixelOffset + 'px,'+(offset.top-start_offset.top)+'px,0)');
				} else if (slideType === "vertical"){
					plugin.el.style.WebkitTransform = "translateX("+ (offset.left - start_offset.left) + "px) translateY(" + plugin[slideType].pixelOffset +"px)";
					//plugin.$el.attr("class", "").css('-webkit-transform', 'translate3d('+(offset.left - start_offset.left)+'px,' + plugin[slideType].pixelOffset + 'px, 0)');
				}	
			
			}
		};
		
		plugin.slideEnd = function(event) {
			/*
			Finish slide transition on touchend
			*/
			if (sliding == 2) {
				sliding = 0;
				plugin[slideType].currentSlide = plugin[slideType].pixelOffset < startPixelOffset ? plugin[slideType].currentSlide + 1 : plugin[slideType].currentSlide - 1;
				plugin[slideType].currentSlide = Math.min(Math.max(plugin[slideType].currentSlide, 0), plugin[slideType].slideCount - 1);

				plugin[slideType].pixelOffset = plugin[slideType].currentSlide * -plugin[slideType].slideSize;
				
				if (slideType === "horizontal") {
					var transitionTime = plugin.getTransitionTime(downX, upX, downXtime, upXtime);
					var transformX = 'translateX(' + plugin[slideType].pixelOffset + 'px)';
					var transformY =  'translateY('+(offset.top - start_offset.top)+'px)';
					plugin.el.style['-webkit-transition-duration'] = transitionTime + 's'
  					plugin.el.style.WebkitTransform = transformX + " " + transformY;
					/*plugin.$el.css({
						'-webkit-transform': 'translate3d(' + plugin[slideType].pixelOffset + 'px,'+(offset.top - start_offset.top)+'px,0)',
						'-webkit-transition-duration': transitionTime + 's'
					}).addClass('animate');
					*/
				} else {
					var transitionTime = plugin.getTransitionTime(downY, upY, downYtime, upYtime);
					var transformX = 'translateX('+ (offset.left - start_offset.left) +'px)';
					var transformY =  'translateY('+ plugin[slideType].pixelOffset +'px)';
					plugin.el.style['-webkit-transition-duration'] = transitionTime + 's'
  					plugin.el.style.WebkitTransform = transformX + " " + transformY;
					/*
					plugin.$el.css({
						'-webkit-transform': 'translate3d('+(offset.left - start_offset.left)+'px,' + plugin[slideType].pixelOffset + 'px, 0)',
						'-webkit-transition-duration': transitionTime + 's'
					}).addClass('animate');
					*/
				}
				
			} else {
				sliding = 0;
			}	
		};
		
        plugin.init();
    }

    $.fn.touchSlide = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_touchSlide")) {
                $.data(this, "plugin_touchSlide", new touchSlide( this, options ));
            }
        });
    };

})( jQuery, window, document );