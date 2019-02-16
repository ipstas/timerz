// import jqueryui from 'jquery-ui';
// import 'jquery-ui/themes/base/core.css';
// import 'jquery-ui/themes/base/theme.css';
// import 'jquery-ui/themes/base/selectable.css';
// import 'jquery-ui/ui/core';
// import 'jquery-ui/ui/widgets/selectable';
import { Random } from 'meteor/random'
//import sly from 'meteor/ipstas:sly';
//window.sly = sly;

export const initCurrTimer = function(currentTimer){
	if (!Meteor.userId()) return;
	var initTimer = Collections.Timers.findOne({userId: Meteor.userId(), timeStarted: {$exists: true}});
	if (initTimer && initTimer.useGPS && !initTimer.gps && Session.get('useGPS') ) {
		if (Meteor.isCordova)
			BackgroundLocation.getPlugin();
		cordovaLocation({start: true});
		navigator.geolocation.getCurrentPosition(function(gps){
				initTimer.update = Collections.Timers.update(initTimer._id,{$set:{'gps.latitude': gps.coords.latitude, 'gps.longitude': gps.coords.longitude}});
				if (Session.get('debug')) console.log('[usertimer startTime] gps set:', initTimer._id, Collections.Timers.findOne(initTimer._id), gps.coords);
				Session.set('gps',{'latitude': gps.coords.latitude, 'longitude': gps.coords.longitude});
/* 			if (Meteor.isCordova)
				cordova.plugins.notification.local.schedule({
					title: initTimer.title,
					text: 'Timer gps location set: ' + gps.coords.latitude + ' ' + gps.coords.longitude + ' mobile: ' + Meteor.isCordova,
					foreground: true
				}); */
			},
			function(err){
				console.warn('[usertimer startTime] err:', err);
			},
			{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }
		);		
	}	else if (Meteor.isCordova && initTimer && initTimer.useGPS && !Session.get('useGPS')) {
		console.log('[usertimer startTime] user useGPS off:', Session.get('useGPS'), this.useGPS);
		Bert.alert('You need to enable "Use GPS" in app settings to use gps switch off feature','warning');
	}
		

	console.log('[functions.js] initCurrTimer', initTimer);
	//computation.stop();
	Session.set('currentTimer',	initTimer);
	
	if (window.analytics)
		analytics.track('Timer started', {
			referrer: document.referrer,
			category: "Timer",
			label: Meteor.user().username,
		});	
			
	return initTimer;
		
}

export const stopSession = function (params){
	console.log('[stopSession] id:', params);
	var timeFinished = new Date();
	Collections.Timers.update(params._id, {$unset: {timeStarted: 1, gps: 1}, $set: {timeFinished: timeFinished}});
	var session = Collections.Sessions.findOne({timerId: params._id, stop: {$exists: false}});
	if (session && timeFinished - session.start < 60000)
		Collections.Sessions.remove(session._id);
	else if (session)
		Collections.Sessions.update(session._id, {$set: {stop: timeFinished}});
	spentUpdate({timerId: params._id});
	Meteor.call('timers.daily',{timerId: params._id,  offset: new Date().getTimezoneOffset()});	
	if (typeof(BackgroundLocation) != "undefined") 
		BackgroundLocation.stop();
	Session.set('gps');
	Session.set('currentTimer');
	if (window.analytics)
		analytics.track('Timer stopped', {
			referrer: document.referrer,
			category: "Timer",
			label: Meteor.user().username,
		});		
}

export const cordovaLocation = function(params){
	if (!Meteor.isCordova) return;
	params.t = params.t || {};
	params.t.error = params.t.error || new ReactiveVar();
	let error;
	
	cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
		console.log("[settings] Location setting is ", (enabled ? "enabled" : "disabled"));
		if (enabled && params.start)
			BackgroundLocation.start();		
		else if (enabled)
			BackgroundLocation.stop();			
		else {
			BackgroundLocation.stop();			
			cordova.plugins.diagnostic.switchToLocationSettings();
		}
			
	}, function(error){
		console.error("The following error occurred: ", error);
	});		
	cordova.plugins.diagnostic.isLocationAuthorized(function(authorized){
		console.log("[settings] Location is ", (authorized ? "authorized" : "unauthorized"));
		if (!authorized)
			cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
				console.log('[settings] permissionStatus:', status, 'cordova:', cordova.plugins.diagnostic.permissionStatus.DENIED_AlWAYS);
				//
				if ( status == 'DENIED_AlWAYS'){
					console.log("[settings] Permission granted only when in use IF:", status);
					Session.set('useGPS');
					error = 'You have denied location for this app, to enable you need to open settings on your device and enable location in App-level permissions!';
					t.error.set(error);
					Bert.alert(error, 'danger');
				}
				switch(status){
					case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
							console.log("[settings] Permission not requested", status);
							break;
					case cordova.plugins.diagnostic.permissionStatus.DENIED:
							console.log("[settings] Permission denied", status);
							Session.set('useGPS');
							break;
					case cordova.plugins.diagnostic.permissionStatus.GRANTED:
							console.log("[settings] Permission granted always", status);
							break;
					case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
							console.log("[settings] Permission granted only when in use", status);
							break;
					case cordova.plugins.diagnostic.permissionStatus.DENIED_AlWAYS:
							console.log("[settings] Permission denied for app", status);
							Session.set('useGPS');
							error = 'You have denied location for this app, to enable you need to open settings on your device and enable location in App-level permissions';
							t.error.set(error);
							Bert.alert(error, 'danger');
							break;
					default :
							console.log("[settings] Permission granted only when in use", status);
							Session.set('useGPS');
							error = 'You have denied location for this app, to enable you need to open settings on your device and enable location in App-level permissions!!';
							t.error.set(error);
							Bert.alert(error, 'danger');
				}
			}, function(error){
				console.error(error);
			}, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);				
	}, function(error){
		console.error("The following error occurred: "+error);
	});		

	return params;
}

