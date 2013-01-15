$("document").ready(function(){
	var hue = 0;
	Array.prototype.slice.call(document.querySelectorAll('.slide')).forEach(function(mc) {
	    mc.style.backgroundColor = 'hsla(' + hue + ', 75%, 50%, 0.5)';
	    hue += 222.5;
	});
	
	$("#slides").touchSlide();
});