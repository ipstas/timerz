import * as d3 from 'd3'; 
import * as c3 from 'c3'; 
import 'c3/c3.min.css';
import './chart.html';

import {Collections} from '/imports/api/collections.js';
import {Schemas} from '/imports/api/collections.js';

Template.hist.onCreated(() => {
	const t = Template.instance();	
	window.prerenderReady = false;
	console.log('[hist.onCreated], t.data', t.data);
});
Template.hist.onRendered(() => {
	const t = Template.instance();	
	let timeframe = moment(new Date(Date.now() - 60*60*24*7*1000)).format('YYYY-MM-DD');
	let daily = _.sortBy(t.data.daily,'_id');
	daily = _.filter(daily, (d)=>{ return d._id > timeframe });
	let range = [];
	let i = 0;
	while (i < 8) {
		i++;
		range.push({_id: moment(new Date(Date.now() - 60*60*24*i*1000)).format('YYYY-MM-DD')});
	}
	daily = _.union(daily, range);
	daily = _.map(daily, (d)=>{ return {_id: d._id, hours: parseInt(d.spent/60/60/100)/10 || 0}});
	console.log('[hist.onCreated], daily', timeframe, daily);
	var chart = c3.generate({
		bindto: '#chart-' + t.data._id,
		data: {
			json: daily,
			keys: {
				x: '_id',
				value: ['hours']
			},
			types: {
				hours: 'bar'
			}
		},
		axis: {
			x: {
				//show: false,
				type: 'timeseries',
/* 				tick: {
					format: '%m-%d'
				}, */
        label: { // ADD
          text: t.data.title,
          position: 'outer-middle'
        }
			},
      y: {
				show: false,
        label: { // ADD
          text: 'hrs',
          position: 'outer-middle'
        }
      },
		},
		size: { 
			height: 150
		},
		legend: {
			hide: true
			//or hide: 'data1'
			//or hide: ['data1', 'data2']
		}
	});	
	window.chart = chart;
	
	window.prerenderReady = true;
});
Template.hist.onDestroyed(() => {

});
Template.hist.helpers({

});
Template.hist.events({
	'change .soon' (e,t){
		console.log('change soon', e.target.id);
		Meteor.setTimeout(function(){
			Session.set(e.target.id);
		},500);
		Bert.alert('this feature is coming soon','info');
	},
});
