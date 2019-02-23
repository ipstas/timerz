import './report.html';

import * as d3 from "d3";
import moment from 'moment';
window.moment = moment;
window.d3 = d3;

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
const showdata = new ReactiveVar(0);

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
	showdata(){
		let t = Template.instance();		
		return showdata.get();
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
	'click .showDaily'(e,t){
		console.log('report showDailyModal', this);
		var data = this.daily;
		data = _.sortBy(data, 'date');
		showdata.set({timerId: this._id, data: this.daily});
		//currtemplate.set('showdaily');
		$('.editBox').removeClass('slideOutRight').addClass('slideInRight').fadeIn();
		//Modal.show('showDailyModal', {timerId: this._id, data: this.daily});
	},
/* 	'click .showSessions'(e,t){
		showdata.set(this);
		//currtemplate.set('showsessions');
		console.log("[report] showsessions:", this);
		$('.editBox').removeClass('slideOutRight').addClass('slideInRight').fadeIn();
		//Modal.show('showSessionsModal', {timerId: this._id, data:data});
	}, */
});

Template.timerreport.onCreated(() => {
  let t = Template.instance();
	t.totalSpent = new ReactiveVar(0);
	t.daily = new ReactiveVar(false);
});
Template.timerreport.onRendered(() => {
	let t = Template.instance();
	t.data.daily = 	 _.sortBy(t.data.daily, 'date');
	console.log('[timerreport] t.data:', t.data);
	
/* 	var jsonCircles = [
	{ "x_axis": 30, "y_axis": 30, "radius": 20, "color" : "green" },
	{ "x_axis": 70, "y_axis": 70, "radius": 20, "color" : "purple"},
	{ "x_axis": 110, "y_axis": 100, "radius": 20, "color" : "red"}]; */
	
	// parse the date / time

/*     // Create the SVG drawing area
    var svg = d3.select("#hist")
		      .append("svg")
		      .attr("width", width + margin.left + margin.right)
		      .attr("height", height + margin.top + margin.bottom)
		      .append("g")
		      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");	 */

	t.autorun(()=>{
		if (!t.daily.get() || t.daily.get().length > 31 || rwindow.outerWidth() < 375) return;
    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var width  = $('#hist').width() - margin.left - margin.right;
    var height = $('#hist').width()/2 - margin.top - margin.bottom;
    var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
    var parseDate = d3.timeParse("%Y-%m-%d");
		$('svg').remove();
    var svg = d3.select("#hist")
		      .append("svg")
		      .attr("width", width + margin.left + margin.right)
		      .attr("height", height + margin.top + margin.bottom)
		      .append("g")
		      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
		let data = [], tick = 0, bins;
		for (let d of t.daily.get()) {
			tick = tick + 10;
			d.dtg = parseDate(d._id);
			d.value = d.spent / 1000 / 60 / 60;
			//data.push({x: tick, y: d.value, value: d.value, date : d.dtg, _id: d._id, spent : d.spent, radius: 10, color: "blue"});
			data.push({value: d.value, date : d.dtg});
		}
		console.log('[timerreport] data1:', t.daily.get(), data);
		
					// Determine the first and last dates in the data set
					//var dayExtent = d3.extent(data, function (d) { return d.date; });
					var dayExtent = [d3.timeDay.offset(d3.min(data, function(d) {
															return d.date;
													}), -2), d3.timeDay.offset(d3.max(data, function(d) {
															return d.date;
													}), +2)]
					// Create one bin per day, use an offset to include the first and last days
					var dayBins = d3.timeDays(d3.timeDay.offset(dayExtent[0],-1),
																		d3.timeDay.offset(dayExtent[1], 1));
					var x = d3.scaleTime()
										.domain(dayExtent)
										.rangeRound([0, width - 20]);
					// Scale the range of the data in the y domain
					var y = d3.scaleLinear()
										.domain([0, d3.max(data, function(d) { return d.value;})])
										.range([height, 0]);

					var barWidth = width / dayBins.length -1;
/* 					// Set the parameters for the histogram
					var histogram = d3.histogram()
														 .value(function(d) { return d.date || 0; })
														 .domain(x.domain())
														 .thresholds(x.ticks(dayBins.length));
					// Group the data for the bars
					bins = histogram(constructionData); */
					console.log('[timerreport] dayBins:', dayBins, '\nbins:', bins, '\ndata:', data, 'x,y', x,y);

					// Append the bar rectangles to the svg element
					svg.selectAll("rect")
					 .data(data)
					 .enter().append("rect")
					 .attr("class", "bar")
					 .attr("x", function(d) { console.log('[timerreport] hist d:', d); return x(d.date); })
					 .attr("y", function(d) { return y(d.value); })
					 .attr("width", barWidth)
					 .attr("height", function(d) { return height - y(d.value); });
					 
					// Add the x axis
					var xAxis = d3.axisBottom(x)
										.tickArguments([d3.timeDay.every(1)]);
					svg.append("g")
							 .attr("transform", "translate(0," + height + ")")
							 .call(d3.axisBottom(x));
							 //.call(xAxis);

					// Add the y Axis
					svg.append("g")
							.call(d3.axisLeft(y));

					// text label for the y axis
					svg.append("text")
							.attr("transform", "rotate(-90)")
							.attr("y", 0 - margin.left)
							.attr("x",0 - (height / 2))
							.attr("dy", "1em")
							.style("text-anchor", "middle")
							.text("Hrs");       	
	
	});
    
				
	
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
		data = _.sortBy(this.daily, 'date');
		data = _.find(data, (day)=>{
			if (day._id.match(period)) daily.push(day)
		});
		for (let day of daily) {
			total = total + day.spent;
		}
		t.totalSpent.set(total);
		console.log('[timerreport.helpers] daily', daily, period, this.daily, select, data );
		t.daily.set(daily);
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
		//console.log('debug timerreport', this);
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
		const date = new Date(this._id);
		const date1 = new Date(new Date().setDate(new Date(this._id).getDate() + 1));
		const data = Collections.Sessions.find({timerId: FlowRouter.getParam('_id'), $and: [{start: {$gte: date}}, {start: {$lte: date1}}] })
		//var data = Collections.Sessions.find({timerId: this._id},{sort: {stop: -1}});
		console.log('[timerreport] clicked showSessions', this, '\ndata:', date, date1, data.fetch());
		showdata.set({_id: FlowRouter.getParam('_id'), dateSes: this.date});
		$('.editBox').removeClass(' slideOutRight').addClass('slideInRight').fadeIn();
		//Modal.show('showSessionsModal', {timerId: this._id, data:data});
	},
});



