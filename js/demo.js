$("document").ready(function(){
	var slideWidth = $("#slides").find(".slide").eq(0).outerWidth(true);
	$("#slides").css("width", slideWidth* $("#slides").find(".row").eq(0).find(".slide").length);
	
	$("#slides").touchSlide();
});