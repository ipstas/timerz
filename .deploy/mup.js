module.exports = {
  servers: {
    one: {
      "host": "xlazz.com",
      "username": "root",
			//"password": "x08349"
      //"pem": '/srv/www/meteor/mup/mup_og_stage/id_rsa'
    }
  },

  meteor: {
		name: 'timersstg',
		path: '/srv/www/meteor/chesstimer',
    volumes: {
      '/localfiles':'/localfiles'
    },
		//port: '3020',
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: false, // skip building mobile apps, but still build the web.cordova architecture
      debug: true,
      cleanAfterBuild: true, // default
      //buildLocation: '/my/build/folder', // defaults to /tmp/<uuid>

      //set serverOnly: false if want to build mobile apps when deploying

      // Remove this property for mobileSettings to use your settings.json. (optional)

      server: 'http://www.xlazz.com', // your app url for mobile app access (optional)
      allowIncompatibleUpdates: false, //adds --allow-incompatible-updates arg to build command (optional)
    },
    env: {
			PORT: '8086',
      ROOT_URL: 'http://www.xlazz.com',
      MONGO_URL: 'mongodb://172.17.0.5/xlazz',
			MAIL_URL: 'smtp://172.17.0.1:25',
			//host should be set for sparkpostmail
			METEOR_ENV: 'staging'
    },
    docker: {
			image: 'abernix/meteord:base'
			//image: 'kadirahq/meteord',
			//image: 'ulexus/meteor:v1.4',
    },

    //dockerImage: 'kadirahq/meteord'
    deployCheckWaitTime: 100,
		enableUploadProgressBar: true
  },
	
/*   mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {}
    },
  }, */
};
