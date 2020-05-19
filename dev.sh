#!/bin/bash

for i in "$@"
do
	case $i in
		--extra=visual*)
		PKGS='--extra-packages bundle-visualizer --production'
		shift # past argument=value
		;;
		--env=prod*)
		ENV='--production'
		shift # past argument=value
		;;
		--device=android*)
		DEVICE='android-device'
		shift # past argument=value
		;;
		--default)
		DEFAULT=YES
		shift # past argument with no value
		;;
		*)
			  # unknown option
		;;
	esac
done

echo export const code_version = \"`git rev-parse --verify HEAD`\" > imports/startup/both/code_version.js

#cp .deploy/mobile-config-dev.js mobile-config.js

export METEOR_PACKAGE_DIRS=/srv/www/meteor/Packages/
export ROOT_URL='https://dev.hundredgraphs.com'
#export MOBILE_SERVER=$ROOT_URL:443
export MOBILE_SERVER=$ROOT_URL
export MAIL_URL="smtp://postmaster@mg.hundredgraphs.com:878c9c4e6e04bd01cf5308dc30a7de83-985b58f4-a86e6fbf@smtp.mailgun.org:587",

SET="$PKGS $ENV $DEVICE -p 3016 --settings settings.json --mobile-server=$MOBILE_SERVER --verbose"

echo settings: $SET

#rm -rf .meteor/local/cordova-build/

#MONGO_URL=mongodb://hguser:senkywenki@localhost:27018/hundredgraphs meteor run $SET
MONGO_URL=mongodb://node0:27017/timerz meteor run $SET
#meteor run $SET
