import OKGAnalytics, { analytics } from '@okgrow/auto-analytics';
import { Schemas } from '/imports/api/collections.js';
import { Collections } from '/imports/api/collections.js';

let env = __meteor_runtime_config__.ROOT_URL.match(/www|stg|app/) || ['dev'];
env = env[0];
//if (env == 'dev') env = 'dev2';

import code_version from '/imports/startup/both/code_version.js';

export const setOlarkDetails = function (t){
	//set FIXX
/* 	Meteor.setTimeout(()=>{
		if (window.olark) {
			window.olark('api.visitor.getDetails', (details)=>{
				Session.setPersistent('olarkdetails',details);
				console.log('push set olarkdetails', details);
			});
		} else if (!window.olark && !Session.get('olarkdetails'))
			Session.set('olarkdetails','no olark present');
	},12000); */
}

export const okanaliticsInit = function(){
	if (env != 'app') return;
	if (!window.analytics || !Meteor.settings.public.analyticsSettings) return console.warn('integration no analytics', window.analytics);
	OKGAnalytics(Meteor.settings.public.analyticsSettings);
}

export const initFullH = function(){
	if (navigator.userAgent.match(/seo4ajax|prerender/)) return;
	if (window._fs_org || !Meteor.settings.public.fullstory) return;
	window['_fs_is_outer_script'] = true;
	window['_fs_debug'] = false;
	window['_fs_host'] = 'www.fullstory.com';
	window['_fs_org'] = Meteor.settings.public.fullstory._fs_org;
	window['_fs_namespace'] = 'FS';
	
	(function(m,n,e,t,l,o,g,y){
			if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
			g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];
			o=n.createElement(t);o.async=1;o.src='https://'+_fs_host+'/s/fs.js';
			y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
			g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){g(l,v)};
			y="rec";g.shutdown=function(i,v){g(y,!1)};g.restart=function(i,v){g(y,!0)};
			g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
			g.clearUserCookie=function(c,d,i){if(!c || document.cookie.match('fs_uid=[`;`]*`[`;`]*`[`;`]*`')){
			d=n.domain;while(1){n.cookie='fs_uid=;domain='+d+
			';path=/;expires='+new Date(0).toUTCString();i=d.indexOf('.');if(i<0)break;d=d.slice(i+1)}}};
	})(window,document,window['_fs_namespace'],'script','user');
}

export const kuollInit = function (){
	(function (w, k, t) {
		if (!window.Promise) {
			w[k] = w[k] || function () {};
			return;
		}
		w[k] = w[k] || function () {
			var a = arguments;
			return new Promise(function (y, n) {
				(w[k].q = w[k].q || []).push({a: a, d: {y: y, n: n}});
			});
		};
		var s = document.createElement(t),
				f = document.getElementsByTagName(t)[0];
		s.async = 1;
		s.src = 'https://cdn.kuoll.com/bootloader.js';
		f.parentNode.insertBefore(s, f);
	}(window, 'kuoll', 'script'));
	var userEmail;
	var user = Meteor.user();
	if (user &&  user.emails && user.emails[0])
		userEmail = user.emails[0].address;
	kuoll('startRecord', { // http://www.kuoll.com/js-doc/module-kuollAPI.html#.startRecord
			API_KEY: "K101DC4EF0N1LU",
			userId: Meteor.userId(),
			userEmail: userEmail,
			createIssueOn:	{"Error": true, "consoleError": true, "serverError": true}
	});	
}

export const localytics = function (){
	var options = {
		appVersion: __meteor_runtime_config__.ROOT_URL,
		trackPageView: true
	};
	if (Meteor.userId())
		options.customerId = Meteor.userId();
	
	+function(l,y,t,i,c,s) {
			l['LocalyticsGlobal'] = i;
			l[i] = function() { (l[i].q = l[i].q || []).push(arguments) };
			l[i].t = +new Date;
			(s = y.createElement(t)).type = 'text/javascript';
			s.src = '//web.localytics.com/v3/localytics.js';
			(c = y.getElementsByTagName(t)[0]).parentNode.insertBefore(s, c);
			ll('init', 'ae39a67c8369f769bf52026-4467b9c2-3cdd-11e7-2329-00827c0501b4', options);
	}(window, document, 'script', 'll');
}

