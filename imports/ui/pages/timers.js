import moment from 'moment';
window.moment = moment;
const _LocalTags = new Mongo.Collection(null);
window._LocalTags = _LocalTags;

import './timers.html';
import './currenttimer.js';
import './profile.js';
import './clock.js';
import './chart.js';
import '../stylesheets/animation.css';


import {Collections} from '/imports/api/collections.js';
import {Schemas} from '/imports/api/collections.js';

import {AutoForm} from 'meteor/aldeed:autoform';
import { hooksAddTimer } from '/imports/api/hooks.js';
import { hooksEditSession } from '/imports/api/hooks.js';
import {hooksEditTimer} from '/imports/api/hooks.js';

import {infCheck} from '/imports/api/functions.js';
import {checkMore} from '/imports/api/functions.js';
import {stopSession} from '/imports/api/functions.js';
import {spentUpdate} from '/imports/api/functions.js';

import {setSort} from '/imports/api/functions.js';
import { imgOnScroll } from '/imports/api/functions.js';
import { initCurrTimer } from '/imports/api/functions.js';

window.Collections = Collections;
const currentTimer = new ReactiveVar(0);
const timeSpent = new ReactiveVar(0);
const currtemplate = new ReactiveVar(0);
const showdata = new ReactiveVar(0);
const showToday = new ReactiveVar();
let interval, pushInterval;
console.log('[timers.js] start:', currentTimer.get());

Template.user.onCreated(() => {
	window.prerenderReady = false;
	let t = Template.instance();		

	t.editRecord = new ReactiveVar(false);
	t.newRecord = new ReactiveVar(false);

	t.currentRoute = new ReactiveVar(FlowRouter.current());
	Session.set('sort',{createdAt: -1});
	
	if (FlowRouter.getParam("username")) 
		t.subscribe('userdata',{username: FlowRouter.getParam("username")});
	
});
Template.user.onRendered(() => {
	let t = Template.instance();
	Session.set('selectDate');	
	//setSelectDate();
	
	t.autorun(function(){
		var data = _LocalTags.findOne();
		if (!data)
			_LocalTags.insert({tags:[]});
	});
	
	window.prerenderReady = true;
});
Template.user.onDestroyed(() => {
	Session.set('currScene');
});
Template.user.helpers({
	author(){
		if (Meteor.user())
			return (FlowRouter.getParam("username") == Meteor.user().username);
	},
	user(){
		return FlowRouter.getParam("username");
	},
	currentTimer(){
		let t = Template.instance();
		return currentTimer.get();
	},
	newRecord(){
		let t = Template.instance();		
		return t.newRecord.get();
	},	
	editRecord(){
		let t = Template.instance();		
		return t.editRecord.get();
	},	
	showdata(){
		let t = Template.instance();		
		return showdata.get();
	},	
});
Template.user.events({
	'change .soon' (e,t){
		console.log('change soon', e.target.id);
		Meteor.setTimeout(function(){
			Session.set(e.target.id);
		},500);
		Bert.alert('this feature is coming soon','info');
	},
	'click .newRecord'(e,t){
		t.newRecord.set(true);
		t.editRecord.set(false);
		Modal.show('newTimerModal');
		if (window.analytics)
			analytics.track('Timer created', {
				referrer: document.referrer,
				category: "Timer",
				label: Meteor.user().username
			});	
		//FlowRouter.setQueryParams({add: true});
	},	
	'click .editRecord'(e,t){
		console.log('editRecord', this);
		t.newRecord.set(false);
		if (!t.editRecord.get()){
			showdata.set(this);
			currtemplate.set('edittimer');
			$('.editBox').removeClass('slideOutRight').addClass('slideInRight').fadeIn();
		}	else
			showdata.set();
		
		//Modal.show('editTimerModal', this);
		if (window.analytics)
			analytics.track('Timer edited', {
				referrer: document.referrer,
				category: "Timer",
				label: Meteor.user().username
			});	
	},
	'click .close'(e,t){
		Meteor.setTimeout(()=>{
			t.newRecord.set(false);
			t.editRecord.set(false);		
			showdata.set();
		},1000)
		$('.editBox').removeClass('slideInRight').addClass('slideOutRight').fadeOut();	
		//Modal.show('editTimerModal', this);
	},
});

