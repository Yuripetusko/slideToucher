$("document").ready(function(){
	var hue = 0;
	Array.prototype.slice.call(document.querySelectorAll('.slide')).forEach(function(element, i) {
		var numberNode = document.createTextNode(i+1);
		var number = document.createElement("span");
		number.appendChild(numberNode);
		element.appendChild(number);
	    element.style.backgroundColor = 'hsla(' + hue + ', 75%, 50%, 0.5)';
	    hue += 222.5;
	});
	
	$("#slides").touchSlide({
		vertical: true,
		horizontal: true
	});
});