export const segmentio = function (){
	if (!window.analytics) {
		!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="4.0.0";
		analytics.load("WxRtU0woR7SVk1yul4ee9wSESuX94a9E");
		analytics.page();
		}}();
	}
}

export const leanplumInit = function (){
	$.getScript('/js/leanplum.js', function(script, textStatus, jqXHR){
		console.log('leanplum was loaded', textStatus, jqXHR);
		//var env = __meteor_runtime_config__.ROOT_URL.match(/www|stg|app/);

		// Sample variables. This can be any JSON object.
		var variables = {
		 items: {
			 color: 'red',
			 size: 20,
			 showBadges: true
		 },
		 showAds: true
		};
		
		// We've inserted your Test API keys here for you :)
		if (!env) {
		 Leanplum.setAppIdForDevelopmentMode(Meteor.settings.public.leanplum.appId, Meteor.settings.public.leanplum.development);
		} else {
		 Leanplum.setAppIdForProductionMode(Meteor.settings.public.leanplum.appId, Meteor.settings.public.leanplum.production);
		}

		Leanplum.setVariables(variables);
		Leanplum.start(function(success) {
		 console.log('Leanplum start. Success: ', success, 'Variables', Leanplum.getVariables());
		});
	});
}
	
export const heapInit = function (){
	window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
		heap.load("1714011256");
}