Template.currenttimer.onCreated(() => {

	//if (!Template.currentData() || !Template.currentData()._id) return;
	let t = Template.instance();	
	if (Session.get('debug'))
		console.log('[currenttimer data]', t.data, currentTimer.get());

	if (Session.get('useGPS') && Session.get('currentTimer') && Session.get('currentTimer').useGPS) {
		if (typeof(Location) != "undefined" && Location.locate) 
			Location.locate(function(pos){
				console.log("[currenttimer] gps Got a position!", pos);
				Collections.Timers.update({_id: t.data._id},{$set:{gps: pos}});
			}, function(err){
				console.warn("[currenttimer] gps Oops! There was an error", err);
			});	
	}

});
Template.currenttimer.onRendered(() => {
	let t = Template.instance();
	
	t.autorun(()=>{
		let data = Session.get('currentTimer') || {};
		
		if (data.timeStarted && !interval)
			interval = Meteor.setInterval(()=>{
				timeSpent.set(parseInt(new Date() - data.timeStarted));
			}, 1000);
		else if (!data.timeStarted)
			Meteor.clearInterval(interval), interval = false;	
		console.log('[currenttimer.onRendered] timespent', interval, data, t.data);
		pushInterval = Meteor.setInterval(()=>{
			Bert.alert('Your timer ' + data.title + ' is running since ' + data.timeStarted);
		},60*60*1000);
	});
});
Template.currenttimer.onDestroyed(()=> {
	Meteor.clearInterval(pushInterval);
});
Template.currenttimer.helpers({
	currentTimer(){
		return Session.get('currentTimer');
	},
	timeStarted(){
		if (this.timeStarted)
			return moment( this.timeStarted ).format('MMM DD HH:mm:ss');
	},	
	session(){	
		let session = timeSpent.get();
		// 	console.log('[currenttimer] this', session, this);
		return moment.utc(session).format("HH:mm:ss");
	},
	spent(){
		var spent = this.timeSpent + timeSpent.get();
	
		return moment.utc(spent).format("HH:mm:ss")
	},	
	ifAuthor(){
		return (Meteor.userId() == this.userId);
	},
	title(){
		return this.title || 'timer stopped';
	},
	animation(){
		if (!this.timeStarted)
			return 'animation: none; color: grey !important;';
	},
	stateGPS(){
		if (this.timeStarted && this.gps)
			return 'text-info showGPS';
		else if (this.timeStarted && Meteor.isCordova && Session.get('useGPS'))
			return 'text-info animated tada infinite';
		else if (this.timeStarted && Meteor.isCordova )
			return 'text-warning turnGPS';
		else if (this.timeStarted)
			return 'text-muted dskGPS';
		else
			return 'text-muted ';
	},
});
Template.currenttimer.events({
	'click .stopTime'(e,t){
		if (this.userId != Meteor.userId()) return;	
		Meteor.clearInterval(interval);	
		stopSession({_id: this._id, caller: 'currenttimer stopTime'});
		console.log('[currenttimer] stopTime', interval, this );
		//currentTimer.set();
		//currentTimer.set();
		
		navigator.vibrate(200);
	},	
});

