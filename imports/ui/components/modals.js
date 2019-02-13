import moment from 'moment';  
import { AutoForm } from 'meteor/aldeed:autoform';

import {Collections} from '/imports/api/collections.js';
import {Schemas} from '/imports/api/collections.js';

import {infCheck} from '/imports/api/functions.js';
import {checkMore} from '/imports/api/functions.js';
import {stopSession} from '/imports/api/functions.js';
import {spentUpdate} from '/imports/api/functions.js';

import { hooksAddTimer } from '/imports/api/hooks.js';
import { hooksEditSession } from '/imports/api/hooks.js';

import {getPermission} from '/imports/startup/client/push-client.js';

import './modals.html';
import './collectform.js';

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

function resizeImage(url, width, height, callback) {
    var sourceImage = new Image();

    sourceImage.onload = function() {
        // Create a canvas with the desired dimensions
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Scale and draw the source image to the canvas
        canvas.getContext("2d").drawImage(sourceImage, 0, 0, width, height);

        // Convert the canvas to a data URL in PNG format
        callback(canvas.toDataURL());
    }

    sourceImage.src = url;
}


Template.showDailyModal.onCreated( () => {
	var data = Template.currentData();
	console.log('showDailyModal data:', data);
	if (data && data.timerId)
		Meteor.call('timers.daily', {timerId: data.timerId, offset: 60*1000*(new Date().getTimezoneOffset())});
});
Template.showDailyModal.helpers({
	data(){
		let data = Collections.Timers.findOne(this.timerId);
		console.log('showDailyModal', data, this);
		// doc.stop = new Date(parseInt(doc.stop / 60000) * 60000);
		// doc.start = new Date(parseInt(doc.start / 60000) * 60000);
		// doc.userId = doc.userId || Meteor.userId();
		return data;
	},
	date(){
		return this.date.toLocaleDateString("en-US");
		//return (new Date(this._id)).toLocaleDateString("en-US");
	},
	timing(){
		if (!this.spent) return;
		var data = moment.duration(this.spent).humanize();
		return data;
	},
	debug(){
		console.log('debug showDailyModal', this);
	},	
	debug2(){
		console.log('debug showDailyModal', this);
	},
});

Template.showSessionsModal.onCreated( () => {
	var data = Template.currentData();
	console.log('showSessionsModal data:', data);
	if (data && data.timerId)
		Meteor.call('timers.daily', {timerId: data.timerId, offset: 60*1000*(new Date().getTimezoneOffset())});
	AutoForm.addHooks('editSessionForm', hooksEditSession);
	let t = Template.instance();
	console.log('editTagsModal oncreatrd template inst', t.data, t);
	t.editRecord = new ReactiveVar();
});
Template.showSessionsModal.helpers({
	record(){
		var record = this;
		record.stop = new Date(parseInt(record.stop / 60000) * 60000);
		record.start = new Date(parseInt(record.start / 60000) * 60000);
		record.userId = record.userId || Meteor.userId();
		return record;
	},
	start(){
		return this.start.toLocaleDateString("en-US");
	},
	stop(){
		if (this.stop)
			return this.stop.toLocaleDateString("en-US");
	},
	timing(){
		if (!this.start) return;
		var stop = this.stop || new Date();
		//stop = moment(stop);
		console.log('timing', stop, this);
		return moment.duration(moment(stop) - moment(this.start)).humanize();
	},
	editRecord(){
		let t = Template.instance();
		return t.editRecord.get();
	},
	collection(){
		return Collections.Sessions;
	},	
	schema(){
		return Schemas.Sessions;
	},

});
Template.showSessionsModal.events({
	'click .editRecord' (e,t){
		t.editRecord.set(this._id);
	},		
	'click .delRecord' (e,t){
		Collections.Sessions.remove(this._id);
	},	
	'click .closeForm' (e,t){
		e.preventDefault();	
		spentUpdate({timerId: this.timerId});
		t.editRecord.set();
		console.log('closeForm', e,t,this);
	},
	'click .hideModal'(){
		Modal.hide();
	}
});

