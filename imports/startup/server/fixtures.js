// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Schemas } from '/imports/api/collections.js';
import { Collections } from '/imports/api/collections.js';

let settings = [
	{type: 'localytics', func: 'localyticsInit', nonenv: 'dev2'},
	{type: 'segmentio', func: 'segmentioInit', nonenv: 'dev2'},
	{type: 'rollbar', func: 'rollbarInit', nonenv: 'dev2'},
	{type: 'instabug', func: 'instabugInit', nonenv: 'dev2'},
	{type: 'sentry', func: 'sentryInit', nonenv: 'dev2'},
	{type: 'oribi', func: 'oribiInit', nonenv: 'dev2'},
	{type: 'mixpanel', func: 'mixpanelInit', nonenv: 'dev2'},
	{type: 'hotjar', func: 'hotjarInit', nonenv: 'dev2'},
	{type: 'inspectlet', func: 'inspectletInit', nonenv: 'dev2'} 
];
Meteor.startup(() => {
	for (let setting of settings){
		setting.createdAt = new Date();
		//setting.common = false;
		Collections.Settings.upsert({type: setting.type}, {$set: setting});
	}	
});
