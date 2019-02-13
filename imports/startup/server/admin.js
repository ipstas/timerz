Meteor.startup(function() {
	
	var users = [
				{email:"stanp@xlazz.com",roles:['admin']},
				{email:"max@podolski.org",roles:['admin']},
				{email:"9560404@mail.ru",roles:['admin']}
			];

	_.each(users, function (checkuser) {
		var id;
		
		var user = Meteor.users.findOne({'emails.address': checkuser.email});
		//console.log('[server/admin.js] users', user, checkuser);		
		if (!user || Roles.userIsInRole(user._id, ['admin'], 'admGroup')) return;		
		
		if (checkuser.roles && checkuser.roles.length > 0) 
			Roles.addUsersToRoles(user._id, checkuser.roles, 'admGroup');
	
	});
});