Template.shareModal.onCreated( () => {
	let t = Template.instance();
	t.sharingService = new ReactiveVar(0);
	t.selectPano = new ReactiveVar(0);
	t.north = new ReactiveVar(0);
	t.showEmbed = new ReactiveVar();
	t.sharingRes = new ReactiveVar();
	t.showText = new ReactiveVar();
	t.error = new ReactiveVar();
	t.subscribe('images',{tour_id: t.data._id});
});
Template.shareModal.onRendered( () => {
	let t = Template.instance();
	console.log('shareModal onrendered', t.data);
	t.autorun(()=>{
		console.log('t.sharingService.get', t.sharingService.get());
		if (!t.sharingService.get()) return;
		Meteor.setTimeout(()=>{
			$('#north').slider({
				formatter: function(value) {
					//console.log('slider', value );
					t.north.set(value);
				}
			});
		},200);
	});
	
});
Template.shareModal.helpers({
	sharingService(){
		let t = Template.instance();
		return t.sharingService.get();
	},	
	north(){
		let t = Template.instance();
		return t.north.get();
	},
	lineposition(){
		let t = Template.instance();
		var lineposition = t.north.get()/18*5 + 50;
		//console.log('lineposition', lineposition);
		return lineposition;		
	},
	url(){
		var url = window.location.origin + '/tour/' + this._id;
		return url;
	},
	embed(){
		if (!Template.instance().showEmbed.get())
			return;
		var url = window.location.origin + '/embed/' + this._id;
		var embed = '<iframe width="1280" height="720" src="' + url +'" frameborder="0" allowfullscreen></iframe>';
		return embed;
	},
	iconUrl(){
		console.log('share icon', this);
		if (this.icon && this.icon.url)
			return this.icon.url.replace(/upload/, 'upload/'+Meteor.settings.public.CLOUDINARY_PREVIEW);
		return '/img/camera.png';
	},	
	dataImg(){
		let t = Template.instance();
		var imgurl;
		if (t.sharingService.get() == 'facebook') {
			var panorama = Images.findOne(this.panorama_id[t.selectPano.get()]);
			console.log('share pano', t.selectPano.get(), 'this:', this, panorama);
			imgurl = panorama.url;
		} else
			imgurl = this.icon.url;
		
		return imgurl.replace(/upload/, 'upload/'+Meteor.settings.public.CLOUDINARY_PREVIEW);
		//return '/img/camera.png';
	},
	facebook(){
		var data = Meteor.user().services.facebook;
		console.log('facebook', data);
		return data;
	},
	options(){
		var user = Meteor.user();
		//if (!user || !user.services || !user.services.facebook || !user.services.facebook.acoounts)
			//return console.warn('no user accounts', user.services.facebook);
		var options = user.services.facebook.accounts;

    var map = _.map(options, function (c) {
      return {label: c.name, value: c.id};
    });
		map.push({label: 'Me', value: 'me'});
		console.log('options', options, map);
		return map;
	},
	schema(){
		return Schemas.SettingsFacebook;
	},
	showText(){
		let t = Template.instance();
		return t.showText.get();
	},
	sharingRes(){
		let t = Template.instance();
		return t.sharingRes.get();
	},
	error(){
		let t = Template.instance();
		return t.error.get();
	}
});
Template.shareModal.events({
	'click .arrow-left'(e,t){
		e.stopPropagation();
		var length = this.panorama_id.length;
		var index = t.selectPano.get() - 1 || 0;
		if (index < 0)
			index = length - 1;
		t.selectPano.set(index);
		console.log('clicked arrow', t.selectPano.get());
	},		
	'click .arrow-right'(e,t){
		e.stopPropagation();
		var length = this.panorama_id.length;
		var index = t.selectPano.get() + 1;
		if (index > length - 1)
			index = 0;
		t.selectPano.set(index);
		console.log('clicked arrow', t.selectPano.get());
	},	
	'click .selectable' (e,t){
		SelectText(e.target.id);
		$('.selectable').removeClass('selected');
		$('#' + e.target.id).addClass('selected');
	},
	'click .embed'(e,t){
		t.sharingRes.set({info: '	copy that embed code'});
		t.showEmbed.set(!t.showEmbed.get());
		t.showText.set();
	},	
  'click .connectfacebook'(e,t) {
		t.error.set();
		Meteor.linkWithFacebook({requestPermissions: ['user_friends', 'email', 'publish_actions']}, (err, r)=> {
			console.log('linkWithFacebook', err, r);
			if (err)
				t.error.set(err.error);
			else
				t.error.set();
		});
  },
	'click .shareIt'(e,t){
		 t.sharingService.set();
		if (!Meteor.userId()) {
			FlowRouter.go('/sign-in');
			return Modal.hide();
		}
		
		analytics.track(FlowRouter.getRouteName(), {
			eventName: "share",
			value: e.currentTarget.id,
		});
		var href = window.location.origin + '/tour/' + this._id;
		var user = Meteor.user();
		console.log('clicked shareIt', e.currentTarget.id, 'e:', e, 'user:', user, 'this:', this);
		t.sharingRes.set();
		t.showEmbed.set();
				
		if (e.currentTarget.id == 'facebook'){
			Meteor.call('social.facebook.accounts');
			t.sharingService.set('facebook');
			if (!user.services.facebook)
				Meteor.linkWithFacebook({requestPermissions: ['user_friends', 'email', 'publish_actions']}, (err, r)=> {
					console.log('linkWithFacebook', err, r);
					if (err)
						t.error.set(err.error);
					else
						t.error.set();
				});
			$('.facebook').removeClass('shareIt');
			t.showText.set('fbtext');
		} else if (e.currentTarget.id == 'twitter'){
			$('.facebook').addClass('shareIt');
			t.showText.set('twtext');
		} else {
			$('.facebook').addClass('shareIt');
			t.showText.set();
			console.log('clicked shareIt 2', e, this);
			t.sharingRes.set({info: 'this feature is coming soon'});
			Bert.alert('this feature is coming soon', 'info');
		}
	},
	'submit'(e,t){
		e.preventDefault();
		
		if (!e.target.id.match(/fbtext|twtext/))
			return console.log('submit out', e.target, e, this);
		
		$('.shareSubmit').fadeOut();
		
		t.sharingRes.set({info:'Please wait, we are sharing this tour'});
		var self = this;
		self.text = $('#showText').val();
		self.north = t.north.get();
		self.index = t.selectPano.get();
		console.log('submit', e, this);
		if (e.target.id == 'fbtext'){
			self.page_id = $('#shareForm').find('select[name="account"] option:selected').val();
			self.privacy = $('#shareForm').find('select[name="privacy"] option:selected').text();
			Meteor.call('social.facebook.post', self,  (err, res) => {
				console.log('social.facebook.post err,res:', err, res);
				if (err) {
					var msg;
					if (err.details)
						msg = err.details.error_user_msg || err.details.message;
					else
						msg = err.reason;
					Bert.alert('FB sharing failed' + msg, 'dangerous');
					t.sharingRes.set({info: msg});
				} else {
					t.showText.set();
					Bert.alert('that tour was shared on FB', 'info');
					res.service = 'Facebook';
					res.link = 'http://www.facebook.com/photo.php?fbid=' + res.id;
					t.sharingRes.set(res);
					$('.facebook').removeClass('pointer').addClass('sharedDone');
				}
			});			
		} else if (e.target.id == 'twtext')
			Meteor.call('social.twitter.post', self,  (err, res) => {
				console.log('social.twitter.post err,res:', err, res);
				if (err) {
					var msg = err.details.error_user_msg || err.details.message;
					Bert.alert('twitter sharing failed' + msg, 'dangerous');
					t.sharingRes.set({info: msg});
				} else {
					t.showText.set();
					Bert.alert('that tour was shared on twitter', 'info');
					res.service = 'twitter';
					res.link = 'https://twitter.com/' + res.user.screen_name + '/status/' + res.id_str;
					t.sharingRes.set(res);
					$('.twitter').removeClass('pointer').addClass('sharedDone');
				}
			});	
	},
/* 	'click .soon'(){
		Bert.alert('this feature is coming soon', 'info');
	}, */
	'click .sharedDone'(){
		Bert.alert('This link was shared already', 'info');
	},
});