export const rollbarInit = function (t){
	//if (env == 'dev') return console.warn('rollbar not loaded in ', env);
	if (!Meteor.settings.public.rollbar || !Meteor.settings.public.rollbar.post_client_item) return console.warn('rollbar error: Meteor.settings.public.rollbar.post_client_item is not set');
	code_version = code_version || 'initial';	
	var user = Meteor.user() || Session.get('appUser') || {};
	var _rollbarConfig = {
		autoInstrument: true,
		accessToken: Meteor.settings.public.rollbar.post_client_item,
		verbose: true,
		ignoredMessages: ["(unknown): Script error."],
		captureUncaught: true,
		captureUnhandledRejections: true,
		payload: {
			environment: env,
			person: {
			  id: user._id,
			  username: user.username
			},
			client: {
				javascript: {
					source_map_enabled: true, //this is now true by default
					code_version: code_version,
					// Optionally have Rollbar guess which frames the error was thrown from
					// when the browser does not provide line and column numbers.
					guess_uncaught_frames: true
				}
			}
		}
	};
	
	// Rollbar Snippet
	!function(r){
		function o(e){
			if(n[e])return n[e].exports;
			var t=n[e]={exports:{},id:e,loaded:!1};
			return r[e].call(t.exports,t,t.exports,o),t.loaded=!0,t.exports}var n={};
			return o.m=r,o.c=n,o.p="",o(0)
		}
		([function(r,o,n){
			"use strict";var e=n(1),t=n(4);
			_rollbarConfig=_rollbarConfig||{},_rollbarConfig.rollbarJsUrl=_rollbarConfig.rollbarJsUrl||"https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/2.4.4/rollbar.min.js",_rollbarConfig.async=void 0===_rollbarConfig.async||_rollbarConfig.async;
			var a=e.setupShim(window,_rollbarConfig),l=t(_rollbarConfig);window.rollbar=e.Rollbar,a.loadFull(window,document,!_rollbarConfig.async,_rollbarConfig,l)},function(r,o,n){"use strict";
			function e(r){
				return function(){
					try{return r.apply(this,arguments)}
					catch(r){try{console.error("[Rollbar]: Internal error",r)}catch(r){}}
				}
			}
			function t(r,o){
				this.options=r,this._rollbarOldOnError=null;
				var n=s++;
				this.shimId=function(){return n},window&&window._rollbarShims&&(window._rollbarShims[n]={handler:o,messages:[]})
			}
			function a(r,o){var n=o.globalAlias||"Rollbar";if("object"==typeof r[n])return r[n];r._rollbarShims={},r._rollbarWrappedError=null;var t=new d(o);return e(function(){return o.captureUncaught&&(t._rollbarOldOnError=r.onerror,i.captureUncaughtExceptions(r,t,!0),i.wrapGlobals(r,t,!0)),o.captureUnhandledRejections&&i.captureUnhandledRejections(r,t,!0),r[n]=t,t})()}function l(r){return e(function(){var o=this,n=Array.prototype.slice.call(arguments,0),e={shim:o,method:r,args:n,ts:new Date};window._rollbarShims[this.shimId()].messages.push(e)})}var i=n(2),s=0,c=n(3),p=function(r,o){return new t(r,o)},d=c.bind(null,p);t.prototype.loadFull=function(r,o,n,t,a){var l=function(){var o;if(void 0===r._rollbarDidLoad){o=new Error("rollbar.js did not load");for(var n,e,t,l,i=0;n=r._rollbarShims[i++];)for(n=n.messages||[];e=n.shift();)for(t=e.args||[],i=0;i<t.length;++i)if(l=t[i],"function"==typeof l){l(o);break}}"function"==typeof a&&a(o)},i=!1,s=o.createElement("script"),c=o.getElementsByTagName("script")[0],p=c.parentNode;s.crossOrigin="",s.src=t.rollbarJsUrl,n||(s.async=!0),s.onload=s.onreadystatechange=e(function(){if(!(i||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)){s.onload=s.onreadystatechange=null;try{p.removeChild(s)}catch(r){}i=!0,l()}}),p.insertBefore(s,c)},t.prototype.wrap=function(r,o){try{var n;if(n="function"==typeof o?o:function(){return o||{}},"function"!=typeof r)return r;if(r._isWrap)return r;if(!r._wrapped&&(r._wrapped=function(){try{return r.apply(this,arguments)}catch(e){var o=e;throw"string"==typeof o&&(o=new String(o)),o._rollbarContext=n()||{},o._rollbarContext._wrappedSource=r.toString(),window._rollbarWrappedError=o,o}},r._wrapped._isWrap=!0,r.hasOwnProperty))for(var e in r)r.hasOwnProperty(e)&&(r._wrapped[e]=r[e]);return r._wrapped}catch(o){return r}};for(var u="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleUnhandledRejection".split(","),f=0;f<u.length;++f)t.prototype[u[f]]=l(u[f]);r.exports={setupShim:a,Rollbar:d}},function(r,o){"use strict";function n(r,o,n){if(r){var t;"function"==typeof o._rollbarOldOnError?t=o._rollbarOldOnError:r.onerror&&!r.onerror.belongsToShim&&(t=r.onerror,o._rollbarOldOnError=t);var a=function(){var n=Array.prototype.slice.call(arguments,0);e(r,o,t,n)};a.belongsToShim=n,r.onerror=a}}function e(r,o,n,e){r._rollbarWrappedError&&(e[4]||(e[4]=r._rollbarWrappedError),e[5]||(e[5]=r._rollbarWrappedError._rollbarContext),r._rollbarWrappedError=null),o.handleUncaughtException.apply(o,e),n&&n.apply(r,e)}function t(r,o,n){if(r){"function"==typeof r._rollbarURH&&r._rollbarURH.belongsToShim&&r.removeEventListener("unhandledrejection",r._rollbarURH);var e=function(r){var n=r.reason,e=r.promise,t=r.detail;!n&&t&&(n=t.reason,e=t.promise),o&&o.handleUnhandledRejection&&o.handleUnhandledRejection(n,e)};e.belongsToShim=n,r._rollbarURH=e,r.addEventListener("unhandledrejection",e)}}function a(r,o,n){if(r){var e,t,a="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(e=0;e<a.length;++e)t=a[e],r[t]&&r[t].prototype&&l(o,r[t].prototype,n)}}function l(r,o,n){if(o.hasOwnProperty&&o.hasOwnProperty("addEventListener")){for(var e=o.addEventListener;e._rollbarOldAdd&&e.belongsToShim;)e=e._rollbarOldAdd;var t=function(o,n,t){e.call(this,o,r.wrap(n),t)};t._rollbarOldAdd=e,t.belongsToShim=n,o.addEventListener=t;for(var a=o.removeEventListener;a._rollbarOldRemove&&a.belongsToShim;)a=a._rollbarOldRemove;var l=function(r,o,n){a.call(this,r,o&&o._wrapped||o,n)};l._rollbarOldRemove=a,l.belongsToShim=n,o.removeEventListener=l}}r.exports={captureUncaughtExceptions:n,captureUnhandledRejections:t,wrapGlobals:a}},function(r,o){"use strict";function n(r,o){this.impl=r(o,this),this.options=o,e(n.prototype)}function e(r){for(var o=function(r){return function(){var o=Array.prototype.slice.call(arguments,0);if(this.impl[r])return this.impl[r].apply(this.impl,o)}},n="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleUnhandledRejection,_createItem,wrap,loadFull,shimId".split(","),e=0;e<n.length;e++)r[n[e]]=o(n[e])}n.prototype._swapAndProcessMessages=function(r,o){this.impl=r(this.options);for(var n,e,t;n=o.shift();)e=n.method,t=n.args,this[e]&&"function"==typeof this[e]&&this[e].apply(this,t);return this},r.exports=n},function(r,o){"use strict";r.exports=function(r){return function(o){if(!o&&!window._rollbarInitialized){r=r||{};for(var n,e,t=r.globalAlias||"Rollbar",a=window.rollbar,l=function(r){return new a(r)},i=0;n=window._rollbarShims[i++];)e||(e=n.handler),n.handler._swapAndProcessMessages(l,n.messages);window[t]=e,window._rollbarInitialized=!0}}}}]);
// End Rollbar Snippet
	console.log('rollbar loaded', window._rollbarInitialized, code_version, env );
}

export const instabugInit = function (t){
	$.getScript('https://s3.amazonaws.com/instabug-pro/sdk_releases/instabugsdk-1.1.3-beta.min.js', function(){
		ibgSdk.init({
			token: 'fb8325ff72395bc04dbf8a9d2d191765'
		});
		console.log('loaded instabug');
	});
}

export const sentryInit = function (t){
	//if (env == 'dev') return;

	Raven.config('https://1fe5c4ff0d4843e68af6ec3e558217d5@sentry.io/193483').install();
	console.log('loaded sentry.io');	
	//Raven.captureMessage('app was restarted ' + new Date());
	Tracker.autorun(()=>{
		if (Meteor.user())
			Raven.setUserContext({
				id: Meteor.userId(),
				username: Meteor.user().username,
			});
		else if	(Session.get('virgoUserId'))
			Raven.setUserContext({
				id: Session.get('virgoUserId').userId,
				username: 'anonymous',
			});
	});

/* 	$.getScript('https://cdn.ravenjs.com/3.17.0/raven.min.js', function(){
		Raven.config('https://1fe5c4ff0d4843e68af6ec3e558217d5@sentry.io/193483').install()
		console.log('loaded sentry.io');
		Tracker.autorun(()=>{
			if (Meteor.user())
				Raven.setUserContext({
					id: Meteor.userId(),
					username: Meteor.user().username,
				});
			else if	(Session.get('virgoUserId'))
				Raven.setUserContext({
					id: Session.get('virgoUserId').userId,
					username: 'anonymous',
				});
		});
	}); */
}

export const oribiInit = function (t){
	if (!Meteor.settings.public.oribi) return;
	(function(b, o, n, g, s, r, c) { 
		if (b[s]) return; 
		b[s] = {}; 
		b[s].scriptToken = Meteor.settings.public.oribi.scriptToken; 
		r = o.createElement(n); 
		c = o.getElementsByTagName(n)[0]; 
		r.async = 1; r.src = g; 
		r.id = s + n; 
		c.parentNode.insertBefore(r, c); 
	})(window, document, "script", "//cdn.oribi.io/" + Meteor.settings.public.oribi.scriptToken + "/oribi.js", "ORIBI");
}

export const mixpanelInit = function (t){
	if (!Meteor.settings.public.mixpanel) return;
	(function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
	for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
	mixpanel.init(Meteor.settings.public.mixpanel.token); 
}

export const hotjarInit = function (t){
	if (!Meteor.settings.public.hotjar) return;
	(function(h,o,t,j,a,r){
			h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
			h._hjSettings={hjid:Meteor.settings.public.hotjar.hjid,hjsv:6};
			a=o.getElementsByTagName('head')[0];
			r=o.createElement('script');r.async=1;
			r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
			a.appendChild(r);
	})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
}

export const analyticsAll = function (t){
	//if (!window.analytics) return console.warn('analytics is blocked');
	
	okanaliticsInit();
	
	if (navigator.userAgent.match(/seo4ajax|prerender/)) return;

	function checkSettings(type){
		let admin, data, common, personal, checked = {};		
		let list = {type: type};
		
		data = Collections.Settings.findOne(list) || {};
		checked.common = data.enable;

		if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
			list = {type: type, 'personal.userId': Meteor.userId()};
			data = Collections.Settings.findOne(list) || {};
			data = _.findWhere(data.personal, {userId: Meteor.userId()}) || {};
			if (data.enable !== false)
				checked.personal = true;
		} else 
			checked.personal = true;
		
		if (Session.get('debug')) console.log('checkSettings', type, checked.common && checked.personal, checked );
		if (checked.common && checked.personal)
			return true;
		else
			return false;
	};
	
	Tracker.autorun(function(){
		if (!Collections.Settings.find().count()) return;
		var admin, count, data, list = {} ;
		
		if (Roles.userIsInRole(Meteor.userId(), ['admin'])) 
			admin = Meteor.userId();
		
		data = Collections.Settings.find().fetch();
		
		//if (Session.get('debug')) console.log('integration', list, data);
		if (checkSettings('fullstory') && env != 'dev'){
			initFullH();
			if (Session.get('debug')) console.log('integration fullstory', data, _.findWhere(data,{type: 'fullstory'})); 
		}
		if (checkSettings('localytics') && env != 'dev') {
			localytics();
			if (Session.get('debug')) console.log('integration localytics', data, _.findWhere(data,{type: 'localytics'})); 
		}		
		if (checkSettings('leanplum')) {
			leanplumInit();
			if (Session.get('debug')) console.log('integration leanplum', data, _.findWhere(data,{type: 'leanplum'})); 
		}
		if (checkSettings('kuoll')) {
			//kuollInit();
			if (Session.get('debug')) console.log('integration kuoll', data, _.findWhere(data,{type: 'kuoll'})); 
		}
		if (checkSettings('segmentio')) {
			segmentio();
			if (Session.get('debug')) console.log('integration segmentio', data, _.findWhere(data,{type: 'segmentio'})); 
		}		
		if (checkSettings('rollbar') && env != 'dev') {
			rollbarInit(t);
			if (Session.get('debug')) console.log('integration rollbar', data, _.findWhere(data,{type: 'rollbar'})); 
		}		
		//instabugInit(t);
		if (checkSettings('sentry') && env != 'dev') {
			sentryInit(t);
			if (Session.get('debug')) console.log('integration sentry', data, _.findWhere(data,{type: 'sentry'})); 
		}
		if (checkSettings('heap') && env != 'dev') {
			heapInit(t);
			if (Session.get('debug')) console.log('integration heap', data, _.findWhere(data,{type: 'heap'})); 
		}		
		if (checkSettings('mixpanel') && env != 'dev') {
			mixpanelInit(t);
			if (Session.get('debug')) console.log('integration mixpanel', data, _.findWhere(data,{type: 'mixpanel'})); 
		}
		if (checkSettings('hotjar') && env != 'dev') {
			hotjarInit(t);
			if (Session.get('debug')) console.log('integration hotjar', data, _.findWhere(data,{type: 'hotjar'})); 
		}

		if (Session.get('debug')) console.log('integration done with data:', data);
	});
	
	// remember referrer
	Tracker.autorun(function(){
		var domain = __meteor_runtime_config__.ROOT_URL.split('.').slice(-2,-1)[0];
		if (Session.get('referrer') || !document.referrer || document.referrer.match(domain)) return;
		Session.setPersistent('referrer', {ref: document.referrer, link: location.href, date: new Date()});
		Meteor.call('user.update.ref', {debug: Session.get('debug'), referred: Session.get('referrer')});
	});
}

const rollbarUser = function(t){
/* 	Tracker.autorun(()=>{	
		var user = Meteor.user() || Session.get('appUser');
		if (!window._rollbarInitialized || !user) return;
		var userId = Meteor.userId() || user.userId;
		Rollbar.configure({
		  payload: {
			person: {
			  id: userId,
			  username: user.username
			}
		  }
		});	
	}) */
}

const userDetails = function(t){
	Tracker.autorun((computation)=>{
		if (!Meteor.userId()) return;
		Meteor.call('user.analytics',{device: navigator.userAgent, platform: navigator.platform, referrer: document.referrer});
		computation.stop();
	})
}

const userEvents = function(t){
	Tracker.autorun((computation)=>{
		if (!Meteor.user()) return;
		if (window.analytics)
			analytics.track('Logging', {
				referrer: document.referrer,
				category: "Account",
				label: Meteor.user().username
			});	
		computation.stop();
	});
}

Meteor.startup(()=>{
	//if (env != 'app') return window.analytics = null;
	
	userDetails();
	analyticsAll();
	userEvents();
	//rollbarUser();
});
