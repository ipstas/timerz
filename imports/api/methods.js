// Methods related to links
//import moment from 'moment';
//import lodash from 'lodash';
//import {CronJob} from 'cron';

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Random } from 'meteor/random'
import { Email } from 'meteor/email'
import { HTTP } from 'meteor/http';
import Fiber from 'fibers';
import moment from 'moment';

import { Collections } from './collections.js';

let verbose;
const emailAddr = {
	to:'info@xlazz.com',
	from:'xLazz Attendant <no-reply@xlazz.com>'
};

Meteor.methods({
/*   'checkUser'() {

		var users = [
			{name:"Stan Podolski", username: "spodolski", email:"spodolski@viviohealth.com",roles:['admin']},
		];

		_.each(users, function (checkuser) {
			var id;
			
			var user = Meteor.users.findOne({'emails.address': checkuser.email});
			console.log('[methods checkUser]', user, checkuser);
			
			if (!user)
				return;

			id = user._id
			
			if (Roles.userIsInRole(user._id, ['admin'], 'admGroup')) {
				return;
			}
			
			if (checkuser.roles && checkuser.roles.length > 0) 
				Roles.addUsersToRoles(id, checkuser.roles, 'admGroup');
				
		});
  }, */

	'user.verify'(){
    let userId = this.userId;
		let verifyRes;
    if ( userId ) {
      verifyRes = Accounts.sendVerificationEmail( userId );
			console.log('[method user.verify]:', this.userId, verifyRes);
			return true;
    }		
	},
	'user.visited'(){
		Meteor.users.update(this.userId,{$set:{visitedAt: new Date()}});
	},
	'user.ref'(params){
		Meteor.users.update(this.userId,{$set:{referrer: params.referrer}});
	},
	'user.admin'(params){
		if (!params || !params.username)
			return;
		var user, updated;
		user = Meteor.users.findOne({username: params.username});
		if (!user)
			return;
		if (user && Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
			if (params.add == true)
				updated = Roles.addUsersToRoles(user._id, ['admin','editor'], 'admGroup');
			else if (params.remove == true)
				updated = Meteor.users.update(user._id,{$unset:{roles: 1}});
				
		console.log('user.addadmin was updated', params, Roles.userIsInRole(this.userId, ['admin'], 'admGroup'), user.username, Roles.userIsInRole(user._id, ['admin'], 'admGroup'));
		return {updated: updated};
	},	
	'user.editor'(params){
		if (!params || !params.username)
			return;
		var user, updated;
		user = Meteor.users.findOne({username: params.username});
		if (!user) return;
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
			if (params.add == true)
				updated = Roles.addUsersToRoles(user._id, ['editor'], 'admGroup');
			else if (params.remove == true)
				updated = Meteor.users.update(user._id,{$unset:{roles: 1}});
				
		return {updated: updated};
	},	
	'user.viewer'(params){
		if (!params || !params.username)
			return;
		var user, updated;
		user = Meteor.users.findOne({username: params.username});
		if (!user) return;
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
			if (params.add == true)
				updated = Roles.addUsersToRoles(user._id, ['viewer'], 'admGroup');
			else if (params.remove == true)
				updated = Meteor.users.update(user._id,{$unset:{roles: 1}});
				
		return {updated: updated};
	},

	'user.analytics'(params){
		//console.log('[user.analytics]', this.userId, params, this);
		let set = {userId: this.userId, visitedAt: new Date()	};
		
		let ip = this.connection.httpHeaders['x-forwarded-for'];
		ip = ip.split(',')[0];
		//console.log('[user.analytics]2', this.userId, this.connection.httpHeaders['x-forwarded-for'], ip);
		
		//if (ip.includes(',')
		
		
		let updated = Collections.Analytics.upsert({userId: this.userId},{
			$set:set, 
			$addToSet:{platform: params.platform, device: params.device, referrer: params.referrer, ip: ip},  
		});
		console.log('[user.analytics]3', updated, this.userId, this.connection.httpHeaders['x-forwarded-for'], params);
	},
	'user.geo'(){
		console.log('user.contactsGeo start', this, '\n');
		if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) return console.warn('[methods] user.contactsGeo not an admin:', this.userId);
		this.unblock();
		//const iplocation = require('iplocation');
		const geoip = require('geoip-lite');
		var data = Collections.Analytics.find({'ip': {$exists: true}, geo: {$exists: false}}).fetch();
		n = 0;
		
		//get geolocation from ip
		async function geoUpd(record){
			//let geo = await iplocation(record.details.ip);
			let geo = await geoip.lookup(record.details.ip);
			let updated = await Collections.Analytics.update(record._id, {$set: {geo: geo}});
			await console.log('user.geo', updated, 'res:', geo, '\n');
		}		
		
		for (let record of data){	
			try{
				geoUpd(record);
			} catch (e){
				console.warn('user.contactsGeo err:', record.details.ip,  e );
			}
			n++;
		}
		
		//if (verbose) 
			console.log('updated contacts with geolocation:', n);
	},
	'user.geoOld'(params){
		if (!Roles.userIsInRole(this.userId, ['admin'])) return;
		this.unblock();
		const iplocation = require('iplocation');
		var data = Collections.Extusers.find({'details.ip': {$exists: true}, geo: {$exists: false}}).fetch();
		n = 0;
		
		async function geoUpd(record){
			let geo = await iplocation(record.details.ip);
			let updated = await Collections.Extusers.update(record._id, {$set: {geo: geo}});
			await console.log('sanitation.nonuser', updated, 'res:', geo, '\n');
		}
		for (let record of data){	
			try{
				geoUpd(record);
			} catch (e){
				console.warn('sanitation.nonuser err:', record.details.ip,  e );
			}
			n++;
		}
		data = Collections.Extusers.find({createdAt: {$exists: false}}).fetch();
		for (let record of data){	
			Collections.Extusers.update(record._id, {$set: {createdAt: new Date()}});
		}	
		data = Collections.Extusers.find({}).fetch();
		for (let record of data){	
			let count = Collections.Posts.find({username: record.username}).count();
			Collections.Extusers.update(record._id, {$set: {posts: count}});
		}
		if (verbose) console.log('updated nonusers:', n);
	},		
	'user.contactsGeo'(){
		console.log('user.contactsGeo start', this, '\n');
		if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) return console.warn('[methods] user.contactsGeo not an admin:', this.userId);
		this.unblock();
		//const iplocation = require('iplocation');
		const geoip = require('geoip-lite');
		var data = Collections.Contact.find({'details.ip': {$exists: true}, geo: {$exists: false}}).fetch();
		n = 0;
		
		//get geolocation from ip
		async function geoUpd(record){
			//let geo = await iplocation(record.details.ip);
			let geo = await geoip.lookup(record.details.ip);
			let updated = await Collections.Contact.update(record._id, {$set: {geo: geo}});
			await console.log('user.contactsGeo', updated, 'res:', geo, '\n');
		}		
		
		for (let record of data){	
			try{
				geoUpd(record);
			} catch (e){
				console.warn('user.contactsGeo err:', record.details.ip,  e );
			}
			n++;
		}
		
		//if (verbose) 
			console.log('updated contacts with geolocation:', n);
	},
	'user.mailchimp'(params){
		const Mailchimp = require('mailchimp-api-v3');
		if (verbose) console.log('mailchimp', )
		const settings = Meteor.settings,
    chimp    = new Mailchimp( settings.private.mailchimp.apiKey ),
    listId   = settings.public.mailchimp.listId;
				
/*     check( params, {
      email: String,
      name: String,
      //action: String
    }); */
		const subs = {
			email_address: params.email,
			status_if_new: "subscribed",
		};
		if (params.name) subs.merge_fields = {FNAME: params.name};
		
		const subscriber_hash = md5(params.email);
		const subscribe = chimp.put('/lists/' + listId +'/members/' + subscriber_hash, subs)
		.then(function(res) {
			if (verbose) console.log('[user.mailchimp] subscribed:', params, res);
			return res;
		})
		.catch(function (err) {
			console.warn('[user.mailchimp] err:', params, err);
			throw new Meteor.Error(err);
		})

	},
	'user.sample'(params){
		params = params || {};
		params.limit = params.limit || 40;
		const list = { $text: { $search: "cloudinary googleusercontent -4252rscbv5M"} };
		data = Meteor.users.aggregate([ 
			{$match : list},
			{$sample: { size: params.limit }}
		]);
		if (verbose) console.log('[user.sample]', params, data.length);
		return data;
	},

	
	'count.members'(){
		return Collections.MemberMaster.find().count();
	},		
	'count.drugs'(){
		return Collections.Druglist.find().count();
	},		
	'count.processed'(){
		return Collections.Processed.find().count();
	},		
	
	'timers.uptime'(params){
		params = params || {};
		var userId = this.userId;
		var list, timer, sessions, timeSpent;
		if (params.timerId)
			list = params.timerId;
		else
			list = {timeStarted: {$exists: true}};
		timer = Collections.Timers.findOne(list);
		sessions = Collections.Sessions.find({timerId: timer._id, stop: {$exists: true}});
		timeSpent = 0;
		for (s of sessions){
			timeSpent = timeSpent + s.stop - s.start;
		}
		Collections.Timers.update(timer._id, {$set: {timeSpent: timeSpent}});
	},
	'timers.daily'(params){
		params = params || {};
		params.offset = params.offset || 0;
		var userId = this.userId;
		var list, timer, sessions, aggr, timeSpent = 0, updated;
		var todayDate = new Date();
		if (params.timerId)
			list = params.timerId;
		else
			list = {timeStarted: {$exists: true}};
		timer = Collections.Timers.findOne(list);
		if (!timer) return console.log('No active timer found with params:', params);
		sessions = Collections.Sessions.find({timerId: timer._id, stop: {$exists: true}});
		if (!sessions.count()) return;
		aggr = Collections.Sessions.aggregate([
			{
				$match: {timerId: timer._id, stop: {$exists: true}}
			},
			{
				$group: { 
					_id: {$dateToString: { format: "%Y-%m-%d", date: {$subtract: ["$start", params.offset]}}}, 
					//date: { $dateToString: { format: "%Y-%m-%d", date: "$start" } }, 
					spent: { $sum: {$subtract: [ '$stop', '$start'] } },
					count: { $sum: 1 } 
				}
			}
		]);			
		//console.log('\n[methods.js]', params, list, '\naggr:', aggr, '\n\n');
		_.map(aggr, (obj)=>{
			//console.log('\n[methods.js] map obj:', obj, '\n\n');
			todayDate = new Date(obj._id);
			obj.date =  new Date(todayDate.setHours(todayDate.getHours() + params.offset/1000/60/60));
		});
		for (s of sessions.fetch()){
			timeSpent = timeSpent + parseInt(s.stop - s.start);
		}
		updated = Collections.Timers.update(timer._id,{$set: {daily: aggr, timeSpent: timeSpent}});
		//if (params.debug) 
			console.log('Daily aggr timer:', timer, '\naggr:', aggr.length, 'updated:', updated, '\ntimer:',  Collections.Timers.findOne(timer._id).title);
	},

	'social.unlink': function(params){
		console.log('[methods.js] social.unlink service', params, this.userId);
		Accounts.unlinkService(this.userId, params.service);
	},	
/* 	'social.instagram.tag'(params){
		params = params || {};
		params.tag = params.tag || 'fashionista';
		//var simpleInstagramScrape = require('simple-instagram-photo-scrape');
		
		var requestPromise = require('request-promise'),
				memoizeClear = require('memoize-clear'),
				memoizedGetPhotos;

		memoizedGetPhotos = memoizeClear(getRecentInstagramPhotos);
		module.exports = memoizedGetPhotos;
		function getRecentInstagramPhotos(tag) {
			var options = {
				uri: `https://www.instagram.com/explore/tags/${ encodeURIComponent(tag) }/`
			};

			return requestPromise(options)
				.then(function(htmlString) {
					var instagramPage = JSON.parse(htmlString.match(/<script\stype="text\/javascript">window._sharedData\s?=\s?(.*)(?=<\/script>)/g)[0].substring(52).replace(/;/g, ''), null, 4);
					console.log('instagramPage', instagramPage.entry_data);
					var data = instagramPage['entry_data'].TagPage[0].tag.media.nodes // jshint ignore:line
						.map(function(item) {
							console.log('instagramPage item', item, item.id, item.owner.id, item.thumbnail_src);
							return item['display_src']; // jshint ignore:line
						})
						.slice(0, 12);
					return {page: instagramPage.entry_data, data: data};
				})
				.catch(function (err) {
						console.error(`ERROR Instagram Scrape ${ err }`);
						console.error('Instagram Scrape Failed, Returning Default images.');
						return [];
				});
		}
		return getRecentInstagramPhotos(params.tag)	
	},
	'social.instagram.media'(params){
		params = params || {};
		params.shortcode = params.shortcode || 'fashionista';
		var requestPromise = require('request-promise'),
				memoizeClear = require('memoize-clear'),
				memoizedGetPhotos;
		memoizedGetPhotos = memoizeClear(getRecentInstagramPhotos);
		module.exports = memoizedGetPhotos;
		function getRecentInstagramPhotos(shortcode) {
			var options = {
				uri: `https://www.instagram.com/p/${ encodeURIComponent(shortcode) }/`
			};
			return requestPromise(options)
				.then(function(htmlString) {
					var instagramPage = JSON.parse(htmlString.match(/<script\stype="text\/javascript">window._sharedData\s?=\s?(.*)(?=<\/script>)/g)[0].substring(52).replace(/;/g, ''), null, 4);
					console.log('instagramPage', instagramPage.entry_data);
					return {page: instagramPage.entry_data};
				})
				.catch(function (err) {
						console.error(`ERROR Instagram Scrape ${ err }`);
						console.error('Instagram Scrape Failed, Returning Default images.');
						return [];
				});
		}
		return getRecentInstagramPhotos(params.shortcode)		
	},
	'social.instagram.get'(params){
		params = params || {};
		params.tag = params.tag || 'fashionista';
		var options = {}, ig, accessToken, res, url = 'https://api.instagram.com/v1/';
		ig = require('instagram-node').instagram();
		if (!this.userId || !Meteor.users.findOne(this.userId)) return;
		accessToken = Meteor.users.findOne(this.userId).services.instagram.accessToken;
		const instagram = new Instagram({
			clientId: Meteor.settings.private.instagram.clientId,
			clientSecret: Meteor.settings.private.instagram.clientSecret,
			accessToken: accessToken
		});		
		try {
			url = url + 'tags/' + params.tag + '/media/recent';
			const res = HTTP.call('GET', url, {
				params: { access_token: accessToken }
			});
			console.log('social.instagram.get res', res);
		} catch (e){
			console.warn('social.instagram.get use err:', url, e, '\nig:', params, accessToken);
			throw new Meteor.Error(500, e);
		}
		//console.log('social.instagram.get ig:', instagram, ig, params, Meteor.settings.private.instagram);
		console.log('social.instagram.get ig:', params, Meteor.settings.private.instagram, accessToken);
		console.log('social.instagram.get', params, '\nres:', res);
	},
	 */
	'social.mailchimp'(params){
		var user, chimpres, updated;
		if (params.newUser && params.emails && params.emails[0].address)
			user = params;
		else if (params.userId)
			user = Meteor.users.findOne(params.userId);
		else
			return console.warn('social.mailchimp.add. no email for new user, can not signup for mailchimp', params);

		var settings = Meteor.settings.private.MailChimp;

		console.log('social.mailchimp.add', params);
		var mailchimp = new Mailchimp(settings.apiKey);
		
		async function mainPost(){
			return await mailchimp.post('/lists/' + settings.listId + '/members', {
				email_address : user.emails[0].address,
				status : 'subscribed',
				merge_fields: {
					FNAME: user.profile.firstName,
					LNAME: user.profile.lastName,
					MMERGE3: user.username,
				}
			})
		}
		
		async function mainPut(){
			var hash = md5(user.emails[0].address);
			return await mailchimp.put('/lists/' + settings.listId + '/members/' + hash, {
				email_address : user.emails[0].address,
				merge_fields: {
					FNAME: user.profile.firstName,
					LNAME: user.profile.lastName,
					MMERGE3: user.username,
				}
			})
		}
		
		async function mainGet(){
			var hash = md5(user.emails[0].address);
			return await mailchimp.put('/lists/' + settings.listId + '/members/' + hash, {
				email_address : user.emails[0].address,
				merge_fields: {
					FNAME: user.profile.firstName,
					LNAME: user.profile.lastName,
					MMERGE3: user.username,
				}
			})
		}

		async function update(){
			try{
				var res = await mainPut();
				await console.log('social.mailchimp.add res2: ', res);
				await mongoGo(res)
				return await res;
			} catch(e){
				console.warn('social.mailchimp.add mainPost err: ', e);
				var res2 = await mainPut();
				await console.log('social.mailchimp.add res2 after err: ', res2);
				throw new Meteor.Error('social.mailchimp error', e);
			}
		}

		function mongoGo(res){
			if (user._id) 
				updated = Meteor.users.update(user._id, {$set:{'profile.mailchimp.id': res.id, 'profile.mailchimp.unique_email_id': res.unique_email_id}});
		}

		try{
			return update();
			// if (user._id)
				// updated = Meteor.users.update(user._id, {$set:{'profile.mailchimp.id': chimpres.unique_email_id}});
			//console.log('social.mailchimp.add res3: ', chimpres);
			//return {chimp: chimpres, user: user, updated: updated};
		} catch(e) {
			console.warn('social.mailchimp.add update err: ', e);
			//throw new Meteor.Error('error:', e);
		};

	},
	'social.mailchimp.get'(params){
		var user, hash, settings, request, chimpres, updated;
		settings = Meteor.settings.private.MailChimp;
		
		if (params.userId)
			user = Meteor.users.findOne(params.userId);
		if (user && user._id) {
			hash = md5(user.emails[0].address);
			request = '/lists/' + settings.listId + '/members/' + hash;
		} else {
			request = '/lists/' + settings.listId + '/members';
		}
		
		console.log('social.mailchimp.get', params);
		var mailchimp = new Mailchimp(settings.apiKey);
		
		async function mainGet(){
			//var hash = md5(user.emails[0].address);
			return await mailchimp.get(request)
		}
		
		async function mainPut(){
			var hash = md5(user.emails[0].address);
			return await mailchimp.put('/lists/' + settings.listId + '/members/' + hash, {
				email_address : user.emails[0].address,
				status_if_new: 'subscribed',
				merge_fields: {
					FNAME: user.profile.firstName,
					LNAME: user.profile.lastName,
					MMERGE3: user.username,
				}
			})
		}

		async function update(){
			try{
				var res = await mainGet();
				await console.log('social.mailchimp.get res2: ', res);
				await mongoGo(res);
				return await res;
			} catch(e){
				console.warn('social.mailchimp.get mainPost err: ', e);
				var res2 = await mainPut();
				await console.log('social.mailchimp.get res2 after err: ', res2);
				throw new Meteor.Error('social.mailchimp error', e);
			}
		}

		function mongoGo(res){
			if (user._id && res) 
				updated = Meteor.users.update(user._id, {$set:{
					'profile.mailchimp.id': res.id,
					'profile.mailchimp.unique_email_id': res.unique_email_id,
					'profile.mailchimp.data': res.timestamp_opt,
					'profile.mailchimp.status': res.status,
					'profile.mailchimp.updatedDate': res.last_changed,
					'profile.mailchimp.stats': res.stats,
				}});
		}

		try{
			return update();
			// if (user._id)
				// updated = Meteor.users.update(user._id, {$set:{'profile.mailchimp.id': chimpres.unique_email_id}});
			//console.log('social.mailchimp.add res3: ', chimpres);
			//return {chimp: chimpres, user: user, updated: updated};
		} catch(e) {
			console.warn('social.mailchimp.get update err: ', e);
			//throw new Meteor.Error('error:', e);
		};

	},
	'social.mailchimp.all'(params){
		var user, hash, settings, request, chimpres, updated;
		settings = Meteor.settings.private.MailChimp;
		
		request = '/lists/' + settings.listId + '/members';
		
		
		console.log('social.mailchimp.all', params);
		var mailchimp = new Mailchimp(settings.apiKey);
		
		async function mainGet(){
			//var hash = md5(user.emails[0].address);
			return await mailchimp.request({
				method : 'get',
				path : request,
				query : {
					count: 1000,
					//fields: 'id, unique_email_id, status, timestamp_opt, last_changed, stats'
				},
			});
		}

		async function update(){
			try{
				var res = await mainGet();
				await console.log('social.mailchimp.all res2: ', res);
				await mongoGo(res);
				return await res;
			} catch(e){
				console.warn('social.mailchimp.all Get err: ', e);
				throw new Meteor.Error('mailchimp err:', e);
			}
		}

		function mongoGo(res){
			if (res.members) 
				_.each(res.members, (member)=>{
					updated = Meteor.users.update({'emails.address': member.email_address}, {
						$set:{
							'profile.mailchimp.id': member.id,
							'profile.mailchimp.unique_email_id': member.unique_email_id,
							'profile.mailchimp.data': member.timestamp_opt,
							'profile.mailchimp.status': member.status,
							'profile.mailchimp.updatedDate': member.last_changed,
							'profile.mailchimp.stats': member.stats,
						},
						$addToSet:{'profile.mailchimp.lists': res.list_id}
					});
					console.log('social.mailchimp.all user updated:', updated, member.status, member.email_address );
				});
				
		}

		try{
			return update();
		} catch(e) {
			console.warn('social.mailchimp.all update err: ', e);
		};

	},
	'social.mailchimp.suball'(params){
		var user, hash, settings, request, chimpres, updated;
		settings = Meteor.settings.private.MailChimp;
		request = '/lists/' + settings.listId + '/members';
		
		var data = Meteor.users.find({'profile.mailchimp.status': {$exists: false}});
		var users = data.fetch();
		console.log('social.mailchimp.suball users:', data.count());
		var mailchimp = new Mailchimp(settings.apiKey);
		
		async function mainPut(user){
			//console.log('updating user', user);
			if (!user || !user.emails[0]) return;
			var hash = md5(user.emails[0].address);
			return await mailchimp.put('/lists/' + settings.listId + '/members/' + hash, {
				email_address : user.emails[0].address,
				status_if_new: 'subscribed',
				merge_fields: {
					FNAME: user.profile.firstName,
					LNAME: user.profile.lastName,
					MMERGE3: user.username,
				}
			})
		}

		async function update(user){
			try{
				var res = await mainPut(user);
				//await console.log('social.mailchimp.suball res2: ', res.id);
				await mongoGo(res);
				return await res;
			} catch(e){
				console.warn('social.mailchimp.suball Get err: ', e);
				throw new Meteor.Error('mailchimp err:', e);
			}
		}

		function mongoGo(member){

			updated = Meteor.users.update({'emails.address': member.email_address}, {
				$set:{
					'profile.mailchimp.id': member.id,
					'profile.mailchimp.unique_email_id': member.unique_email_id,
					'profile.mailchimp.data': member.timestamp_opt,
					'profile.mailchimp.status': member.status,
					'profile.mailchimp.updatedDate': member.last_changed,
					'profile.mailchimp.stats': member.stats,
				},
				$addToSet:{'profile.mailchimp.lists': settings.listId}
			});
			console.log('social.mailchimp.suball user updated:', updated, member.status, member.email_address );

		}

		try{
			for (let user of users) {
				 Meteor._sleepForMs(1000);
				update(user);
			}
		} catch(e) {
			console.warn('social.mailchimp.suball update err: ', e);
			throw new Meteor.Error('social.mailchimp error', e);
		};

	},
	
	'email.admin'(doc) {
		if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) return;
		if (verbose) console.log('email.admin 0', doc);
		check(doc, Object);

		this.unblock();
		// Build the e-mail text
		var text = "Name: " + doc.name + "\n"
						+ "Email: " + doc.email + "\n"
						+ "Phone: " + doc.phone +  "\n"
						+ "on " + new Date() + "\n\n"
						+ 'Question was: \n\n' + doc.question;

		//if (verbose) 
			console.log('sendEmailAdm', doc, text);
		var subject = 'question was asked on a Timerz by ' + doc.name;
		Email.send({
		  to: emailAddr.to,
		  from: emailAddr.from,
		  subject: subject,
		  text: text
		});
	},
	'email.signup'(doc) {
		check(doc, Object);	
		var data;

    // Build the e-mail text
		if (!data) return console.warn('email.signup err, no signup email in DB', Collections.EmailsTmpl.findOne() );
		
		data.text = data.text.replace(/DearUser/, doc.username);
		//if (verbose) console.log('email.signup 1', doc, data);
		if (!doc.emails || !doc.emails[0] || !doc.emails[0].address)
			return console.warn('signup email, no user email 1',  doc);
			
    var to = doc.emails[0].address;
		var subject = data.subject;

		var sent = Email.send({
      to: to,
      from: emailAddr.from,
      subject: subject,
      html: data.text
    });
		if (verbose) console.log('email.signup fin', doc, data.text);
		return sent;
	},	
	'email.comment'(doc) {
		check(doc, Object);	
		var data;

    // Build the e-mail text		
    data = Collections.EmailsTmpl.findOne({id:'menthioned'});
		if (!data) return console.warn('email.comment err, no comment email in DB', Collections.EmailsTmpl.findOne() );
		data.text = data.text.replace(/DearUser/, doc.user.username);
		data.text = data.text.replace(/CommentUser/, doc.commentator);
		data.text = data.text.replace(/TourId/, doc.tour._id);
		data.text = data.text.replace(/TourTitle/, doc.tour.title);
		
		if (verbose) console.log('email.comment 1', doc, data);
		if (!doc.user.emails || !doc.user.emails[0] || !doc.user.emails[0].address) return console.warn('comment email, no user email',  doc.user.emails);
			
		var sent = Email.send({
      to: doc.user.emails[0].address,
      from: emailAddr.from,
      subject: data.subject,
      html: data.text
    });
		if (verbose) console.log('email.comment fin', doc, '\nemail:', to, subject, data.text);
		return sent;
	},
	'email.liked'(doc) {
		check(doc, Object);	
		var data;

    // Build the e-mail text		
    data = Collections.EmailsTmpl.findOne({id:'comment'});
		if (!data) return console.warn('email.liked err, no comment email in DB', Collections.EmailsTmpl.findOne() );
		
		data.text = data.text.replace(/DearUser/, doc.username);
		if (verbose) console.log('email.liked 1', doc, data);
		if (!doc.emails || !doc.emails[0] || !doc.emails[0].address) return console.warn('liked email, no user email 1',  doc.emails);
			
		var sent = Email.send({
      to: doc.emails[0].address,
      from: emailAddr.from,
      subject: data.subject,
      html: data.text
    });
		if (verbose) console.log('email.liked fin', to, data.text);
		return sent;
	},	
	'email'(doc) {
		//if (verbose) console.log('email.signup 0', doc);
		check(doc, Object);	
		var data;
		if (verbose) console.log('email 0.5', doc);

    // Build the e-mail text		
    data = Collections.EmailsTmpl.findOne({id: doc.sendEmail});
		if (!data) return console.warn('email err, no email in DB', doc.sendEmail, Collections.EmailsTmpl.find().count() );
		
		data.text = data.text.replace(/DearUser/, doc.username);
		if (verbose) console.log('email 1', doc, data);
		if (!doc.emails || !doc.emails[0] || !doc.emails[0].address) return console.warn('email, no user email',  doc.id, doc.emails);
			
		try {
			var sent = Email.send({
				to: doc.emails[0].address,
				from: emailAddr.from,
				subject: data.subject,
				html: data.text
			});
		} catch (e){
			console.warn('email failed',e,doc);
			throw new Meteor.Error('Method Email error', e);
		}
		if (verbose) console.log('email fin', to, data.text);
		return sent;
	},	

	'contact.seen'(params){
		if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) return;
		let update = Collections.Contact.update({_id:params._id}, {$push: {seen: this.userId}});
		console.log('[contact.seen]', update, Collections.Contact.findOne({_id:params._id}));
	},
	'contact.remove'(params){
		if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) return;
		Collections.Contact.remove({_id:params._id});
	},
	
	'push.voted'(params){
		check(params, Object);
		//if (!this.userId) return;
		const user = Meteor.users.findOne({_id:this.userId});
		if (!user) return;
		const post = Collections.Posts.findOne(params.postId);	
		if (!post) return;
		
		const msg = {
			title: "Graffiti: " + user.username + " voted on your post",
			body: "don't leave it antattended", 
			click_action: "https://app.graffitiover.com/graffiti/" + post.pageUrlQueryHash + '?post=' + params.postId
		}

		//var pushs = Collections.Push.findOne({userId: post.userId});
		if (verbose) console.log('[push.voted]', post.userId, msg);
		Meteor.call('firebase.msg', {userId: post.userId, msg: msg});
	},
	'push.comment_old'(params){
		//if (verbose) console.log('push.comment 0', doc);
		check(params, Object);

		var msg = {
			title: "Graffiti: " + params.author + " left you a comment:",
			body: params.body, 
			click_action: "https://app.graffitiover.com/graffiti/" + params.pageUrlQueryHash
		}
		
		if (verbose) console.log('push.comment 1', params, msg);
		if (!params.postUser) return console.warn('push.comment no postUser', params, msg);
		//see in push-server.js
		for (let userId of params.postUser) {
			Meteor.call('firebase.msg', {userId: params.userId, username: params.postUsername, msg: msg});
		}	
	},
	'push.comment'(params){
		//if (verbose) console.log('push.comment 0', doc);
		if (!params) return console.warn('[push.comment] params:', params);
		check(params, Object);
		
		let url = params.pageUrl || __meteor_runtime_config__.ROOT_URL + '/push';
		let body = params.message || params.comment;

		var msg = {
			title: "DateAha: " + params.commenterName + " left you a " + params.type,
			body: body,
			click_action: url
		}
		
		//if (verbose) 
		console.log('[push.comment] 1', params, msg);
		if (!params.userId) return console.warn('push.comment no to user', params, msg);
		//see in push-server.js

		Meteor.call('firebase.msg', {userId: params.userId, msg: msg});

	},
	'push.post'(params){
		//if (verbose) console.log('push.comment 0', doc);
		check(params, Object);
		if (!this.userId) return;
		var post = Collections.Posts.findOne(params.postId);
		if (!post) return;
		
		var msg = {
			title: "Graffiti: " + post.username + " posted a new pic:",
			body: post.text, 
			click_action: "https://app.graffitiover.com/posts/" + params.postId
		}
		
		var userIds = Collections.Followings.find({'following.userId': this.userId});
		if (!userIds.count()) return;
		
		var userIds = _.pluck(userIds.fetch(), 'userId');

		var pushs = Collections.Push.find({userId: {$in: userIds}, following: true}).fetch();
		userIds = _.pluck(pushs, 'userId');
		
		if (verbose) console.log('push.post 1', params, userIds);
		_.each(userIds, (userId)=>{
			Meteor.call('firebase.msg', {userId: userId, msg: msg});
		});
	},
	'push.count'(params){
		if (!Roles.userIsInRole(this.userId, ['admin'])) return;
		return Collections.Push.find().count();
	},

	'app.version'() {
  	try {
	    var version = {};
	    version = JSON.parse(Assets.getText("version.json"));
	    return version;
	  } catch(e) { 
	    // .. Version not found
	    return {};
	  }
  },
	
	'maint.archive'(){
		Collections.Timers.update({archived: false},{$unset:{archived: 1}},{multiple: true});		
	},	
	'maint.removesmall'(){
		if (!Collections.Sessions.find().count()) return;
		var aggr = Collections.Sessions.aggregate(
			{ $project:
				{ 
					timerId: 1,
					timing:  { $subtract: ['$stop', '$start']},
				}
			},
			{ $match: { timing: {$lt: 60000}}} 
		);
		
		return console.log('[methods.js] maint.removesmall aggr:', aggr);
		var ids = _.pluck(aggr, '_id');
		var updated = Collections.Sessions.remove({_id: {$in: ids}});
		console.log('aggr', aggr, _.pluck(aggr, '_id'), updated);
	},
	'maint.username'(){
		if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) return;
		let users = Meteor.users.find({'services.google':{$exists: true}}).fetch();
		_.each(users, (user)=>{
			
			let username, avatar;
			if (user.services.google) {			
				username = user.services.google.name.split(' ').join('_').toLowerCase();
				console.log('[methods.js maint.username user:]', username, user.username, user.services.google.name);
				if (Meteor.users.find({username: username}).count()) 
					username = username + '_' + Random.id(2);
				Meteor.users.update(user._id,{$set: {username: username}});
				if (user.services.google.picture && !user.profile || !user.profile.avatar )
					Meteor.users.update(user._id,{$set: {'profile.avatar': user.services.google.picture}});
			}
		})
	},
});

