App.info({
	id: 'net.timerz.dev.loc',
	name: 'Timerz DEV',
	description: 'DEV Timerz, the best way to track time for tasks',
	author: 'xLazz Inc',
	email: 'info@xlazz.com',
	website: 'http://timerz.net',
	version: '0.0.6'
});

// App.icons({
  // 'iphone_2x': 'resources/icons/ios/Icon-120.png',
	// 'iphone_3x': 'resources/icons/ios/Icon@3x.png',
  // 'ipad': 'resources/icons/ios/Icon-76.png',
  // 'ipad_2x': 'resources/icons/ios/Icon-152.png',
	// 'ipad_pro': 'resources/icons/ios/Icon-167.png',
	// 'ios_settings': 'resources/icons/ios/Icon-29.png',
	// 'ios_settings_2x': 'resources/icons/ios/Icon-58.png',
	// 'ios_settings_3x': 'resources/icons/ios/Icon-87.png',
	// 'ios_spotlight': 'resources/icons/ios/Icon-40.png',
	// 'ios_spotlight_2x': 'resources/icons/ios/Icon-80.png',
  // 'android_mdpi': 'resources/icons/android/drawable-mdpi/appicon.png',
  // 'android_hdpi': 'resources/icons/android/drawable-hdpi/appicon.png',
  // 'android_xhdpi': 'resources/icons/android/drawable-xhdpi/appicon.png',
  // 'android_xxhdpi': 'resources/icons/android/drawable-xxhdpi/appicon.png',
  // 'android_xxxhdpi': 'resources/icons/android/drawable-xxxhdpi/appicon.png'
// });

// App.launchScreens({
  // 'iphone_2x': 'resources/splash/Default@2x.png',
  // 'iphone5': 'resources/splash/Default-568h@2x.png',
	// 'iphone6': 'resources/splash/Default-667h@2x.png',
	// 'iphone6p_portrait': 'resources/splash/Default-Portrait-736h@3x.png',
	// 'iphone6p_landscape': 'resources/splash/Default-Landscape-736h@3x.png',
	// 'ipad_portrait': 'resources/splash/Default-Portrait.png',
	// 'ipad_portrait_2x': 'resources/splash/Default-Portrait@2x.png',
  // 'android_mdpi_portrait': 'resources/splash/drawable-mdpi/splash.png',
  // 'android_hdpi_portrait': 'resources/splash/drawable-hdpi/splash.png',
  // 'android_xhdpi_portrait': 'resources/splash/drawable-xhdpi/splash.png',
  // 'android_xxhdpi_portrait': 'resources/splash/drawable-xxhdpi/splash.png'
// });

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
App.accessRule("http://*.kadira.io");
App.accessRule("https://*.kadira.io");
App.accessRule("http://*.cloudinary.com");
App.accessRule("https://*.cloudinary.com");
App.accessRule("http://*.segment.io");
App.accessRule("https://*.segment.io");
App.accessRule("http://*.mixpanel.com");
App.accessRule("https://*.mixpanel.com");

