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
	while (i < 8) {
		i++;
		range.push({_id: moment(new Date(Date.now() - 60*60*24*i*1000)).format('YYYY-MM-DD')});
	}
	daily = union(daily, range);
	daily = _.map(daily, (d)=>{ return {_id: d._id, spent: d.spent/60/60/1000}})
	console.log('[hist.onCreated], daily', timeframe, daily);
	var chart = c3.generate({
		bindto: '#chart-' + t.data._id,
		data: {
			json: daily,
			keys: {
				x: '_id',
				// x: 'name', // it's possible to specify 'x' when category axis
				value: ['spent']
			},
			types: {
				spent: 'bar'
			}
		},
		axis: {
			x: {
				type: 'timeseries',
				tick: {
					format: '%m-%d'
				}
			}
		},
		size: { 
			height: 150
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
