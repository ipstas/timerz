// All links-related publications

//import { Meteor } from 'meteor/meteor';
//import { FilesCollection } from 'meteor/ostrio:files';

import { Collections } from '../collections.js';

//import { Markers } from '../collections.js';
//import { MarkerFiles } from '../collections.js';

publishComposite('userdata', function(params) {
	console.log('[pub userdate] params', params);
	let user, list = {}, listChildren = {}, fields, updated, userFound, count = {}, counted;

	if (!params)
		list = this.userId;
	else if (params.all && Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
		list = {};				
	else if (params.username) {
		user = Meteor.users.findOne({username: params.username},{fields: {profile: 0}});
		console.log('[pub userdate] user', user);
		if (user && this.userId == user._id)
			list = {_id: this.userId};
		else if (user)
			list = {_id: user._id}, listChildren = {publicTimer: true};
		else 
			list = this.userId;
	} else if (params.userId && this.userId == params.userId)  	
		list = {_id: this.userId};
	else if (params.userId)  	
		list = {_id: params.userId}, listChildren = {publicTimer: true};
	else if (params.userIds)  	
		list._id = {$in: params.userIds}, listChildren = {publicTimer: true};
	else
		list = this.userId;
		
	return {					
		find(){
			params = params || {};

			fields = {
				createdAt: 1,
				visitedAt: 1,
				username: 1,
				profile: 1,
				'services.facebook.name': 1,
				'services.facebook.privacy': 1,
				'services.facebook.role': 1,
				'services.facebook.avatar': 1,
				'services.google.name': 1
			};
				
			if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
				fields = {
					empty: 0
				}	

			params.limit = params.limit || 12;	
			params.sort = params.sort || {timeStarted: -1, createdAt: -1};
			
			user = Meteor.users.find(list, {fields: fields}, {sort: params.sort, limit : params.limit});	
			if (params.debug) 
				console.log('[pub userdata] params:', params, 'for:', list, '\nfields:', fields, '\nusers:', user.count(), '\n\n');
			
			return user;
		},
		children: [
			{
				find(record) {					
					listChildren.userId = record._id;					
					let data = Collections.Timers.find(listChildren, {sort: {start: -1}});	
					return data;		
				}
			},			
		]
	}
});

Meteor.publish('texts', function () {
	return Collections.Texts.find();
});
Meteor.publish('terms', function () {
	return Collections.Terms.find();
});
Meteor.publish('pricing', function () {
	return Collections.Pricing.find();
});
Meteor.publish('contact', function () {
	if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
		return Collections.Contact.find();
});
Meteor.publish('images', function () {
  return Collections.Images.find();
});
Meteor.publish('currentTimer', function () {
  return Collections.Timers.find({userId:this.userId, timeStarted: {$exists:true}});
});

// App pubs
publishComposite('timersSet', function(params) {
	return{
		find(){
			params = params||{};

			var user, data, teamUser;
			var list = {
				publicTimer: true,
				archived: {$exists: false}
				//archived: {$or: [{archived: false}, {archived: {$exists: false}}]}
			};
			
			if (params._id) {
				list = params._id;
			} else if (params.username) {
				user = Meteor.users.findOne({username: params.username},{fields: {_id: 1, username: 1}});
				if (user)
					list.userId = user._id;
			}	else if (params.userId) {
				list.userId = params.userId;
			}	
			if (list.userId && list.userId == this.userId)
				delete list.publicTimer;
			
			if (params.tags && params.tags.length)
				list.tags = {$in: params.tags};
			if (params.archived)
				list.archived = true;
			
			params.limit = params.limit || 12;
			params.sort = params.sort || {createdAt: -1};
			
			data = Collections.Timers.find(list, {sort: params.sort, limit : params.limit} );
			if (params.debug) 
				console.log('[pub timersSet]', data.count(), data.fetch(), list);
			return data;
		},
		children: [
			{
				find(record) {
					var data = Collections.Sessions.find({timerId:record._id});	
					return data;
				}
			},
		]
	}
});

/* Meteor.publish('timers', function (params) {
	params = params||{};
	
	var user, data, teamUser;
	var radius = params.radius || 0.5;
	var list = {publicTimer: true};
	var limit = {};
	//var sort = {createdAt: -1};
	
	
	if (params._id) {
		list = params._id;
	} else if (params.username) {
		user = Meteor.users.findOne({username: params.username},{fields: {_id: 1, username: 1}});
		if (user)
			list.userId = user._id;
		if (user && user._id == this.userId)
			list = {userId: user._id};
	}	else if (params.userId) {
		user = Meteor.users.findOne(this.userId,{fields: {_id: 1, username: 1}});
		list.userId = this.userId;
	}	
	
	if (params.tags && params.tags.length)
		list.tags = {$in: params.tags};	
		
	params.limit = params.limit || 12;	
	params.sort = params.sort || {publishedAt: -1};
	
	data = Collections.Timers.find(list, {sort: params.sort, limit : params.limit} );
	console.log('timers pub', data.count(), list);
	return data;
});
 */