export const infCheck = function (t){
	$('#infiniteCheck').each(function(i){
		var t = $(this);
		if(t.offset().top - $(window).scrollTop() < $(window).height() ){
			console.log('infiniteCheck ', i, this, t, t.id, t.offset().top < $(window).height());
		}
		t.limit.set(t.limit.get()+6);
	});	
}
export const checkMore = function (t){

	Meteor.setTimeout(function(){
		if ($('#infiniteCheck').offset() && $('#infiniteCheck').offset().top - $(window).scrollTop() - $(window).height() < -20){
			t.limit.set(t.limit.get() + t.next.get());
			if (Session.get('debug')) console.log('userpanos.onRendered getting next limit 0:', t.ready.get(), t.limit.get(), t.next.get(), t.loaded.get(), $('#infiniteCheck').offset().top - $(window).scrollTop() - $(window).height());
		}	
	},500);
}

export const spentUpdate = function (params){
	if (!Meteor.userId()) return;
	params = params || {};
	var userId = Meteor.userId();
	var list, timer, sessions, timeSpent = 0, updated;
	if (params.timerId)
		list = params.timerId;
	else
		list = {timeStarted: true};
	timer = Collections.Timers.findOne(list);
	if (!timer) return;
	sessions = Collections.Sessions.find({timerId: timer._id, stop: {$exists: true}});
	for (s of sessions.fetch())
		timeSpent = timeSpent + parseInt(s.stop - s.start);
	updated = Collections.Timers.update(timer._id, {$set: {timeSpent: timeSpent}});	
	console.log('spentUpdate', params, timeSpent, updated, sessions.fetch());
}

export const slyOptions = {
	horizontal: 1,
	itemNav: 'centered',
	smart: 1,
	activateOn: 'click',
	mouseDragging: 1,
	touchDragging: 1,
	releaseSwing: 1,
	startAt: 3,
	//scrollBar: $wrap.find('.scrollbar'),
	scrollBar: '.scrollbar',
	scrollBy: 1,
	//pagesBar: $wrap.find('.pages'),
	activatePageOn: 'click',
	speed: 300,
	elasticBounds: 1,
	easing: 'easeOutExpo',
	dragHandle: 1,
	dynamicHandle: 1,
	clickBar: 1,
	activeClass: 'activeScene',
}
export const slyOptions2 = {
    horizontal: 0, // Switch to horizontal mode.

    // Item based navigation
    itemNav:      null, // Item navigation type. Can be: 'basic', 'centered', 'forceCentered'.
    itemSelector: null, // Select only items that match this selector.
    smart:        0,    // Repositions the activated item to help with further navigation.
    activateOn:   null, // Activate an item on this event. Can be: 'click', 'mouseenter', ...
    activateMiddle: 0,  // Always activate the item in the middle of the FRAME. forceCentered only.

    // Scrolling
    scrollSource: null, // Element for catching the mouse wheel scrolling. Default is FRAME.
    scrollBy:     0,    // Pixels or items to move per one mouse scroll. 0 to disable scrolling.

    // Dragging
    dragSource:    null, // Selector or DOM element for catching dragging events. Default is FRAME.
    mouseDragging: 0,    // Enable navigation by dragging the SLIDEE with mouse cursor.
    touchDragging: 0,    // Enable navigation by dragging the SLIDEE with touch events.
    releaseSwing:  0,    // Ease out on dragging swing release.
    swingSpeed:    0.2,  // Swing synchronization speed, where: 1 = instant, 0 = infinite.
    elasticBounds: 0,    // Stretch SLIDEE position limits when dragging past FRAME boundaries.
    interactive:   null, // Selector for special interactive elements.

    // Scrollbar
    scrollBar:     null, // Selector or DOM element for scrollbar container.
    dragHandle:    0,    // Whether the scrollbar handle should be draggable.
    dynamicHandle: 0,    // Scrollbar handle represents the ratio between hidden and visible content.
    minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.
    clickBar:      0,    // Enable navigation by clicking on scrollbar.
    syncSpeed:     0.5,  // Handle => SLIDEE synchronization speed, where: 1 = instant, 0 = infinite.

    // Pagesbar
    pagesBar:       null, // Selector or DOM element for pages bar container.
    activatePageOn: null, // Event used to activate page. Can be: click, mouseenter, ...
    pageBuilder:          // Page item generator.
        function (index) {
            return '<li>' + (index + 1) + '</li>';
        },

    // Navigation buttons
    forward:  null, // Selector or DOM element for "forward movement" button.
    backward: null, // Selector or DOM element for "backward movement" button.
    prev:     null, // Selector or DOM element for "previous item" button.
    next:     null, // Selector or DOM element for "next item" button.
    prevPage: null, // Selector or DOM element for "previous page" button.
    nextPage: null, // Selector or DOM element for "next page" button.

    // Automated cycling
    cycleBy:       null, // Enable automatic cycling by 'items' or 'pages'.
    cycleInterval: 5000, // Delay between cycles in milliseconds.
    pauseOnHover:  0,    // Pause cycling when mouse hovers over the FRAME.
    startPaused:   0,    // Whether to start in paused sate.

    // Mixed options
    moveBy:        300,     // Speed in pixels per second used by forward and backward buttons.
    speed:         0,       // Animations speed in milliseconds. 0 to disable animations.
    easing:        'swing', // Easing for duration based (tweening) animations.
    startAt:       0,       // Starting offset in pixels or items.
    keyboardNavBy: null,    // Enable keyboard navigation by 'items' or 'pages'.

    // Classes
    draggedClass:  'dragged',  // Class for dragged elements (like SLIDEE or scrollbar handle).
    activeClass:   'active',   // Class for active items and pages.
    disabledClass: 'disabled'  // Class for disabled navigation elements.
};
export const slyInit = function(frame, caller){
/* 	if (window.slyFrame)
		return; */
	if (!$(frame) || !$(frame).length) return console.warn('slyInit no frame');
	//if (window.slyFrame) return;
	var $slidee = $(frame).children('ul').eq(0);
	var $wrap = $(frame).parent();
	var slyFrame = new Sly($(frame),slyOptions); 
	//slyFrame.init();
	window.slyFrame = slyFrame;
	console.log('sly set', caller, slyFrame, slyOptions, frame);
	return slyFrame;
}

