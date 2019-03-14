Meteor.startup(function() {

});
Meteor.subscribe('currentTimer');
Meteor.subscribe('settings');		
Tracker.autorun(()=>{
	if (!Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) 
		return;
	Meteor.subscribe('analytics');
	Meteor.subscribe('logs');				
})