import {Collections} from '/imports/api/collections.js';
import {Schemas} from '/imports/api/collections.js';
import {stopSession} from '/imports/api/functions.js';

Meteor.startup(function() {
	
	if (Meteor.isCordova && Session.get('useGPS') !== false && Session.get('useGPS') !== true) 
		Session.setPersistent('useGPS', true);
	
	Tracker.autorun(()=>{	
		if (!Meteor.isCordova) return;
		if (!Meteor.user()) return;
		let currentTimer = Collections.Timers.findOne({userId:Meteor.userId(), timeStarted: {$exists:true}});
		if (!Session.get('useGPS') || !Session.get('gps') || !currentTimer || !currentTimer.gps) return;
		if (Meteor.isCordova && BackgroundLocation.havePlugin() && !BackgroundLocation.started)
			if (currentTimer && currentTimer.useGPS)
				BackgroundLocation.start(), console.log('[gpsswitch.js] BackgroundLocation started', BackgroundLocation.started);
			else
				BackgroundLocation.stop();
		
		let dev = {dev: 0};
		dev.Lat = Math.abs(currentTimer.gps.latitude - Session.get('gps').latitude);
		dev.Lng = Math.abs(currentTimer.gps.longitude - Session.get('gps').longitude);
		dev.dev = Math.round( (dev.Lat + dev.Lng) * 1e6 ) / 1e6;
		Session.set('deviation', dev);
		if (dev.dev < 0.0002 ) 
			return	console.log('[gpsswitch.js] current:', currentTimer.gps.latitude, Session.get('gps').latitude, '\ncurrentTimer:', currentTimer, '\ngps:', Session.get('gps'), '\ndeviation:', dev.dev, dev.Lat, dev.Lng);;
		console.log('[gpsswitch.js] stopped:', dev.dev, dev.Lat, dev.Lng, '\ncurrent:', currentTimer.gps.latitude, Session.get('gps').latitude, '\ncurrentTimer:', currentTimer, '\ngps:', Session.get('gps') );

		cordova.plugins.notification.local.schedule({
			title: currentTimer.title,
			text: 'Timer switched of by gps move ' + dev.dev,
			foreground: true
		});

		
		stopSession({_id: currentTimer._id, caller: 'gpswwitch'});
	});
});