Template.embedModal.onCreated( () => {
	Template.instance().showEmbed = new ReactiveVar(  );
});
Template.embedModal.helpers({
	embed(){
		var url = window.location.origin + '/embed/' + this._id;
		var embed = '<iframe width="1280" height="720" src="' + url +'" frameborder="0" allowfullscreen></iframe>';
		return embed;
	},
	iconUrl(){
		console.log('share icon', this);
		if (this.icon && this.icon.url)
			return this.icon.url;
		return '/img/camera.png';
	}
});
Template.embedModal.events({
	'click .selectable' (e,t){
		SelectText(e.target.id);
		$('.selectable').removeClass('selected');
		$('#' + e.target.id).addClass('selected');
	},
	'click .embed'(e,t){
		t.showEmbed.set(!t.showEmbed.get());
	},
	'click .soonBert'(){
		Bert.alert('this feature is coming soon', 'info');
	}
});

Template.prouserModal.helpers({
	upload(){
		return this.max/1024/1024;
	},
	plan(){
		return this.type.toUpperCase();
	},
	exp(){
		return this.expire.toLocaleDateString("en-US");
	}
});
Template.prouserModal.events({
	'click .submit'(e){
		$("#prousersForm").submit();
		e.preventDefault();
		Meteor.setTimeout(function(){
			Modal.hide();
		},500);
	}
});

