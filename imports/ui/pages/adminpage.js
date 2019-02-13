import 'bootstrap-toggle';

import { AutoForm } from 'meteor/aldeed:autoform';
import { HTTP } from 'meteor/http';

import './adminpage.html';
//import './posts.js';

import { Schemas } from '/imports/api/collections.js';
import { Collections } from '/imports/api/collections.js';
import { checkMore } from '/imports/api/functions.js';
import { hooksAddFile } from '/imports/api/hooks.js';

PostSubs = new SubsManager();

//window.LocalFiles = LocalFiles;
//LocalFiles.attachSchema(Schemas.LocalFiles);
//AutoForm.addHooks('insertFilesForm', hooksAddFile);



let selectors = [
/* 	{ value: 'postsListLast', label: 'Latest Posts'}, */
	{ value: 'contacts', label: 'Contacts'},
/* 	{ value: 'reports', label: 'Reports'}, */
/* 	{ value: 'subusers', label: 'Push notifications'}, */
	{ value: 'allusers', label: 'All Users'},
/* 	{ value: 'nonusers', label: 'Non Users'}, */
	{ value: 'adminusers', label: 'Admins'},
/* 	{ value: 'adminpages', label: 'Pages'}, */
/* 	{ value: 'terms', label: 'T&C'}, */
	{ value: 'emails', label: 'Email Templates'},
	{ value: 'integration', label: 'Integration'}
];

const sort = new ReactiveVar({createdAt: -1});
const engaged = new ReactiveVar(false);

/* function checkMore(t){
	Meteor.setTimeout(function(){
		if ($('#infiniteCheck').offset() && $('#infiniteCheck').offset().top - $(window).scrollTop() - $(window).height() < -20){
			t.limit.set(t.limit.get() + t.next.get());
			if (Session.get('debug')) console.log('getting next limit 0:', t.ready.get(), t.limit.get(), t.next.get(), t.loaded.get(), $('#infiniteCheck').offset().top - $(window).scrollTop() - $(window).height());
		}	
	},500);
} */
function convertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ','
			line += array[i][index];
		}
		str += line + '\r\n';
	}

	return str;
}

Template.adminpage.onCreated( () => {
	//AutoForm.debug(); 
	Meteor.subscribe('texts');
	Meteor.subscribe('faq');
	Meteor.subscribe('contact');
	Meteor.subscribe('terms');
	Meteor.subscribe('userdata');
	Meteor.subscribe('pricing');
	Meteor.subscribe('verrors');
	let t = Template.instance();
	t.editpage = new ReactiveVar();
	t.showcontacts = new ReactiveVar();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	t.selectText = new ReactiveVar();
	t.selector = new ReactiveVar();
	t.running = new ReactiveVar();
	t.showdel = new ReactiveVar();

	
	t.autorun(function(){
		let selector = _.findWhere(selectors, {value: FlowRouter.getQueryParam('get')});
		if (selector)
			t.selector.set(selector);
	});

});
Template.adminpage.onRendered( () => {
	let t = Template.instance();

	Meteor.setTimeout(()=>{
		t.autorun(()=>{
			console.log('adminpage:', FlowRouter.getQueryParam('get'));
			if (window.CKEDITOR && $('textarea').attr('name')) 
				if (!$(this).hasClass('olark-form-message-input')) 
					$('textarea').each(()=>{
						CKEDITOR.replace($(this).attr('name'))
					});
				$('.toggleSwitch').bootstrapToggle();
		});
		
/* 		t.autorun(()=>{
			if (Meteor.user() && !Roles.userIsInRole(Meteor.userId(), 'admin'))
				FlowRouter.go('/');
		}); */
	},500);

});
Template.adminpage.helpers({
	selectors(){
		return selectors;
	},
	selector(){
		let t = Template.instance();
		//console.log('selector', t.selector.get());
		return t.selector.get();
	},
	active(){
		let t = Template.instance();
		//console.log('adminpage active:', t.selector.get(), this.value);
		if (t.selector.get() && this.value == t.selector.get().value)
			return 'active';
	},
	activeRotate(){
		let t = Template.instance();
		if (t.running.get())
			return 'activeRotate';
	},
	filename(){
		return this.model.split('/').pop();
	},
	ImagesColl() {
		return Images;
	},
	newRecord(){
		return Template.instance().newRecord.get();
	},
	editRecord(){
		return Template.instance().editRecord.get();
	},
	faqs(){
		return Faq.find();
	},
	credits(){
		return Faq.find();
	},
	date(){
		var date = this.date || this.createdAt || new Date();
		return date.toLocaleDateString();
	},
	texts(){
		return Texts.find();
	},
	dataTexts(){
		let t = Template.instance();
		var data = Texts.findOne({title:t.selectText.get()});
		console.log('dataText', data, t.selectText.get());
		return data;
	},	
	news(){
		return Texts.find({title:'productnews'},{sort: {createdAt: -1}});
	},
	formId(){
		return this._id + 'updateForm';
	},
	dataPricing(){
		return Pricing.findOne();
	},
	dataEmails(){
		var data = Emails.find();
		if (data.count())
			return data;
	},
	users(){
		let t = Template.instance();
		var list = {}, billings, users;
		if (!t.showdel.get())
			list = {'stripe.deleted': {$ne: true}}; 
		if (FlowRouter.getQueryParam('userId'))
			list.userId = FlowRouter.getQueryParam('userId');

		users = Collections.Billing.find(list);
		if (Session.get('debug'))
			console.log('users', list, users.count(), users.fetch());
		return users;
	},
  error() {
    return Template.instance().error.get();
  },
	debug(){
		console.log('adminpage debug', this);
	}
});
Template.adminpage.events({
	'click .selector': function (e, t) {
		t.selector.set(this);
		FlowRouter.setQueryParams({get: this.value, userId: null});
		if (this.value == 'userbilling')
			Meteor.call('payment.customer.list',(e,r)=>{
				console.log('payment.customer.list', e,r);
				FlowRouter.setQueryParams({ref:null});
			});
		Meteor.setTimeout(function(){
			if (window.CKEDITOR && $('textarea').attr('name')) 
				if (!$(this).hasClass('olark-form-message-input')) 
					$('textarea').each(function(){
						CKEDITOR.replace($(this).attr('name'))
					});
		},500);
	},
	'click .getBilling'(e,t){
		t.running.set(true);
		Meteor.call('payment.invoices.retrieve', {limit: 1000, all: true}, (e,r)=>{
			t.running.set();
			console.log(e,r)
		})
	},
	'change .showDeleted'(e,t){
		console.log('showDeleted', e.target.checked, e);
		t.showdel.set(e.target.checked);
	},
	'click .deleteCustomer'(e,t){
		t.running.set(true);
		Meteor.call('payment.customer.delete', {stripeId: this.stripe.id}, (e,r)=>{
			t.running.set();
			console.log(e,r)
		})
	},
  'click .newRecord' ( e, t ) {
		console.log('newRecord', this._id, e.target, this);
		t.editRecord.set('new');
  },  
	'click .editRecord' ( e, t ) {
		console.log('editRecord', this._id, e.target, this);
		t.editRecord.set(this._id);
  },
	'click .submitted'(e,t){
		t.editRecord.set();
		Bert.alert('submitted','success');
	},
	'change .selectText'(e,t){
		t.selectText.set($( "#selectText" ).val());
		console.log('selectText', t.selectText.get(), e.target, t.data, this);
	}
});

