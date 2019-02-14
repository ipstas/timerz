import './footer.html';
let version = ReactiveVar();

Template.footer.onCreated(()=>{
	Meteor.call('app.version',(e,r)=>{
		console.log('[footer] version', e,r);
		version.set(r);
	});
});
Template.footer.helpers({
	cordova(){
		
	},
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
	}
});
Template.footer.events({
	'click .updateVersion'(e,t){
		console.log('[footer] reloading', window.location.href);
		$('#loadingspinner').fadeIn();
		window.location.replace('/');
	},
});

