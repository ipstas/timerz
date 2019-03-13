import OKGAnalytics, { analytics } from '@okgrow/auto-analytics';
import { Schemas } from '/imports/api/collections.js';
import { Collections } from '/imports/api/collections.js';

let env = __meteor_runtime_config__.ROOT_URL.match(/www|stg|app/) || ['dev'];
env = env[0];
//env = 'stg2';
//if (env == 'dev') env = 'dev2';

import code_version from '/imports/startup/both/code_version.js';

const dyn_functions = [];
dyn_functions['setOlarkDetails'] = function (t){
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

dyn_functions['okanaliticsInit'] = function(){
	if (env == 'dev') return;
	if (!window.analytics || !Meteor.settings.public.analyticsSettings) return console.warn('integration no analytics', window.analytics);
	OKGAnalytics(Meteor.settings.public.analyticsSettings);
}

dyn_functions['fullstoryInit'] = function(){
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
dyn_functions['heapInit'] = function (){
	window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
		heap.load("1714011256");
}
dyn_functions['hotjarInit'] = function (t){
	if (!Meteor.settings.public.hotjar) return;
	(function(h,o,t,j,a,r){
			h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
			h._hjSettings={hjid:Meteor.settings.public.hotjar.hjid,hjsv:6};
			a=o.getElementsByTagName('head')[0];
			r=o.createElement('script');r.async=1;
			r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
			a.appendChild(r);
	})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
	console.log('[analytics] hotjarInit loaded' );
}
dyn_functions['inspectletInit'] = function (t){
	if (!Meteor.settings.public.inspectlet) return;
		
	window.__insp = window.__insp || [];
	__insp.push(['wid', Meteor.settings.public.inspectlet]);
	var ldinsp = function(){
	if(typeof window.__inspld != "undefined") return; window.__inspld = 1; var insp = document.createElement('script'); insp.type = 'text/javascript'; insp.async = true; insp.id = "inspsync"; insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js?wid=' + Meteor.settings.public.inspectlet + '&r=' + Math.floor(new Date().getTime()/3600000); var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(insp, x); };
	setTimeout(ldinsp, 0);
	console.log('[analytics] inspectletInit loaded' );
}

dyn_functions['instabugInit'] = function (t){
	$.getScript('https://s3.amazonaws.com/instabug-pro/sdk_releases/instabugsdk-1.1.3-beta.min.js', function(){
		ibgSdk.init({
			token: 'fb8325ff72395bc04dbf8a9d2d191765'
		});
		console.log('loaded instabug');
	});
}
dyn_functions['kuollInit'] = function (){
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
dyn_functions['leanplumInit'] = function (){
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
dyn_functions['localyticsInit'] = function (){
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
dyn_functions['mixpanelInit'] = function (t){
	if (!Meteor.settings.public.mixpanel) return;
	(function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
	for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
	mixpanel.init(Meteor.settings.public.mixpanel.token); 
}
dyn_functions['oribiInit'] = function (t){
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
dyn_functions['rollbarInit'] = function (t){
	//if (env == 'dev') return console.warn('rollbar not loaded in ', env);
	
	//return;
	
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
	!function(r){function e(n){if(o[n])return o[n].exports;var t=o[n]={exports:{},id:n,loaded:!1};return r[n].call(t.exports,t,t.exports,e),t.loaded=!0,t.exports}var o={};return e.m=r,e.c=o,e.p="",e(0)}([function(r,e,o){"use strict";var n=o(1),t=o(4);_rollbarConfig=_rollbarConfig||{},_rollbarConfig.rollbarJsUrl=_rollbarConfig.rollbarJsUrl||"https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/2.4.6/rollbar.min.js",_rollbarConfig.async=void 0===_rollbarConfig.async||_rollbarConfig.async;var a=n.setupShim(window,_rollbarConfig),l=t(_rollbarConfig);window.rollbar=n.Rollbar,a.loadFull(window,document,!_rollbarConfig.async,_rollbarConfig,l)},function(r,e,o){"use strict";function n(r){return function(){try{return r.apply(this,arguments)}catch(r){try{console.error("[Rollbar]: Internal error",r)}catch(r){}}}}function t(r,e){this.options=r,this._rollbarOldOnError=null;var o=s++;this.shimId=function(){return o},"undefined"!=typeof window&&window._rollbarShims&&(window._rollbarShims[o]={handler:e,messages:[]})}function a(r,e){if(r){var o=e.globalAlias||"Rollbar";if("object"==typeof r[o])return r[o];r._rollbarShims={},r._rollbarWrappedError=null;var t=new p(e);return n(function(){e.captureUncaught&&(t._rollbarOldOnError=r.onerror,i.captureUncaughtExceptions(r,t,!0),i.wrapGlobals(r,t,!0)),e.captureUnhandledRejections&&i.captureUnhandledRejections(r,t,!0);var n=e.autoInstrument;return e.enabled!==!1&&(void 0===n||n===!0||"object"==typeof n&&n.network)&&r.addEventListener&&(r.addEventListener("load",t.captureLoad.bind(t)),r.addEventListener("DOMContentLoaded",t.captureDomContentLoaded.bind(t))),r[o]=t,t})()}}function l(r){return n(function(){var e=this,o=Array.prototype.slice.call(arguments,0),n={shim:e,method:r,args:o,ts:new Date};window._rollbarShims[this.shimId()].messages.push(n)})}var i=o(2),s=0,d=o(3),c=function(r,e){return new t(r,e)},p=d.bind(null,c);t.prototype.loadFull=function(r,e,o,t,a){var l=function(){var e;if(void 0===r._rollbarDidLoad){e=new Error("rollbar.js did not load");for(var o,n,t,l,i=0;o=r._rollbarShims[i++];)for(o=o.messages||[];n=o.shift();)for(t=n.args||[],i=0;i<t.length;++i)if(l=t[i],"function"==typeof l){l(e);break}}"function"==typeof a&&a(e)},i=!1,s=e.createElement("script"),d=e.getElementsByTagName("script")[0],c=d.parentNode;s.crossOrigin="",s.src=t.rollbarJsUrl,o||(s.async=!0),s.onload=s.onreadystatechange=n(function(){if(!(i||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)){s.onload=s.onreadystatechange=null;try{c.removeChild(s)}catch(r){}i=!0,l()}}),c.insertBefore(s,d)},t.prototype.wrap=function(r,e,o){try{var n;if(n="function"==typeof e?e:function(){return e||{}},"function"!=typeof r)return r;if(r._isWrap)return r;if(!r._rollbar_wrapped&&(r._rollbar_wrapped=function(){o&&"function"==typeof o&&o.apply(this,arguments);try{return r.apply(this,arguments)}catch(o){var e=o;throw e&&("string"==typeof e&&(e=new String(e)),e._rollbarContext=n()||{},e._rollbarContext._wrappedSource=r.toString(),window._rollbarWrappedError=e),e}},r._rollbar_wrapped._isWrap=!0,r.hasOwnProperty))for(var t in r)r.hasOwnProperty(t)&&(r._rollbar_wrapped[t]=r[t]);return r._rollbar_wrapped}catch(e){return r}};for(var u="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleUnhandledRejection,captureEvent,captureDomContentLoaded,captureLoad".split(","),f=0;f<u.length;++f)t.prototype[u[f]]=l(u[f]);r.exports={setupShim:a,Rollbar:p}},function(r,e){"use strict";function o(r,e,o){if(r){var t;"function"==typeof e._rollbarOldOnError?t=e._rollbarOldOnError:r.onerror&&!r.onerror.belongsToShim&&(t=r.onerror,e._rollbarOldOnError=t);var a=function(){var o=Array.prototype.slice.call(arguments,0);n(r,e,t,o)};a.belongsToShim=o,r.onerror=a}}function n(r,e,o,n){r._rollbarWrappedError&&(n[4]||(n[4]=r._rollbarWrappedError),n[5]||(n[5]=r._rollbarWrappedError._rollbarContext),r._rollbarWrappedError=null),e.handleUncaughtException.apply(e,n),o&&o.apply(r,n)}function t(r,e,o){if(r){"function"==typeof r._rollbarURH&&r._rollbarURH.belongsToShim&&r.removeEventListener("unhandledrejection",r._rollbarURH);var n=function(r){var o,n,t;try{o=r.reason}catch(r){o=void 0}try{n=r.promise}catch(r){n="[unhandledrejection] error getting `promise` from event"}try{t=r.detail,!o&&t&&(o=t.reason,n=t.promise)}catch(r){t="[unhandledrejection] error getting `detail` from event"}o||(o="[unhandledrejection] error getting `reason` from event"),e&&e.handleUnhandledRejection&&e.handleUnhandledRejection(o,n)};n.belongsToShim=o,r._rollbarURH=n,r.addEventListener("unhandledrejection",n)}}function a(r,e,o){if(r){var n,t,a="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(n=0;n<a.length;++n)t=a[n],r[t]&&r[t].prototype&&l(e,r[t].prototype,o)}}function l(r,e,o){if(e.hasOwnProperty&&e.hasOwnProperty("addEventListener")){for(var n=e.addEventListener;n._rollbarOldAdd&&n.belongsToShim;)n=n._rollbarOldAdd;var t=function(e,o,t){n.call(this,e,r.wrap(o),t)};t._rollbarOldAdd=n,t.belongsToShim=o,e.addEventListener=t;for(var a=e.removeEventListener;a._rollbarOldRemove&&a.belongsToShim;)a=a._rollbarOldRemove;var l=function(r,e,o){a.call(this,r,e&&e._rollbar_wrapped||e,o)};l._rollbarOldRemove=a,l.belongsToShim=o,e.removeEventListener=l}}r.exports={captureUncaughtExceptions:o,captureUnhandledRejections:t,wrapGlobals:a}},function(r,e){"use strict";function o(r,e){this.impl=r(e,this),this.options=e,n(o.prototype)}function n(r){for(var e=function(r){return function(){var e=Array.prototype.slice.call(arguments,0);if(this.impl[r])return this.impl[r].apply(this.impl,e)}},o="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleUnhandledRejection,_createItem,wrap,loadFull,shimId,captureEvent,captureDomContentLoaded,captureLoad".split(","),n=0;n<o.length;n++)r[o[n]]=e(o[n])}o.prototype._swapAndProcessMessages=function(r,e){this.impl=r(this.options);for(var o,n,t;o=e.shift();)n=o.method,t=o.args,this[n]&&"function"==typeof this[n]&&("captureDomContentLoaded"===n||"captureLoad"===n?this[n].apply(this,[t[0],o.ts]):this[n].apply(this,t));return this},r.exports=o},function(r,e){"use strict";r.exports=function(r){return function(e){if(!e&&!window._rollbarInitialized){r=r||{};for(var o,n,t=r.globalAlias||"Rollbar",a=window.rollbar,l=function(r){return new a(r)},i=0;o=window._rollbarShims[i++];)n||(n=o.handler),o.handler._swapAndProcessMessages(l,o.messages);window[t]=n,window._rollbarInitialized=!0}}}}]);
// End Rollbar Snippet
	console.log('[analytics] rollbar loaded', window._rollbarInitialized, code_version, env );
}
dyn_functions['segmentioInit'] = function (){
	if (!window.analytics) {
		!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="4.0.0";
		analytics.load("WxRtU0woR7SVk1yul4ee9wSESuX94a9E");
		analytics.page();
		}}();
	}
}
dyn_functions['sentryInit'] = function (t){
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

window.dyn_functions = dyn_functions;

export const analyticsAll = function (t){
	//if (!window.analytics) return console.warn('analytics is blocked');
	
	dyn_functions['okanaliticsInit'];
	
	if (navigator.userAgent.match(/seo4ajax|prerender/)) return;
	
	let sub = Meteor.subscribe('settings');
	
	Tracker.autorun(function(){
		if (!sub.ready() || !Collections.Settings.find().count()) return;

		var admin, count, data, list = {common: true} ;
		
		if (Roles.userIsInRole(Meteor.userId(), ['admin'])) 
			admin = Meteor.userId();
		
		data = Collections.Settings.find(list).fetch();
			
		_.forEach(data, (f)=>{
			if (Session.get('debug')) 
				console.log('integration scripts', f);
			//if (f.nonenv == env) return;
			dyn_functions[f.func]();
		});

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
	Tracker.autorun(()=>{	
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
	})
}
const userDetails = function(t){
	Tracker.autorun((computation)=>{
		//if (!Meteor.userId()) return;
		Meteor.call('user.analytics',{device: navigator.userAgent, platform: navigator.platform, referrer: document.referrer});
		//computation.stop();
	})
}
const userEvents = function(t){
	Tracker.autorun((computation)=>{
		if (!Meteor.user()) return;
		if (window.analytics)
			analytics.track('Started', {
				referrer: document.referrer,
				category: "App",
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
