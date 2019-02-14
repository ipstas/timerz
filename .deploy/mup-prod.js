module.exports = {
	servers: {
		one: {
			"host": "xlazz.com",
			"username": "root",
			"pem": '~/.ssh/id_rsa_2018-2-12'
		}
	},

	meteor: {
		name: 'timerz',
		path: '/srv/www/meteor/timerz',
		volumes: {
			'/localfiles':'/localfiles'
		},
		servers: {
			one: {}
		},
		buildOptions: {
			server: 'https://www.timerz.net:443', // your app url for mobile app access (optional)
			serverOnly: false, // skip building mobile apps, but still build the web.cordova architecture
			debug: false,
			cleanAfterBuild: true, // default
			allowIncompatibleUpdates: false //adds --allow-incompatible-updates arg to build command (optional)
		},
		env: {
			PORT: '8086',
			ROOT_URL: 'https://www.timerz.net',
			MONGO_URL: 'mongodb://mongodb/xlazzstg',
			MAIL_URL: 'smtp://172.17.0.1:25',
			//host should be set for sparkpostmail
			METEOR_ENV: 'prod'
		},
		docker: {
			//image: 'abernix/meteord:base',
			//image: 'abernix/meteord:node-8.9.1-base',
			image: 'zodern/meteor:root',
			args: [
				'--link=mongodb:mongodb'
			],

		},

		deployCheckWaitTime: 100,
		enableUploadProgressBar: true
	}
	
};
