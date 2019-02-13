import './status.html';
//import '../components/git.html';

Template.statusonline.onCreated(function () {

});

Template.statusonline.helpers({
	offline: function(){
		var status = Meteor.status();
		if (status.status != 'connected') {
			Meteor.setTimeout(function(){
				status = Meteor.status();
				if (status.status != 'connected')
					Bert.alert({
						message: 'Server is offline, we will be back momentarily',
						type: 'info',
						hideDelay: 3500,			
					});
			},2000);
			return true;
		}
	},
});

Template.statusonline.events({
	'click .pointer'(event, template){
		//Modal.show('serverofflineModal');
	},
});

Template.versionserver.helpers({
	status: function(){
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
	runtimecfg: function(){
		var runtimecfg = __meteor_runtime_config__;
		console.log('meteor runtime ',  runtimecfg);
		return runtimecfg;
	}
});