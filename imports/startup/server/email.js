import { Email } from 'meteor/email';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(function() {

	Accounts.emailTemplates.siteName = "xLazz";
	Accounts.emailTemplates.from = "xLazz 360 Attendant <no-reply@xlazz.com>";
	Accounts.urls.resetPassword = function(token) {
		return Meteor.absoluteUrl('reset-password/' + token);
	};
	Accounts.urls.verifyEmail = function (token) {
		return Meteor.absoluteUrl('verify-email/' + token);
	};

	Accounts.urls.enrollAccount = function (token) {
		return Meteor.absoluteUrl('enroll-account/' + token);
	};

	Accounts.emailTemplates.enrollAccount.subject = function (user) {
			return "Welcome to xLazz, the VR and AR developer, " + user.profile.name;
	};
	Accounts.emailTemplates.enrollAccount.text = function (user, url) {
		 return "You have been selected to participate in building a better future!"
			 + " To activate your account, simply click the link below:\n\n"
			 + url;
	};
	Accounts.emailTemplates.resetPassword.from = function () {
		 // Overrides value set in Accounts.emailTemplates.from when resetting passwords
		 return "xLazz Attendant <no-reply@xlazz.com>";
	};	
});