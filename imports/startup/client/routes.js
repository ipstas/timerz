import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Accounts } from 'meteor/accounts-base';

import '../../ui/pages/not-found/not-found.js';
import '../../ui/components/useraccount.js';
import '../accounts-config.js';

// Import needed templates
import '../../ui/layouts/layout.js';
import '../../ui/pages/landing.js';
import '../../ui/pages/adminpage.js';
import '../../ui/pages/profile.js';
import '../../ui/pages/timers.js';
import '../../ui/pages/report.js';
import '../../ui/pages/archive.js';
import '../../ui/pages/about.js';
import '../../ui/pages/signin.js';
import '../../ui/pages/coming.js';

var nav = 'navbox';
var navdsk = 'navdsk';
var navmob = 'navmob';
var landing = 'landing';

FlowRouter.triggers.enter( [ enterFunction ] );
FlowRouter.triggers.exit( [ exitFunction ] );

function enterFunction() {
	//GAnalytics.pageview();
  //console.log( "Entering a route!" );
}

function exitFunction() {
  //console.log( "Exiting a route!" );
}

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'landing',
  action: function(params, queryParams) {
		console.log('landing', landing);
    BlazeLayout.render('layoutLanding', { nav: nav, main: 'landing' });
  },
});

FlowRouter.route('/adminpage', {
	//triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'adminpage',
  action() {
		if (Roles.userIsInRole(Meteor.userId(), 'admin', 'admGroup'))
			BlazeLayout.render('layout', { nav: navdsk, main: 'adminpage' });
		else
			FlowRouter.go('/');
			//BlazeLayout.render('layout', { nav: nav, main: 'profile' });
		console.log('user', Meteor.userId(), Meteor.user(), Roles.userIsInRole(Meteor.userId(), 'admin', 'admGroup'));
  },
});

FlowRouter.route('/profile', {
  name: 'profile',
  action() {
    BlazeLayout.render('layout', { nav: navdsk, main: 'profile' });
  },
});

FlowRouter.route('/timers/', {
	//triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'timers',
	action: function(params, queryParams) {
		Tracker.autorun(function(computation){
			if (!Meteor.userId()) 
				return FlowRouter.go('/signIn');
			if (Meteor.userId() && !Meteor.user()) return;
			FlowRouter.go('/timers/' + Meteor.user().username);
			computation.stop();
		});
	},
});

FlowRouter.route('/timers/:username', {
  name: 'timers',
	action: function(params, queryParams) {
		BlazeLayout.render('layout', { nav: navdsk, main: 'user' });
	},
});

FlowRouter.route('/report/:_id', {
  name: 'report',
	action: function(params, queryParams) {
		BlazeLayout.render('layout', { nav: navdsk, main: 'report' });
	},
});

FlowRouter.route('/archive/:username', {
  name: 'archive',
	action: function(params, queryParams) {
		BlazeLayout.render('layout', { nav: navdsk, main: 'archive' });
	},
});

FlowRouter.route('/soon', {
  name: 'coming',
  action() {
    BlazeLayout.render('layout', { nav: navdsk, main: 'coming' });
  },
});

FlowRouter.route('/settings', {
  name: 'settings',
  action: function(params, queryParams) {
		console.log('settings', this, params, queryParams);
    BlazeLayout.render('layout', { nav: navdsk, main: 'settings' });
  },
});

FlowRouter.route('/about', {
  name: 'about',
  action: function(params, queryParams) {
		console.log('about', this, params, queryParams);
    BlazeLayout.render('layout', { nav: navdsk, main: 'about' });
  },
});

FlowRouter.route('/feedback', {
  name: 'feedback',
  action: function(params, queryParams) {
		console.log('feedback', this, params, queryParams);
    BlazeLayout.render('layout', { nav: navdsk, main: '_userFeedback' });
  },
});

/* FlowRouter.route('/signIn', {
  name: 'signIn',
  action: function(params, queryParams) {
		FlowRouter.go('/sign-in');
		console.log('signIn', this, params, queryParams);
    BlazeLayout.render('layout', { nav: navdsk, main: 'signIn' });
  },
}); */

FlowRouter.route('/404', {
  name: '404',
  action() {
		console.log('404', this);
    BlazeLayout.render('layoutLanding', { main: 'App_notFound' });
  },
});

FlowRouter.notFound = {
	name: 'not found redirect',
  action() {
		console.log('not found', this);
		FlowRouter.go('/404');
  },
};


if ('AccountsTemplates' in window) {
	AccountsTemplates.configureRoute('signIn', {
		layoutType: 'blaze',
		name: 'signin',
		template: 'useraccount',
		layoutTemplate: 'layoutLanding',
		layoutRegions: {
			nav: 'nav',
			footer: 'footer'
		},
		contentRegion: 'main'
	});

	AccountsTemplates.configureRoute('signUp', {
		template: 'useraccount',
		layoutTemplate: 'layoutLanding',
		layoutRegions: {
			nav: 'nav',
			footer: 'footer'
		},
		contentRegion: 'main'
	});

	AccountsTemplates.configureRoute('changePwd');
	AccountsTemplates.configureRoute('forgotPwd');
	AccountsTemplates.configureRoute('resetPwd');
	//AccountsTemplates.configureRoute('signIn');
	//AccountsTemplates.configureRoute('signUp');
	AccountsTemplates.configureRoute('verifyEmail');
	
	
}

/* AdminConfig = {
	adminEmails: ['stanp@xlazz.com','yana@kiborgov.net'],
  collections: {
    Texts: {
			collectionObject: Texts
		},
    Tours: {
			collectionObject: Tours
		},
    Images: {
			collectionObject: Images
		},
    Showtime: {
			collectionObject: Showtime
		},
    Contact: {
			collectionObject: Contact
		},
  }
}; */



