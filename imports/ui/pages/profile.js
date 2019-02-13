import moment from 'moment';
//import * as cloudinary from 'cloudinary';
//import cloudinary from 'cloudinary-jquery-file-upload';
import { Random } from 'meteor/random';

import { Schemas } from '/imports/api/collections.js';
import { Collections } from '/imports/api/collections.js';


import './profile.html';
import '/imports/api/collections.js';
import '../stylesheets/autoform.css';

import {requestPermission} from '/imports/startup/client/push-client.js';
import {getPermission} from '/imports/startup/client/push-client.js';

var options;

//const cloudinary = require('cloudinary-jquery-file-upload');

var authorSet = function(t){
	var author;
	//console.log('author', this);
	if (t.username.get() && Meteor.user() && t.username.get() == Meteor.user().username)
		author = {author: Meteor.user().username};

	if (Session.get('debug')) console.log('author', author, t.username.get(), Meteor.user(), this);	
	return author;
}

Template.profile.onCreated(function () {
	Meteor.subscribe('settings');
	Meteor.users.attachSchema(Schemas.User);
	let t = Template.instance();
	t.changePwd = new ReactiveVar( false );
	t.secretKey = new ReactiveVar( false );
	t.selector = new ReactiveVar( 'userprofile' );
	//t.username = new ReactiveVar(FlowRouter.current().params.username);
	t.subscribe('userdata',{userId: Meteor.userId(), debug: Session.get('debug')});		
	//t.subscribe('prousers', {userId: Meteor.userId()});
	t.subscribe('pricing');
});
Template.profile.onRendered(function () {

});
Template.profile.helpers({
	mobile(){
		if ($(window).width() < 768)
			return true;
	},
	selector(){
		//console.log('selector', Template.instance().selector.get());
		return Template.instance().selector.get();
	},
	userProfile() {
		//if (Session.get('debug')) console.log('profile', Meteor.user());
		var user, teamlead;
		if (FlowRouter.current().params && FlowRouter.current().params.username)
			user = Meteor.users.findOne({username: FlowRouter.current().params.username});
		else
			user = Meteor.user();
		if (Session.get('debug')) console.log('userprofile', user, this);
		return user;
	},
	changePwd() {
		return Template.instance().changePwd.get();
	},
	secret() {
		return Template.instance().secretKey.get();
	},
	avaurl(){
		console.log('avaurl profile', this, this.profile);
		if (this.profile && this.profile.avatar)
			return this.profile.avatar.replace(/upload/, 'upload/w_400,h_400,c_fill,g_face,r_max,q_auto,fl_progressive:steep,f_auto,dpr_auto,e_improve/w_200/');
		else
			return '/img/Batman-icon.png';
	},
	pricing(){
		return Collections.Pricing.findOne({title: 'pro'});
	}
});
Template.profile.events({
	'click .selector'(e, t) {
		console.log('clicked selector', e, e.currentTarget.id, this);
		if (e.currentTarget.id)
			t.selector.set(e.currentTarget.id);	
	},
	'click .editProfile' (e,t){
		//Modal.show('profileModal', this);
	},
  'click .export-data' ( event, template ) {

  },
  'click #changePwd' ( event, template ) {
		template.changePwd.set( true )
  },
	'click .editAvatar'(e,t){
		
	},
	'click #logOut'(e,r){
		AccountsTemplates.logout();
	},
});

Template.userprofile.helpers({
	user(){
		var data = Meteor.user();
		console.log('userprofile', data);
		return data;
	},
/* 	profile(){
		return this.profile;
	}, */
	schemaUser(){
		return Schemas.User;
	},
	schemaProfile(){
		return Schemas.UserProfile;
	}
});