Template.usertimers.onCreated(() => {
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
	//t.timeSpent = new ReactiveVar(0);
	t.interval = new ReactiveVar();
	
	var sub;

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
			sub = t.subscribe('timersSet',{
				userId: Meteor.userId(),
				limit: t.limit.get(),
				sort: t.sort.get()
			});
		}
		t.ready.set(sub.ready());
		//console.log('tours.onCreated sub', sub, t.list.get(), t.sort.get(), t.limit.get());
	})
	
	t.autorun(function(){
		if (!t.ready.get()) return;
		t.loaded.set(Collections.Timers.find().count());
	});
	
	
	
});
Template.usertimers.onRendered(() => {
	let t = Template.instance();

  $(window).scroll(function(){
		checkMore(t);
	});
	
	t.autorun(()=>{
		if (!t.ready.get()) return;
		console.log('[usertimers.onRendered] timer re-activated', Collections.Timers.findOne({userId: Meteor.userId(), timeStarted: {$exists: true}}));
		let startedTimer = Collections.Timers.findOne({userId: Meteor.userId(), timeStarted: {$exists: true}});
		if (startedTimer && currentTimer.get() && startedTimer._id == currentTimer.get()._id) return;
		initCurrTimer(startedTimer);
	});
});
Template.usertimers.onDestroyed(()=> {
	let t = Template.instance();
	//console.log('destroyed 0', t.timeSpent.get());
	//Meteor.clearInterval(interval.get());
});
Template.usertimers.helpers({
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
			list = {userId: Meteor.userId(), $or: [{archived: false}, {archived: {$exists: false}}]};
		else if (FlowRouter.getParam("username")) {
			user = Meteor.users.findOne({username: FlowRouter.getParam("username")});
			if (!user)
				return ;
			list = {userId: user._id,  $or: [{archived: false}, {archived: {$exists: false}}]};
		}
		tags = _LocalTags.findOne();

		sort = {sort: {updatedAt: -1}};
		data = Collections.Timers.find(list, sort);
		//console.log('timers', data.count(), data.fetch(), list, sort);
		return data;
	},


});
Template.usertimers.events({

	'click .showDaily'(e,t){
		console.log('clicked showDailyModal', this);
		var data = this.daily;
		data = _.sortBy(data, 'date');
		showdata.set({timerId: this._id, data: this.daily});
		currtemplate.set('showdaily');
		$('.editBox').removeClass('slideOutRight').addClass('slideInRight').fadeIn();
		//Modal.show('showDailyModal', {timerId: this._id, data: this.daily});
	},
	'click .showSessions'(e,t){
		showdata.set(this);
		currtemplate.set('showsessions');
		console.log("[usertimers] showsessions:", this);
		$('.editBox').removeClass('slideOutRight').addClass('slideInRight').fadeIn();
		//Modal.show('showSessionsModal', {timerId: this._id, data:data});
	},

});

