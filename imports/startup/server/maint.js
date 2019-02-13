Meteor.startup(()=> {
	Meteor.call('maint.archive');
	Meteor.call('maint.removesmall');
});