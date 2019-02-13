//Only start if this is a cordova project
if (Meteor.isCordova) {
  //Only run commands after cordova has finished device Ready
  Meteor.startup(function() {
    //Configure Plugin
		
		Tracker.autorun((computation)=>{
			//if (!Session.get('useGPS')) return;
			console.log('[BackgroundLocation] started');
			if (typeof(BackgroundLocation) == "undefined" || !BackgroundLocation.havePlugin()) return console.warn('[cordova.js start] no BackgroundLocation');
			
			BackgroundLocation.configure({
				desiredAccuracy: 5, // Desired Accuracy of the location updates (lower = more accurate).
				distanceFilter: 1, // (Meters) Distance between points aquired.
				debug: true, // Show debugging info on device.
				interval: 9000, // (Milliseconds) Requested Interval in between location updates.
				useActivityDetection: false, // Shuts off GPS when your phone is still, increasing battery life enormously
				fetchLocationOnStart: true,
				//[Android Only Below]
				notificationTitle: 'Timerz location tracking', // Customize the title of the notification.
				notificationText: 'Timerz tracking', // Customize the text of the notification.
				fastestInterval: 5000, //(Milliseconds) - Fastest interval OS will give updates.
			});

			//Register a callback for location updates.
			//this is where location objects will be sent in the background
			BackgroundLocation.registerForLocationUpdates(function (gps) {
				console.log("[BackgroundLocation] We got a Background Update" + JSON.stringify(gps));
				Session.set('gps', gps);
			}, function (err) {
				console.log("[BackgroundLocation] Error: Didn't get an update", err);
			});
			
			//Register a callback for activity updates 
			//If you set the option useActivityDetection to true you will recieve
			//periodic activity updates, see below for more information
			BackgroundLocation.registerForActivityUpdates(function (activities) {
				console.log("[BackgroundLocation] We got an activity Update" + activites);
			}, function (err) {
				console.log("[BackgroundLocation] Error:", err);
			});
			computation.stop();
		});


    //Start the Background Tracker. 
    //When you enter the background tracking will start.
    //BackgroundLocation.start();
    console.log('[BackgroundLocation] configured');
		
    ///later, to stop
    //BackgroundLocation.stop();

  });
}