Template.topprofile.onCreated(function () {
	let t = Template.instance();
	var self = this;
  t.state = new ReactiveDict();
	t.vrloading = new ReactiveVar();
	t.showtime = new ReactiveVar();
	t.sortPano = new ReactiveVar( 'date' );
	t.author =  new ReactiveVar();
	t.profilesett =  new ReactiveVar();
	t.editLogo = new ReactiveVar();
	t.username = new ReactiveVar(FlowRouter.getParam('username'));
	t.olarkdetails = new ReactiveVar();
	t.currentToken = new ReactiveVar();
	t.newComment = new ReactiveVar();
	t.subscribe('comments',{debug: Session.get('debug')});
	t.autorun( ()=> {
		FlowRouter.watchPathChange();
		t.author.set();
	});
	t.autorun(() => {
		var username = FlowRouter.getParam('username');
		if (!username)
			return;
		t.username.set(username);
		if (username) {
			t.subscribe('userdata',{username: username, debug: Session.get('debug')});		
		} else if (Meteor.user()) {
			// t.subscribe('userdata',{username: Meteor.user().username});
			// t.subscribe('prousers', {userId: Meteor.userId()});
			console.log('topprofile redirect', Meteor.user().username);
			//FlowRouter.go('/user/' + Meteor.user().username);
		}
	});	
});
Template.topprofile.onRendered(function () {
	let t = Template.instance();
	
	Meteor.setTimeout(()=>{
		if (window.olark && !Session.get('olarkdetails')) {
			if (Session.get('debug')) console.log('checking olark');
			window.olark('api.visitor.getDetails', (details)=>{
				if (Session.get('debug')) console.log('push api visitor details', details);
				Session.setPersistent('olarkdetails',details);
				//t.olarkdetails.set(details);
			})
		} else if (!window.olark && !Session.get('olarkdetails'))
			Session.set('olarkdetails', 'no olark in profile');
	},5000);
	
	t.autorun(()=>{
		if (Session.get('firebaseToken'))
			return;
		t.currentToken.set(Session.get('firebaseToken'));
	});

	t.autorun(()=>{
		if (Session.get('firebaseToken'))
			return;
	});
});
Template.topprofile.helpers({
	mobile(){
		console.log('window width', $(window).width() );
		if ($(window).width() < 768)
			return true;
	},
	userProfile() {
		let t = Template.instance();
		var user, teamlead;
		//console.log('topprofile userProfile', t.username.get());
		if (t.username.get())
			user = Meteor.users.findOne({username: t.username.get()});
		else
			user = Meteor.user();
		if (!user)
			return;

		if (Session.get('debug')) console.log('topprofile userProfile', user);
		if (user.services && user.services.twitter)
			user.services.twitter.link = 'http://twitter.com/' + user.services.twitter.screenName;
		return user;
	},
	avaurl(){
		//console.log('avaurl', this.profile);
		if (this.profile && this.profile.avatar)
			return this.profile.avatar.replace(/upload/, 'upload/w_400,h_400,c_fill,g_face,r_max,q_auto,fl_progressive:steep,f_auto,dpr_auto,e_improve/w_200/');
		else
			return '/img/Batman-icon.png';
	},
	author(){
		let t = Template.instance();
		if (Session.get('debug')) console.log('topprofile author', t.author.get());
		return t.author.get();
	},
	roles(){
		if (Meteor.user() && Meteor.user().roles)
			return _.flatten( _.values(Meteor.user().roles));
	},
	maxsize(){
		if (this.max)
			return parseInt(this.max / 1024 /1024);
		else
			return 5;
	},
	fa(){
		let t = Template.instance();
		var fa, token; 
		token = Session.get('firebaseToken');
		if (Notification.permission == 'denied')
			fa = 'red';
		else if (Notification.permission == 'granted' && Push.findOne({userId: Meteor.userId(), token: token, pushing: {$exists: 1}}))
			fa = 'blue';				
		else 
			fa = 'grey';
	
		if (Session.get('debug')) console.log('topprofile notif', fa, Notification.permission);
		return fa;
	},
/* 	prouser(){
		var username, user, pro, logo;
		logo = '/img/virgo360_transp_bckr.png';
		if (FlowRouter.current().params.username) {
			username = FlowRouter.current().params.username;
			user = Meteor.users.findOne({username: username});	
		} else
			username = Meteor.user().username;
		if (!user)
			return console.warn('prouser no user', user, username);
		pro = ProUsers.findOne({userId: user._id});
		if (!pro)
			return ;
		
		pro.sinceDate = pro.createdAt.toLocaleDateString("en-US");
		if (!pro.logo)
			pro.logo = '/img/virgo360_transp_bckr.png';
		console.log('prouser', pro, user, ProUsers.findOne());
		return pro;
	}, */
/* 	logourl(){
		var username, user, pro, logo;
		logo = this.logo;
		if (!this.logo)
			logo = '/img/virgo360_transp_bckr.png';
		console.log('logourl', logo, this);
		return logo;
	}, */
	editLogo(){
		return Template.instance().editLogo.get();
	},
	comments(){
		let t = Template.instance();
		//console.log('comments call out ', t.newComment.get());
		return t.newComment.get();
	},
	comment(){
		return Comments.findOne(this._id);
	},
	debug(){
		if (Session.get('debug')) 
			console.log('debug', this);
	}
});
Template.topprofile.events({
	'click .editProfile' (e,t){
		e.preventDefault();
		console.log('editProfile', this, e);
		if (this._id != Meteor.userId())
			return;
		FlowRouter.go('/profile');
		//Modal.show('profileModal', this);
	},
	'click .profilesett'(e,t){
		t.profilesett.set(!t.profilesett.get());
		if (t.profilesett.get()) {
			$('#profilesett').show().removeClass('hidden');
			$('#wrench').addClass('rotate90');
			$('#worlds').slideUp( "slow");
		}	else {
			$('#profilesett').slideUp( "slow");
			$('#wrench').removeClass('rotate90');
			$('#worlds').show( "slow");
		}
		//$('#wrench').addClass('animated zoomOut');
	},	
	'click .notifysett'(e,t){
		var updated;
		var push = Push.findOne({userId: Meteor.userId()});
		if (Notification.permission == 'denied')
			Bert.alert('You need to enable notifications in your browser', 'info');
		else if (Notification.permission == 'default')
			updated = getPermission(Session.get('olarkdetails'),'profile butt');
		else if (!push && Session.get('firebaseToken'))
			Meteor.call('push.sub',{token:Session.get('firebaseToken'), userId: Meteor.userId(), details: Session.get('olarkdetails')}, function(e,r){
				console.log('push **** firebase token !updated!', Meteor.userId(), Session.get('firebaseToken'), '\nolark:', Session.get('olarkdetails'), '\npush:', push, '\nres e,r:', e, r,);
			});	
		else if (push && push.pushing)
			updated = Push.update(push._id,{$unset: {pushing: 1}});
		else if (push && Session.get('firebaseToken'))
			updated = Push.update(push._id,{$addToSet: {token: Session.get('firebaseToken')}, $set: {pushing: 'checked'}});
		else if (push && !Session.get('firebaseToken')) {
			getPermission(Session.get('olarkdetails'),'profile butt');
			updated = Push.update(push._id,{$set: {pushing: 'checked'}});
		}
		if (Session.get('debug')) console.log('clicked notifysett', updated, '\ntoken:', Session.get('firebaseToken'), '\npush', push, Meteor.userId());
	},
	'click .editPro'(e,t){
		if (!Meteor.userId() || t.username.get() != Meteor.user().username)
			return;
		console.log('editLogo', this.pro, this);
		this.userId = this._id;
		if (this.team)
			Modal.show('teamuserModal', this.team);		
		else if (this.pro)
			Modal.show('prouserModal', this.pro);
		else {
			Bert.alert('become a PRO and upload your own logo', 'info', 'growl-top-right');
			FlowRouter.go('/pricing');
		}
		//t.editLogo.set(!t.editLogo.get());
	},
	'click .agree'(e,t){
		console.log('agree', this);
		Meteor.users.update(Meteor.userId(),{$set: {'profile.agree.date': new Date(), 'profile.agree.checked': true}});
		//t.editLogo.set(!t.editLogo.get());
	},
});