Template.contacts.onCreated( () => {
	//AutoForm.debug(); 
	Meteor.subscribe('contact');
	let t = Template.instance();
	t.editpage = new ReactiveVar();
	t.showcontacts = new ReactiveVar();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	t.selectText = new ReactiveVar();
	t.selector = new ReactiveVar();
	t.running = new ReactiveVar();
	t.showdel = new ReactiveVar();
	Meteor.call('user.contactsGeo');

});
Template.contacts.onRendered( () => {
	let t = Template.instance();

});
Template.contacts.helpers({
  contacts() {
		var contacts = Collections.Contact.find({},{sort:{createdAt: -1}});
		//console.log('uploaded tour', tour, Template.instance().tour.get());
		return contacts;
	},
	date(){
		var date = this.date || this.createdAt || new Date();
		return date.toLocaleDateString();
	},
	ifSeen(){
		var data =  _.findWhere(this.seen, Meteor.userId());
		return data;
	},
	texts(){
		return Texts.find();
	},
});
Template.contacts.events({
  'click .seen' ( event, template ) {
		console.log('seen', this, event, 	event.target, event.target.id);
		Collections.Contact.update(this._id, {$push: {seen: Meteor.userId()}});
  },
  'click .remove' ( event, template ) {
		console.log('remove', this, event, 	event.target, event.target.id);
		Collections.Contact.remove(this._id);
  },
});

Template.reports.onCreated( () => {
	//AutoForm.debug(); 
	PostSubs.subscribe('reports',{all: true, limit: 100, caller:'adminpage'});
	let t = Template.instance();
	t.editpage = new ReactiveVar();
	t.showcontacts = new ReactiveVar();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	t.selectText = new ReactiveVar();
	t.selector = new ReactiveVar();
	t.running = new ReactiveVar();
	t.showdel = new ReactiveVar();
	Meteor.call('user.contactsGeo');

});
Template.reports.onRendered( () => {
	let t = Template.instance();

});
Template.reports.helpers({
  data() {
		var contacts = Collections.Reports.find({},{sort:{createdAt: -1}});
		//console.log('uploaded tour', tour, Template.instance().tour.get());
		return contacts;
	},
	date(){
		var date = this.date || this.createdAt || new Date();
		return date.toLocaleDateString();
	},
	ifSeen(){
		var data =  _.findWhere(this.seen, Meteor.userId());
		return data;
	},
	texts(){
		return Texts.find();
	},
});
Template.reports.events({
  'click .seen' ( event, template ) {
		console.log('seen', this, event, 	event.target, event.target.id);
		Collections.Reports.update(this._id, {$push: {seen: Meteor.userId()}});
  },
  'click .remove' ( event, template ) {
		console.log('remove', this, event, 	event.target, event.target.id);
		Collections.Reports.remove(this._id);
  },
});

Template.campaigns.onCreated( () => {
	//AutoForm.debug(); 
	Meteor.subscribe('terms');
	let t = Template.instance();
	t.editpage = new ReactiveVar();
	t.showcontacts = new ReactiveVar();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	t.selectText = new ReactiveVar();
	t.selector = new ReactiveVar();
	t.running = new ReactiveVar();
	t.showdel = new ReactiveVar();

});
Template.campaigns.onRendered( () => {
	let t = Template.instance();
});
Template.campaigns.helpers({
  data() {
		let data = Collections.Terms.find({type: 'campaign'},{sort:{createdAt: -1}});
		//console.log('uploaded tour', tour, Template.instance().tour.get());
		return data;
	},
	checked(){
		if (this.visible)
			return 'checked';
	},
	date(){
		var date = this.date || this.createdAt || new Date();
		return date.toLocaleDateString();
	},
	userIds(){
		return Collections.Followings.find({'campaign.campId': this.subtype});
	},
	schema() {
		return Schemas.Terms;
	},	
	collection() {
		return Collections.Terms;
	},
	newRecord(){
		let t = Template.instance();
		$('textarea').summernote();
		return t.newRecord.get();
	},
	editRecord(){
		let t = Template.instance();
		console.log('editRecord', t.editRecord.get());
		$('textarea').summernote();
		return t.editRecord.get();
	},
});
Template.campaigns.events({
	'click .newRecord'(e, t) {
		if (!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) return;
		t.newRecord.set(true);
		t.editRecord.set();
		Meteor.setTimeout(()=>{
			$('textarea').summernote();
		},500)
	},
	'click .editRecord'(e, t) {	
		if (!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) return;
		t.editRecord.set(this._id);
		t.newRecord.set();
		Meteor.setTimeout(()=>{
			$('textarea').summernote();
		},500)
		console.log('click .editRecord', t.editRecord.get(), this, 'admin:', Roles.userIsInRole(Meteor.userId(), ['admin','editor']));
	},
	'submit'(e,t){
		if (!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) return;
		t.newRecord.set();
		t.editRecord.set();
	},
	'click .cancel'(e,t){
		t.newRecord.set();
		t.editRecord.set();
		Modal.hide();
	},
	'click .openUp'(e,t){
		Meteor.call('user.campaign', {surveyId: this._id, userId: Session.get('appUser')});
		Modal.hide();
	},
  'click .delRecord' ( event, template ) {
		if (!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) return;
		console.log('delRecord', this, event, 	event.target, event.target.id);
		Collections.Terms.remove(this._id);
  },
});

