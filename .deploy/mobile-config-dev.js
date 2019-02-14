App.info({
	id: 'net.timerz.dev.loc',
	name: 'Timerz DEV',
	description: 'DEV Timerz, the best way to track time for tasks',
	author: 'xLazz Inc',
	email: 'info@xlazz.com',
	website: 'http://timerz.net',
	version: '0.0.8'
});

App.icons({
  'android_hdpi': 'private/android/mipmap-hdpi/ic_launcher.png',
  'android_mdpi': 'private/android/mipmap-mdpi/ic_launcher.png',
  'android_ldpi': 'private/android/mipmap-ldpi/ic_launcher.png',
  'android_xhdpi': 'private/android/mipmap-xhdpi/ic_launcher.png',
  'android_xxhdpi': 'private/android/mipmap-xxhdpi/ic_launcher.png',
  'android_xxxhdpi': 'private/android/mipmap-xxxhdpi/ic_launcher.png'
});

App.launchScreens({
  'android_mdpi_portrait': 'resources/screens/android/drawable-port-mdpi-screen.png',
  'android_hdpi_portrait': 'resources/screens/android/drawable-port-hdpi-screen.png',
  'android_xhdpi_portrait': 'resources/screens/android/drawable-port-xhdpi-screen.png',
  'android_xxhdpi_portrait': 'resources/screens/android/drawable-port-xxhdpi-screen.png',
  'android_xxxhdpi_portrait': 'resources/screens/android/drawable-port-xxxhdpi-screen.png'
});

App.setPreference('deployment-target', '7.0');
App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');
App.setPreference('android-minSdkVersion', '19');
App.setPreference('android-targetSdkVersion', '26');
//App.setPreference('orientation', 'landscape');
App.accessRule("*");
App.accessRule('http://*');
App.accessRule('https://*');
App.accessRule('http://localhost');
App.accessRule('https://localhost');
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
App.accessRule("http://*.cloudinary.com");
App.accessRule("https://*.cloudinary.com");
App.accessRule("http://*.segment.io");
App.accessRule("https://*.segment.io");
App.accessRule("http://*.mixpanel.com");
App.accessRule("https://*.mixpanel.com");