Template.serverofflineModal.helpers({
	status: function(){
		var status = Meteor.status();
		if ((status.status == 'connected'))
			status.checked = 'checked';
		else
			status.checked = '';
		status.server = status.status;
		console.log('meteor status ',  status);
		return status;
	},
});
Template.serverofflineModal.events({
	'change .updateTitle' (e,t){
		console.log('updateTitle', e.target.id, e.target.value, this, t.tour.get(), t.tour_id.get());
		data = {};
		data.tourId = t.tour.get();
		data.panoId = e.target.id;
		data.text = e.target.value
		Meteor.call('titles.update',data);
		if (Titles.findOne({id: data.tourId, strings: {$elemMatch:{id: data.panoId, text: data.text}}}));
			Bert.alert({
				title: 'Title was updated',
				message: e.target.id + ': ' + e.target.value,
				type: 'info',
				style: 'growl-top-right',
			});
	}
/* 	'click #editTourText' ( event, template ) {
		console.log('uploadWay', event.target.checked);
		template.editTourText.set(!template.editTourText.get());
	},	 */
});

Template.tryModal.onRendered( () => {
	const t = Template.instance();
	console.log('tryModal.onRendered', t.data);
	Meteor.setTimeout( () => {
		$('.animated').addClass('bounce');
	},1000);
	Meteor.setTimeout( () => {
		$('.animated').removeClass('bounce').addClass('tada');
	},2000);
});
Template.tryModal.events({
	'click .exploreVR'(e,t){
		Modal.hide();
		FlowRouter.go('worldtours');
	},
	'click a'(e,t){
		Meteor.setTimeout(function(){
			Modal.hide();
		},500);
	},
});

Template.notificationsModal.onCreated( () => {
	const t = Template.instance();
	t.details = new ReactiveVar(  );
});
Template.notificationsModal.onRendered( () => {
	const t = Template.instance();
	console.log('notificationsModal.onRendered', t.data, window.olark);
	if (window.olark) {
		//console.log('checking olark');
		window.olark('api.visitor.getDetails', (details)=>{
			t.details.set(details);
		})
	}
	Meteor.setTimeout( () => {
		$('.animated').addClass('bounce');
	},1000);
	Meteor.setTimeout( () => {
		$('.animated').removeClass('bounce').addClass('tada');
	},2000);
});
Template.notificationsModal.events({
	'click .enablePush'(e,t){
		//console.log('visitor details', t.details.get());
		getPermission(t.details.get());
		Modal.hide();
	},
	'click a'(e,t){
		Meteor.setTimeout(function(){
			Modal.hide();
		},500);
	},
});

Template.feedbackModal.onCreated(function () {
	
});
Template.feedbackModal.helpers({
	isCordova: function(){
		return Meteor.isCordova;
	},
	submitted: function(){
//		return Contact.findOne(Session.get('submitted'));
		return Session.get('submitted');
	},
	contactUser: function(){
		var user = Meteor.user();
		if (!user)
			return;
		user.userId = user._id;
		user.name = user.profile.name;
		if ((user.emails) && (user.emails[0]))
			user.email = user.emails[0].address;
		//console.log('feedback contactUser', user);
		return user;
	},
	env: function(){
		return Session.get('env');
	}
});

Template.sendMessageModal.helpers({
	schema(){
		return Schemas.SendMessage;
	},
	doc(){
		var doc = this;
		doc.recipientId = doc.value.messenger;
		console.log('sendMessageModal', doc);
		return doc;
	}
});
Template.sendMessageModal.events({
	'submit'(e,t){
		e.preventDefault();
		console.log('sendMessageModal', e, this);
	},
});

Template.sendPushModal.helpers({
	schema(){
		return Schemas.SendPush;
	},
	doc(){
		var doc = this;
		console.log('sendMessageModal', doc);
		doc.recipientId = doc._id;
		
		return doc;
	}
});
Template.sendPushModal.events({
	'submit'(e,t){
		e.preventDefault();
		console.log('sendMessageModal', e, this);
	},
});

