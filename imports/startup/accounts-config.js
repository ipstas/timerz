import { Accounts } from 'meteor/accounts-base';

// Options

Accounts.ui.config({
  requestPermissions: {
		google: ['profile','email','openid'],
    facebook:  ['email', 'public_profile', 'user_friends', 'user_likes'],
//    github: ['user', 'repo']
  },
  requestOfflineToken: {
    google: true
  },
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

if ('AccountsTemplates' in window) {
AccountsTemplates.configure({
  defaultLayout: 'layoutLanding',
  defaultLayoutRegions: {
    nav: 'nav',
    footer: 'footer',
  },
  defaultContentRegion: 'main',
  showForgotPasswordLink: true,
  overrideLoginErrors: true,
  enablePasswordChange: true,

  // sendVerificationEmail: true,
  // enforceEmailVerification: true,
  //confirmPassword: true,
  //continuousValidation: false,
  //displayFormLabels: true,
  //forbidClientAccountCreation: true,
  //formValidationFeedback: true,
  //homeRoutePath: '/',
  //showAddRemoveServices: false,
  //showPlaceholders: true,

  negativeValidation: true,
  positiveValidation: true,
  negativeFeedback: false,
  positiveFeedback: true,

  // Privacy Policy and Terms of Use
  //privacyUrl: 'privacy',
  //termsUrl: 'terms-of-use',
});

var pwd = AccountsTemplates.removeField('password');
	AccountsTemplates.removeField('email');
	AccountsTemplates.addFields([
		{
			_id: "username",
			type: "text",
			displayName: "username",
			required: true,
			minLength: 5,
		},
		{
			_id: 'email',
			type: 'email',
			required: true,
			displayName: "email",
			re: /.+@(.+){2,}\.(.+){2,}/,
			errStr: 'Invalid email',
		},
		{
			_id: 'username_and_email',
			placeholder: 'username or email',
			type: 'text',
			required: true,
			displayName: "Login",
		},
		pwd
	]);
}