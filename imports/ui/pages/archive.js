import moment from 'moment';
//import '/imports/external/jquery-ui.js';

const _LocalTags = new Mongo.Collection(null);
window._LocalTags = _LocalTags;

import './archive.html';
import './timers.js';
import './profile.js';

import '../stylesheets/animation.css';


import {Collections} from '/imports/api/collections.js';
import {Schemas} from '/imports/api/collections.js';
import {setSort} from '/imports/api/functions.js';
import { imgOnScroll } from '/imports/api/functions.js';
import { initCurrTimer } from '/imports/api/functions.js';

import {hooksAddTimer} from '/imports/api/hooks.js';
//AutoForm.addHooks('insertTimerForm', hooksAddTimer);
window.Collections = Collections;



function infCheck(t){
	$('#infiniteCheck').each(function(i){
		var t = $(this);
		if(t.offset().top - $(window).scrollTop() < $(window).height() ){
			console.log('infiniteCheck ', i, this, t, t.id, t.offset().top < $(window).height());
		}
		t.limit.set(t.limit.get()+6);
	});	
}
function checkMore(t){

	Meteor.setTimeout(function(){
		if ($('#infiniteCheck').offset() && $('#infiniteCheck').offset().top - $(window).scrollTop() - $(window).height() < -20){
			t.limit.set(t.limit.get() + t.next.get());
			if (Session.get('debug')) console.log('userpanos.onRendered getting next limit 0:', t.ready.get(), t.limit.get(), t.next.get(), t.loaded.get(), $('#infiniteCheck').offset().top - $(window).scrollTop() - $(window).height());
		}	
	},500);
}

Template.archive.onCreated(() => {
  let t = Template.instance();
	t.vrloading = new ReactiveVar();
	t.showtime = new ReactiveVar();
	t.errordetail =  new ReactiveVar();
	t.list =  new ReactiveVar({userId: Meteor.userId()});
	t.ready = new ReactiveVar(true);
	t.next = new ReactiveVar(4);
	t.limit = new ReactiveVar(8);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	t.currentTimer = new ReactiveVar(0);
	t.timeSpent = new ReactiveVar(0);
	t.interval = new ReactiveVar();
	
	var sub;

	if (FlowRouter.getParam("username")) 
		t.subscribe('userdata',{username: FlowRouter.getParam("username")});
	t.autorun(function(){		
		if (FlowRouter.getParam("username")) {
			t.list.set({username: FlowRouter.getParam("username")});
			sub = t.subscribe('timersSet',{
				username: FlowRouter.current().params.username,
				limit: t.limit.get(),
				sort: t.sort.get()
			});
		} else {
			t.list.set({userId: Meteor.userId()});	
			sub = t.subscribe('timers',{
				userId: Meteor.userId(),
				limit: t.limit.get(),
				sort: t.sort.get()
			});
		}
		t.ready.set(sub.ready());
		//console.log('tours.onCreated sub', sub, t.list.get(), t.sort.get(), t.limit.get());		
	})	
	
});
Template.archive.onRendered(() => {
	let t = Template.instance();
	
	t.autorun(function(){
		var data = _LocalTags.findOne();
		if (!data)
			_LocalTags.insert({tags:[]});
	});
	
  $(window).scroll(function(){	
		checkMore(t);
	});
	
	window.prerenderReady = true;
});
Template.archive.onDestroyed(() => {

});
Template.archive.helpers({

});
Template.archive.events({

});

