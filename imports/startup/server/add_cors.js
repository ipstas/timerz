// Enable cross origin requests for all endpoints
WebApp.rawConnectHandlers.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
	//console.log('[add_cors.js]', req, '\nres:', res, '\n\n');
  return next();
});

Meteor.startup(function() {
  console.log('Configuring content-security-policy:');
  BrowserPolicy.content.allowSameOriginForAll();
  BrowserPolicy.content.allowOriginForAll('http://meteor.local');
  BrowserPolicy.content.allowOriginForAll('http://localhost');
  BrowserPolicy.content.allowOriginForAll('http://*.timerz.net');
  BrowserPolicy.content.allowOriginForAll('https://*.timerz.net');
  BrowserPolicy.content.allowOriginForAll('https://cdnjs.cloudflare.com');
  BrowserPolicy.content.allowOriginForAll('https://connect.facebook.net');
  BrowserPolicy.content.allowOriginForAll('https://www.facebook.com');
  BrowserPolicy.content.allowOriginForAll('https://staticxx.facebook.com');
  BrowserPolicy.content.allowOriginForAll('https://*.fbsbx.com');
  BrowserPolicy.content.allowOriginForAll('https://*.googleusercontent.com');
  BrowserPolicy.content.allowOriginForAll('https://www.google-analytics.com');
  BrowserPolicy.content.allowOriginForAll('https://www.googletagmanager.com');
  BrowserPolicy.content.allowOriginForAll('https://*.googleapis.com');
  BrowserPolicy.content.allowOriginForAll('https://*.firebaseapp.com/');
  BrowserPolicy.content.allowOriginForAll('https://apis.google.com');
  BrowserPolicy.content.allowOriginForAll('https://*.gstatic.com');
  BrowserPolicy.content.allowOriginForAll('https://cdn.mxpnl.com');
  BrowserPolicy.content.allowOriginForAll('res.cloudinary.com');
  BrowserPolicy.content.allowEval();
  BrowserPolicy.framing.disallow();
});
	
/* WebApp.connectHandlers.use("/hello", function(req, res, next) {
  res.writeHead(200);
  res.end("Hello world from: " + Meteor.release);
});
	
Meteor.startup(() => {

}); */