/* Template.connectAccounts.onRendered(function () {
	Tracker.autorun(function () {
		if (!Meteor.user())
			return;
		t.subscribe('user', Meteor.user().username);
	});
});

Template.connectAccounts.onRendered(function () {

	
	Tracker.autorun(function () {
		if (!Meteor.user())
			return;
		var service = Meteor.user().profile.notify;
		if ((service) && (service != 'instagram'))
			Remodal.open('firstTweet', service);
		else
			Remodal.close();
	});

	Tracker.autorun(function (){
		var services = _.pluck(Session.get('services'),'service');
		if ((service.get()) && (_.has(services, service.get()))) {
			Meteor.users.update(Meteor.userId(), {$set:{'profile.notify': service.get()}});
			service.set();
		} else {

		}
	});
});

Template.connectAccounts.helpers({
	ifDebug: function(){
		return Session.get('debug');
	},
	user_details: function(){
		var user_email;
		var userId = Meteor.userId();
		var api_key;
		var create_profile;
//		var user_emails = Meteor.user().emails;
		var services; 
		var user_details = Meteor.user();
		return user_details;
	},
	services: function(){
		return Session.get('services');
	},
	services2: function () {
		var user = Meteor.user(); 
		if (user) {
			return _.without(_.keys(Meteor.user().services), 'password', 'resume');
		} else {
			return;
		}
	},
	connected: function(){
		var connected = this;
		if (!Meteor.user() || !Meteor.user().services)
			return;
		connected.label = 'default';
		connected.url = '#';
		connected.css = 'connect';
		var services = Session.get('services');
		var service = this.service;
		var user_details = Meteor.user();
		if (!user_details)
			return;
		if (Session.get('debug'))	
			console.log('this service', services, service, this);
		if (Meteor.user() && Meteor.user().services[service]) {
			connected.yes = true;
			connected.label = 'success';
		}

		if (Session.get('debug'))	
			console.log('connected', service, 'connected:', connected, 'user_details:', user_details);
		
		return connected;
	},
	mute_sa: function(){
		var user = Meteor.user();
		console.log('checked_sa',  moment().format("HH:mm:ss.SSS"), this, user);
		if (!user)
			return;
		if (!_.contains(Meteor.user().profile.services, this.service))
			return 'checked';
	},
	first_sa: function(){
		var user = Meteor.user();
		if (!user)
			return;
		return user.profile.notify;
	},
	mylabel: function(){
		var label = 'default';
		if (_.contains(services, this.valueOf())) 
			label = 'success';
		return label;
	},
	ispwd: function(){
		if (Meteor.user() && Meteor.user().services && Meteor.user().services.password)
			return true;
	},
	on_connected: function(){
		return service.get();
	}

});

Template.connectAccounts.events({
	'click .connect': function(event, template) {
		event.preventDefault();
		console.log('connect to', 'target:', event.target.id, 'currentTarget:', event.currentTarget.id, template.find('.connect').id);
		if (event.currentTarget.id == 'google')
			Meteor.linkWithGoogle();
		if (event.currentTarget.id == 'facebook')
			Meteor.linkWithFacebook();
		if (event.currentTarget.id == 'twitter')
			Meteor.linkWithTwitter();
		if (event.currentTarget.id == 'instagram')
			Meteor.linkWithInstagram();

		var service = event.currentTarget.id;			
		Meteor.users.update(Meteor.userId(), {$addToSet:{'profile.services': service}});
		var services = _.pluck(Session.get('services'),'service');
	},

	'click .disconnect': function(event, template) {
		event.preventDefault();
		console.log('disconnect to', event.currentTarget.id, template.find('.disconnect').id);
		var service = event.currentTarget.id
		Meteor.call('unlinkService', service, function(err, result){ 
			if (Session.get('debug'))
				console.log('unlinkService', result);
			if (err)
				console.log(err);
		});
		Meteor.users.update(Meteor.userId(), {$pull:{'profile.services': service}});
	},	
	
	'click .send_sa': function(event, template) {
		console.log('send_sa', event, this);
		if (_.contains(exclude, this.service))
			sAlert.info('Publishing to ' + this.service + ' coming soon');
		else 
			Meteor.users.update(Meteor.userId(), {$pull:{'profile.services': this.service}});
			var params = {};
			params.text = 'I have just joined Orangry. Check my profile http://app.orangry.com/user/' + Meteor.user().username;
			params.service = this.service;
			Meteor.setTimeout(function(){
				Meteor.call('tweetIt', params);
			},10000);
	},
	
	'click .mute_sa': function(event, template) {
		console.log('mute_sa', event, this);
		Meteor.users.update(Meteor.userId(), {$addToSet:{'profile.services': this.service}});
	},
	
	'click .autopublish': function(event, template) {
		console.log('send_sa', event, this);
		if (_.contains(exclude, service.get())) {
			sAlert.info('Publishing to ' + service.get() + ' coming soon');
		} else {		
			Meteor.users.update(Meteor.userId(), {$pull:{'profile.services': service.get()}});
			var params = {};
			params.text = 'I have just joined Orangry. Check my profile http://app.orangry.com/user/' + Meteor.user().username;
			params.service = service.get();
			Meteor.setTimeout(function(){
				Meteor.call('tweetIt', params);
			},10000);
		}
	}
	
	
}); */