Template.usertimer.onCreated(() => {
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
	t.timeSpent = new ReactiveVar(0);
	t.interval = new ReactiveVar();
	t.showDetails = new ReactiveVar();
	t.showGPS = new ReactiveVar();

	var sub;
});
Template.usertimer.onRendered(() => {
	let t = Template.instance();
});
Template.usertimer.onDestroyed(()=> {
	let t = Template.instance();
});
Template.usertimer.helpers({
	countDaily(){
		if (this.daily)
			return this.daily.length;
	},	
	countSessions(){
		return Collections.Sessions.find({timerId: this._id},{sort: {stop: -1}}).count();
	},
	ifAuthor(){
		return (Meteor.userId() == this.userId) 
	},
	createdAt(){
		return moment( this.createdAt).format('MMM DD HH:mm:ss');
	},
	timeStarted(){
		if (this.timeStarted)
			return moment( this.timeStarted ).format('MMM DD HH:mm:ss');
	},	
	timeFinished(){
		if (this.timeFinished)
			return moment( this.timeFinished ).format('MMM DD HH:mm:ss');
	},
	spent(){
		let t = Template.instance();
		var spent = this.timeSpent || 0;
		if (Session.get('currentTimer') && Session.get('currentTimer')._id == this._id)
			spent = spent + timeSpent.get();
		spent = spent/1000;
		spent = Math.floor(moment.duration(spent,'seconds').asHours()) + 'h ' + moment.duration(spent,'seconds').minutes() + 'm ';
		//console.log('\ntime spent for:', this.title, spent, this.timeSpent, 'counter:', t.timeSpent.get(), this, '\n');
		return spent;
	},	
	spenttoday(){
		let today, spent, time, t = Template.instance();
		today = _.findWhere(this.daily, {_id: moment(new Date()).format("Y-MM-DD")}) || {};	
		today.spent = today.spent || 0;
		if (Session.get('currentTimer') && Session.get('currentTimer')._id == this._id)
			spent = today.spent + timeSpent.get();
		else
			spent = today.spent;
		//time = moment.utc(spent).format("HH:mm:ss");
		time = Math.floor(moment.duration(spent).asHours()) + 'h ' + moment.duration(spent).minutes() + 'm ';
		//+ moment.duration(spent).seconds() + 's ';
		//console.log('\ntime spenttoday for:', this.title, today.spent, today.spent + timeSpent.get(), spent, time, 'counter:', t.timeSpent.get(), this, '\n\n');
		return time;
	},	
	showToday(){
		return showToday.get();
	},
	session(){
		let t = Template.instance();
		var counter = t.timeSpent.get() || 0;
		if (currentTimer.get() && currentTimer.get()._id == this._id)
			return moment.utc(counter).format("hh:mm:ss");
	},
	sessAlert(){	
		let session = timeSpent.get();
		if (this.timeStarted && session < 60000)
			return true;
	},
	deviation(){
		return Session.get('deviation');
	},
	state(){
		//console.log('[usertimer] state:', this.timeStarted, this);
		if (this.timeStarted) return {cssclass:'stopTime', icon:'fa-circle-o-notch'};
		return {cssclass: 'startTime', icon:'fa-play'}
	},
	showDetails(){
		let t = Template.instance();
		return t.showDetails.get();
	},
	showGPS(){
		let t = Template.instance();
		return t.showGPS.get();
	},
	stateGPS(){
		if (this.timeStarted && this.gps)
			return 'text-info showGPS';
		else if (this.timeStarted && Meteor.isCordova && Session.get('useGPS'))
			return 'text-info animated tada infinite';
		else if (this.timeStarted && Meteor.isCordova )
			return 'text-warning turnGPS';
		else if (this.timeStarted)
			return 'dskGPS';
		else
			return 'text-muted ';
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
	}
});
Template.usertimer.events({
	'click .startTime'(e,t){
		let initTimer, self=this;
		
		console.log('[usertimer startTime]', this);
		if (this.userId != Meteor.userId()) return;	
		Meteor.clearInterval(interval);
		let timeStarted = new Date();
		// if there is timer, switch it off
		if (Session.get('currentTimer')) {
			console.log('currentTimer:', this, initTimer);
			initTimer = Session.get('currentTimer');
			stopSession({_id: initTimer._id, timer: Session.get('currentTimer'), caller: 'usertimer previous stopTime'});
		}		
		// start timer
		this.updated = Collections.Timers.update(this._id,{$set:{timeStarted: timeStarted, updatedAt: timeStarted}});
		this.session = Collections.Sessions.insert({timerId: this._id, start: timeStarted, userId: Meteor.userId()});
		if (Session.get('debug')) console.log('startTime', this, initTimer);
		navigator.vibrate(200);
		//currentTimer.set(this);
	},	
	'click .stopTime'(e,t){
		if (this.userId != Meteor.userId()) return;	
		Meteor.clearInterval(interval);	
		stopSession({_id: this._id, timer: Session.get('currentTimer'), caller: 'usertimer stopTime'});
		//currentTimer.set();
		navigator.vibrate(200);
	},	
	'click .showDetails'(e,t){
		if (!t.showDetails.get())
			t.showDetails.set(this._id);
		else
			t.showDetails.set();
	},	
	'click .showGPS'(e,t){
		if (!t.showGPS.get())
			t.showGPS.set(this._id);
		else
			t.showGPS.set();
	},	
	'click .showToday'(e,t){
		showToday.set(!showToday.get());
	},	
	'click .turnGPS'(e,t){
		Bert.alert('Turn on "Use GPS" in app settings if you need gps swttch-off', 'warning');
	},
	'click .dskGPS'(e,t){
		Bert.alert('gps swttch-off is available on mobile only', 'warning');
	}
	
});

Template.editBox.onCreated(() => {
	let t = Template.instance();	
});
Template.editBox.onRendered(() => {
	let t = Template.instance();
	
	if ($('html').width() < 576){
		$('.editBox').removeClass('slideOutRight').addClass('slideInRight').fadeIn();
		const editBoxSwipeRight = new Hammer(document.getElementById('editBox'));
		editBoxSwipeRight.on("swiperight panright", function(e) {
			console.log('[editBox hammer]', e, " gesture detected:", e.type) ;
			$('.editBox').removeClass('slideInRight').addClass('slideOutRight').fadeOut();		
		});
	}
});
Template.editBox.onDestroyed(() => {
	//$('#datepicker').datepicker('destroy');
});
Template.editBox.helpers({
	currtemplate(){
		if (FlowRouter.getRouteName() == 'report')
			return 'showsessions';
		return currtemplate.get() || 'showsessions';
	},
});
Template.editBox.events({
	'click .archive'(e,t){

	},
	'click .close'(e,t){
		$('.editBox').removeClass('slideInRight ').addClass('slideOutRight').fadeOut();
	},
});

