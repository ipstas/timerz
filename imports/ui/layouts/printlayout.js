import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './printlayout.html';
import '../components/nav.js';
import '../components/footer.js';

import '/imports/api/get_html.js';

BlazeLayout.setRoot('body');


Template.printlayout.onCreated(function() {

});
	
Template.printlayout.onRendered(function() {

});

Template.printlayout.events({

});