Template.archivetimers.onCreated(() => {
  let t = Template.instance();
	t.vrloading = new ReactiveVar();
	t.showtime = new ReactiveVar();
	t.errordetail =  new ReactiveVar();
	t.list =  new ReactiveVar({userId: Meteor.userId()});
	t.ready = new ReactiveVar(true);
	t.next = new ReactiveVar(4);
	t.limit = new ReactiveVar(8);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	t.currentTimer = new ReactiveVar(0);
	t.timeSpent = new ReactiveVar(0);
	t.interval = new ReactiveVar();
	
	var sub;

	if (FlowRouter.getParam("username")) 
		t.subscribe('userdata',{username: FlowRouter.getParam("username")});
	t.autorun(function(){		
		if (FlowRouter.getParam("username")) {
			t.list.set({username: FlowRouter.getParam("username")});
			sub = t.subscribe('timersSet',{
				username: FlowRouter.current().params.username,
				archived: true,
				limit: t.limit.get(),
				sort: t.sort.get()
			});
		} else {
			t.list.set({userId: Meteor.userId()});	
			sub = t.subscribe('timersSet',{
				userId: Meteor.userId(),
				archived: true,
				limit: t.limit.get(),
				sort: t.sort.get()
			});
		}
		t.ready.set(sub.ready());
		//console.log('tours.onCreated sub', sub, t.list.get(), t.sort.get(), t.limit.get());		
	})	
});
Template.archivetimers.onRendered(() => {
	let t = Template.instance();
	//var self = this;
	
	t.autorun((computation)=>{
		if (!t.currentTimer.get()) return;
		var interval = Meteor.setInterval(()=>{
			t.timeSpent.set(Math.round(t.currentTimer.get().timeSpent + (new Date() - t.currentTimer.get().timeStarted) / 1000))	;
			console.log('time spent', t.timeSpent.get(), t.currentTimer.get());
		},5000);
		t.interval.set(interval);
		console.log('time started interval', interval, t.currentTimer.get());
		
	});
  $(window).scroll(function(){	
		checkMore(t);
	});
});
Template.archivetimers.onDestroyed(() => {
	let t = Template.instance();
});
Template.archivetimers.helpers({
	isMore(){
		let t = Template.instance();
		if (t.loaded.get() < 8 && t.limit.get() < 16)
			return true;
		return (t.limit.get() - t.next.get() <= t.loaded.get());
	},
	isReady() {
		let t = Template.instance();
		return t.ready.get();
	},
	timeRunning(){
		let t = Template.instance();
		return t.timeRunning.get();
	},
	timers(){
		let t = Template.instance();
		var prouser, data, sort, list;
		
		if (Meteor.user() && FlowRouter.getParam("username") == Meteor.user().username)
			list = {userId: Meteor.userId(), archived: true};
		else if (FlowRouter.getParam("username")) {
			user = Meteor.users.findOne({username: FlowRouter.getParam("username")});
			if (!user)
				return ;
			list = {userId: user._id,  archived: true};
		}

		tags = _LocalTags.findOne();
		// if (tags && tags.tags)
			// list.tags = {$in: tags.tags};
		
		sort = {sort: Session.get('sort')};
		data = Collections.Timers.find(list, sort);		
		//console.log('timers', data.count(), data.fetch(), list, sort);
		return data;
	},
	countDaily(){
		if (this.daily)
			return this.daily.length;
	},	
	countSessions(){
		return Collections.Sessions.find({timerId: this._id}).count();
	},
	ifAuthor(){
		if (Meteor.userId() == this.userId) return true;
	},
	createdAt(){
		return moment( this.createdAt).format('MMM DD HH:mm:ss');
	},
	timeStarted(){
		if (this.timeStarted) return moment( this.timeStarted ).format('MMM DD HH:mm:ss');
	},
	spent(){
		let t = Template.instance();
		var data = this.timeSpent || 0;
		var counter = t.timeSpent.get() || 0;
		if (t.currentTimer.get())
			data = data + counter;
		var spent = moment.duration(data).humanize();
		//console.log('\ntime spent for:', spent, '\ndata:', data, 'counter:', t.timeSpent.get(), this, '\n\n');
		return spent;
	},
	sorted(){
		var sort;
		if (Session.get('sort').createdAt) 
			sort = 'date';
		else if (Session.get('sort').file)
			sort = 'filename';
		return sort;
	},
	selectTag(){
		let t = Template.instance();
		var data = _LocalTags.findOne();
		if (data)
			return data.tags;
	},
	activetags(){
		let t = Template.instance();
		var data = _LocalTags.findOne();
		if (data && data.tags)
			return 'active';
	},
	activedate(){
		let t = Template.instance();
		if (Session.get('selectDate')) return 'active';	
	},
	selectedtags(){
		return _LocalTags.findOne();
	},	
	author(){
		//console.log('author', this);
		if (Meteor.user())
			return (this.userId == Meteor.userId());
	},
});
Template.archivetimers.events({
	'click .unarchive'(e,t){
		console.log('unarchive', this);
		Collections.Timers.update(this._id,{$unset: {archived: 1}});
	},
	'click .deleteTimer'(e,t){
		console.log('deleteTimer', this);
		Collections.Timers.remove({_id: this._id});
	},
	'click .showDaily'(e,t){
		console.log('clicked showDailyModal', this);
		Modal.show('showDailyModal', this.daily);
	},	
	'click .showSessions'(e,t){	
		var data = Collections.Sessions.find({timerId: this._id});
		Modal.show('showSessionsModal', data);
	},
});