if (Meteor.isClient)
	window.slyInit = slyInit;
//export const initSly = slyFrame.init();

export const initSly2 = function(){
	
	jQuery(function($) {
		'use strict';

		// -------------------------------------------------------------
		//   Basic Navigation
		// -------------------------------------------------------------
		(function() {
			var $frame = $('#slyframe');
			var $slidee = $frame.children('ul').eq(0);
			var $wrap = $frame.parent();

			// Call Sly on frame
			//new Sly(frame, options, callbackMap).init();
			$frame.sly({
				horizontal: 1,
				itemNav: 'basic',
				smart: 1,
				activateOn: 'click',
				mouseDragging: 1,
				touchDragging: 1,
				releaseSwing: 1,
				startAt: 3,
				scrollBar: $wrap.find('.scrollbar'),
				scrollBy: 1,
				pagesBar: $wrap.find('.pages'),
				activatePageOn: 'click',
				speed: 300,
				elasticBounds: 1,
				easing: 'easeOutExpo',
				dragHandle: 1,
				dynamicHandle: 1,
				clickBar: 1,

				// Buttons
				forward: $wrap.find('.forward'),
				backward: $wrap.find('.backward'),
				prev: $wrap.find('.prev'),
				next: $wrap.find('.next'),
				prevPage: $wrap.find('.prevPage'),
				nextPage: $wrap.find('.nextPage')
			});

			// To Start button
			$wrap.find('.toStart').on('click', function() {
				var item = $(this).data('item');
				// Animate a particular item to the start of the frame.
				// If no item is provided, the whole content will be animated.
				$frame.sly('toStart', item);
			});

			// To Center button
			$wrap.find('.toCenter').on('click', function() {
				var item = $(this).data('item');
				// Animate a particular item to the center of the frame.
				// If no item is provided, the whole content will be animated.
				$frame.sly('toCenter', item);
			});

			// To End button
			$wrap.find('.toEnd').on('click', function() {
				var item = $(this).data('item');
				// Animate a particular item to the end of the frame.
				// If no item is provided, the whole content will be animated.
				$frame.sly('toEnd', item);
			});

			// Add item
			$wrap.find('.add').on('click', function() {
				$frame.sly('add', '<li>' + $slidee.children().length + '</li>');
			});

			// Remove item
			$wrap.find('.remove').on('click', function() {
				$frame.sly('remove', -1);
			});
		}());

		// -------------------------------------------------------------
		//   Centered Navigation
		// -------------------------------------------------------------
/* 		(function() {
			var $frame = $('#centered');
			var $wrap = $frame.parent();

			// Call Sly on frame
			$frame.sly({
				horizontal: 1,
				itemNav: 'centered',
				smart: 1,
				activateOn: 'click',
				mouseDragging: 1,
				touchDragging: 1,
				releaseSwing: 1,
				startAt: 4,
				scrollBar: $wrap.find('.scrollbar'),
				scrollBy: 1,
				speed: 300,
				elasticBounds: 1,
				easing: 'easeOutExpo',
				dragHandle: 1,
				dynamicHandle: 1,
				clickBar: 1,

				// Buttons
				prev: $wrap.find('.prev'),
				next: $wrap.find('.next')
			});
		}()); */

		// -------------------------------------------------------------
		//   Force Centered Navigation
		// -------------------------------------------------------------
/* 		(function() {
			var $frame = $('#forcecentered');
			var $wrap = $frame.parent();

			// Call Sly on frame
			$frame.sly({
				horizontal: 1,
				itemNav: 'forceCentered',
				smart: 1,
				activateMiddle: 1,
				activateOn: 'click',
				mouseDragging: 1,
				touchDragging: 1,
				releaseSwing: 1,
				startAt: 0,
				scrollBar: $wrap.find('.scrollbar'),
				scrollBy: 1,
				speed: 300,
				elasticBounds: 1,
				easing: 'easeOutExpo',
				dragHandle: 1,
				dynamicHandle: 1,
				clickBar: 1,

				// Buttons
				prev: $wrap.find('.prev'),
				next: $wrap.find('.next')
			});
		}()); */

		// -------------------------------------------------------------
		//   Cycle By Items
		// -------------------------------------------------------------
		(function() {
			var $frame = $('#cycleitems');
			var $wrap = $frame.parent();

			// Call Sly on frame
			$frame.sly({
				horizontal: 1,
				itemNav: 'basic',
				smart: 1,
				activateOn: 'click',
				mouseDragging: 1,
				touchDragging: 1,
				releaseSwing: 1,
				startAt: 0,
				scrollBar: $wrap.find('.scrollbar'),
				scrollBy: 1,
				speed: 300,
				elasticBounds: 1,
				easing: 'easeOutExpo',
				dragHandle: 1,
				dynamicHandle: 1,
				clickBar: 1,

				// Cycling
				cycleBy: 'items',
				cycleInterval: 1000,
				pauseOnHover: 1,

				// Buttons
				prev: $wrap.find('.prev'),
				next: $wrap.find('.next')
			});

			// Pause button
			$wrap.find('.pause').on('click', function() {
				$frame.sly('pause');
			});

			// Resume button
			$wrap.find('.resume').on('click', function() {
				$frame.sly('resume');
			});

			// Toggle button
			$wrap.find('.toggle').on('click', function() {
				$frame.sly('toggle');
			});
		}());

		// -------------------------------------------------------------
		//   Cycle By Pages
		// -------------------------------------------------------------
		(function() {
			var $frame = $('#cyclepages');
			var $wrap = $frame.parent();

			// Call Sly on frame
			$frame.sly({
				horizontal: 1,
				itemNav: 'basic',
				smart: 1,
				activateOn: 'click',
				mouseDragging: 1,
				touchDragging: 1,
				releaseSwing: 1,
				startAt: 0,
				scrollBar: $wrap.find('.scrollbar'),
				scrollBy: 1,
				pagesBar: $wrap.find('.pages'),
				activatePageOn: 'click',
				speed: 300,
				elasticBounds: 1,
				easing: 'easeOutExpo',
				dragHandle: 1,
				dynamicHandle: 1,
				clickBar: 1,

				// Cycling
				cycleBy: 'pages',
				cycleInterval: 1000,
				pauseOnHover: 1,
				startPaused: 1,

				// Buttons
				prevPage: $wrap.find('.prevPage'),
				nextPage: $wrap.find('.nextPage')
			});

			// Pause button
			$wrap.find('.pause').on('click', function() {
				$frame.sly('pause');
			});

			// Resume button
			$wrap.find('.resume').on('click', function() {
				$frame.sly('resume');
			});

			// Toggle button
			$wrap.find('.toggle').on('click', function() {
				$frame.sly('toggle');
			});
		}());

		// -------------------------------------------------------------
		//   One Item Per Frame
		// -------------------------------------------------------------
		(function() {
			var $frame = $('#oneperframe');
			var $wrap = $frame.parent();

			// Call Sly on frame
			$frame.sly({
				horizontal: 1,
				itemNav: 'forceCentered',
				smart: 1,
				activateMiddle: 1,
				mouseDragging: 1,
				touchDragging: 1,
				releaseSwing: 1,
				startAt: 0,
				scrollBar: $wrap.find('.scrollbar'),
				scrollBy: 1,
				speed: 300,
				elasticBounds: 1,
				easing: 'easeOutExpo',
				dragHandle: 1,
				dynamicHandle: 1,
				clickBar: 1,

				// Buttons
				prev: $wrap.find('.prev'),
				next: $wrap.find('.next')
			});
		}());

		// -------------------------------------------------------------
		//   Crazy
		// -------------------------------------------------------------
		(function() {
			var $frame = $('#crazy');
			var $slidee = $frame.children('ul').eq(0);
			var $wrap = $frame.parent();

			// Call Sly on frame
			$frame.sly({
				horizontal: 1,
				itemNav: 'basic',
				smart: 1,
				activateOn: 'click',
				mouseDragging: 1,
				touchDragging: 1,
				releaseSwing: 1,
				startAt: 3,
				scrollBar: $wrap.find('.scrollbar'),
				scrollBy: 1,
				pagesBar: $wrap.find('.pages'),
				activatePageOn: 'click',
				speed: 300,
				elasticBounds: 1,
				easing: 'easeOutExpo',
				dragHandle: 1,
				dynamicHandle: 1,
				clickBar: 1,

				// Buttons
				forward: $wrap.find('.forward'),
				backward: $wrap.find('.backward'),
				prev: $wrap.find('.prev'),
				next: $wrap.find('.next'),
				prevPage: $wrap.find('.prevPage'),
				nextPage: $wrap.find('.nextPage')
			});

			// To Start button
/* 			$wrap.find('.toStart').on('click', function() {
				var item = $(this).data('item');
				// Animate a particular item to the start of the frame.
				// If no item is provided, the whole content will be animated.
				$frame.sly('toStart', item);
			}); */

			// To Center button
/* 			$wrap.find('.toCenter').on('click', function() {
				var item = $(this).data('item');
				// Animate a particular item to the center of the frame.
				// If no item is provided, the whole content will be animated.
				$frame.sly('toCenter', item);
			}); */

			// To End button
/* 			$wrap.find('.toEnd').on('click', function() {
				var item = $(this).data('item');
				// Animate a particular item to the end of the frame.
				// If no item is provided, the whole content will be animated.
				$frame.sly('toEnd', item);
			}); */

			// Add item
			$wrap.find('.add').on('click', function() {
				$frame.sly('add', '<li>' + $slidee.children().length + '</li>');
			});

			// Remove item
			$wrap.find('.remove').on('click', function() {
				$frame.sly('remove', -1);
			});
		}());
	});	
}