Template.agreement.helpers({
	isAdmin: function(){
		return Roles.userHasRole(Meteor.userId(), 'admin');
	},
	ifDebug: function () {
		return Session.get('debug');
	},
	dateAgree: function(){
		console.log('dateAgree', this, this.agreeTerm);
		if (this.agreeTerm)
			return moment(this.agreeTerm).format('LL');
	},
	checked(){
		if (Meteor.user().profile.agree && Meteor.user().profile.agree.checked)
			return true;
	}
});
Template.agreement.events({
	'click #NoWay': function(){
		Meteor.users.update(Meteor.userId(), {$unset: {'profile.agreeTerm': ''}})
	},
	'submit'(e,t){
		e.preventDefault();
		e.stopPropagation();				
	}
});

Template.privacy.helpers({
	isAdmin: function(){
		return Roles.userHasRole(Meteor.userId(), 'admin');
	},
	ifDebug: function () {
		return Session.get('debug');
	},
	dateAgree: function(){
		console.log('dateAgree', this, this.agreeTerm);
		if (this.agreeTerm)
			return moment(this.agreeTerm).format('LL');
	}
});

Template.settings.onCreated(function () {
	Meteor.users.attachSchema(Schemas.User);
	let t = Template.instance();
	t.ready = new ReactiveVar();
	t.next = new ReactiveVar(6);
	t.limit = new ReactiveVar(6);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	t.changePwd = new ReactiveVar( false );
	t.secretKey = new ReactiveVar( false );
	t.gps = new ReactiveVar();
	if (Session.get('autoCamera') == undefined)
		Session.get('autoCamera',true);
	t.autorun(function(){
		var data = Collections.Settings.find({}, {sort: {type: 1}});
		if (!data.count())
			return;
		//console.log('user settings integration', data.count(), data.fetch());
		var types = _.uniq(_.pluck(Collections.Settings.find({}, {sort: {type: 1}}).fetch(), 'type'));
		_.each(types,function(type){
			if (Collections.Settings.findOne({type: type, personal: true}))
				return;
			var enable;
			var service = Collections.Settings.findOne({common:true, type: type});
			if (service && service.enable)
				enable = service.enable;
			Meteor.call('settings.set', {_id: this._id, type: type, enable: enable, personal: true});
		});		
	});
});
Template.settings.onRendered(function () {
/* 	Meteor.setTimeout(function(){
		$('.toggleSwitch').bootstrapToggle();
	},1000); */
});
Template.settings.helpers({
	isMore(){
		let t = Template.instance();
		if (t.loaded.get() < 8 && t.limit.get() < 16)
			return true;
		return (t.limit.get() - t.next.get() <= t.loaded.get());
	},
	isReady() {
		let t = Template.instance();
		if (Session.get('debug')) console.log('sounds isReady', t.ready.get(), 'vars:', t.selectUsed.get(), t.limit.get(), t.sort.get(), t.loaded.get() );
		return t.ready.get();
	},
	user(){
		return Meteor.user();
	},
	changePwd() {
		return Template.instance().changePwd.get();
	},
	secret() {
		return Template.instance().secretKey.get();
	},
	isAdmin: function(){
		return (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) ;
	},
/* 	ifDebug: function () {
		return Session.get('debug');
	}, */
	useAdvanced: function(){
		if (Session.get('useAdvanced'))
			return 'checked';
	},	
	useGPS: function(){
		if (Session.get('useGPS'))
			return 'checked';
	},	
	autoload: function(){
		if (Session.get('autoload')) return 'checked';
	},
	gpsExif: function(){
		if (Session.get('gpsExif')) return 'checked';
	},

	// admin stuff
	statusDebug: function(){
		//console.log('debug', this);
		if (Session.get('debug'))
			return 'checked';
	},
	fullhistory: function(){
		if (!Session.get('fullhistory'))
			return 'checked';
	},
	status: function(){
		var status = Meteor.status();
		if ((status.status == 'connected'))
			status.checked = 'checked';
		else
			status.checked = '';
		status.server = status.status;
		if (Session.get('debug')) console.log('meteor status ',  status);
		return status;
	},	
	//non used

	dateEx: function(){
		if (Session.get('exactTime'))
			return moment(moment() - 100000).format('LLL'); 
		else
			return moment(moment() - 100000).fromNow(); 
	},
	dateCheck: function(){
		if (Session.get('dateCheck')) return 'checked';
	},
	libraries(){
		var data, sub, list;
		// list = {personal: true};
		// data = Collections.Settings.find(list, {sort: {createdAt: -1}});
		// if (!data.count())
		data = Collections.Settings.find({personal:true}, {sort: {type: 1}});
		//console.log('user settings integration', data.count(), data.fetch());
		return data;
	},
	enabled(){
		if (this.enable)
			return 'checked';
	},
	gps(){
		let t = Template.instance();
		let gps = Session.get('gps');
		console.log('[settings] gps:', gps);
		return gps;
	},
	debug(){
		if (Session.get('debug')) console.log('sounds debug', this);
	}
});
Template.settings.events({
  'click #changePwd' ( event, template ) {
		template.changePwd.set( true )
  },
  'click #genKey' ( event, template ) {
		if (!Meteor.user().profile.agree.checked)
			return Bert.alert('Please agree to the terms and conditions first', 'warning');
		template.secretKey.set();
		var secretKey = Random.secret(4).toUpperCase();
		Meteor.setTimeout(function(){
			template.secretKey.set( secretKey );
			Meteor.call('user.recordkey', secretKey);
		},1000);
  },
	'change .autoPortals' ( e, t ) {
		//console.log('scrollStyle', e.target, e.target.checked, $(e.target).prop('checked'));
		Session.setPersistent('autoPortals', !Session.get('autoPortals'));
		//$( "input:checked" ).val());
	},
	'change .autoTurn' ( e, t ) {
		Session.setPersistent('autoTurn', !Session.get('autoTurn'));
	},
	'change .autoCamera' ( e, t ) {
		Session.setPersistent('autoCamera', !Session.get('autoCamera'));
	},
	'change .preload' ( e, t ) {
		Session.setPersistent('preload', !Session.get('preload'));
	},	
	'change .useAdvanced' ( e, t ) {
		Session.setPersistent('useAdvanced', !Session.get('useAdvanced'));
	},	
	'change .useGPS' ( e, t ) {
		Session.setPersistent('useGPS', !Session.get('useGPS'));
		//Meteor.setTimeout(()=>{
			if (Session.get('useGPS')) BackgroundLocation.start();			
			else BackgroundLocation.stop();
	//},1000)
		
	},	
	'change .autosuggest': function (event, template) {
		//Session.set('debug', true);
		Session.setPersistent('autosuggest', !Session.get('autosuggest'));
		
	},
/* 	'change .feedbacksound': function (event, template) {
		//Session.set('debug', true);
		Session.setPersistent('feedbacksound', !Session.get('feedbacksound'));
	}, */
/* 	'change .autoload': function (event, template) {
		//Session.set('debug', true);
		Session.setPersistent('autoload', !Session.get('autoload'));
	}, */
/* 	'change .gpsExif': function (event, template) {
		//Session.set('debug', true);
		Session.setPersistent('gpsExif', !Session.get('gpsExif'));
	}, */
/* 	'click .soon' (e,t){
		Bert.alert('this feature is coming soon','info');
	}, */
/* 	'change .soon' (e,t){
		console.log('change soon', e.target.id);
		Meteor.setTimeout(function(){
			Session.set(e.target.id, false);
		},700);
		Bert.alert('this feature is coming soon','info');
	}, */
	// admin stuff
	'change .reconnect': function (event, template) {
		console.log('meteor status ',  Meteor.status(), $( "input:checked" ).val());
		if (event.target.checked) {
			Meteor.reconnect();
			if (Session.get('debug'))
				console.log('checkbox connect ',  Meteor.status(), this, $( "input:checked" ).val());
		} else {
			Meteor.disconnect();
			if (Session.get('debug'))
				console.log('checkbox connect off ', Meteor.status(), $( "input:checked" ).val());
		}
	},
	'change .debug': function (event, template) {
		Session.setPersistent('debug', !Session.get('debug'));
		console.log('debug set', Session.get('debug'));
	},
/* 	'change .fullhistory': function (event, template) {
		//Session.set('debug', true);
		//console.log('checkbox debug ', event.target.checked, $(event.target).prop('checked'), $( "input:checked" ).val());
		if (event.target.checked) {
			Session.setPersistent('fullhistory', true);
		} else {
			Session.setPersistent('fullhistory', false);	
		}
	}, */
	'change .enableLib'(e,t){
		console.log('clicked enableLib', this.type, e.target.checked, '\n', e, this);
		Meteor.call('settings.set', {_id: this._id, type: this.type, enable: e.target.checked, personal: true});
	},	
	
	// non used

/* 	'click': function (event, template) {
		console.log('general click ',  event, this, template);
	}, */
/* 	'click .removeauto': function (event, template) {
		var myId = template.find('.removeauto');
		console.log('template.find ', myId.attr, myId.name, myId.id, myId );
		AutoPlaces.remove(myId.id);
	},
	'click .disconnect': function (event, template) {
		Meteor.disconnect();
		console.log('meteor status ',  Meteor.status());
	}, */

/* 	'click .reconnect': function (event, template) {
		Meteor.reconnect();
		console.log('meteor status ',  Meteor.status());
	}, */

/* 	'click .nondebug': function (event, template) {
		Session.set('debug', false);
	}, */


});

