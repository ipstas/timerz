import './signin.html';

import { Collections } from '/imports/api/collections.js';
import { Schemas } from '/imports/api/collections.js';

Template.signReason.onCreated( ()=> {
	
	let t = Template.instance();
  t.state = new ReactiveDict();
	t.enlarge = new ReactiveVar();
	t.contactUs = new ReactiveVar();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	t.showForm = new ReactiveVar();
	Meteor.subscribe('texts');
	t.autorun(function(){
		if (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) 
			Meteor.subscribe('contact');
	});
});

Template.signReason.onRendered(()=> {
	let t = Template.instance();
	
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

});

Template.signReason.helpers({
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
  data() {
    let data = Collections.Texts.findOne({title:'signReasons'}) ;
		// if (data && data.screens)
			// length = data.screens.length;
		return data;
  },
	newRecord(){
		let t = Template.instance();
		return t.newRecord.get();
	},
	editRecord(){
		let t = Template.instance();
		console.log('editRecord', t.editRecord.get());
		return t.editRecord.get();
	},
	collection() {
    return Collections.Texts;
  },
  schema() {
    return Schemas.Texts;
  },
});

Template.signReason.events({
	'click .href'(e,t){
		e.preventDefault();
	},	
	'click .toOne'(e, t){
		e.preventDefault(); 
		t.contactUs.set(true);
		$('html, body').animate({scrollTop: $("#one").offset().top  -1 }, 'slow');
		if (window.analytics)
			analytics.track('toOne', {
				referrer: document.referrer,
				category: "Langing",
				label: 'a'
			});				
	},	
	'click .toTwo'(e, t){
		e.preventDefault(); 
		t.contactUs.set(true);
		$('html, body').animate({scrollTop: $("#two").offset().top  -1}, 'slow');		
		if (window.analytics)
			analytics.track('toTwo', {
				referrer: document.referrer,
				category: "Langing",
				label: 'a'
			});	
	},	
	'click .toContact'(e, t){
		e.preventDefault(); 
		t.contactUs.set(true);
		$('html, body').animate({scrollTop: $("#contact").offset().top -1 }, 'slow');	
		if (window.analytics)
			analytics.track('toContact', {
				referrer: document.referrer,
				category: "Langing",
				label: 'a'
			});	
	},
	'click .tryMe' (e,t){
		FlowRouter.go('/timers');
		$('html, body').animate({scrollTop: $('body').offset().top -200 }, 'slow');
		if (window.analytics)
			analytics.track('Download -> webappNow', {
				referrer: document.referrer,
				category: "LangingSigned",
				label: 'a'
			});	
	},
	'click .enlargeImg'(e,t){
		console.log('[clicked enlarge]', e, this);
		if (!t.enlarge.get())
			t.enlarge.set(this.txt);
		else
			t.enlarge.set()
	},
	'click #webapp' (e,t){
		FlowRouter.go('/timers');
		$('html, body').animate({scrollTop: $('body').offset().top -200 }, 'slow');
		if (window.analytics)
			analytics.track('Download -> webapp', {
				referrer: document.referrer,
				category: "LangingSigned",
				label: 'a'
			});	
	},
	'click #android' (e,t){
		//FlowRouter.go('/timers');
		//$('html, body').animate({scrollTop: $('body').offset().top -200 }, 'slow');
		//Modal.show('tryitModal');
		window.open('https://play.google.com/store/apps/details?id=net.timerz.www.loc','_blank');
		if (window.analytics)
			analytics.track('Download -> android', {
				referrer: document.referrer,
				category: "LangingSigned",
				label: 'b'
			});		
	},
	'click #ios' (e,t){
		t.showForm.set(true);
		if (window.analytics)
			analytics.track('Download -> ios', {
				referrer: document.referrer,
				category: "LangingSigned",
				label: 'c'
			});	
	},
	'click .newRecord'(e, t) {
		t.newRecord.set(true);
		t.editRecord.set();
	},
	'click .editRecord'(e, t) {
		console.log('[landing.js] editRecord', this);
		t.editRecord.set(true);
		t.newRecord.set();
	},
	'submit'(e,t){
		t.newRecord.set();
		t.editRecord.set();
	},
	'click .cancel'(e,t){
		t.newRecord.set();
		t.editRecord.set();
	},
});
