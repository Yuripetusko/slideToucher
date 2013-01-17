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
        var plugin = this;

        plugin.el = el;
        plugin.$el = $(el);

        var sliding = startClientX = startClientY = startPixelOffset = 0;

        var $slide = plugin.$el.find('.slide');
        var $row = plugin.$el.find('.row');
        var slideWidth = $slide.width();
        var slideHeight = $row.height();

        var downX = "";
        var upX = "";
        var downXtime = "";
        var upXtime = "";

        var downY = "";
        var upY = "";
        var downYtime = "";
        var upYtime = "";

        var slideType = "";
        var offsetLeft = "";
        var offsetTop = "";

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

            $row.filter(".current-row").removeClass("current-row");
            $slide.filter(".current").removeClass("current");
            $row.eq(plugin.vertical.currentSlide).addClass("current-row").find(".slide").eq(plugin.horizontal.currentSlide).addClass("current");

            plugin.setWidth();

            plugin.bindEvents();
        };

        plugin.getTransitionTime = function (downPos, upPos, downPosTime, upPosTime, dir) {
            /*
            	calculates the transition time from the speed of the swipe, ceiling of 1s
            */
            var distance_delta = Math.abs(downPos - upPos);
            var time_delta = upPosTime - downPosTime;
            var transition_time = 1 / (distance_delta / time_delta);
            //Let's make transition speed based on screen size, giving 1024x768 screen a max 1ms speed 
            var screenSizeDelta = dir === "Y" ? slideHeight / 768 : slideWidth / 1024;
            //$("#debug").html(Math.min(transition_time * screenSizeDelta, screenSizeDelta) / 3);
            return Math.min(transition_time * screenSizeDelta, screenSizeDelta) / 3;
        };

        plugin.setWidth = function () {
            var slideWidth = $slide.eq(0).outerWidth(true);
            plugin.$el.css("width", slideWidth * $row.eq(0).find(".slide").length);
            $slide.css("width", slideWidth);
        };

        plugin.bindEvents = function () {
            plugin.$el.live('touchstart', plugin.slideStart);
            plugin.$el.live('touchmove', plugin.slide);
            plugin.$el.live('touchend', plugin.slideEnd);

            plugin.$el.bind('webkitTransitionEnd', function (event) {
                event.stopPropagation();
                if (event.target !== $(this)[0]) return;

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
                    plugin.el.style.WebkitTransform = 'translate3d(' + plugin[slideType].pixelOffset + 'px, ' + offsetTop + 'px, 0)';
                } else if (slideType === "vertical") {
                    plugin.el.style.WebkitTransform = 'translate3d(' + offsetLeft + 'px, ' + plugin[slideType].pixelOffset + 'px, 0)';
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
                    plugin.el.style['-webkit-transition-duration'] = transitionTime + 's'
                    plugin.el.style.WebkitTransform = 'translate3d(' + plugin[slideType].pixelOffset + 'px, ' + offsetTop + 'px, 0)';
                } else {
                    var transitionTime = plugin.getTransitionTime(downY, upY, downYtime, upYtime, "Y");
                    plugin.el.style['-webkit-transition-duration'] = transitionTime + 's'
                    plugin.el.style.WebkitTransform = 'translate3d(' + offsetLeft + 'px, ' + plugin[slideType].pixelOffset + 'px, 0)';
                }

            } else {
                sliding = 0;
            }
        };

        plugin.init();
    }

    $.fn.touchSlide = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_touchSlide")) {
                $.data(this, "plugin_touchSlide", new touchSlide(this, options));
            }
        });
    };

})(jQuery, window, document);