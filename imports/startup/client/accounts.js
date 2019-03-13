var onSubmitHook = function(error, state){
  if (!error) {
    if (state === "signIn") {
			if (Session.get('debug')) console.log('[onSubmitHook] user signed In', Meteor.user());
			if (window.analytics)
				analytics.track('signIn', {
					referrer: document.referrer,
					category: "Account",
					label: document.referrer
				});		
    } else if (state === "signUp") {
      if (Session.get('debug')) console.log('[onSubmitHook] user signed Up', Meteor.user());
			if (window.analytics)
				analytics.track('signUp', {
					referrer: document.referrer,
					category: "Account",
					label: document.referrer,
				});		
			
    }
  } 
	Meteor.setTimeout(()=>{
		if (Meteor.user() && !error && FlowRouter.getRouteName() == 'signIn')
			FlowRouter.go('/timers/' + Meteor.user().username);
		else if (!error && FlowRouter.getRouteName() == 'signIn')
			FlowRouter.go('/timers');		
	},500);

	if (Session.get('debug')) console.log('[onSubmitHook] end err:', error, 'state:', state, 'route:', FlowRouter.getRouteName());
};

AccountsTemplates.configure({
	onSubmitHook: onSubmitHook
});