Template.surveys.onCreated( () => {
	//AutoForm.debug(); 
	Meteor.subscribe('survey');
	let t = Template.instance();
	t.editpage = new ReactiveVar();
	t.showcontacts = new ReactiveVar();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	t.selectText = new ReactiveVar();
	t.selector = new ReactiveVar();
	t.running = new ReactiveVar();
	t.showdel = new ReactiveVar();

});
Template.surveys.onRendered( () => {
	let t = Template.instance();
});
Template.surveys.helpers({
  data() {
		let data = Collections.Survey.find({},{sort:{createdAt: -1, date: -1}});
		//console.log('uploaded tour', tour, Template.instance().tour.get());
		return data;
	},
	user(){
		const userId = this.toString();
		let user = Meteor.users.findOne({_id: userId}) || Collections.Extusers.findOne({_id: userId});
		if (!user){
			PostSubs.subscribe('userdata', {userId: userId});
			PostSubs.subscribe('nonuserdata', {userId: userId});
		}
		console.log('adminpage surveys user', userId, user);
		return user;
	},
	date(){
		var date = this.date || this.createdAt || new Date();
		return date.toLocaleDateString();
	},
	schema() {
		return Schemas.Survey;
	},	
	collection() {
		return Collections.Survey;
	},
	newRecord(){
		let t = Template.instance();
		$('textarea').summernote();
		return t.newRecord.get();
	},
	editRecord(){
		let t = Template.instance();
		console.log('editRecord', t.editRecord.get());
		$('textarea').summernote();
		return t.editRecord.get();
	},
});
Template.surveys.events({
	'click .newRecord'(e, t) {
		if (!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) return;
		t.newRecord.set(true);
		t.editRecord.set();
		Meteor.setTimeout(()=>{
			$('textarea').summernote();
		},500)
	},
	'click .editRecord'(e, t) {	
		if (!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) return;
		t.editRecord.set(this._id);
		t.newRecord.set();
		Meteor.setTimeout(()=>{
			$('textarea').summernote();
		},500)
		console.log('click .editRecord', t.editRecord.get(), this, 'admin:', Roles.userIsInRole(Meteor.userId(), ['admin','editor']));
	},
	'submit'(e,t){
		if (!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) return;
		t.newRecord.set();
		t.editRecord.set();
	},
	'click .cancel'(e,t){
		t.newRecord.set();
		t.editRecord.set();
		Modal.hide();
	},
  'click .delRecord' ( event, template ) {
		if (!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) return;
		console.log('delRecord', this, event, 	event.target, event.target.id);
		Collections.Survey.remove(this._id);
  },
});

