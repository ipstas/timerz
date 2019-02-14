#!/bin/bash

ENV=$1

cp .deploy/mobile-config-dev.js mobile-config.js 
export METEOR_PACKAGE_DIRS=/srv/www/meteor/Packages/
export ROOT_URL=https://dev.timerz.net
export MOBILE_SERVER=$ROOT_URL:443
echo settings: $ROOT_URL $MOBILE_SERVER

#echo export const code_version = \"`git rev-parse --verify HEAD`\" > imports/startup/both/code_version.js
#meteor run android-device -p 3008 --settings settings.json --mobile-server=$MOBILE_SERVER
meteor run $ENV -p 3016 --settings settings.json --mobile-server=$MOBILE_SERVER --verbose  #--allow-incompatible-update
#/srv/www/meteor/orangry/.meteor/local/cordova-build/platforms/android/cordova/run --device
