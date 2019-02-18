App.info({
	id: 'net.timerz.www.loc',
	name: 'Timerz',
	description: 'Timerz, the best way to track time for tasks',
	author: 'xLazz Inc',
	email: 'info@xlazz.com',
	website: 'http://timerz.net',
	version: '0.0.13'
});

App.icons({  
	'android_mdpi': 'private/android/drawable-mdpi/icon.png',
  'android_hdpi': 'private/android/drawable-hdpi/icon.png',
  'android_xhdpi': 'private/android/drawable-xhdpi/icon.png',
  'android_xxhdpi': 'private/android/drawable-xxhdpi/icon.png',
  'android_xxxhdpi': 'private/android/drawable-xxxhdpi/icon.png'
});

App.launchScreens({
	'android_mdpi_portrait': 'private/android/drawable-mdpi/screen.png',
  'android_hdpi_portrait': 'private/android/drawable-hdpi/screen.png',
  'android_xhdpi_portrait': 'private/android/drawable-xhdpi/screen.png',
  'android_xxhdpi_portrait': 'private/android/drawable-xxhdpi/screen.png',
  'android_xxxhdpi_portrait': 'private/android/drawable-xxxhdpi/screen.png',	
	'android_mdpi_landscape': 'private/android/drawable-land-mdpi/screen.png',
  'android_hdpi_landscape': 'private/android/drawable-land-hdpi/screen.png',
  'android_xhdpi_landscape': 'private/android/drawable-land-xhdpi/screen.png',
  'android_xxhdpi_landscape': 'private/android/drawable-land-xxhdpi/screen.png',
  'android_xxxhdpi_landscape': 'private/android/drawable-land-xxxhdpi/screen.png'
});
App.setPreference("SplashMaintainAspectRatio", true, "android");

App.setPreference('deployment-target', '7.0');
App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');
App.setPreference('android-minSdkVersion', '19');
App.setPreference('android-targetSdkVersion', '26');
//App.setPreference('orientation', 'landscape');
App.accessRule('http://*');
App.accessRule('https://*');
App.accessRule('http://localhost');
App.accessRule('http://*.timerz.net');
App.accessRule('https://*.timerz.net');
App.accessRule('http://meteor.local');
App.accessRule('https://meteor.local');
App.accessRule('http://*.google-analytics.com');
App.accessRule('https://*.google-analytics.com');
App.accessRule('http://*.facebook.net');
App.accessRule('https://*.facebook.net');
App.accessRule("http://*.google.com");
App.accessRule("https://*.google.com");
App.accessRule("http://*.kadira.io");
App.accessRule("https://*.kadira.io");
App.accessRule("http://*.cloudinary.com");
App.accessRule("https://*.cloudinary.com");
App.accessRule("http://*.segment.io");
App.accessRule("https://*.segment.io");
App.accessRule("http://*.mixpanel.com");
App.accessRule("https://*.mixpanel.com");

