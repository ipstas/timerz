Meteor.startup(function() {
	Meteor.subscribe('currentTimer');
	Meteor.subscribe('analytics');
	if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
		Meteor.subscribe('logs');
});
