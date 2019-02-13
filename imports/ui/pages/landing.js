import { Random } from 'meteor/random'

import { Collections } from '/imports/api/collections.js';

import './landing.html';
import '../components/collectform.js';
//import '/imports/external/virgo_DB.js';
//import '../pages/tour.js';

var vrloaded = 'Loading...';

Template.landing.onCreated(function () {
	
	let t = Template.instance();
  t.state = new ReactiveDict();
	t.vrloading = new ReactiveVar();
	t.contactUs = new ReactiveVar();
	Meteor.subscribe('texts');
	t.autorun(function(){
		if (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) 
			Meteor.subscribe('contact');
	});

/* 	$.getScript('/js/jquery.scrolly.min.js', function(script, textStatus, jqXHR){console.log('scrolly was loaded', textStatus, jqXHR);});
	$.getScript('/js/jquery.scrollex.min.js', function(script, textStatus, jqXHR){console.log('scrollex was loaded', textStatus, jqXHR);});
 */
});

Template.landing.onRendered(function () {
	let t = Template.instance();
/* 	t.autorun(function () {
		if (Session.get('visited') && !FlowRouter.current().context.hash && Meteor.userId()) 
			FlowRouter.go('/timers/' + Meteor.user().username);
	}); */
	
	if (FlowRouter.current().route.name == 'landing')
		$(window).scroll(function() {
			if(FlowRouter.current().route.name == 'landing' && $(window).scrollTop() + $(window).height() > $(document).height() - 100) {
				console.log("near bottom!");
				var timeout = 10 * 60 * 1000;
				if (!Session.get('visited') || new Date() - Session.get('visited') > timeout) {	
					if (FlowRouter.current().route.name != 'landing')
						return;
					var data = Collections.Texts.findOne({title:'landingtimers'});
					//if (!Meteor.userId()) Modal.show('tryModal', data);
					Session.setPersistent('visited', new Date());
				}
			}
		});

	//$.getScript('/js/skel.min.js', function(script, textStatus, jqXHR){console.log('skel was loaded', textStatus, jqXHR);});
	//$.getScript('/js/util.js', function(script, textStatus, jqXHR){console.log('util was loaded', textStatus, jqXHR);});
	//$.getScript('/js/main.js', function(script, textStatus, jqXHR){console.log('main was loaded', textStatus, jqXHR);});		

});

Template.landing.helpers({
	abtest(){
		var abtest;
		if (!FlowRouter.getQueryParam('set')) {
			if (Session.get('abtest'))
				abtest = Session.get('abtest');
			else
				abtest = Random.choice(['up','down']);
			if (window.ll) {
				ll('abtest', FlowRouter.getRouteName(), abtest);		
				ll('setProfileAttribute', 'abtest', abtest, 'org');
			}
			Session.set('abtest', abtest);
			if (abtest == 'up')
				FlowRouter.setQueryParams({set: abtest});
			console.log('abtest', abtest);
		} else {
			abtest = FlowRouter.getQueryParam('set');
			if (window.ll) {
				ll('abtest', FlowRouter.getRouteName(), abtest);		
				ll('setProfileAttribute', 'abtest', abtest, 'org');
			}
			Session.set('abtest', abtest);
		}
		return abtest;
	},
  landing() {
    return Collections.Texts.findOne({title:'landingtimers'});
  },
	contactUs(){
		let t = Template.instance();
		return t.contactUs.get();
	},
	debug(){
		console.log('debug in landing', this, this.valueOf());
	}
});

Template.landing.events({
	'click .href'(e,t){
		e.preventDefault();
	},	
	'click .toOne'(e, t){
		e.preventDefault(); 
		t.contactUs.set(true);
		$('html, body').animate({scrollTop: $("#one").offset().top  -1 }, 'slow');
		
	},	
	'click .toTwo'(e, t){
		e.preventDefault(); 
		t.contactUs.set(true);
		$('html, body').animate({scrollTop: $("#two").offset().top  -1}, 'slow');		
	},	
	'click .toContact'(e, t){
		e.preventDefault(); 
		t.contactUs.set(true);
		$('html, body').animate({scrollTop: $("#contact").offset().top -1 }, 'slow');	
	},
	'click .tryMe' (e,t){
		FlowRouter.go('/timers');
		$('html, body').animate({scrollTop: $('body').offset().top -200 }, 'slow');
		//Modal.show('tryitModal');
	}
});

