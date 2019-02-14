App.info({
	id: 'net.timerz.www.loc',
	name: 'Timerz',
	description: 'Timerz, the best way to track time for tasks',
	author: 'xLazz Inc',
	email: 'info@xlazz.com',
	website: 'http://timerz.net',
	version: '0.0.7'
});

App.icons({
  'android-hdpi': 'assets/mipmap-hdpi/ic_launcher.png',
  'android-mdpi': 'assets/mipmap-mdpi/ic_launcher.png',
  'android-xhdpi': 'assets/mipmap-xhdpi/ic_launcher.png',
  'android-xxhdpi': 'assets/mipmap-xxhdpi/ic_launcher.png',
  'android-xxxhdpi': 'assets/mipmap-xxxhdpi/ic_launcher.png'
});

App.launchScreens({
  'android_mdpi_portrait': 'assets/screens/android/drawable-port-mdpi-screen.png',
  'android_hdpi_portrait': 'assets/screens/android/drawable-port-hdpi-screen.png',
  'android_xhdpi_portrait': 'assets/screens/android/drawable-port-xhdpi-screen.png',
  'android_xxhdpi_portrait': 'assets/screens/android/drawable-port-xxhdpi-screen.png'
  //'android_xxxhdpi_portrait': 'assets/screens/android/drawable-port-xxxhdpi-screen.png'
});

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

