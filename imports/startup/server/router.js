// import express from 'express';
// import snapsearch from 'snapsearch-client-nodejs';
let verbose = false;

import { Meteor } from 'meteor/meteor';
import { Picker } from 'meteor/meteorhacks:picker';
import { Random } from 'meteor/random';
import { Collections } from '/imports/api/collections.js';

/*;
import { addWatermark } from '/imports/api/functions.js';
import { validateUrl } from '/imports/api/functions.js'; */

//const dockerNames = require('docker-names');
//const bodyParser = require('body-parser');

/* import Rollbar from 'rollbar';
	const rollbar = new Rollbar({
	autoInstrument: true,
	accessToken: Meteor.settings.private.rollbar.token,
	handleUncaughtExceptions: true,
	handleUnhandledRejections: true,
	captureUncaught: true,
	captureUnhandledRejections: true,
	payload: {
		environment: 'router'
	}
}); */
/* if (env == 'dev')
	rollbar.enabled = false; */
//rollbar.log('[router.js] loaded', this);

import cloudinary from 'cloudinary';
const cloudinaryConf = Meteor.settings.public.cloudinary.config;
cloudinary.config({
	cloud_name: cloudinaryConf.cloud_name,
	api_key: cloudinaryConf.api_key,
	api_secret: Meteor.settings.private.cloudinary.api_secret,
	folder: 'ufg'
});
const analytics = '<!-- Global site tag (gtag.js) - Google Analytics --><script async src="https://www.googletagmanager.com/gtag/js?id=UA-51455923-2"></script><script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag("js", new Date()); gtag("config", "UA-121068149-1"); </script>';

let domain = __meteor_runtime_config__.ROOT_URL || 'dev';
domain = domain.replace(/stg/,'app');
let env = __meteor_runtime_config__.ROOT_URL.match(/www|stg|app/) || ['dev'];
env = env[0];

const inject = {
	title: 'Timerz, the best way to track your multiple projects',
	description: 'Easy to creat timer tracker, can be switched manually or by your movement',
	author: 'Orangry, Inc',
	icon: domain + '/img/timer.png',
	url: domain
}
const back = '/img/dateaha_sunset.jpg.png';
//var spinner = '<img src="/img/splash.png" style="width:100%">';
//var body = '<div id="injectloadingspinner" class="injectloading" style="width: 100vw; height: 100vh; margin: -8px; background-size: cover; background-image: url(' + back +');"></div>';
var body = '<div id="injectloadingspinner" class="injectloading"></div>';
var css = '<link rel="stylesheet" href="/inject.css">';

function consoleIn(params, req, res){
	var env = __meteor_runtime_config__.ROOT_URL;

	if (!req.headers['user-agent'] || !req.headers['user-agent'].match('UptimeRobot'))
		console.log(
		'\ninjecting head for', req.url, params.route, '#title:', params.title, '#date:', new Date(),
		'\nuser-agent:', req.headers['user-agent'], 
		'\nreferer:', req.headers['referer'],
		'\nremote:', req.headers['x-forwarded-for'],
		'\n********************\n');	

};

function injectIt(params){
	
	Inject.rawHead('injected_css', css);
	Inject.rawBody('injected', body);
	
	try{
		params.title = params.title || inject.title;
		params.description = params.description || inject.description;
		params.image = params.image || inject.icon;
		params.url = params.url || inject.url;

		Inject.rawHead('meta', '<meta name="msvalidate.01" content="94B3F70E5F916804BF7CB42D68F39422" />\n<meta property="fb:app_id" content="1877742739178201">\n<meta property="og:locale" content="en_US">\n<meta property="og:type" content="website">\n<meta property="twitter:card" content="summary_large_image">');
		Inject.rawHead('meta_og_type', '<meta property="og:type" content="website" >');
		Inject.rawHead('meta_og_type', '<meta property="og:url" content="' + params.url + '" >');
		Inject.rawHead('meta_og_title', '<meta property="og:title" content="' + params.title + '" >');
		Inject.rawHead('meta_og_description', '<meta property="og:description" content="' + params.description + '" >');
		Inject.rawHead('meta_og_img_w', '<meta property="og:image:width" content="1200">');
		Inject.rawHead('meta_og_img_h', '<meta property="og:image:height" content="630">');	
		Inject.rawHead('meta_og_img', '<meta property="og:image" content="' + params.image + '">');
		Inject.rawHead('meta_tw_title', '<meta property="twitter:title" content="' + params.title + '" >');
		Inject.rawHead('meta_tw_desc', '<meta property="twitter:description" content="' + params.description + '" >');
		Inject.rawHead('meta_tw_img', '<meta property="twitter:image" content="' + params.image + '">');	
		
		Inject.rawHead('analytics', analytics);
		
		if (params.jsonLD)
			Inject.rawHead('injected_jsonld', params.jsonLD);	
		
	} catch (e){
		console.warn('[router.js] injectIt err:', e);
	}

	//if (verbose) 
		console.log('[router.js] injectIt', params, '\n***\n');
	//Inject.rawBody('injected', body);
}

