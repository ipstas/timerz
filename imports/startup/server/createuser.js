import { AccountsServer } from 'meteor/accounts-base';
import { Random } from 'meteor/random';
import gravatar from 'gravatar';
import md5 from 'md5';const dockerNames = require('docker-names');

import { Collections } from '/imports/api/collections.js';

var formatUsername = function(username){
	username = username.replace(/ /g, '_').toLowerCase();
	if (Meteor.users.findOne({username: username}) || username.length < 5)
		username = username + '_' + Random.secret(4);
	return username;
}

Accounts.onCreateUser((options, user)=> {
	//console.log('onCreateUser',options,user);
  var emails;
	options.profile = options.profile || {};
	
	if (options.profile) {
		user.profile = options.profile;
		user.profile.agree = { checked: true, date: new Date()};
		if (user.profile.mailchimp)
			user.profile.mailchimp = { checked: true, date: new Date()};
		else 
			user.profile.mailchimp = {}; 
	}

	if (user.services) {
		console.log('onCreateUser user.services', user.services);
		let exists;
		if (user.services.facebook) {
			/// facebook
			exists = Meteor.users.findOne({'emails.address': user.services.facebook.email});
/* 			if (exists && exists.services.facebook){
				console.log('[onCreateUser] user exists', exists); */
		//} else 
			if (exists){
				console.log('[onCreateUser] user.services adding to user:', exists, '\nservice:', user.services);
				Meteor.users.update(exists._id,{$set:{'services.facebook': user.services.facebook}, addToSet:{'user.emails': {address: user.services.facebook.email, verified:true}}});
				//return;
			} else{
				user.emails =  [{address: user.services.facebook.email, verified:true}];
				console.log('onCreateUser facebook', user.services.facebook);
				user.services.facebook.name = user.services.facebook.name || user.services.facebook.email.split(/@/)[0];
				user.username = formatUsername(user.services.facebook.name);
				user.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";			
			}
		} else if (user.services.google) {
			/// google
			exists = Meteor.users.findOne({'emails.address': user.services.google.email});
			if (exists && exists.services.google){
				console.log('[onCreateUser] user exists', exists);
			} else if (exists){
				console.log('[onCreateUser] user.services adding to user:', exists, '\nservice:', user.services);
				Meteor.users.update(exists._id,{$set:{'services.google': user.services.google}, addToSet:{'user.emails': {address: user.services.google.email, verified:true}}});
				//Meteor.linkWithGoogle({ loginStyle: 'popup' }, callback);
				//return;
			} else{
				user.emails =  [{address: user.services.google.email, verified:true}];
				user.services.google.name = user.services.google.name || user.services.google.email.split(/@/)[0];
				user.username = formatUsername(user.services.google.name);
				user.profile.picture = user.services.google.picture;
				user.profile.name = user.services.google.given_name + ' ' + user.services.google.family_name ;
			}
		} else if (user.services.twitter) {
			// twitter
			user.emails =  [{address: user.services.twitter.email, "verified":true}];
			user.username = formatUsername(user.services.twitter.screenName);
		}	else if (user.services.instagram) {
			user.username = formatUsername(user.services.instagram.username);
			user.profile.name = user.services.instagram.full_name;
			user.profile.picture = user.services.instagram.profile_picture;
			user.profile.website = user.services.instagram.website;
		} else if (user.services.password) {
			console.log('onCreateUser, password', user.services);
		} else {
			console.warn('onCreateUser, we have encountered service we dont know', user.services);
			user.username = formatUsername(dockerNames.getRandomName() + '_' + Random.id(4));
		}
		if (!user.profile.picture && user.emails) {
			//user.profile.picture = gravatar.url(user.emails[0].address, {s: '400', r: 'pg'});	
			let hash = md5(user.emails[0].address);
			user.profile.picture = 'https://unicornify.pictures/avatar/' + hash + '?s=128';
		}

	}
	//console.log('onCreateUser sending signup email', user);
	
	Meteor.call('email.signup', user,(err, res) => { 
		console.log('onCreateUser email.signup sent', err, res);
	});
	
	if (user.emails && user.emails.length) {
		const params = {email: user.emails[0].address};
/* 		Meteor.call('user.mailchimp', params,(err, res) => { 
			console.log('onCreateUser adding mailchimp', err, res);
			if (res && res.id) 
				user.profile.mailchimp.id = res.id;
		});		 */
	}
	
/* 	let refUsed = Collections.Referrals.update({referralToken: user.profile.referral}, 
		{$push: {
			 invites: {
				 userId: user._id,
				 createdAt: new Date(),
			 }
		 }
	}); */
	//if (!refUsed) return;

	console.log('[onCreateUser] fin', user);
	
	return user;
});

// Validate username, sending a specific error message on failure.
Accounts.validateNewUser((user) => {  
  // Ensure user name is long enough
	console.log('[createuser.js] validateNewUser', user);

	if (!user) return true;
	if (user.services && (user.services.google || user.services.facebook || user.services.twitter))
		return true;

	if (!(/^[a-zA-Z0-9_-]{5,25}$/).test(user.username)) 
		throw new Meteor.Error(403, 'Your username needs at least 5 characters and can use only Latin letters, numbers and symbols "-" and "_"');

	if ((/root\b|moderator\b|admin\b/).test(user.username))
		throw new Meteor.Error(403, 'Sorry, you can not use reserved names');

	var passwordTest = new RegExp("(?=.{6,}).*", "g");
	if (passwordTest.test(user.password) == false) 
		throw new Meteor.Error(403, 'Your password is too weak!');

	return true;
});