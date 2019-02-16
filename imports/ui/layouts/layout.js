import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import {Collections} from '/imports/api/collections.js';
import {Schemas} from '/imports/api/collections.js';

import './layout.html';
import '../components/nav.js';
import '../components/footer.js';
import '../components/status.js';


//import '/imports/ui/stylesheets/grayscale.css';
import '/imports/ui/stylesheets/xlazz.css';
//import '/imports/ui/stylesheets/bootstrap.css';
import '/imports/ui/stylesheets/stylish-portfolio.css';			
//import '/imports/ui/stylesheets/main.css';			

BlazeLayout.setRoot('body');

//import '/imports/functions/page_scroll.js';
//import '/imports/external/grayscale.js';
//import '/imports/external/bootstrap.js';

Template.layoutLanding.onRendered(()=>{
	//$('#loadingspinner').fadeOut('slow');
	$('.injectloading').addClass('animated fadeOut');
	$('#loadingspinner').fadeOut();
	Meteor.setTimeout(()=>{
		$('.injectloading').addClass('d-none');
	},1000)
	//$('#loadingspinner').fadeOut();
	$('body').css('overflow', 'auto');
});
Template.layoutLanding.events({
	'click .page-scroll'(event, template){
		var anchor;
		if (event.target.hash)
			anchor = template.find(event.target.hash);
		if (!anchor)
			return;
		console.log('click ', anchor, event, template);
/* 		$('html, body').stop().animate({
			scrollTop: $(anchor).offset().top
		}, 1000, 'easeInOutExpo');
		event.preventDefault(); */
		$('html, body').animate({scrollTop: $(event.target.hash).offset().top -20 }, 'easeInOutExpo');
		$("#menu-close").click();
		event.preventDefault();
	},
	'scroll'(event, template){
		$("#menu-close").click();
		//event.preventDefault();
	},
/* 	'mousewheel': function(event, template) {
		$("#menu-close").click();
	}, */
/* 	'click': function(event,template) {
		//console.log('menu-toggle', event, template.active.get());
		$('#menu').removeClass('slideInRight ').addClass(' slideOutRight');
		//template.active.set();
		event.preventDefault();
	}, */
});

Template.layout.onCreated(()=>{
	Meteor.subscribe('contact');
});
Template.layout.onRendered(()=>{
	$('#loadingspinner').fadeOut('slow');
	$('#injectloadingspinner').fadeOut();
	$('#loadingspinner').fadeOut();
	$('body').css('overflow', 'auto');
});
Template.layout.helpers({
  newContact() {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator'], 'admGroup')) return;
    return data = Collections.Contact.findOne({
      seen: {
        $nin: [Meteor.userId()]
      }
    });
  },
});
Template.layout.events({
	'click .page-scroll'(event, template){
		var anchor;
		if (event.target.hash)
			anchor = template.find(event.target.hash);
		if (!anchor)
			return;
		console.log('click ', anchor, event, template);
/* 		$('html, body').stop().animate({
			scrollTop: $(anchor).offset().top
		}, 1000, 'easeInOutExpo');
		event.preventDefault(); */
		$('html, body').animate({scrollTop: $(event.target.hash).offset().top -20 }, 'easeInOutExpo');
		$("#menu-close").click();
		event.preventDefault();
	},
	'scroll'(event, template){
		$("#menu-close").click();
		//event.preventDefault();
	},
	'mousewheel': function(event, template) {
		$("#menu-close").click();
	},
	'click .menuClick'(e,t) {
		console.log('[layout] menuClick', e);
		if ($('#navsection').hasClass('d-none') || $('#menudsk').hasClass('slideOutLeft')) {
			//$('#menudsk').removeClass('d-none z-down slideOutLeft').addClass('slideInLeft');
			$('#navsection').removeClass('z-down d-none').addClass('z-up slideInLeft').fadeIn();
			$('#bars').addClass('rotate90');
		} else {
			//$('#menudsk').removeClass('slideInLeft ').addClass(' slideOutLeft');
			$('#navsection').removeClass('z-up').addClass('z-down').fadeOut();
			$('#bars').removeClass('rotate90');
		}
		//navigator.vibrate(200);
		e.preventDefault();
	},
  'click ul li'(e,t) {
		if ($('html').width() > 574) return;
		//$('#menudsk').removeClass('slideInLeft ').addClass(' slideOutLeft').addClass('d-none');
		$('#navsection').removeClass('z-up').addClass('z-down d-none').fadeOut();
		$('#bars').removeClass('rotate90');
		//navigator.vibrate(200);
		//e.preventDefault();
	},
/* 	'click': function(event,template) {
		//console.log('menu-toggle', event, template.active.get());
		$('#menu').removeClass('slideInRight ').addClass(' slideOutRight');
		//template.active.set();
		event.preventDefault();
	}, */
});
