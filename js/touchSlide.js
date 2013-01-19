/*********

The MIT License (MIT)
Copyright (c) 2013 Jurijs Petusko | Yuri Petusko | yuripetusko@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Plugin is loosely based on tutorial by Martin Kool https://twitter.com/mrtnkl
http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/

************/

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

    function touchSlide(el, options) {
        /*
            Defiantly too many variables here. Need to find a way to reduce 'em
        */
        var plugin = this;

        plugin.el = el;
        plugin.$el = $(el);

        var sliding = startClientX = startClientY = startPixelOffset = 0;

        /*
            should I come up with better name for this var?
        */
        var cachedElStyle = plugin.el.style;

        /*
            Should I use DOM querySelectorAll? All mobile phone browsers should be capable of it now...
        */
        var $slide = plugin.$el.find('.slide');
        var $row = plugin.$el.find('.row');

        var slideWidth = "";
        var slideHeight = "";

        var downX = "";
        var upX = "";
        var downXtime = "";
        var upXtime = "";

        var downY = "";
        var upY = "";
        var downYtime = "";
        var upYtime = "";

        var slideType = "";
        /*
            There is currently a bug if body (or nay other parent) has margin or padding.
            Then initial offset is wrong and position of slide increases with every slide.
            Potential fix that I need to look into is substracting parent's offset from document offset
            http://stackoverflow.com/questions/5389527/how-to-get-offset-relative-to-a-specific-parent
        */
        var offsetLeft = "";
        var offsetTop = "";

        var defaults = {
            /* Anyone in here? */
        }

        plugin.init = function () {
            plugin.options = $.extend({
                vertical: false,
                horizontal: true
            }, options);

            plugin.setWidth();

            plugin.recordDimensions();

            plugin.bindEvents();

            /*
                Need to come up with less expensive selectors.
            */
            $row.filter(".current-row").removeClass("current-row");
            $slide.filter(".current").removeClass("current");
            $row.eq(plugin.vertical.currentSlide).addClass("current-row").find(".slide").eq(plugin.horizontal.currentSlide).addClass("current");
        };

        plugin.getTransitionTime = function (downPos, upPos, downPosTime, upPosTime, dir) {
            /*
            	calculates the transition time from the speed of the swipe.
                THIS IS BAD. I DON'T THINK THAT I KNOW WHAT i'M DOIJNG HERE. NEED TO LOOK INTO IT.
            */
            var distance_delta = Math.abs(downPos - upPos);
            var time_delta = upPosTime - downPosTime;
            var transition_time = 1 / (distance_delta / time_delta);
            //Let's make transition speed based on screen size, giving 1024x768 screen a max 1ms speed 
            var screenSizeDelta = dir === "Y" ? slideHeight / 768 : slideWidth / 1024;
            return Math.min(transition_time * screenSizeDelta, screenSizeDelta) / 2;
        };

        plugin.setWidth = function () {
            /*
                Setting with of parent container to number of slides in first row * first slide width.
                This will not work very well if other rows has  different number of slides.
            */
            var slideWidth = $slide.eq(0).outerWidth(true);
            plugin.$el.css("width", slideWidth * $row.eq(0).find(".slide").length);
            $slide.css("width", slideWidth);
            
        };

        plugin.recordDimensions = function(){
            slideWidth = $slide.width();
            slideHeight = $row.height();

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
        };

        plugin.bindEvents = function () {
            plugin.$el.on('touchstart', plugin.slideStart);
            plugin.$el.on('touchmove', plugin.slide);
            plugin.$el.on('touchend', plugin.slideEnd);

            plugin.$el.bind('webkitTransitionEnd', function (event) {
                event.stopPropagation();
                if (event.target !== $(this)[0]) return;

                /*
                    Need to come up with less expensive selectors.
                */
                $row.filter(".current-row").removeClass("current-row");
                $row.eq(plugin.vertical.currentSlide).addClass("current-row");

                $slide.filter(".current").removeClass("current");
                $row.filter(".current-row").find(".slide").eq(plugin.horizontal.currentSlide).addClass("current");

                plugin.$el.trigger("touchSlideTransitionCompleted");
            });

        };

        plugin.slideStart = function (event) {
            /*
            	Register position on touch start
			*/
            if (event.originalEvent.touches) {
                cachedElStyle['-webkit-transition-duration'] = "";

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
                offsetLeft = plugin.$el.offset().left;
                offsetTop = plugin.$el.offset().top;
                startClientX = event.clientX;
                startClientY = event.clientY;
            }
        };

        plugin.slide = function (event) {
            /*
            	Drag slide on touchmove
			*/
            event.preventDefault();
            if (event.originalEvent.touches) {

                upX = event.originalEvent.touches[0].pageX;

                upY = event.originalEvent.touches[0].pageY;

                upXtime = upYtime = new Date().getTime();

                event = event.originalEvent.touches[0];
            }

            var deltaSlideX = event.clientX - startClientX;
            var deltaSlideY = event.clientY - startClientY;

            if (sliding == 1 && deltaSlideX != 0 && Math.abs(deltaSlideX) > 15 && plugin.options.horizontal) {
                sliding = 2;
                slideType = "horizontal";

                startPixelOffset = plugin.horizontal.pixelOffset;
            } else if (sliding == 1 && deltaSlideY != 0 && Math.abs(deltaSlideY) > 15 && plugin.options.vertical) {
                sliding = 2;
                slideType = "vertical";

                startPixelOffset = plugin.vertical.pixelOffset;
            }

            if (slideType === "horizontal") {
                var deltaSlide = deltaSlideX,
                    startClienPos = startClientX,
                    eventPos = event.clientX;
            } else if (slideType === "vertical") {
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
                    cachedElStyle.WebkitTransform = 'translate3d(' + plugin[slideType].pixelOffset + 'px, ' + offsetTop + 'px, 0)';
                } else if (slideType === "vertical") {
                    cachedElStyle.WebkitTransform = 'translate3d(' + offsetLeft + 'px, ' + plugin[slideType].pixelOffset + 'px, 0)';
                }

            }
        };

        plugin.slideEnd = function (event) {
            /*
            	Finish slide transition on touchend
			*/
            if (sliding == 2) {
                sliding = 0;
                plugin[slideType].currentSlide = plugin[slideType].pixelOffset < startPixelOffset ? plugin[slideType].currentSlide + 1 : plugin[slideType].currentSlide - 1;
                plugin[slideType].currentSlide = Math.min(Math.max(plugin[slideType].currentSlide, 0), plugin[slideType].slideCount - 1);

                plugin[slideType].pixelOffset = plugin[slideType].currentSlide * -plugin[slideType].slideSize;

                if (slideType === "horizontal") {
                    var transitionTime = plugin.getTransitionTime(downX, upX, downXtime, upXtime, "X");
                    cachedElStyle['-webkit-transition-duration'] = transitionTime + 's'
                    cachedElStyle.WebkitTransform = 'translate3d(' + plugin[slideType].pixelOffset + 'px, ' + offsetTop + 'px, 0)';
                } else {
                    var transitionTime = plugin.getTransitionTime(downY, upY, downYtime, upYtime, "Y");
                    cachedElStyle['-webkit-transition-duration'] = transitionTime + 's'
                    cachedElStyle.WebkitTransform = 'translate3d(' + offsetLeft + 'px, ' + plugin[slideType].pixelOffset + 'px, 0)';
                }
            } else {
                sliding = 0;
            }
        };

        plugin.init();
    }

    $.fn.touchSlide = function (options) {
        /*
            Just incase I will need to expose some methods to public in future I am doing it this way:
        */    
        return this.each(function () {
            if (!$.data(this, "plugin_touchSlide")) {
                $.data(this, "plugin_touchSlide", new touchSlide(this, options));
            }
        });
    };

})(jQuery, window, document);