import { Collections } from '/imports/api/collections.js';
import { Schemas } from '/imports/api/collections.js';

import './collectform.html';
import '../stylesheets/autoform.css';

Template.contactForm.helpers({
	schema(){
		let schema = Schemas.Contact;
		console.log('[contactform]', schema);
		return schema;
	},	
	collection(){
		return Collections.Contact;
	},
	user(){
		return Meteor.user() || Session.get('appUser');
	},
	email(){
		if (!Meteor.user() || !Meteor.user().emails) return;
		return Meteor.user().emails[0].address;
	},
	hashed(){
		return Session.get('hashed');
	},
	contacted(){
		if (( Session.get('contacted')) && ( Session.get('contacted').formId == 'contactForm'))
			return Session.get('contacted');
	},
	device: function(){
		return navigator.userAgent;
	},
	today() {
		return new Date();
	},
	referrer(){
		return document.referrer;
	}

});

Template.collectForm.helpers({
	schema(){
		let schema = Schemas.Contact;
		console.log('[collectForm] schema', schema);
		schema._schema.email.optional = false;
		return schema;
	},	
	collection(){
		return Collections.Contact;
	},
	referrer(){
		return document.referrer;
	},
  collected() {
		if (( Session.get('contacted')) && ( Session.get('contacted').questionType == 'beta'))
			return Session.get('contacted');
  },
	user(){
		return Meteor.user() || Session.get('appUser');
	},
	email(){
		if (!Meteor.user() || Meteor.user().emails) return;
		return Meteor.user().emails[0].address;
	},
	today: function(){
		return new Date();
	},
	device: function(){
		return navigator.userAgent;
	},
/* 	ab(){
		console.log('collectform ab', this.abtest);
		return this.abtest;
	}, */
	debug(){
		console.log('collectform', this);
	}
});
Template.collectForm.events({
  'submit form'(e,t) {
		console.log('contactForm was submitted', this);
		//Session.set('contacted', true);
    e.preventDefault();
		e.stopPropagation();
  },
  'click #editform'(e,t) {
		Session.set('contacted', false);
    e.preventDefault();
		e.stopPropagation();
  },
	'click .cancel'(e, t) {
		Modal.hide();
		Session.set('contacted');
	},
	'click .close'(e, t) {
		Modal.hide();
		Session.set('contacted');
	},
});

Template.feedbackForm.helpers({
	schema(){
		return Schemas.Contact;
	},	
	collection(){
		return Collections.Contact;
	},
	contacted: function(){
		if (( Session.get('contacted')) && ( Session.get('contacted').formId == 'feedbackForm'))
			return Session.get('contacted');
	},
	type: function(){
		if (this.type)
			return this.type;
		else
			return 'other';	
	},
	url: function(){
		return location.href;
	},
	device: function(){
		return navigator.userAgent;
	},
});

Template.reportForm.helpers({
	schema(){
		return Schemas.Reports;
	},	
	collection(){
		return Collections.Reports;
	},
	contacted(){
		if (( Session.get('contacted')) && ( Session.get('contacted').formId == 'reportForm'))
			return Session.get('contacted');
	},
	user(){
		return Meteor.user() || Session.get('appUser');
	},
	email(){
		if (!Meteor.user() || !Meteor.user().emails) return;
		return Meteor.user().emails[0].address;
	},
	today(){
		return new Date();
	},
/* 	postId(){
		console.log('postId:', this);
		
	}, */
	url(){
		return document.URL;
	},
	device(){
		return navigator.userAgent;
	},
});
Template.reportForm.events({
	'click .cancel'(e, t) {
		Modal.hide();
		Session.set('contacted');
	},
	'click .close'(e, t) {
		Modal.hide();
		Session.set('contacted');
	},
	'click'(e,t){
		console.log('clicked', e, this);
	}
});

Template.sorryForm.onDestroyed( () => {
	// remove token user on ext uninstall
	if (localStorage['Graffiti.token'])
		Meteor.call('user.uninstall', {token:localStorage['Graffiti.token']});
});
Template.sorryForm.helpers({
	schema(){
		return Schemas.Contact;
	},	
	collection(){
		return Collections.Contact;
	},
	user(){
		let user = Meteor.user() || Session.get('appUser') || {};
		user.profile = user.profile || {};
		user.name = user.profile.name || user.username;
		if (user.name == user._id)
			user.name = '';
		if (user.emails && user.emails.length)
			user.email = user.emails[0].address;
		user.today = new Date();
		return user;
	},
	device: function(){
		return navigator.userAgent;
	},
	contacted: function(){
		if (( Session.get('contacted')) && ( Session.get('contacted').formId == 'uninstallForm'))
			return Session.get('contacted');
	},

});

Template.surveyForm.onDestroyed( () => {

});
Template.surveyForm.helpers({
	schema(){
		return Schemas.Contact;
	},	
	collection(){
		return Collections.Contact;
	},
	surveyItem(){
	
	},
	user(){
		let user = Meteor.user() || Session.get('appUser') || {};
		user.profile = user.profile || {};
		user.name = user.profile.name || user.username;
		if (user.name == user._id)
			user.name = '';
		if (user.emails && user.emails.length)
			user.email = user.emails[0].address;
		user.today = new Date();
		return user;
	},
	device: function(){
		return navigator.userAgent;
	},
	contacted: function(){
		if (( Session.get('contacted')) && ( Session.get('contacted').formId == 'surveyForm'))
			return Session.get('contacted');
	},

});
