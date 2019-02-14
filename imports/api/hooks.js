import moment from 'moment';

import { AutoForm } from 'meteor/aldeed:autoform';
import { Random } from 'meteor/random';
import { tagsMassage } from './functions.js';
import { usernameMassage } from './functions.js';

AutoForm.debug();

export const hooksObject = {
  onError: function (doc) {
    console.log("onError hook called with arguments", 'context:', this, '\ndoc:', doc);
		this.event.preventDefault();
  },
	// onSuccess: function (doc) {
		// console.log("onSuccess on all input/update/method forms!", this, '\ndoc:', doc);
		// this.event.preventDefault();
		// return false;
	// },
};
export const hooksContact = {
	
	before: {
		// Replace `formType` with the form `type` attribute to which this hook applies
		insert: function(doc) {
			// Potentially alter the doc
			const ip = headers.get()['x-real-ip'] || headers.get()['x-forwarded-for']
			doc.createdAt = new Date();
			doc.details = {
				ip: ip,
				referrer: document.referrer,
				lang: navigator.language,
				agent: navigator.userAgent,
				platform: navigator.platform
			}
			if (doc.estimate)
				doc.breakdown = Collections.Cost.findOne({userId:Session.get('appUser')._id});
			return doc;
		}
	},

	// Called when any submit operation succeeds
	onSuccess: function(formType, result) {
		console.log('hooksClients', this, formType, result);
		//signedBeta
		if ((this.insertDoc) && (this.insertDoc.questionType == 'beta')) {	
			Meteor.call('user.mailchimp', {email:this.insertDoc.email, name: this.insertDoc.name});
			if (window.analytics) 
				analytics.track("Signed Final", {
					referrer: document.referrer,
					category: "LangingSigned",
					label: this.insertDoc.abtest
				});	
			FlowRouter.setQueryParams({nav: 'signed'});
		}
		
		Meteor.call('email.admin', this.insertDoc);
			
		this.insertDoc.contactId = result;
		this.insertDoc.formId = this.formId;
		Session.set('contacted', this.insertDoc);
		Session.set('submitted', result);
	},
};
export const hooksAddTimer = {
/* 	onSubmit: function (doc) {
		Schemas.Timers.clean(doc);
		console.log("Timers doc with auto values", doc);
		this.done();
		return false;
	}, */
  formToDoc: function(doc) {		
		doc.userId = Meteor.userId();
		doc.createdAt = new Date();
		console.log('formToDoc typeless hooksAddTimer', doc, this);
    // alter doc
    return doc;
  },
/* 	before: {
		formToDoc: function(doc) {
			console.log('formToDoc before hooksAddTimer', doc, this);
			// alter doc
			return doc;
		},
		insert: function (doc) {
			console.log('formToDoc insert hooksAddTimer', doc, this);
			doc.userId = Meteor.userId();
			doc.createdAt = new Date();
			doc.timeSpent = 0;
			doc.archived = false;
			return doc;
		},		
		update: function (doc) {
			console.log('formToDoc update hooksAddTimer', doc, this);
			return doc;
		}
  }, */
	onSuccess: function(formType, result) {
		console.log('onSuccess hooksAddTimer', result, this);
		Modal.hide();
	},
};
export const hooksEditTimer = {
	onSuccess: function(formType, result) {
		console.log('onSuccess hooksAddTimer', result, this);
		Modal.hide();
	},
};
export const hooksEditSession = {
	onSubmit: function (doc) {
		Schemas.Timers.clean(doc);
		console.log("Timers doc with auto values", doc);
		this.done();
		if (doc.stop < doc.start) {
			console.warn('stop before start');
			return true;
		}
		return false;
	},
  formToDoc: function(doc) {
		if (doc.stop < doc.start)
			return console.warn('stop before start');
		console.log('formToDoc typeless hooksEditSession', doc, this);
    return doc;
  },
	before: {
		update: function (doc) {
			console.log('formToDoc update hooksEditSession', doc.$set.stop < doc.$set.start, 'doc:', doc, this);
			if (doc.$set.stop < doc.$set.start) {
				console.warn('stop before start');
				Bert.alert('stop can not be before start', 'danger');
				//this.addStickyValidationError(key, type, [value])
				return false;
			} else 
				return doc;
		}
  },
	onSuccess: function(formType, result) {
		console.log('onSuccess hooksEditSession', result, this);
	},

};

AutoForm.addHooks(['contactForm', 'addContact','collectForm','reportForm','feedbackForm', 'uninstallForm'], hooksContact);
AutoForm.addHooks('insertTimerForm', hooksAddTimer);
AutoForm.addHooks('updateTimerForm', hooksEditTimer);
AutoForm.addHooks(null, hooksObject);
