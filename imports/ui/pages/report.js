import './report.html';

import moment from 'moment';
window.moment = moment;

import './timers.html';
import './timers.js';
import './profile.js';

import '../stylesheets/animation.css';

import {Collections} from '/imports/api/collections.js';
import {Schemas} from '/imports/api/collections.js';


import {infCheck} from '/imports/api/functions.js';
import {checkMore} from '/imports/api/functions.js';
import {stopSession} from '/imports/api/functions.js';
import {spentUpdate} from '/imports/api/functions.js';

import {setSort} from '/imports/api/functions.js';
import {imgOnScroll } from '/imports/api/functions.js';
import { initCurrTimer } from '/imports/api/functions.js';

Collections._localMonth = new Mongo.Collection(null);

/* const hooksMonth = {
	onSubmit: function (doc) {
		console.log("hooksMonth onSubmit:", doc);
		this.done();
		return false;
	},

	onSuccess: function(formType, result) {
		console.log('hooksMonth onSuccess', formType, result, this);
	},
}; */

//AutoForm.addHooks('slctMonth', hooksMonth);

Template.report.onCreated(() => {
	window.prerenderReady = false;
	let t = Template.instance();
	t.vrloading = new ReactiveVar();
	t.showtime = new ReactiveVar();
	t.errordetail =  new ReactiveVar();
	t.list =  new ReactiveVar({userId: Meteor.userId()});
	t.ready = new ReactiveVar(true);
	t.next = new ReactiveVar(4);
	t.limit = new ReactiveVar(1);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	t.currentTimer = new ReactiveVar(0);
	t.currentTimer = new ReactiveVar(0);
	t.timeSpent = new ReactiveVar(0);
	t.interval = new ReactiveVar();
	t.subscribe('userdata');

	var sub;
	t.autorun(function(){
		if (!FlowRouter.getParam('_id')) return;
		sub = t.subscribe('timersSet',{
			_id: FlowRouter.getParam('_id')
		});
		t.ready.set(sub.ready());
		//console.log('tours.onCreated sub', sub, t.list.get(), t.sort.get(), t.limit.get());
	})

	t.autorun(function(){
		if (!t.ready.get()) return;
		t.loaded.set(Collections.Timers.find().count());
	});
	
});
Template.report.onRendered(() => {
	let t = Template.instance();
	Session.set('selectDate');	

	window.prerenderReady = true;
});
Template.report.onDestroyed(() => {

});
Template.report.helpers({
	timer(){
		return Collections.Timers.findOne({_id: FlowRouter.getParam('_id')});
	},
});
Template.report.events({
	'change .soon' (e,t){
		console.log('change soon', e.target.id);
		Meteor.setTimeout(function(){
			Session.set(e.target.id);
		},500);
		Bert.alert('this feature is coming soon','info');
	},
	'click .done'(e,t){
		Bert.alert('Loaded', 'info');
	},
});

Template.timerreport.onCreated(() => {
  let t = Template.instance();
	t.totalSpent = new ReactiveVar(0);
});
Template.timerreport.onRendered(() => {
	let t = Template.instance();
});
Template.timerreport.helpers({
	schema(){
		return Schemas.Monthly;
	},
	collection(){
		return Collections._localMonth;
	},
	method(){
		if (Collections._localMonth.findOne())
			return 'update';
		else
			return 'insert';
	},

	doc(){
		var data = Collections._localMonth.findOne({},{sort: {createdAt: -1}});
		console.log('doc', data);
		if (!data) return;
		data.month = data.month || '*';
		data.year = data.year || '*';
		return data;
	},
	day(){
		let t = Template.instance();
		var period = '-', daily = [], data, total = 0;
		var select = Collections._localMonth.findOne();
		if (select) {
			select.year = select.year || '';
			select.month = select.month || '';
			period = select.year + '-' + select.month;
		}
		data = _.find(this.daily, (day)=>{
			if (day._id.match(period)) daily.push(day)
		});
		for (let day of daily) {
			total = total + day.spent;
		}
		t.totalSpent.set(total);
		console.log('daily', this.daily, select, period, data, daily);
		return daily;
	},

/* 	countDaily(){
		if (this.daily)
			return this.daily.length;
	},	
	countSessions(){
		return Collections.Sessions.find({timerId: this._id},{sort: {stop: -1}}).count();
	}, */
	spentHuman(){
		let t = Template.instance();
		//var spent = moment.utc(this.spent).format("HH:mm")
		let spent = Math.floor(moment.duration(this.spent).asHours()) + ':' + moment.duration(this.spent).minutes() + ':' + moment.duration(this.spent).seconds();
		return spent;
	},
	totalHuman(){
		let t = Template.instance();
		//var data = moment.utc(t.totalSpent.get()).format("HH:mm");
		let spent = t.totalSpent.get();
		spent = Math.floor(moment.duration(spent).asHours()) + ':' + moment.duration(spent).minutes() + ':' + moment.duration(spent).seconds();
		return spent;
	},

	debug(){
		console.log('debug timerreport', this);
	}
});
Template.timerreport.events({
	'change'(e,t){
		console.log('change', this);
	},
/* 	'submit'(e,t){
		//e.preventDefault();
		console.log('submit', this);
	}, */
	'click .showDaily'(e,t){
		console.log('clicked showDailyModal', this);
		var data = this.daily;
		data = _.sortBy(data, 'date');
		Modal.show('showDailyModal', {timerId: this._id, data: this.daily});
	},
	'click .showSessions'(e,t){
		var data = Collections.Sessions.find({timerId: this._id},{sort: {stop: -1}});
		Modal.show('showSessionsModal', {timerId: this._id, data:data});
	},
});



