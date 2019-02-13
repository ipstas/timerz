
import { AutoForm } from 'meteor/aldeed:autoform';
import './portfolio.html';
//Images.attachSchema(SchemasImages);

import { Contact } from '/imports/api/links/collections.js';
import { Texts } from '/imports/api/links/collections.js';

window.Texts = Texts;

Template.portfolio.onCreated( () => {
	AutoForm.debug(); 
	Meteor.subscribe('contact');
	Meteor.subscribe('texts');
});
 
Template.portfolio.helpers({
	ImagesColl() {
		return Images;
	},
  contacts() {
		var contacts = Contact.find();
		//console.log('uploaded tour', tour, Template.instance().tour.get());
		return contacts;
	},
	dataTexts(){
		return Texts.findOne({title:'landing'});
	},
  error() {
    return Template.instance().error.get();
  }
});
 
Template.portfolio.events({
  'change [name="uploadJSON"]' ( event, template ) {

  },
});