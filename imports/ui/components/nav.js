import './nav.html';


Template.navbox.onCreated(function(){
	this.active = new ReactiveVar();
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
			$('#menu').removeClass('hidden d-none').removeClass('slideOutLeft').addClass('slideInLeft');
		else
			$('#menu').removeClass('slideInLeft ').addClass(' slideOutLeft');
		//template.active.set();
		e.preventDefault();
	},
  'click ul li'(e,t) {
		console.log('ul li', e, t.active.get());
		$('#menu').removeClass('slideInLeft ').addClass(' slideOutLeft');
	},
});

Template.navdsk.onCreated(function(){
	this.active = new ReactiveVar();
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

	'click #menu-close': function(event,template) {
/* 		//console.log('menu-toggle', event, template.active.get());
		$('#menu').removeClass('slideInRight ').addClass(' slideOutRight');
		//template.active.set();
		event.preventDefault(); */
	},
/*   'click ul li': function(event,template) {
		$('#menu').removeClass('slideInRight ').addClass(' slideOutRight');
	}, */
});
