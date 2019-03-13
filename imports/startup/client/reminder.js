Meteor.startup(function() {
	
	if (!Meteor.isCordova) 
		return;
	
	let pushInterval;
	Tracker.autorun(()=>{	
		if (!Meteor.user()) return;
		let currentTimer = Collections.Timers.findOne({userId:Meteor.userId(), timeStarted: {$exists:true}});
		
		if (currentTimer.reminder) 
			pushInterval = Meteor.setInterval(()=>{
				cordova.plugins.notification.local.schedule({
					title: currentTimer.title,
					text: 'Timer running since' + currentTimer.timeStarted,
					foreground: true
				});				
			},60*60*1000);
		else
			Meteor.clearInterval(pushInterval);
	
	});
});