Template.connectAccounts.onCreated(function () {
	Meteor.subscribe('services');
  let t = Template.instance();
	t.errorState = new ReactiveVar();
	Meteor.call('social.facebook.roles',function(err,res){
		console.log('social.facebook.roles', err, res);
	});	
});
Template.connectAccounts.onRendered(function () {

});
Template.connectAccounts.helpers({
	services(){
		var data = ServiceConfiguration.configurations.find();
		console.log('connectAccounts', data.fetch());
		return data;
	},
	connected(){
		var data = Meteor.user();
		console.log('connected', this.service, data, this);
		if (data && data.services)
			return 	_.contains(_.keys(data.services), this.service);
	},
	errorState(){
		let t = Template.instance();
		return t.errorState.get();
	},
	facebook(){
		var data = Meteor.user().services.facebook;
		console.log('facebook', data);
		return data;
	},
	schema(){
		return Schemas.SettingsFacebook;
	}
});
Template.connectAccounts.events({
  'click .connectfacebook'(e,t) {
		t.errorState.set();
		Meteor.linkWithFacebook({requestPermissions: ['user_friends', 'email', 'publish_actions']}, (err, r)=> {
			console.log('linkWithFacebook', err, r);
			if (err)
				t.errorState.set(err.error);
			else
				t.errorState.set();
		});
  },
  'click .connectgoogle'(e,t) {
    Meteor.linkWithGoogle({},(err,r)=> {
			if (err)
				t.errorState.set(err.error);
			else
				t.errorState.set();
		});
  }, 
	'click .connecttwitter'(e,t) {
    Meteor.linkWithTwitter({}, (err,r)=> {
      console.log( err, r, this);
    });
  },		
	'click .connectmedium'(e,t) {
    Meteor.linkWithMedium({}, (err,r)=> {
      console.log( err, r, this);
    });
  },	
  'click .disconnect'(e,t) {
		console.log('clicked disconnect', this.service, this);
    Meteor.call('social.unlink', {serviceName: this.service});
  }, 
	'submit'(e,t){
		e.stopPropagation();	
		console.log('submit', e, this);
		Meteor.call('social.facebook.roles',function(err,res){
			console.log('social.facebook.roles', err, res);
		});	
	}
});




