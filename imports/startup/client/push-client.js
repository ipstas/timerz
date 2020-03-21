//import * as firebase from "firebase";
var firebase = require("firebase");
import { Collections } from '/imports/api/collections.js';

var userId, worker, requested;
var pushsubs = new ReactiveVar();
var self2 = this;
this.virgoWorker = new ReactiveVar();

if (!('serviceWorker' in navigator)) { 
	console.log('push  Service Worker isnt supported on this browser, disable or hide UI. ');
	return; 
}

if (!('PushManager' in window)) { 
	console.log('Push isnt supported on this browser, disable or hide UI. ');
	return; 
}

	
var config = {
    apiKey: "AIzaSyBsBJ8boCp34qaY8JdejLSfOFjUQRg50tM",
    authDomain: "hundredgraphs.firebaseapp.com",
    databaseURL: "https://hundredgraphs.firebaseio.com",
    projectId: "hundredgraphs",
    storageBucket: "hundredgraphs.appspot.com",
    messagingSenderId: "563816874739",
    appId: "1:563816874739:web:9a123f0c19cf29fbf66d86"
};
firebase.initializeApp(config);
const messaging = firebase.messaging();
window.virgoMessaging = messaging;
window.virgoFirebase = firebase;

let notificationTitle = '360 Zipper update';
notificationOptions = {
	body: '360 Zipper has an update for you',
	icon: '/360icon.png',
	vibrate: [100, 50, 100],
	actions: [
		{action: 'explore', title: 'Explore this new world'},
	],
	click_action: "https://www.360zipper.com"
};		

export const getPermission = function(data, caller){
	var token = messaging.getToken()
		.then(function(currentToken) {
			if (Session.get('debug')) console.log('push getPermission, Instance ID token 0', currentToken);
			if (currentToken) {
				//console.log('push getPermission, Instance ID token 1', currentToken);
				Session.setPersistent('firebaseToken', currentToken);
				//pushToken(currentToken, data);
				if (Session.get('debug')) console.log('push getPermission, Instance ID token found', Session.get('firebaseToken'), Meteor.user(), '\ndata:', data);
			} else {
				console.log('push getPermission, No Instance ID token available. Request permission to generate one.');
				// Show permission UI.
				askPermission(data);
			}
			return currentToken;
		})
		.catch(function(err) {
			console.warn('push getPermission, An error occurred while retrieving token. ', err);
			//showToken('Error retrieving Instance ID token. ', err);
			//setTokenSentToServer(false);
		});	
		
		if (Session.get('debug')) console.log('push getPermission, token:', token, caller, data);	
		return token;
}

function askPermission(data) {
	messaging.requestPermission()
	.then(function(res) {
		if (Session.get('debug')) console.log('push askPermission, Notification permission granted in', res, '\ndata:', data);
		getPermission(data);
	})
	.catch(function(err) {
		console.warn('push askPermission, Unable to get permission to notify.', err);
	});
}


const updateToken = function (oldToken, currentToken, data){
	Tracker.autorun(()=>{
		var userId = Meteor.userId() || Session.get('virgoUserId').userId;
		if (!userId) return;
		var push = Collections.Push.findOne({userId: userId});
		if (!push) return;
		
		console.log('push firebase remove token userId', userId, 'sub ready:', '\npush:', push, '\ntoken', currentToken, '\n');
		Meteor.call('push.token', {_id: push._id, oldToken: oldToken, currentToken: currentToken, caller: 'updateToken'});
			
	});
}

const pushToken = function (currentToken, data){
	if (Session.get('debug')) console.log('push firebase pushToken started', Meteor.userId(), 'sub ready:', '\ntoken', currentToken, '\ndata:', data, '\n\n');
	Tracker.autorun(()=>{
		if (!Meteor.userId() && !Session.get('virgoUserId')) return;
		var userId = Meteor.userId() || Session.get('virgoUserId').userId;
		if (!userId) return;
		//var pushsub = Meteor.subscribe('push',{userId: userId});
		if (!pushsub.ready()) return;
		
		var push = Collections.Push.findOne({userId: userId});
		if (Session.get('debug')) console.log('push pushToken firebase add token userId', userId, 'sub ready:', '\npush:', pushsub.ready(), push, '\ntoken', currentToken, '\ndata:', data, '\n\n');
		
		if (push && _.contains(push.token,currentToken)) {
			if (!Meteor.userId()) {
				var virgoUser = Session.get('virgoUserId');
				virgoUser.push_id = push._id;
				Session.set('virgoUserId', virgoUser);
			}
		} else if (!push) {		
			Meteor.call('push.sub',{token:currentToken, userId: userId, details: data}, function(e,r){
				console.log('push **** firebase token !updated!', userId, currentToken, '\npush:', push, '\nres:', e, r,);
				//Meteor.subscribe('userdata', {userId: userId});
			});
		}	else if (push) {
			//Push.update(push._id, {$addToSet: {token: currentToken}});
			Meteor.call('push.token', {_id: push._id, currentToken: currentToken, caller: 'pushToken'});
		}	
	});
}