Template.edittimer.onCreated(() => {
	let t = Template.instance();
  t.state = new ReactiveDict();
	t.vrloading = new ReactiveVar();
	t.showtime = new ReactiveVar();
	t.sortPano = new ReactiveVar( 'date' );
	t.selectUsed = new ReactiveVar();
	t.ready = new ReactiveVar();
	t.next = new ReactiveVar(6);
	t.limit = new ReactiveVar(6);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
  //Meteor.subscribe('tours');
	
	if (Session.get('sort'))
		t.sort.set(Session.get('sort'));	
	
});
Template.edittimer.onRendered(() => {
	let t = Template.instance();
});
Template.edittimer.onDestroyed(() => {
	//$('#datepicker').datepicker('destroy');
});
Template.edittimer.helpers({
	collection(){
		return Collections.Timers;
	},
	schema(){
		return Schemas.Timers;
	},
	archive(){
		let timer = Collections.Timers.findOne(this._id);
		if (timer.archived) 
			return {btn:'info',name: 'UnArchive'};
		return {btn:'success',name: 'Archive'};
	},
	ifArch(){
		return Collections.Timers.findOne(this._id);
	}
});
Template.edittimer.events({
	'click .submit'(e,t){
		$('.close').click();
	},
	'click .archive'(e,t){
		let timer = Collections.Timers.findOne(this._id);
		if (timer.userId != Meteor.userId()) return;
		console.log('archive', timer);
		if (!timer.archived)
			Collections.Timers.update(timer._id,{$unset: {timeStarted: 1}, $set: {archived: true, archivedAt: new Date()}});
		else
			Collections.Timers.update(timer._id,{$unset: {archived: 1}});
	},
});

Template.showdaily.onCreated( () => {
	var data = Template.currentData();
	console.log('showDailyModal data:', data);
	if (data && data.timerId)
		Meteor.call('timers.daily', {timerId: data.timerId, offset: 60*1000*(new Date().getTimezoneOffset())});
});
Template.showdaily.helpers({
	data(){
		let data = Collections.Timers.findOne(this.timerId);
		data.daily = _.sortBy(data.daily, 'date');
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

Template.showsessions.onCreated( () => {
	let t = Template.instance();
	t.editRecord = new ReactiveVar();
	var data = Template.currentData();
	console.log('[showsessions] data:', data);
	Meteor.call('timers.daily', {timerId: data._id, offset: 60*1000*(new Date().getTimezoneOffset())});
	AutoForm.addHooks('editSessionForm', hooksEditSession);
});
Template.showsessions.helpers({
	data(){
		let date, date1, list = {timerId: this._id};
		if (this.dateSes) {
			date = new Date(this.dateSes);
			var today = new Date(this.dateSes);
			var tomorrow = new Date(today);
			tomorrow.setDate(today.getDate()+1);
			date1 = new Date(tomorrow);
			//date1 = new Date(new Date().setDate(new Date(this.dateSes).getDate() + 1));		
			list.$and = [{start: {$gte: date}}, {start: {$lte: date1}}];
		}
		const data = Collections.Sessions.find(list,{sort: {start: -1}});
		console.log('[showsessions] data list:', date, date1, list, this, data.fetch());
		return data;
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
		//console.log('timing', stop, this);
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
		record(){
		var record = this;
		record.stop = new Date(parseInt(record.stop / 60000) * 60000);
		record.start = new Date(parseInt(record.start / 60000) * 60000);
		record.userId = record.userId || Meteor.userId();
		return record;
	},

});
Template.showsessions.events({
	'click .editRecord' (e,t){
		t.editRecord.set(this._id);
		e.stopPropagation();
	},		
	'click .delRecord' (e,t){
		Collections.Sessions.remove(this._id);
	},	
	'submit' (e,t){
		spentUpdate({timerId: this.timerId});
		Meteor.call('timers.daily', {timerId: this.timerId, offset: 60*1000*(new Date().getTimezoneOffset())});
	},	
	'click .closeForm' (e,t){
		e.preventDefault();	
		spentUpdate({timerId: this.timerId});
		t.editRecord.set();
		console.log('closeForm', e,t,this);
		Meteor.call('timers.daily', {timerId: this.timerId, offset: 60*1000*(new Date().getTimezoneOffset())});
	},
	'click .hideModal'(){
		Modal.hide();
	}
});

Template.addtimer.helpers({
	collection(){
		return Collections.Timers;
	},
	schema(){
		return Schemas.Timers;
	}
});

