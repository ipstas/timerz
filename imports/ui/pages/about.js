import moment from 'moment';
/* import { Reloader } from 'meteor/jamielob:reloader';
window.Reloader = Reloader;
Reloader.configure({
	check: 'everyStart', // Check for new code every time the app starts
	checkTimer: 3000,  // Wait 3 seconds to see if new code is available
	refresh: 'startAndResume', // Refresh to already downloaded code on both start and resume
	idleCutoff: 1000 * 60 * 10  // Wait 10 minutes before treating a resume as a start
}); */

import { Collections } from '/imports/api/collections.js';
import { Schemas } from '/imports/api/collections.js';
import './about.html';
import '../components/git.html';
import code_version from '/imports/startup/both/code_version.js';
PostSubs = new SubsManager();

//import Masonry from 'masonry-layout';
//const imagesLoaded =  require('imagesloaded');
//window.imagesLoaded = imagesLoaded;
//import jQueryBridget from 'jquery-bridget';
//jQueryBridget( 'masonry', Masonry, $ );
//jQueryBridget( 'imagesLoaded', imagesLoaded, $ );

const selectorAbout = new ReactiveVar();
const version = new ReactiveVar();

const selectors = [
/* 	{ value: 'creators', label: 'Creators'}, */
	{ value: 'tutorial', label: 'Tutorial'},
	{ value: 'faq', label: 'FAQ'},
	{ value: 'contactForm', label: 'Contact Us'},
	{ value: 'terms', label: 'Terms & Conditions'},
	{ value: 'credits', label: 'Credits'},
	{ value: 'version', label: 'Version'},
];
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: 0,
  columnWidth: '.grid-sizer',
  percentPosition: true
};