//window.initSly = initSly;
//window.slyFrame = slyFrame;

export const SelectText = function(element) {
    var doc = document
        , text = doc.getElementById(element)
        , range, selection
    ;    
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();        
        range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

export const initDD = function () {
	import 'jquery-ui';	
		//dragula([document.querySelector('.draggable'), document.querySelector('.droppable')]);
	$(".droppable").droppable({ accept: ".draggable", 
		drop: function(e, ui) {
			var imgs = $('.drophere').find('img');
			var ids = [];
			$(this).removeClass("border").removeClass("over");
			var dropped = ui.draggable;
			var droppedOn = $(this);
			$(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);    
			if (Session.get('debug')) console.log('droppable1', e.target.id, ui.draggable.id, $(e.target).find("img"), $(e.target), ui.draggable, ui.draggable.alt, this);	
			var params = {};
			params.scene_id = e.target.id;
			if ($(e.target).find("img"))
				params.panoramaOld = $(e.target).find("img").first().attr('alt');	
			params.panorama = ui.draggable[0].id;
			if (Session.get('debug')) console.log('\ndroppable2', params.panoramaOld, params.panorama, e.target.id, '\n\n');
			dropScene(params);
		}, 
		over: function(e, elem) {
			//if (Session.get('debug')) console.log('over', e.target.id, e, elem, this);
			$('#' + e.target.id).addClass("bkblsolid");
		},
		out: function(e, elem) {
			//console.log('out', e, elem, this);
			$('#' + e.target.id).removeClass("bkblsolid	");
		}
	});
	$( ".draggable" ).draggable({ 
			containment: "document",
			scroll: true,
			revert: 'invalid',
			start: function( e, ui ) {
				$('html, body').animate({scrollTop: $('body').offset().top - 10 }, 'slow');
			},
	});

	// Draggin scene to trasharea
/* 	$(".trasharea").droppable({ accept: ".selectScn", 
		drop: function(e, ui) {
			var imgs = $('.drophere').find('img');
			var ids = [];
			$(this).removeClass("border").removeClass("over");
			var dropped = ui.draggable;
			var droppedOn = $(this);
			$(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);    
			console.log('droppable', e.target.id, $(e.target).find("img").first().attr('alt'), ui.draggable.alt, this);
			var params = {};
			params.scene_id = e.target.id;
			if ($(e.target).find("img"))
				params.panoramaOld = $(e.target).find("img").first().attr('alt');
			params.panorama = ui.draggable.alt;
			//dropScene(params);
		}, 
		over: function(e, elem) {
			//console.log('over', e, elem, this);
			$(this).addClass("over");
		},
		out: function(e, elem) {
			//console.log('out', e, elem, this);
			$(this).removeClass("over");
		}
	}); */
    //$( ".selectScn" ).draggable({ revert: 'invalid' });	
		
}

export const trashDD = function () {
	import 'jquery-ui';	
	var dropEl = ".trasharea";
	var dragEl = ".trashable";
	$( dragEl ).draggable({ 
		revert: 'invalid',
		start: function( e, ui ) {
			$(dropEl).removeClass('hidden').removeClass('zoomOut').addClass('zoomIn');
			$(dragEl).addClass('img50');
			$("#slyframe").css("overflow", "initial");
		},
		stop: function( e, ui ) {
			$(dropEl).addClass('hidden').addClass('zoomOut').removeClass('zoomIn');
			$(dragEl).removeClass('img50');
			$("#slyframe").css("overflow", "hidden");
		},	
	});

	// Draggin scene to trasharea
	$(dropEl).droppable({ 
		accept: dragEl, 
		drop: function(e, ui) {
			var imgs = $(dropEl).find('img');
			var ids = [];
			$(this).removeClass("border").removeClass("over");
			var dropped = ui.draggable;
			var droppedOn = $(this);
			$(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);    
			//console.log('droppable', e.target.id, $(e.target).find("div")[0].id, ui.draggable.id, ui.draggable, this);
			params = {_id: ui.draggable.context.id, tour_id: FlowRouter.current().params.id};
			
			//console.log('removing scene', ui.draggable.context.id, $(e.target).find("div")[0].id);
			//slyFrame.remove($('#' + ui.draggable.context.id).parent().index());
			//slyframe.reload();	
			//removeScene(params);
			Meteor.call('scene.remove',params);
			//$('#' + ui.draggable.context.id).remove;
			console.log('removing scene', $('#' + ui.draggable.context.id).parent().index(), ui.draggable.context.id, $(e.target).find("div")[0].id);
			
		}, 
		over: function(e, elem) {
			//console.log('over', e, elem, this);
			$(this).addClass("bkred");
		},
		out: function(e, elem) {
			//console.log('out', e, elem, this);
			$(this).removeClass("bkred");
		}
	});
    //$( ".selectScn" ).draggable({ revert: 'invalid' });	
		
}
export const removeScene = function(params){	
	var tour = Tours.findOne({scene_id: params._id});
	var scene = Scenes.findOne(params._id);
	_.each(scene.panorama_id,function(panorama_id){
		//console.log('removing image', panorama_id, scene._id, scene.panorama_id, Images.findOne(panorama_id));	
		Images.update(panorama_id,{$pull:{scene_id: params._id}});
		if (tour)
			Tours.update(tour._id,{$pull: {panorama_id: panorama_id}});
	});
	Tours.update(tour._id,{$pull: {scene_id: params._id}});
	Scenes.update({tour_id: tour._id},{$pull: {'portal.next_scene': params._id}});
	Scenes.remove(params._id);
/* 	Meteor.setTimeout(function(){
		slyFrame.reload();
	},100);	 */
}

export const initDrag = function(){
	//let t = Template.instance();
	//this.drake = dragula(this.find('.draggable'), this.find('.droppable'));
	var drake = dragula([document.querySelector('.draggable'), document.querySelector('.droppable')])  
	.on('drag', function (el) {
    el.className = el.className.replace('ex-moved', '');
		console.log('drake', el, con, this);
  })
  .on('drop', function (el,con) {
    el.className += ' ex-moved';
		console.log('drake', el, con, this);
  })
  .on('over', function (el, container) {
    container.className += ' ex-over';
  })
  .on('out', function (el, container) {
    container.className = container.className.replace('ex-over', '');
  });

	console.log('drake init', drake, this);
	// this.drake.on('drag',function(el,con){
		// console.log('drake', el, con, this);
	// });	
}

export const loadImage = function () {
	var imgs = $('img');
	_.each(imgs, function(img){
		img.addEventListener('load', function() { 
			//console.log('img loaded', img, this);
		}, false);
		img.addEventListener('error', function() { 
			console.log('img error', img, this);
		}, false);
	});
}
export const dropScene = function (params){
	var panorama_id;
	console.warn('dropScene', params);
	if (params.scene_id != 'droparea'){
		var scene = Scenes.findOne(params.scene_id);
		if ( scene && scene.type == 'spheric' && !scene.is_stereo)
			Scenes.update(params.scene_id,{$set:{panorama_id:[]}});
		else
			Scenes.update(params.scene_id,{$pull:{panorama_id: params.panoramaOld}});
		
		Scenes.update(params.scene_id,{$push:{panorama_id: params.panorama}});
	}	else {
		Meteor.setTimeout(function(){
			addingScene(params);
		},100);
/* 		Meteor.setTimeout(function(){
			slyFrame.destroy();
			slyInit('#slyframe', 'dropScene');
			//slyFrame.reload();		
			slyFrame.toEnd();		
		},1000); */
	}		
}
export const addingScene = function(params){
	imgs = $('.drophere').find('img');
	ids = [];
	var i = 0;
	var metasub = Meteor.subscribe('meta',{image_id: params.panorama});
	
	var tour_id = FlowRouter.current().params.id;
	var tour = Tours.findOne(tour_id);
	if (!tour)
		return console.warn('tour is not ready', tour, tour_id);
	if (Tours.findOne({_id: tour._id,panorama_id: params.panorama}))
		return Bert.alert('You have that panorama in a tour already','warning');
	
	var count, scene_id, scene, scenePrev, portal, portalPrev;
	if (tour.scene_id && tour.scene_id.length)
		count = tour.scene_id.length + 1;
	else
		count = 1;
	
	scene = {
		tour_id: tour._id, 
		tourId: tour.id, 
		tourTitle: tour.title, 
		title: 'Pano ' + count, 
		order: count,
		type: 'spheric',
		portal: [],
		panorama_id: [params.panorama]
	};
	if (Session.get('debug')) console.log('addingScene', tour_id, tour._id, tour, scene);
	
	// create autoPortals
	if (Session.get('autoPortals'))
		if (count > 1) {
			scenePrev = Scenes.findOne({tour_id: tour._id}, {sort: {createdAt: -1}});
			if (!scenePrev) {
				console.warn('Can not find previous scene for autoportals: ' + tour._id + ' / ' + String(count - 1), 'warning');
				scene.portal = [];
				// Bert.alert('Can not find previous scene ' + tour._id + ' / ' + String(count - 1), 'warning');
			} else {
				//portal on this scene to prev							
				portal = {
					_id: Random.id(),
					title: scenePrev.title,
					active: true,
					azimuth: 180,
					declination: 0,
					distance: 1,
					next_scene: scenePrev._id,
				};	
				scene.portal.push(portal);
				//portal on prev scene to  this
				portalPrev = {
					_id: Random.id(),
					title: scene.title,
					active: true,
					azimuth: 0,
					declination: 0,
					distance: 1,
					next_scene: count.toString(),
				};			
			}
		} else {
			scene.first = true;
		}
	// end autoPortals
	if (Session.get('debug')) console.log('inserting scene autoportals:', Session.get('autoPortals'), count, 'portals:', scene.portal, 'scene:', scene, '\n');
	scene_id = Scenes.insert(scene);	
	Session.set('currScene', scene_id);
	Scenes.update(scene_id,{$set: {id: scene_id}});
	if (Session.get('autoPortals') && portalPrev) {
		portalPrev.next_scene = scene_id;
		Scenes.update(scenePrev._id,{$push:{portal: portalPrev}});
	}
	// if (!Tours.findOne(tour._id).icon) {
		// var pano = Images.findOne(params.panorama);
		// if (pano)
			// Tours.update(tour._id,{$set:{'icon.url': pano.url}});
	// }
	var updated = Tours.update(tour._id,{$push:{scene_id: scene_id}});
	if (!updated && updated == 0)
		console.warn('tour was not updated', updated, tour_id, tour._id, tour);
	if (! Tours.findOne({_id: tour._id, panorama_id: params.panorama}))
		Tours.update(tour._id,{$push:{panorama_id: params.panorama}});
	//console.log('img 2 ', alt, tour );			
	
	Images.update(params.panorama, {$push:{scene_id: scene_id}, $push: {tour_id: tour._id}});
	
	// updating tour with location
	if (!tour.location) {
		Tracker.autorun(function(){
			var meta = Meta.findOne({image_id: params.panorama});
			console.log('addingScene updating tour location', metasub.ready(), meta);
			if (!metasub.ready() || !meta)
				return;
			if (meta.gps){
				meta.gps.lat = parseFloat(meta.gps.lat);
				meta.gps.lng = parseFloat(meta.gps.lng);
			} else
				meta.gps = {};
			Tours.update(tour._id,{
				$set:{
					'locationShow': true,
					'location.gps': meta.gps, 
					'location.googlePlaceId': meta.address[0].extra.googlePlaceId,
					'location.address': meta.address[0].formattedAddress, 
					'meta.make': meta.Make,
					'meta.model': meta.Model
				},
				$addToSet:{
					tags: {$each: [meta.address[0].city, meta.address[0].zipcode]}
				}
			});		
		});
	}


	Meteor.setTimeout(function(){
		slyFrame.destroy();
		slyFrame.init();
		slyFrame.activate($('#' + Session.get('currScene')).parent().index());
	},1000);
	
	if (Session.get('debug')) console.log('create scene ', updated, tour._id, scene_id, scenePrev, scene, tour);		
}

export const checkPortals = function(params){
	//console.log('checkPortals started', params);
	if (!params || !params.tour_id)
		return console.warn('checkPortals, no params', params);	
	var data, error;
	// if (data && Meteor.userId() != data.userId)
		// FlowRouter.go('/worldtours');
	data = Scenes.find({tour_id: params.tour_id},{sort: {order: 1}});
	
	if (!data.count())
		return console.log('checkPortals, unknown tour in ', params);		
	else if (data.count() == 1)
		return;
	data = data.fetch();
	//console.log('checkPortals started 2', params, data);
	Session.set('error');
	_.each(data, function(scene){
		//console.log('checkPortals started 3', params, scene);
		if (scene.portal && scene.portal.length) 
			return;
		error = scene.title + " doesn't have a portal to move from";
		Session.set('error', error);
		Bert.alert(error, "danger"); 
		console.warn('no portal for scene', error, scene.id, scene.title, scene.portal, scene);			
	});
}

export const dropImages = function (){
	Meteor.setTimeout(function(){
		imgs = $('.drophere').find('img');
		ids = [];
		var i = 0;
		
		_.each(imgs, function(img){
			Images.update(alt, {$push: {tour_id: tour._id}, $push:{scene_id: scene_id}});
			console.log('create scene ', tour._id, scene_id, scenePrev, scene, tour);	
		});
	},100);
	
}
export const setSort = function(){
	var sort;
	if (!Session.get('sort')){
		Session.set('sort',{createdAt: -1});
	}	else if (Session.get('sort').file) {
		sort = 'date';
		Session.set('sort',{createdAt: -1});
	} else if (Session.get('sort').createdAt){
		sort = 'filename';
		Session.set('sort',{file: 1});
	} else {
		sort = 'date';
		Session.set('sort',{createdAt: -1});		
	}
		
/* 	else if (Session.get('sort') == 'date-file')
		Session.set('sort','date');	 */
	if (Session.get('debug')) console.log('clicked sort', Session.get('sort'));
	
	Bert.alert({
		title: 'Sort',
		message: 'Sorted by '+ sort,
		type: 'info',
		style: 'growl-top-right',
	});
}

export const selectTags = function(){
	var image;
	map = function(){
		for (var i in this.tags){
			var recency = 1/(new Date() - this.createdAt);
			var score = recency * this.score;
			
			emit(this.tags[i],{'urls': [this.url], 'score': score});
		}
	}
	images = Images.find({tags:{$exists: true}}).fetch();
	_.each(images, function(image){
		_.each(image.tags, function(){
			
		});
	});
	
	var mapFn = function(){
			if( this.tags ){
					this.tags.forEach(function(value){
							if (value.match(/web/i)){
									emit('web', value);
							}
					});
			}
	};
	var reduceFn = function(key, values){
			return {result:values};
	};

	db.runCommand({
			mapreduce: 'posts',
			out: {inline:1},
			map: mapFn,
			reduce: reduceFn,
			query: {tags:/web/}
	});
}

export const datepickerInit = function(data){
	//$('#datepicker').val(new Date().toLocaleDateString())	;
	//$('#datepicker').datepicker('destroy');
	$('#datepicker').datepicker(
		{
			autoclose: true,
			todayHighlight: true,
		}
	);
	$('#datepicker').datepicker('update', today());
	
	if (Session.get('selectDate')) 
		$('#datepicker').removeClass('hidden');
	function today(data){
		var d;
		if (data && data.createdAt)
			d = data.createdAt.toLocaleDateString();
		else
			d = new Date().toLocaleDateString();
/* 		var curr_date = d.getDate();
		var curr_month = d.getMonth() + 1;
		var curr_year = d.getFullYear();
		var currentDate = curr_date + "-" + curr_month + "-" + curr_year; */
		
		console.log('datepickerInit', data, d, $('#datepicker').val(), Session.get('selectDate'), Images.findOne({},{sort: {createdAt: -1}}));
		return d;
	}	
	console.log('datepickerInit2', data, $('#datepicker').val(), Session.get('selectDate'));
	
}

export const setSelectDate = function(date){
	if (Session.get('selectDate') == null){
		$('#datepicker').val('');
		$('#datepicker').addClass('hidden');
	} else if (Session.get('selectDate') == true && $('#datepicker').hasClass('hidden')){
		$('#datepicker').removeClass('hidden');
		Session.set('selectDate', $('#datepicker').val());		
	} else if (!$('#datepicker').hasClass('hidden')) {
		$('#datepicker').addClass('hidden');
		Session.set('selectDate', false);			
	}	
	console.log('setSelectDate', Session.get('selectDate'), 'datepicker:', $('#datepicker').val());
}
export const selectDate = function(startDate){
	//var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
	if (!startDate)
		return new Date();
	else
		startDate = new Date(startDate);
	//console.log('selectDate func', startDate);
	startDate.setSeconds(0);
	startDate.setHours(0);
	startDate.setMinutes(0);

	var dateMidnight = new Date(startDate);
	dateMidnight.setHours(23);
	dateMidnight.setMinutes(59);
	dateMidnight.setSeconds(59);

	//### MONGO QUERY

	var query = {	
		$gt:startDate,
		$lt:dateMidnight
	};	
	return query;
}

export const dataURItoBlob = function(dataURI){
    // convert base64/URLEncoded data component to raw binary data held in a string
	var byteString;
	if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
	else
			byteString = unescape(dataURI.split(',')[1]);
	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	// write the bytes of the string to a typed array
	var ia = new Uint8Array(byteString.length);
	for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ia], {type:mimeString});
}
export const  blobToFile = function(theBlob, filename){
	//A Blob() is almost a File() - it's just missing the two properties below which we will add
	theBlob.lastModifiedDate = new Date();
	theBlob.name = filename;
	return theBlob;
}

