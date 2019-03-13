Meteor.startup(function() {
	Meteor.subscribe('currentTimer');
	
	if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) {
		Meteor.subscribe('logs');
		Meteor.subscribe('analytics');
	}
		
});
