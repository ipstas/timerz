module.exports = {
  servers: {
    one: {
		"host": "xlazz.com",
		"username": "root",
		"pem": '~/.ssh/id_rsa_2018-2-12'
    }
  },

  // Formerly named 'meteor'. Configuration for deploying the app
  app: {
	name: 'timerz_stg',
	path: '/srv/www/meteor/timerz',
    // (optional, default is meteor) Plugins can provide additional types
    type: 'meteor',

    // lets you add docker volumes (optional). Can be used to
    // store files between app deploys and restarts.
	volumes: {
		'/localfiles':'/localfiles'
	},
	docker: {
		image: 'abernix/meteord:node-12-base',
		args: [
			'--link=mongodb:mongodb'
		],
		// (optional) It is set to true when using a docker image
		// that supports it. Builds a new docker image containing the
		// app's bundle and npm dependencies to start the app faster and
		// make deploys more reliable and easier to troubleshoot
		prepareBundle: true,
		// Additional docker build instructions, used during Prepare Bundle
		// buildInstructions: [
		// 'RUN apt-get update && apt-get install -y imagemagick'
		// ],
		// (optional, default is true) If true, the app is stopped during
		// Prepare Bundle to help prevent running out of memory when building
		// the docker image. Set to false to reduce downtime if your server has
		// enough memory or swap.
		stopAppDuringPrepareBundle: false,

		// lets you bind the docker container to a
		// specific network interface (optional)
		//bind: '127.0.0.1',

		// lets you add network connections to perform after run
		// (runs docker network connect <net name> for each network listed here)
		// networks: [
		// 'net1'
		// ]
    },

    // list of servers to deploy to, from the 'servers' list
    servers: {
		one: {}
    },

    // All options are optional.
    buildOptions: {
		// Set to true to skip building mobile apps
		// but still build the web.cordova architecture. (recommended)
		serverOnly: true,

		// Set to true to disable minification and bundling,
		// and include debugOnly packages
		debug: false,

		// defaults to a a folder in your tmp folder.
		//buildLocation: '/my/build/folder',

		// Remove this property for mobileSettings to use your settings.json
		// mobileSettings: {
		// yourMobileSetting: 'setting value'
		// },

		// your app url for mobile app access
		server: 'https://stg.timerz.net:443',

		// When true, adds --allow-incompatible-updates arg to build command
		allowIncompatibleUpdates: false,

		// Executable used to build the meteor project
		// You can set to a local repo path if needed
		executable: 'meteor'
    },
    env: {
		// If you are using SSL, this needs to start with https
		ROOT_URL: 'https://stg.timerz.net',
		PORT: 8087,
		// When using the built-in mongodb,
		// this is overwritten with the correct url
		MONGO_URL: 'mongodb://mongodb/timerz',
		MONGO_OPLOG_URL: "mongodb://mongodb/local",

		// The number of proxies in front of your server (optional, default is
		// 1 with reverse proxy, unused otherwise).
		// https://docs.meteor.com/api/connections.html
		HTTP_FORWARDED_COUNT: 1,
		MAIL_URL: 'smtp://172.17.0.1:25', //host should be set for sparkpostmail
		TZ:       "America/New_York",
		METEOR_ENV: 'production'
    },

    // Docker log options (optional)
    // log: {
      // driver: 'syslog',
      // opts: {
        // 'syslog-address': 'udp://syslogserverurl.com:1234'
      // }
    // },
    // The maximum number of seconds it will wait
    // for your app to successfully start (optional, default is 60)
    deployCheckWaitTime: 120,

    // lets you define which port to check after the deploy process, if it
    // differs from the meteor port you are serving
    // (like meteor behind a proxy/firewall) (optional)
    deployCheckPort: 80,

    // Shows progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    // (optional, default is false)
    enableUploadProgressBar: true
  },

   // (optional) Use built-in mongodb. Remove it to use a remote MongoDB
  // mongo: {
    // version: '4.4',
    // servers: {
      // one: {}
    // }
  // }
};