const addTokenDB = function(currentToken, userId){
	var push, olarkdetails, user, username;
	push = Push.findOne({userId: userId});

	if (Session.get('debug')) console.log('push autorun firebase add token userId', userId, 'sub ready:', pushsubs.get(), '\npush:', push, '\ntoken', currentToken, '\n\n');
	olarkdetails = Session.get('olarkdetails');
	user = Meteor.user();
	if (user)
		username = user.username;
	else
		username = 'anonymous';
	if (!push) {			
		var updated = Push.insert({
			userId: userId,
			username: username,
			pushing: 'checked',
			createdAt: new Date(),
			push: 'fcm', 
			token: [currentToken],		
			details: olarkdetails,
		});
		if (Session.get('debug')) console.log('\npush **** firebase token !inserted! ', updated, userId, '\ntoken:', currentToken, '\npush:', push, '\n\n');
	} else if (push && !Push.find({token:currentToken}).count()) {
		if (olarkdetails)
			Meteor.call('push.update', {_id: push._id, olarkdetails: olarkdetails});
			//Push.update(push._id, {$set:{details: olarkdetails}});
		//var updated = Push.update(push._id, {$addToSet: {token: currentToken}});
		Meteor.call('push.token', {_id: push._id, currentToken: currentToken, caller: 'addTokenDB'});
		if (Session.get('debug')) console.log('\npush **** firebase token !updated! ', updated, userId, '\ntoken:', currentToken, '\npush:', push, '\n\n');
	}		
}


// changed Token
Tracker.autorun(()=>{
	console.log('push token changed report', Session.get('firebaseToken'));
});

// subscribe to Push DB
Tracker.autorun(()=>{
	if (!Meteor.userId() && !Session.get('virgoUserId')) return;
	var userId = Meteor.userId() || Session.get('virgoUserId').userId;
	if (!userId) return;	
	var subs = Meteor.subscribe('push', {userId: userId});
	pushsubs.set(subs.ready());
});


// if no session token, getPermission
Tracker.autorun(()=>{
	if (!pushsubs.get() || !Session.get('olarkdetails') || Session.get('firebaseToken'))
		return //console.warn('push autorun out', pushsubs.get(), Session.get('olarkdetails'), Session.get('firebaseToken'));
	console.log('push autorun ask', pushsubs.get(), Session.get('olarkdetails'), Session.get('firebaseToken'));
	getPermission(Session.get('olarkdetails'), 'autorun');
});

var count = 0;


//update Push DB with new token
Tracker.autorun(()=>{
	var push;
	var currentToken = Session.get('firebaseToken');
	if (!currentToken) 
		return console.warn('push token to db not ready', currentToken);
	else
		if (Session.get('debug')) console.log('push token to db ready', currentToken);
	if (!Meteor.userId() && !Session.get('virgoUserId')) 
		return console.warn('push token to db no userId', Meteor.userId(), Session.get('virgoUserId'));
	var userId = Meteor.userId() || Session.get('virgoUserId').userId;
	if (!userId) return;	
	if (!pushsubs.get()) return;
	addTokenDB(currentToken, userId);
});

// update olark
Tracker.autorun((computation)=>{
	if (!Meteor.userId() && !Session.get('virgoUserId') && !Session.get('olarkdetails')) return;
	if (!pushsubs.get()) return;
	
	var userId = Meteor.userId() || Session.get('virgoUserId').userId;
	var olarkdetails = Session.get('olarkdetails');

	var push = Push.findOne({userId:userId});
	if (!push || !olarkdetails || !olarkdetails.ip)
		return;
	if (push.ip == olarkdetails.ip)
		return;
	Meteor.call('push.update', {_id: push._id, olarkdetails: olarkdetails, debug: Session.get('debug')});
	//Push.update(push._id,{$set:{details: olarkdetails}});
	if (Session.get('debug')) console.log('push olark updated', olarkdetails);
	computation.stop();
});

messaging.onTokenRefresh(function() {
	messaging.getToken()
	.then(function(refreshedToken) {
		console.log('push Token refreshed.', refreshedToken);
		// Indicate that the new Instance ID token has not yet been sent to the
		// app server.
		var oldToken = Session.get('firebaseToken');
		if (oldToken == refreshedToken)
			return;
		updateToken(oldToken, refreshedToken);
		Session.setPersistent('firebaseToken', refreshedToken);
	})
	.catch(function(err) {
		console.warn('\n\n******* push Unable to retrieve refreshed token ', err, '\n\n****************');
	});
});

messaging.onMessage(function(payload) {
	console.log("push inline Message received. ", messaging.registrationToUse_, payload);
	notificationTitle = 'VirGO 360 update';
	notificationOptions.data = payload.data;
	notificationOptions.title = payload.notification.title || notificationTitle ;
	notificationOptions.body = payload.notification.body || notificationOptions.body;
	notificationOptions.icon = payload.notification.icon || notificationOptions.icon;
	notificationOptions.click_action = payload.notification.click_action || notificationOptions.click_action;	
	notificationOptions.bert = '<a href="' + notificationOptions.click_action + '" style="color:white">' + notificationOptions.title + '</a>'
	
	Bert.defaults.hideDelay = 15000;
	Bert.alert({
		title: notificationOptions.title,
		message: notificationOptions.bert ,
		type: 'info',
		style: 'growl-top-left',
		icon: 'fa-lightbulb-o',
	});
	Bert.defaults.hideDelay = 4000; 	

});


console.log('push firebase initial \n', firebase, '\nmessaging:\n', messaging, '\nregistration\n', messaging.registrationToUse_, '\n\n');