export const imgOnScroll = function(){
	Meteor.setTimeout(function(){
		$('img[realsrc]').each(function(i){
			var t = $(this);
			//console.log('position', t.offset(), t.offset().top, $(window).scrollTop(), $(window).height());
			if(t.offset().top - $(window).scrollTop() < $(window).height() ){
				t.attr('src', t.attr('realsrc')); // trigger the image load
				t.removeAttr('realsrc'); // so we only process this image once
				//console.log('imgOnScroll inserted ', i, this, t, t.id, t.offset().top < $(window).height());
			}
		});		
	},500);
}
export const infiniteScroll = function(){
	Meteor.setTimeout(function(){
		$('#infiniteCheck').each(function(i){
			var t = $(this);
			if(t.offset().top - $(window).scrollTop() < $(window).height() ){
				console.log('infiniteCheck ', i, this, t, t.id, t.offset().top < $(window).height());
			}
		});		
	},500);
}

export const requestGPS = function(){
	//Success Will fire upon completion of the GPS check
	//State will be different for Android and iOS

	//Android States:
	//Enabled
	//Disabled

	//iOS States: (See IOS KClAuthorizationStatus Documentation for more information)
	//NotDetermined -- Never asked user for auhtorization
	//Denied -- Asked User for authorization but they denied
	//Restricted -- Same As Not Determined

	function success(state) {
		 if(state === 'Enabled') {
				console.log("GPS Is Enabled");
		 }
	}

	//This will fire if either your not running in a cordova application
	//Or the plugin was not found for some reason
	function failure() {
		 console.log("Failed to get the GPS State");
	}

	//Options: The only option right now is to show 
	//a dialog if gps is disabled. The dialog has a 
	//button on it that directs the user to the settings
	//page assocaited with enabling their gps for your app.
	// Dialog : true means the pop up will appear
	var options = {
		 dialog: true
	}

	Location.getGPSState(success, failure, options);	
	
}


