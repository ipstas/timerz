Meteor.startup(function() {
	Meteor.subscribe('currentTimer');
	Meteor.subscribe('analytics');
});