Template.subusers.onCreated( () => {
	AutoForm.debug(); 
	var sub;
	//PostSubs.subscribe('userdata', {limit: 10});
	let t = Template.instance();
	t.hidden = new ReactiveVar();
	t.ready = new ReactiveVar(true);
	t.next = new ReactiveVar(5);
	t.limit = new ReactiveVar(10);
	t.sort = new ReactiveVar({createdAt: -1});
	t.filter = new ReactiveVar('all');
	t.loaded = new ReactiveVar(0);
	t.count = new ReactiveVar(0);
	t.userselected = new ReactiveVar(0);
	
	t.autorun(function(){
		sub = PostSubs.subscribe('push',{
			all: true,
			limit: t.limit.get(),
			sort: t.sort.get(),
			filter: t.filter.get(),
			debug: Session.get('debug')
		});
		t.ready.set(sub.ready());
	})	
	t.autorun(function(){
		if (!t.ready.get()) return;
		t.loaded.set(Collections.Push.find().count());
		if (Session.get('debug')) console.log('subusers.onCreated sub ready', t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	});
	
	t.autorun(function(){
		let limit = parseInt(FlowRouter.getQueryParam('more')) || t.limit.get();
		t.limit.set(limit);
	});
	
  $(window).scroll(function(){
		checkMore(t);
	});
});
Template.subusers.onRendered(() => {
	let t = Template.instance();
	// t.autorun(()=>{
		// if (!t.ready.get())
			// return;
		// Meteor.setTimeout(()=>{
			// $('.toggleSwitch').bootstrapToggle('destroy');
			// $('.toggleSwitch').bootstrapToggle();
		// },500);
	// });
	Meteor.setTimeout(()=>{
		// $('.toggleSwitch').bootstrapToggle('destroy');
		// $('.toggleSwitch').bootstrapToggle();
	},1500);
});
Template.subusers.helpers({
	ready(){
		let t = Template.instance();
		if (Session.get('debug')) console.log('subusers ready', t.ready.get(), t.count.get());
		return t.ready.get();
	},
	showMore(){
		let t = Template.instance();
		if (Session.get('debug')) console.log('subusers showMore:', t.limit.get() <= t.count.get(), 'limit:', t.limit.get(), 'count:', t.count.get());
		return t.limit.get() <= t.count.get();
	},
/* 	filter(){
		let t = Template.instance();
		return t.filter.get();
	}, */
	user(){
		let t = Template.instance();
		var data, filter = {};

		data = Collections.Push.find(filter,{sort: sort.get()});
		//t.count.set(data.count());
		//data = Collections.Push.find(filter);
		if (Session.get('debug')) console.log('sub users', t.filter.get(), t.sort.get(), data.count(), data.fetch());
		t.userselected.set(data.count());
		return data;
	},
	userCount(){
		let t = Template.instance();
		var count = Meteor.call('push.count', (e,r)=>{
			t.count.set(r);
		});
		if (Session.get('debug')) console.log('userCount', t.count.get());
		return t.count.get();
	},
	userSelected(){
		let t = Template.instance();
		return t.userselected.get();
	},
	tokenLength(){
		if (this.device)
			return this.device.length;
	},
	date(){
		// $('.toggleSwitch').bootstrapToggle('destroy');
		// $('.toggleSwitch').bootstrapToggle();
		if (this.createdAt)
			return this.createdAt.toLocaleDateString();
	},
	last(){
		if (this.sentAt)
			return this.sentAt.toLocaleDateString();
	},
	serviceAvatar(){
		console.log('serviceAvatar', this);
		var user = Meteor.users.findOne(this.userId);
		if (user)
			return user.profile.picture;
	},
	debug(){
		console.log('debug subusers', this);
	}
});
Template.subusers.events({
	'click .load-more'(e,t){
		if (Session.get('debug')) console.log('clicked more', FlowRouter.getQueryParam('more'), t.next.get(), t.count.get());
		FlowRouter.setQueryParams({more: t.limit.get() + t.next.get()});
	},
	'click .toggleSwitch'(e,t){
		var pushing;
		console.log('clicked togglePush', e.target.checked, this.pushing, '\n', e, this);
		if (this.pushing)
			pushing = null;
		else
			pushing = 'checked';
		Meteor.call('push.pushing', {_id: this._id, pushing: pushing});
	},
	'click .pushmessage'(e,t){
		e.preventDefault();
		e.stopPropagation();
		console.log('clicked pushmessage', this);
		Modal.show('sendPushModal', this);
	},
	'click .remove'(e,t){
		e.preventDefault();
		e.stopPropagation();
		console.log('clicked remove', this);
		Collections.Push.remove(this._id);
	},
	'click .filter'(e,t){
		if (!t.filter.get() || t.filter.get() == 'all')
			t.filter.set('checked');
		else if (t.filter.get() == 'checked')
			t.filter.set('nonchecked');		
		else if (t.filter.get() == 'nonchecked')
			t.filter.set('all');
		else
			t.filter.set('checked');
		console.log('click filter', t.filter.get(), e.target.id, e);
	},	
	'click .sort'(e,t){
		if (e.target.id == 'signed')
			t.sort.set({createdAt: -1});
		if (e.target.id == 'sent')
			t.sort.set({sentAt: -1});
	}
});

Template.allusers.onCreated( () => {
	AutoForm.debug(); 
	var sub;
	//PostSubs.subscribe('userdata', {limit: 10});
	let t = Template.instance();
	t.hidden = new ReactiveVar();
	t.ready = new ReactiveVar(true);
	t.next = new ReactiveVar(5);
	t.limit = new ReactiveVar(10);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	t.count = new ReactiveVar(0);
	t.userselected = new ReactiveVar(0);
	t.countwith = new ReactiveVar(0);
	t.showpro = new ReactiveVar(0);
	t.showtesters = new ReactiveVar(0);
	t.showwith = new ReactiveVar(0);
	t.file = new ReactiveVar(0);
	t.running = new ReactiveVar(0);

	Meteor.call('count.allusers', (e,r)=>{
		if (r) console.warn('ERR userCount call ', e,r);
		t.count.set(r);
	});
	
	t.autorun(function(){
		sub = PostSubs.subscribe('userdata',{
			all: true,
			limit: t.limit.get(),
			sort: sort.get(),
			engaged: engaged.get(),
			debug: Session.get('debug')
		});
	})

	t.autorun(()=> {
		if (!t.ready.get()) return;
		let data = Meteor.users.find();
		t.count.set(data.count());
		let limit = parseInt(FlowRouter.getQueryParam('more')) || 12;
		if (limit > t.limit.get()) t.limit.set(limit);
		
		file = _.map(data.fetch(), function(rec){
			//console.log(rec); 
			var out = {}; 
			out.username = rec.username; 
			if (rec.emails)
				out.email = rec.emails[0].address; 
			rec.profile = rec.profile || {};
			out.name = rec.profile.name || out.username; 
			out.posts = rec.posts;
			out.last = rec.visitedAt || rec.createdAt;
			return out
		});
		t.file.set(file);
		
	});
	
	$(window).scroll(function(){
		if (!t.ready.get()) return;
		checkMore(t);
	});
	
	Meteor.call('posts.count');
	
});
Template.allusers.helpers({
	ready: function(){
		let t = Template.instance();
		if (Session.get('debug')) console.log('nonusers ready', t.ready.get(), t.count.get());
		return t.ready.get();
	},
	showMore: function(){
		let t = Template.instance();
		if (Session.get('debug')) console.log('nonusers showMore:', t.limit.get() <= t.count.get(), 'limit:', t.limit.get(), 'count:', t.count.get());
		return t.limit.get() <= t.count.get();
	},
	userCount(){
		//return Counts.get('countUsers');
	},
	userSelected(){
		let t = Template.instance();
		return t.userselected.get();
	},
	sorted(){
		let t = Template.instance();
		return _.keys(sort.get())[0];
	},
	user(){
		let t = Template.instance();
		let list = {};
		if (engaged.get())
			list.posts = {$gt: 0};
		let data = Meteor.users.find(list,{sort: sort.get()});		
		console.log('allusers: ', data.count(), sort.get(), engaged.get());
		t.userselected.set(data.count());
		return data;
	},
	countPosts(){
		return Collections.Posts.find({userId: this.userId}).count();
	},
	roles(){
		if (this.roles)
			return _.values(this.roles);
	},
	ifGPS(){
		//console.log('ifGPS', this);
		if (this.profile.gps)
			return 'fa-check-square';
		else
			return 'fa-square-o';
	},
	ifPush(){
		if (Collections.Push.findOne({userId: this._id, pushing: 'checked'}))
			return 'fa-check-square';
		return
			'fa-square-o';
	},
	push(){
		return Collections.Push.findOne({userId: this._id});
	},
	localDate(){
		//console.log('date', this);
		return this.toLocaleDateString();
	},
	userservices(){
		//console.log('allusers user', this);
		if (!this.services)
			return;
		var services = [];
		_.each(_.pairs(this.services), function(pair){
			if (pair[0] == 'password' || pair[0] == 'resume' || pair[0] == 'email')
				return;
			else if (pair[0] == 'twitter')
				pair[1].link = 'https://twitter.com/' + pair[1].screenName;
			else if (pair[0] == 'google')
				pair[1].link = 'https://plus.google.com/u/' + pair[1].id;
			services.push({service: pair[0], value: pair[1]});
		});
		//console.log('services', services);
		return services;
	},
	serviceAvatar(){
		//console.log('serviceAvatar', this);
		return this.value.avatar || this.value.picture || this.value.profile_image_url_https;
	},
	activeRotate(){
		let t = Template.instance();
		if (t.running.get())
			return 'activeRotate';
	},
});
Template.allusers.events({
/* 	'click .sortIt'(e,t){
		e.preventDefault();
		if (t.sort.get().createdAt)
			t.sort.set({'profile.visitedAt': -1})
		else if (t.sort.get()['profile.visitedAt'])
			t.sort.set({'profile.countOG.all': -1})
		else if (t.sort.get()['profile.countOG.all'])
			t.sort.set({createdAt: -1})
		console.log('click sort', sort.get() == {'createdAt': -1}, sort.get());
	}, */
	'change .showPro'(e,t){
		console.log('showPro', e.target.checked, e);
		t.showpro.set(e.target.checked);
	},
	'click .submit' ( e, t ) {	
		var username = $('#username').val();
		console.log('submit username', $('#username').val());
		Meteor.call('user.addtester', {username: username, manage: 'add'});
	},
	'click .toggleTester' ( e, t ) {
		var tester, manage;
		console.log('toggleTester', e, this.roles, this );
		if (this.roles)
			tester = _.contains(_.flatten(_.values(this.roles)),'tester');
		if (tester) 
			manage = 'remove';
		else
			manage = 'add';
		Meteor.call('user.addtester', {userId: this._id, manage: manage});
		//Meteor.call('user.addtester', {userId: this._id, manage: 'remove'});
		//ProUsers.remove(this._id);
	},  
/* 	'click .togglePro' ( e, t ) {
		var user, manage;
		var pro = ProUsers.findOne({userId: this._id});
		
		
		if (!pro)
			ProUsers.insert({userId: this._id, type: 'pro', max: Meteor.settings.public.ImageMaxPro, createdAt: new Date, expire: new Date(Date.now()+365*24*60*60*1000)});
		else
			ProUsers.remove(pro._id);
		pro = ProUsers.findOne({userId: this._id});
		console.log('togglePro', e, this.roles, this, 'pro:',  pro, Meteor.settings.public.ImageMaxPro);
		//Meteor.call('user.addtester', {userId: this._id, manage: manage});
		//Meteor.call('user.addtester', {userId: this._id, manage: 'remove'});
		//ProUsers.remove(this._id);
  }, */
	'click .fbmessenger'(e,t){
		e.preventDefault();
		e.stopPropagation();
		console.log('clicked fbmessenger', this);
		Modal.show('sendMessageModal', this);
	},
/* 	'click #showTesters'(e,t){
		var val = $('#showTesters').prop('checked');
		console.log('clicked showTesters', val, e.target, this);
		t.showtesters.set(val);
	},	
	'click #showPro'(e,t){
		var val = $('#showPro').prop('checked');
		console.log('clicked showPro', val, e.target, this);
		t.showpro.set(val);
	}, */
/* 	'click .userBilling'(e,t){
		console.log('clicked userBilling', this);
		FlowRouter.setQueryParams({get: 'userbilling', userId: this._id});
	}, */
	'click .userMailchimp'(e,t){
		Meteor.call('social.mailchimp.get',{userId: this._id},(e,r)=>{
			console.log('social.mailchimp.get', e,r);
			//if (r) Bert.alert('
			t.running.set();
		});
	},
/* 	'click .withTours'(e,t){
		t.showwith.set('withTours');
	},
	'click .withNoPublishes'(e,t){
		t.showwith.set('withNoPublishes');
	},
	'click .withNoPanos'(e,t){
		t.showwith.set('withNoPanos');
	}, */
	'click .saveFile'(e,t){
		var json = JSON.stringify(t.file.get());
		var csv = convertToCSV(json);
		csv = 'Username, Email Address, Name, Posts, Last visit\n' + csv;
		var fileout = new File([csv], 'filename', {type: 'contentType', lastModified: Date.now()}); 
		console.log('file', csv, '\n\n', json, '\n\n', t.file.get());
		saveAs( fileout, 'userlist.csv' );
	},
});

Template.nonusers.onCreated( () => {
	AutoForm.debug(); 
	var sub;
	//PostSubs.subscribe('userdata', {limit: 10});
	let t = Template.instance();
	t.hidden = new ReactiveVar();
	t.ready = new ReactiveVar(true);
	t.next = new ReactiveVar(5);
	t.limit = new ReactiveVar(10);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	t.count = new ReactiveVar(0);
	t.countwith = new ReactiveVar(0);
	t.userselected = new ReactiveVar(0);
	t.showpro = new ReactiveVar(0);
	t.showtesters = new ReactiveVar(0);
	t.showwith = new ReactiveVar(0);
	t.file = new ReactiveVar(0);
	t.running = new ReactiveVar(0);
	
	t.autorun(function(){
		sub = PostSubs.subscribe('nonuserdata',{
			all: true,
			limit: t.limit.get(),
			sort: sort.get(),
			engaged: engaged.get(),
			debug: Session.get('debug')
		});
	})

	t.autorun(()=> {
		if (!t.ready.get()) return;
		t.count.set(Collections.Extusers.find().count());
		let limit = parseInt(FlowRouter.getQueryParam('more')) || 12;
		if (limit > t.limit.get())
			t.limit.set(limit);
	});
	
	$(window).scroll(function(){
		if (!t.ready.get()) return;
		checkMore(t);
	});
	
	// update count posts for non users
	Meteor.call('sanitation.nonuser');
	Meteor.call('ip.geo');
});
Template.nonusers.helpers({
	ready: function(){
		let t = Template.instance();
		if (Session.get('debug')) console.log('nonusers ready', t.ready.get(), t.count.get());
		return t.ready.get();
	},
	showMore: function(){
		let t = Template.instance();
		if (Session.get('debug')) console.log('nonusers showMore:', t.limit.get() <= t.count.get(), 'limit:', t.limit.get(), 'count:', t.count.get());
		return t.limit.get() <= t.count.get();
	},
	userCount(){
		//return Counts.get('countNonUsers');
	},
	userSelected(){
		let t = Template.instance();
		return t.userselected.get();
	},
	sorted(){
		let t = Template.instance();
		return _.keys(sort.get())[0];
	},
	user(){
		let t = Template.instance();
		var list = {};
		if (engaged.get())
			list.posts = {$gt: 0};
		var data = Collections.Extusers.find(list, {sort: sort.get()});		
		//console.log('nonusers: ', data.count(), sort.get(), data.fetch());
		t.userselected.set(data.count());
		return data;
	},
	countPosts(){
		return Collections.Posts.find({username: this.username}).count();
	},
	ifPush(){
		if (Collections.Push.findOne({userId: this._id, pushing: 'checked'}))
			return 'fa-check-square';
		return
			'fa-square-o';
	},
	push(){
		return Collections.Push.findOne({userId: this._id});
	},
	localDate(){
		//console.log('date', this);
		return this.toLocaleDateString();
	},
	activeRotate(){
		let t = Template.instance();
		if (t.running.get())
			return 'activeRotate';
	},
});
Template.nonusers.events({
/* 	'click .sortIt'(e,t){
		e.preventDefault();
		if (t.sort.get().createdAt)
			t.sort.set({createdAt: - t.sort.get().createdAt})
		console.log('click sort', t.sort.get());
	}, */
	'click .saveFile'(e,t){
		return Bert.alert('coming soon', 'default');
		var json = JSON.stringify(t.file.get());
		var csv = convertToCSV(json);
		csv = 'Username, Email Address, First Name, Last Name\n' + csv;
		var fileout = new File([csv], 'filename', {type: 'contentType', lastModified: Date.now()}); 
		console.log('file', csv, '\n\n', json, '\n\n', t.file.get());
		saveAs( fileout, 'userlist.csv' );
	},
	'click .load-more'(e,t){
		if (Session.get('debug')) console.log('clicked more', FlowRouter.getQueryParam('more'), t.next.get(), t.count.get());
		FlowRouter.setQueryParams({more: t.limit.get() + t.next.get()});
	},
});

Template.mailchimp.onCreated( () => {
	let t = Template.instance();
	t.hidden = new ReactiveVar();
	t.ready = new ReactiveVar(true);
	t.next = new ReactiveVar(5);
	t.limit = new ReactiveVar(10);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	t.count = new ReactiveVar(0);
	t.showpro = new ReactiveVar(0);
	t.showtesters = new ReactiveVar(0);
	t.showwith = new ReactiveVar(0);
	t.file = new ReactiveVar(0);
	var sub;
	
	t.autorun(function(){	
		sub = PostSubs.subscribe('userdata',{
			all: true,
			limit: t.limit.get(),
			sort: t.sort.get(),
			debug: Session.get('debug')
		});
	})	
	t.autorun(function(){
		if (sub)
			t.ready.set(sub.ready());
		if (t.ready.get())
			t.loaded.set(Meteor.users.find().count());
		if (Session.get('debug')) console.log('allusers.onCreated sub ready', t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	});
	var count = Meteor.call('count.allusers', (e,r)=>{
		if (r) console.warn('ERR userCount call ', e,r);
		t.count.set(r);
	});
  $(window).scroll(function(){	
		checkMore(t);
	});
});
Template.mailchimp.helpers({
	isMore(){
		let t = Template.instance();		
		if (t.loaded.get() < 8 && t.limit.get() < 16)
			return true;
		if (Session.get('debug')) console.log('isMore', t.limit.get(), t.next.get(), t.loaded.get());
		return (t.limit.get() - t.next.get() <= t.loaded.get());
	},
	isReady() {
		let t = Template.instance();
		return t.ready.get();
	},
	userCount(){
		let t = Template.instance();
		//console.log('userCount', t.count.get());
		return t.count.get();
	},
	user(){
		let t = Template.instance();
		var list = {};
		if (t.showwith.get() =='withTours')
			list = {'profile.count': {$elemMatch: {type: 'published', number: {$gte: 1}}}};
		else if (t.showwith.get() =='withNoPublishes')
			list = { $and: [{'profile.count': {$elemMatch: {type: 'published', number: 0}}}, {'profile.count': {$elemMatch: {type: 'tours', number: {$gte: 1}}}}]};
		else if (t.showwith.get() =='withNoPanos')
			list = {'profile.count': {$elemMatch: {type: 'panos', number: 0}}};

		var data = Meteor.users.find(list,{fields:{username:1, emails: 1, 'profile.firstName': 1, 'profile.lastName': 1, 'profile.count': 1}, sort:{visitedAt: -1}});
		//console.log('all users', data.count(), data.fetch());
		t.count.set(data.count());
		var file = Meteor.users.find(list,{fields:{username: 1, 'emails.address': 1, 'profile.firstName': 1, 'profile.lastName': 1}, sort:{visitedAt: -1}});
		if (file.count()) {
			file = _.map(file.fetch(), function(rec){
				console.log(rec); 
				var out = {}; 
				out.username = rec.username; 
				out.email = rec.emails[0].address; 
				out.firstName = rec.profile.firstName; 
				out.lastName = rec.profile.lastName; 		
				return out
			});
			t.file.set(file);
		}
		return data;
	},
	roles(){
		if (this.roles)
			return _.values(this.roles);
	},
	subscribed(){
		let t = Template.instance();
		var sub = PostSubs.subscribe('prousers',{userId: this._id});
		//console.log('subscribed prousers sub', this, sub, sub.ready());
		return sub.ready();
	},
	prouser(){
		var data = ProUsers.findOne({userId: this._id});
		//console.log('subscribed prousers sub', this, data);
		return data;
	},
	localDate(){
		console.log('date', this);
		return this.toLocaleDateString();
	},
	lastVisit(){
		if (this.visitedAt)
			return this.visitedAt.toLocaleDateString();
	},
	userservices(){
		//console.log('allusers user', this);
		if (!this.services)
			return;
		var services = [];
		_.each(_.pairs(this.services), function(pair){
			if (pair[0] == 'twitter')
				pair[1].link = 'https://twitter.com/' + pair[1].screenName;
			else if (pair[0] == 'google')
				pair[1].link = 'https://plus.google.com/u/' + pair[1].id;
			services.push({service: pair[0], value: pair[1]});
		});		
		//console.log('services', services);
		return services;
	},
	serviceAvatar(){
		//console.log('serviceAvatar', this);
		return this.value.avatar || this.value.picture || this.value.profile_image_url_https;
	}
/* 	userdata(){
		var data = Meteor.users.findOne(this.userId);
		if (!data)
			PostSubs.subscribe('userdata',{userId: this.userId});
		console.log('pro users', this.userId, data);
		return data;
	} */
});
Template.mailchimp.events({
  'click .submit' ( e, t ) {	
		var username = $('#username').val();
		console.log('submit username', $('#username').val());
		Meteor.call('user.addtester', {username: username, manage: 'add'});
  },
  'click .toggleTester' ( e, t ) {
		var tester, manage;
		console.log('toggleTester', e, this.roles, this );
		if (this.roles)
			tester = _.contains(_.flatten(_.values(this.roles)),'tester');
		if (tester) 
			manage = 'remove';
		else
			manage = 'add';
		Meteor.call('user.addtester', {userId: this._id, manage: manage});
		//Meteor.call('user.addtester', {userId: this._id, manage: 'remove'});
		//ProUsers.remove(this._id);
  },  
	'click .togglePro' ( e, t ) {
		var user, manage;
		var pro = ProUsers.findOne({userId: this._id});
		
		
		if (!pro)
			ProUsers.insert({userId: this._id, type: 'pro', max: Meteor.settings.public.ImageMaxPro, createdAt: new Date, expire: new Date(Date.now()+365*24*60*60*1000)});
		else
			ProUsers.remove(pro._id);
		pro = ProUsers.findOne({userId: this._id});
		console.log('togglePro', e, this.roles, this, 'pro:',  pro, Meteor.settings.public.ImageMaxPro);
		//Meteor.call('user.addtester', {userId: this._id, manage: manage});
		//Meteor.call('user.addtester', {userId: this._id, manage: 'remove'});
		//ProUsers.remove(this._id);
  },
	'click .fbmessenger'(e,t){
		e.preventDefault();
		e.stopPropagation();
		console.log('clicked fbmessenger', this);
		Modal.show('sendMessageModal', this);
	},
	'click #showTesters'(e,t){
		var val = $('#showTesters').prop('checked');
		console.log('clicked showTesters', val, e.target, this);
		t.showtesters.set(val);
	},	
	'click #showPro'(e,t){
		var val = $('#showPro').prop('checked');
		console.log('clicked showPro', val, e.target, this);
		t.showpro.set(val);
	},
	'click .withTours'(e,t){
		t.showwith.set('withTours');
	},	
	'click .withNoPublishes'(e,t){
		t.showwith.set('withNoPublishes');
	},	
	'click .withNoPanos'(e,t){
		t.showwith.set('withNoPanos');
	},	
	'click .saveFile'(e,t){
		var json = JSON.stringify(t.file.get());
		var csv = convertToCSV(json);
		csv = 'Username, Email Address, First Name, Last Name\n' + csv;
		var fileout = new File([csv], 'filename', {type: 'contentType', lastModified: Date.now()}); 
		console.log('file', csv, '\n\n', json, '\n\n', t.file.get());
		saveAs( fileout, 'userlist.csv' );
	},
});

Template.adminusers.onCreated( () => {
	let t = Template.instance();
	t.hidden = new ReactiveVar();
	t.ready = new ReactiveVar(true);
	t.next = new ReactiveVar(5);
	t.limit = new ReactiveVar(10);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	t.count = new ReactiveVar(0);
	t.countwith = new ReactiveVar(0);
	t.showpro = new ReactiveVar(0);
	t.showtesters = new ReactiveVar(0);
	t.showwith = new ReactiveVar(0);
	t.file = new ReactiveVar(0);
	t.running = new ReactiveVar(0);
	t.autorun(function(){
		sub = PostSubs.subscribe('userdata',{
			all: true,
			limit: t.limit.get(),
			sort: t.sort.get(),
			debug: Session.get('debug')
		});
	})
});
Template.adminusers.helpers({
	admin(){
		var data = Meteor.users.find({'roles.admGroup': 'admin'});
		if (Session.get('debug')) console.log('admin users', data.fetch());
		return data;
	},
	group(){
		return this['admGroup'];
	}
/* 	userdata(){
		var data = Meteor.users.findOne(this.userId);
		return data;
	} */
});
Template.adminusers.events({
	'click .submit' ( e, t ) {
		if (Session.get('debug')) console.log('submit addadmin', $('#addadmin').val());
		var addadmin = $('#addadmin').val();
		var role = $('#role').val();
		Meteor.call('user.admin', {username: addadmin, role: role, add: true, caller:'adminusers submit'});
		//PostSubs.subscribe('userdata',{all: true});
	},
	'click .removeadm' ( e, t ) {
		if (Session.get('debug')) console.log('remove addadmin', this);
		if (Meteor.userId() == this._id)
			return Bert.alert('You can\'t remove yourself','warning');
		Meteor.call('user.admin', {username: this.username, role: 'admin', remove: true, caller:'adminusers removeadm'});
		//PostSubs.subscribe('userdata',{all: true});
		//ProUsers.remove(this._id);
	},
});

Template.adminpages.onCreated( () => {
	let t = Template.instance();
	t.hidden = new ReactiveVar();
	t.ready = new ReactiveVar(true);
	t.limit = new ReactiveVar(10);
	t.sort = new ReactiveVar({createdAt: -1});
	PostSubs.subscribe('pages',{
		adminpages: true,
		limit: 1000,
		sort: {createdAt: -1},
		debug: Session.get('debug'),
		caller: 'adminpages.onCreated'
	});
});
Template.adminpages.helpers({
	pages(){
		list = {$or: [{hidden: true}, {dynamic: true}]};	
		let data = Collections.Pages.find(list, {sort: {createdAt: -1}});
		console.log('adminpages data', data.fetch());
		return data;
	},
	icon(){
		let og = this.og || {};
		let icon = this.og.icon || this.og.logo || '/favicon-96x96.png';
		console.log('adminpages icon', icon, og);
		return icon;
	}
});
Template.adminpages.events({
	'click .editPage'(e,t){
		Modal.show('editPageModal', this);
	}
});

Template.emailTemplates.onCreated( () => {
	AutoForm.debug(); 
	let t = Template.instance();
	t.editRecord = new ReactiveVar();
	PostSubs.subscribe('emailstmpl');
});
Template.emailTemplates.onRendered( () => { 
	let t = Template.instance();
	t.autorun(() => { 
		t.editRecord.get();
		if (window.CKEDITOR && $('textarea').attr('name')) 
			if (!$(this).hasClass('olark-form-message-input')) 
				$('textarea').each(function(){
					CKEDITOR.replace($(this).attr('name'))
				});
	});
});
Template.emailTemplates.helpers({
	collection(){
		return Collections.EmailsTmpl;
	},
	editRecord(){
		return Template.instance().editRecord.get();
	},
	emails() {
		var data = Collections.EmailsTmpl.find();
		//console.log('uploaded tour', tour, Template.instance().tour.get());
		return data;
	},
	error() {
		return Template.instance().error.get();
	}
});
Template.emailTemplates.events({
	'click .pointer' (e,t){
		//e.preventDefault();
		//e.stopPropagation();
	},	
  'click .newRecord' ( e, t ) {
		e.preventDefault();
		e.stopPropagation();
		t.editRecord.set('new');
  },
  'click .editRecord' ( e, t ) {
		e.preventDefault();
		e.stopPropagation();
		console.log('clicked editRecord', this);
		t.editRecord.set(this._id);
  },
  'submit' ( e, t ) {
		e.stopPropagation();
		console.log('submitting', e, this);
		t.editRecord.set();
  },
  'click .remove' ( e, t ) {
		e.preventDefault();
		e.stopPropagation();
		console.log('clicked remove', this);
		EmailsTmpl.remove(this._id);
		t.editRecord.set();
		//template.editmarker.set();
  },
});

Template.integration.onCreated(()=> {
	var sub, tags;
	let t = Template.instance();
	t.state = new ReactiveDict();
	t.vrloaded = new ReactiveVar();
	t.showtime = new ReactiveVar();
	t.sortPano = new ReactiveVar( 'date' );
	t.selectUsed = new ReactiveVar();
	t.selectTag = new ReactiveVar();
	t.ready = new ReactiveVar();
	t.next = new ReactiveVar(6);
	t.limit = new ReactiveVar(6);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	
	if (Session.get('sort'))
		t.sort.set(Session.get('sort'));
	
});
Template.integration.onRendered( ()=> {
/* 	Meteor.setTimeout(function(){
		$('.toggleSwitch').bootstrapToggle();
	},1000); */
});
Template.integration.onDestroyed( ()=> {
	//$('#datepicker').datepicker('destroy');
});
Template.integration.helpers({
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
	libraries(){
		var data, sub;
		var data = Collections.Settings.find({$or: [{common: true}, {personal: {$exists: false}}]});
		console.log('integration', data.count(), data.fetch());
		return data;
	},
	enabled(){
		if (this.enable)
			return 'checked';
	},
	debug(){
		if (Session.get('debug')) console.log('sounds debug', this);
	}
});
Template.integration.events({
	'change .enableLib'(e,t){
		console.log('clicked enableLib', this.type, e.target.checked, '\n', e, this);
		Meteor.call('settings.set', {_id: this._id, type: this.type, enable: e.target.checked, common: true});
	},
});


const buttonEl = [
	{label: 'sortDate', value: 'by Reg'},
	{label: 'sortVisit', value: 'by Visit'},
	{label: 'sortGraf', value: 'by Graffiti'},
];
Template.sortElementAdm.onCreated(()=> {
	let t = Template.instance();
	t.label = new ReactiveVar('sortDate');
});
Template.sortElementAdm.helpers({
	buttonEl(){
		return buttonEl;
	},
	active(){
		let t = Template.instance();	
		if (this.label === t.label.get())
			return 'active';
		return 'nonactive';
	},
	caret(){
		let t = Template.instance();
		let caret;
		if (this.label != t.label.get()) return;
		if (_.values(sort.get())[0] > 0)
			caret = '<i class="fa fa-sort-asc" aria-hidden="true"></i> ';
		else
			caret = '<i class="fa fa-sort-desc" aria-hidden="true"></i> ';
		//console.log('active:', caret, _.values(sort.get())[0], this.label === t.label.get(), this.label, t.label.get(), sort.get());
		return caret;
	},
	engaged(){
		if (engaged.get()) 
			return 'engaged';
		else
			return 'all';
	}
});
Template.sortElementAdm.events({
	'click .sort'(e,t){
		t.label.set(this.label);
		if (this.label == 'sortDate') {
			if (sort.get().createdAt)
				sort.set({createdAt: -sort.get().createdAt});
			else 
				sort.set({createdAt: -1});
		} else if (this.label == 'sortVisit'){
				if (sort.get().visitedAt)
					sort.set({posts: -sort.get().visitedAt});
				else 
					sort.set({visitedAt: -1});			
		}	else if (this.label == 'sortGraf'){
				if (sort.get().posts)
					sort.set({posts: -sort.get().posts});
				else 
					sort.set({posts: -1});			
		}
		if (window.grid) {
			Meteor.setTimeout(()=>{
				if ($('.grid').data('masonry'))
					window.grid.masonry('reloadItems');
				window.grid.masonry();
			},100);
		}
	},
	'click .engaged'(e,t){
		engaged.set(!engaged.get());	
	}
});