/* function createUser(req, ip){
	// create unique name and check it
	let dockername;
	while (!dockername) {
		dockername = dockerNames.getRandomName(3);
		let extuser = Collections.Extusers.findOne({username: dockername});	
		if (extuser)
			dockername = false;
	}
	
	let user = {
		//username: dockerNames.getRandomName() + '_' + Random.id(4),
		username: dockername,
		avatar: 'http://res.cloudinary.com/graffiti/image/upload/avatar/4568.jpg',
		token: Random.secret(64),
		count: 0,
		createdAt: new Date(),
		visitedAt: new Date(),
		details: {
			ip: ip,
			referrer: req.headers['referer'],
			lang: req.headers['accept-language'],
			agent: req.headers['user-agent']
		}
	}
	user._id = Collections.Extusers.insert(user);	
	return user;	
} */
Meteor.startup(function () {
	process.env.HTTP_FORWARDED_COUNT = 1;
});

Picker.route('/', function(params, req, res, next) {
	
	if (params.query.verbose && params.query.verbose == 'true')
		verbose = true;
	else if (params.query.verbose && params.query.verbose == 'false')
		verbose = false;
	
	if (verbose) console.log('[router.js] picker / params:', params, 'verbose:', verbose);
	let dommatch;
	try {
		dommatch = domain.match(/dev|stg|localhost/);
	} catch (e){
		dommatch = true;
		console.warn('[router.js] picker dommatch err:', e, domain, req.headers);
	}
	try {
		if (dommatch && req.headers['user-agent'] && req.headers['user-agent'].match(/bing|google/)) {
			if (verbose) console.warn('[router.js] picker \n***\n\nbot _id', params, domain, req.headers['user-agent'], '\n***\n');
			res.writeHead(302, {'Location': 'https://www.timerz.net'});
			res.end();
			return;
		}
	} catch (e){
		console.warn('[router.js] picker user-agent err:', e, domain, req.headers);
	}
	
	let share = {};
	share.route = '/ root';
	share.title = 'Timerz, the best way to track you multiple projects' ;
	share.description = 'Easy to creat timer tracker, can be switched manually or by your movement';
	share.image = domain + '/img/timer.png';	
	share.jsonLD = {
		"@context" : "http://schema.org",
		"@type" : "WebApplication",
		"SoftwareApplication": "Productivity, Tools",
		"screenshot" : inject.icon,
		"about" : inject.title,
		"author" : "Orangry, Inc",
		"name" : "Timerz"
	}
	share.jsonLD = JSON.stringify(share.jsonLD); 
	share.jsonLD = '<script type="application/ld+json" dochead="1">' + share.jsonLD + '</script>';
	consoleIn(share, req, res);
	injectIt(share);
	
	next();
});

Picker.route('/timers/:username', function(params, req, res, next) {
	if (params.username == 'bootstrap-theme.css.map' || params._id == 'bootstrap.css.map') return;
	
	let data, user, page, location, comments, meta, share = {};
	
	user = Meteor.users.findOne({username: params.username});
	if (!user) {
		res.writeHead(302, {'Location': '/'});
		if (verbose) console.warn('[router.js] picker NONEXISTING _id', params, '\n***\n');
		res.end();
		return;
	}
	
	user.profile = user.profile || {};
	
	data = Collections.Timers.findOne({userId: user._id, $or: [{publicTimer: false}, {publicTimer: {$exists: false}}]});
	
/* 	post.image = cloudinary.url(post.cloud, { 
		secure: true,  
		quality: 'auto', 
		overlay: "GraffitiOver", 
		width: 400, gravity: 'south_east', x: 50, y: 100
	}); */

	share.route = '/timers/:username';
	share.url = domain + '/timers/' + user.username;
	share.image = user.profile.avatar || domain + '/Batman-icon.png';
	share.title = 'Timerz, the best way to track multiple projects';
	share.description = 'Public timers for ' + user.username;
	
	share.jsonLD = {
		"@context" : "http://schema.org",
		"@type" : "Photograph",
		"about": inject.title,
		"author" : user.username,
		//"audio" : audio,
		//"comment" : comments,
		//"dateCreated" : post.createdAt,
		"interactivityType" : "active",
		"text": inject.description,
		"url": inject.url,
		//"keywords": post.tags,
		//"contentLocation": post.place,
		"image": share.image,
		// "location" : {
			// "@type" : "Place",
			// "name" : "Hollywood Bowl"
		// }
	};
	share.jsonLD = JSON.stringify(share.jsonLD); 
	share.jsonLD = '<script type="application/ld+json" dochead="1">' + share.jsonLD + '</script>';
	
	consoleIn(share, req, res);
	injectIt(share);
  //res.end();

	next();
	return;
});

Picker.route('/feedback', function(params, req, res, next) {
	if (params.username == 'bootstrap-theme.css.map' || params._id == 'bootstrap.css.map') return;
	
	let data, user, page, location, comments, meta, share = {};

	share.route = '/feedback';
	share.url = domain + share.route;
	share.image = domain + '/timer.png';
	share.title = 'Timerz, the best way to track multiple projects';
	share.description = 'Please give us a feedback or offer a new feature';
	
	share.jsonLD = {
		"@context" : "http://schema.org",
		"@type" : "Photograph",
		"about": inject.title,
		"author" : 'Orangry Inc',
		//"audio" : audio,
		//"comment" : comments,
		//"dateCreated" : post.createdAt,
		"interactivityType" : "active",
		"text": inject.description,
		"url": inject.url,
		//"keywords": post.tags,
		//"contentLocation": post.place,
		"image": share.image,
		// "location" : {
			// "@type" : "Place",
			// "name" : "Hollywood Bowl"
		// }
	};
	share.jsonLD = JSON.stringify(share.jsonLD); 
	share.jsonLD = '<script type="application/ld+json" dochead="1">' + share.jsonLD + '</script>';
	
	consoleIn(share, req, res);
	injectIt(share);
  //res.end();

	next();
	return;
});




