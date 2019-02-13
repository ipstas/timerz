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
  BrowserPolicy.content.allowEval();
  BrowserPolicy.framing.disallow();
});
	
/* WebApp.connectHandlers.use("/hello", function(req, res, next) {
  res.writeHead(200);
  res.end("Hello world from: " + Meteor.release);
});
	
Meteor.startup(() => {

}); */
