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

	'email.admin'(doc) {
		if (verbose) console.log('email.admin 0', doc);
		check(doc, Object);

		this.unblock();
		// Build the e-mail text
		var text = "Name: " + doc.name + "\n"
						+ "Email: " + doc.email + "\n"
						+ "Phone: " + doc.phone +  "\n"
						+ "on " + new Date() + "\n\n"
						+ 'Question was: \n\n' + doc.question;

		if (verbose) console.log('sendEmailAdm', doc, text);
		var subject = 'question was asked on a Graffiti site by ' + doc.name;
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