Template.about.onCreated(function () {
	
	Meteor.subscribe('about');

	let t = Template.instance();
	t.editpage = new ReactiveVar();
	t.showcontacts = new ReactiveVar();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	t.selectText = new ReactiveVar();
	t.selector = new ReactiveVar();
	t.running = new ReactiveVar();
	t.showdel = new ReactiveVar();

	
	t.autorun(function(){
		let value = FlowRouter.getQueryParam('get');
		let selector = _.findWhere(selectors, {value: value});
		t.selector.set(selector);
	});
	//PostSubs.subscribe('about');

	//PostSubs.subscribe('Followings', {caller: 'about'});
	
	Meteor.call('app.version',(e,r)=>{
		console.log('[about] version', e,r);
		version.set(r);
	});	

});
Template.about.onRendered(function(){
	$('html, body').animate({scrollTop:0}, 'slow');
	console.log('about onrendered', moment().format("HH:mm:ss.SSS"));
});
Template.about.helpers({
	selectors(){
		return selectors;
	},
	selector(){
		let t = Template.instance();
		console.log('selector', t.selector.get());
		return t.selector.get() || selectors[0];
	},
	active(){
		let t = Template.instance();
		//console.log('adminpage active:', t.selector.get(), this.value);
		if (t.selector.get() && this.value == t.selector.get().value)
			return 'active';
	},
	activeRotate(){
		let t = Template.instance();
		if (t.running.get())
			return 'activeRotate';
	},
	isOrion(){
		return false;
	},
	isCordova(){
		return Meteor.isCordova;
	},
	schema() {
		return Schemas.About;
	},	
	collection() {
		return Collections.About;
	},
	isAdmin(){
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
	aboutAll(){
		console.log('about helpers', Collections.About.findOne());
		return Collections.About.findOne();
	},
	submitted(){
		return Session.get('submitted');
	},
	contactUser(){
		var user = Meteor.user();
		if (!user)
			return;
		user.userId = user._id;
		user.name = user.profile.name;
		if ((user.emails) && (user.emails[0]))
			user.email = user.emails[0].address;
		return user;
	},
	code_version(){
		return code_version;
	}

});
Template.about.events({
/* 	'click .selector'(e, t) {
		e.preventDefault();
		if (this.value == FlowRouter.getQueryParam('get')) 
			FlowRouter.setQueryParams({get: null, userId: null});
		else 
			FlowRouter.setQueryParams({get: this.value, userId: null});
		
		console.log('clicked selector', this, e);
	}, */
	'click .join': function(event, template){
		Remodal.open('joinUs');
	},
	'click .getUpdate'(e, t) {
		e.preventDefault();
		e.stopPropagation();
		Overlay.show('showoverlay', {closeable: false});
		FlowRouter.go('/');
		Meteor.setTimeout(()=>{
			Reloader.reload();
		},1000);
	},
});

Template.aboutSelectors.helpers({
	selectors(){
		return selectors;
	},
	href(){
		if (this.value.match('http'))
			return this.value;
		return '/about?get=' + this.value;
	}
});
Template.aboutSelectors2.helpers({
	selectors(){
		return selectors;
	},
	href(){
		if (this.value.match('http'))
			return this.value;
		return '/about?get=' + this.value;
	}
});

Template.tutorial.onCreated(()=> {
	const t = Template.instance();
	t.ready = new ReactiveVar();
	t.element = new ReactiveVar();
	t.newRecord = new ReactiveVar(false);
	t.editRecord = new ReactiveVar(false);
	t.abtest = new ReactiveVar(FlowRouter.getQueryParam('abtest') || 'a');
	let sub;
	
	Meteor.subscribe('texts');
	
});
Template.tutorial.onRendered(()=> {
	const t = Template.instance();
	let bullets = [];

	t.autorun(()=>{
		
		let data = Collections.Texts.findOne({section:'thanks1', version: t.abtest.get()});
		if (!data) return console.log('[thanks] no data yet', data);
		Meteor.setTimeout(()=>{
			const els = $('.landingbullet');
			console.log('[landingbullet]', els);
			let n = 1;
			_.each(els,(el)=>{
				console.log('[thanks] bullet:', el);	
				Meteor.setTimeout(()=>{
					$(el).removeClass('opacity20').addClass('slideInLeft');
					console.log('[thanks] bullet2:', el);	
				},n * 500);	
				n++;
			});			
		});
	})

});
Template.tutorial.helpers({
	clickedImg(){
		let t = Template.instance();
		if (t.element.get())
			return {lg: 'col-md-12', sm: 'col-md-0', hd:'hidden'};
		else
			return {lg: 'col-md-6', sm: 'col-md-6', hd:''};
	},
	newRecord(){
		let t = Template.instance();
		return t.newRecord.get();
	},
	editRecord(){
		let t = Template.instance();
		console.log('editRecord', t.editRecord.get());
		return t.editRecord.get();
	},
	schema(){
		let schema = Schemas.Contact;
		console.log('[collectForm] schema', schema);
		schema._schema.email.optional = false;
		return schema;
	},	
	collection(){
		return Collections.Contact;
	},		
	schemaLand(){
		return Schemas.Texts;
	},	
	collectionLand(){
		return Collections.Texts;
	},
	tutorial(){
		let t = Template.instance();
		const data = Collections.Texts.findOne({section:'tutorial', version: 'a'});
		console.log('tutorial', 'a', data);
		return data;
		//return '<h1>Add any site to your social network.</h1> Comment, See Friends, Answer';
	},	
});
Template.tutorial.events({
	'click .imgEnl'(e,t){
		t.element.set(!t.element.get());
		$('.grid').masonry();
	},
	'click .editAB'(e,t){
		if (t.abtest.get() == 'a')
			FlowRouter.setQueryParams({abtest: 'b'});
		else
			FlowRouter.setQueryParams({abtest: 'a'});
		console.log('abtest',t.abtest.get(), e,this);
	},
	'click .newRecord'(e, t) {
		t.newRecord.set(true);
		t.editRecord.set(false);
		Meteor.setTimeout(()=>{
			$('textarea').each(function(){
				$(this).summernote()
			});			
		},500)
	},
	'click .editRecord'(e, t) {
		t.editRecord.set(this._id);
		t.newRecord.set(false);
		Meteor.setTimeout(()=>{
			$('textarea').each(function(){
				$(this).summernote()
			});			
		},500)
	},
	'click .cancel'(e,t){
		e.stopPropagation();
		e.preventDefault();
		t.newRecord.set(false);
		t.editRecord.set(false);
		console.log('click cancel', e.target, this);
		Meteor.setTimeout(()=>{
			document.getElementById(this.section).scrollIntoView({behavior: 'smooth'});
		},300)
	},
});

Template.faq.onCreated(function(){
	let t = Template.instance();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	Meteor.subscribe('faq');
});
Template.faq.helpers({
	newRecord(){
		let t = Template.instance();
		return t.newRecord.get();
	},
	editRecord(){
		let t = Template.instance();
		console.log('editRecord', t.editRecord.get());
		return t.editRecord.get();
	},
	faq(){
		return Collections.Faq.find();
	},
	schema(){
		return Schemas.Faq;
	},
	collection(){
		return Collections.Faq;
	}
});
Template.faq.events({
	'click .newRecord'(e, t) {
		t.newRecord.set(true);
		t.editRecord.set();
	},
	'click .editRecord'(e, t) {
		t.editRecord.set(this._id);
		t.newRecord.set();
	},
	'submit'(e,t){
		t.newRecord.set();
		t.editRecord.set();
	},
	'click .join': function(event, template){
		Remodal.open('joinUs');
	},

	'click .bloglink': function (event, template) {
		var href = "http://medium.com/@Orangry";
		cordova.InAppBrowser.open(href, '_blank', 'location=yes');
	},
});

Template.creators.onCreated(function(){
	let t = Template.instance();
	t.ready = new ReactiveVar();
	t.count = new ReactiveVar();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	
	let sub = PostSubs.subscribe('team');
	t.autorun(()=>{
		t.ready.set(sub.ready());
	});	
	t.autorun(()=>{
		t.count.set(Collections.Team.find().count());
	});
/* 	t.autorun(()=>{
		if (!sub.ready()) return;
		console.log(t.editRecord.get(), t.newRecord.get());
		Meteor.setTimeout(()=>{
			$('.grid').masonry(masonryOptions);
			console.log('creators.onCreated masonry loaded');
		},100);
	}); */
});
Template.creators.onRendered(()=>{	
	let t = Template.instance();
	
	$('.grid').masonry(masonryOptions);
	t.autorun(()=>{
		if (!t.count.get()) return;
		imagesLoaded(('.grid'),function(){		
			$('.grid').masonry('reloadItems');
			$('.grid').masonry('layout');
			console.log('creators.onRendered images loaded', $('.grid').data('masonry'));
		});	
	});
});
Template.creators.helpers({
	debug(){
		console.log('DEBUG creators', this);
	},
	newRecord(){
		let t = Template.instance();
		return t.newRecord.get();
	},
	editRecord(){
		let t = Template.instance();
		console.log('editRecord', t.editRecord.get());
		return t.editRecord.get();
	},
	record(){
		return Collections.Team.find({},{sort: {index: 1}});
	},
	picture(){
		return this.picture || '/img/robot.jpg';
	},
	schema(){
		return Schemas.Team;
	},
	collection(){
		return Collections.Team;
	}
});
Template.creators.events({
	'click .newRecord'(e, t) {
		t.newRecord.set(true);
		t.editRecord.set();
	},
	'click .editRecord'(e, t) {
		t.editRecord.set(this._id);
		t.newRecord.set();
	},
	'click .delRecord'(e, t) {
		Collections.Team.remove(this._id);
	},
	'submit'(e,t){
		t.newRecord.set();
		t.editRecord.set();
	},
});

Template.credits.onCreated(function(){
	let t = Template.instance();
	t.newRecord = new ReactiveVar();
	t.editRecord = new ReactiveVar();
	Meteor.subscribe('credits');
});
Template.credits.helpers({
	newRecord(){
		let t = Template.instance();
		return t.newRecord.get();
	},
	editRecord(){
		let t = Template.instance();
		console.log('editRecord', t.editRecord.get());
		return t.editRecord.get();
	},
	record(){
		return Collections.Credits.find({},{sort: {index: 1}});
	},
	picture(){
		return this.picture || '/img/robot.jpg';
	},
	schema(){
		return Schemas.Credits;
	},
	collection(){
		return Collections.Credits;
	}
});
Template.credits.events({
	'click .newRecord'(e, t) {
		t.newRecord.set(true);
		t.editRecord.set();
	},
	'click .editRecord'(e, t) {
		t.editRecord.set(this._id);
		t.newRecord.set();
	},
	'submit'(e,t){
		t.newRecord.set();
		t.editRecord.set();
	},
});


Template.state.helpers({
	state(){
		var status = Meteor.status();
		if ((status.status == 'connected'))
			status.checked = 'checked';
		else
			status.checked = '';
		status.server = status.status;
		if (Session.get('debug'))
			console.log('meteor status ',  status);
		return status;
	},
});

Template.version.helpers({
	env(){
		let env = {};
		env.srv = __meteor_runtime_config__.ROOT_URL.split('.')[0].split('/').slice(-1)[0];
		env.hash = __meteor_runtime_config__.autoupdate.versions["web.cordova"].version;
		env.update = Reload.isWaitingForResume();
		console.log('[footer] env', env, 'waiting:', Reload.isWaitingForResume(), 'ifnew:', Autoupdate.newClientAvailable(), __meteor_runtime_config__.autoupdate.versions["web.cordova"]);
		return env;
	},
	version(){
		return version.get()
	},
	state(){
		return Meteor.status();
	},
	isCordova(){
		return Meteor.isCordova;
	},
	ifUpdate(){
		//var data = Reloader.updateAvailable.get();
		console.log('ifupdate', data);
		return data;
	}
});

Template.terms.onCreated( () => {
	Meteor.subscribe('terms');
	const t = Template.instance();
	t.ready = new ReactiveVar();
	t.element = new ReactiveVar();
	t.newRecord = new ReactiveVar(false);
	t.editRecord = new ReactiveVar(false);
});
Template.terms.helpers({
	newRecord(){
		let t = Template.instance();
		return t.newRecord.get();
	},
	editRecord(){
		let t = Template.instance();
		console.log('editRecord', t.editRecord.get());
		return t.editRecord.get();
	},
	schema(){
		let schema = Schemas.Terms;
		return schema;
	},	
	collection(){
		return Collections.Terms;
	},		
	data(){
		let t = Template.instance();
		const data = Collections.Terms.find();
		console.log('t&c', data.fetch());
		return data;
		//return '<h1>Add any site to your social network.</h1> Comment, See Friends, Answer';
	},	
});
Template.terms.events({
	'click .newRecord'(e, t) {
		t.newRecord.set(true);
		t.editRecord.set(false);
		Meteor.setTimeout(()=>{
			$('textarea').each(function(){
				$(this).summernote()
			});			
		},500)
	},
	'click .editRecord'(e, t) {
		t.editRecord.set(this._id);
		t.newRecord.set(false);
		Meteor.setTimeout(()=>{
			$('textarea').each(function(){
				$(this).summernote()
			});			
		},500)
	},
	'click .cancel'(e,t){
		e.stopPropagation();
		e.preventDefault();
		t.newRecord.set(false);
		t.editRecord.set(false);
		console.log('click cancel', e.target, this);
	},
});

