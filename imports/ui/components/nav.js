import './nav.html';



Template.navbox.onCreated(function(){
	this.active = new ReactiveVar();
});
Template.navbox.onRendered(function(){
	const menuSwipeLeft = new Hammer(document.getElementById('menu'));
	menuSwipeLeft.on("swipeleft panright tap press", function(e) {
		console.log('[navbox hammer]', e.type +" gesture detected.") ;
		if (e.type == 'swipeleft') {
			$('#menu').removeClass('slideInLeft ').addClass(' slideOutLeft').fadeOut();
			$('#bars').removeClass('rotate90');		
		} 		
	});
});
Template.navbox.helpers({
	topLocation(){
		return (FlowRouter.getRouteName() == 'landing');
	},
	active(){
		return Template.instance().active.get();
	}
});
Template.navbox.events({
/* 	'mouseenter  #menu-toggle': function(event,template) {
		template.active.set('active');
	}, */
/* 	'mouseleave  #menu-toggle': function(event,template) {
		template.active.set();
	}, */
	'click #menu-toggle'(e,t) {
		//console.log('menu-toggle', e, t.active.get());
		//template.active.set('active');
/* 		e.preventDefault();
		if ($('#menu').hasClass('slideOutLeft'))
			$('#menu').removeClass('hidden').removeClass('slideOutLeft').addClass('slideInLeft');
		else
			$('#menu').removeClass('slideInLeft ').addClass(' slideOutLeft'); */
		
	},
	'click #menu-close'(e,t) {
		//console.log('menu-toggle', e, t.active.get());
		//$('#menu').removeClass('slideInLeft ').addClass(' slideOutLeft');
		//template.active.set();
		//e.preventDefault();
	},
	'click .menuClick'(e,t) {
		console.log('menuClick', e, t.active.get());
		if ($('#menu').hasClass('slideOutLeft'))
			$('#menu').removeClass('hidden d-none').removeClass('slideOutLeft').addClass('slideInLeft').fadeIn();
		else
			$('#menu').removeClass('slideInLeft ').addClass(' slideOutLeft').fadeOut();
		//template.active.set();
		e.preventDefault();
	},
  'click ul li'(e,t) {
		console.log('ul li', e, t.active.get());
		$('#menu').removeClass('slideInLeft ').addClass(' slideOutLeft').fadeOut();
	},
});

Template.navdsk.onCreated(function(){
	this.active = new ReactiveVar();
});
Template.navdsk.onRendered(function(){

	const menuSwipeLeft = new Hammer(document.getElementById('menudsk'));
	menuSwipeLeft.on("swipeleft panright tap press", function(e) {
		console.log('[navdsk hammer]', e, " gesture detected:", e.type) ;
		if (e.type == 'swipeleft') {
			$('#navsection').removeClass('slideInLeft').addClass('slideOutLeft');
			$('#bars').removeClass('rotate90');		
		} 		
	});

});
Template.navdsk.helpers({
	topLocation(){
		return (FlowRouter.getRouteName() == 'landing');
	},
	active(){
		return Template.instance().active.get();
	}
});
Template.navdsk.events({
});
