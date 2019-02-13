#!/bin/bash
echo
echo
echo deployment started $ENVIRONMENTS at `date`

DEBUG=mup*

rm -rf /tmp/*-*-*-*-*; 
REVISION=`git log -n 1 --pretty=format:"%H"`

#cd ../mup/mup_virgo_stage/
mup deploy --config .deploy/mup.js --settings settings.json --cached-build

EXIT=$?

echo "deploy status" $EXIT
 
if [ $EXIT != 0 ]
then
	echo "deploy failed!"
	exit
fi

ACCESS_TOKEN="5a15e56b058e44a79baf90f96142f410"
ENVIRONMENT='stg'
LOCAL_USERNAME=`whoami`
VERSION=`git describe --tags`
#REVISION=`git --git-dir=.git  rev-parse master`
REVISION=`git log -n 1 --pretty=format:"%H"`

curl https://api.rollbar.com/api/1/deploy/ \
  -F access_token=$ACCESS_TOKEN \
  -F environment=$ENVIRONMENT \
  -F revision=$VERSION \
  -F local_username=$LOCAL_USERNAME

.meteor/local/build/programs/web.browser/app/app.js.map

curl https://api.rollbar.com/api/1/sourcemap \
  -F access_token=$ACCESS_TOKEN \
  -F version=$REVISION \
  -F minified_url=https://timers.xlazz.com/app/app.js \
  -F source_map=@.meteor/local/build/programs/web.browser/app/app.js.map

echo SUCCESS deployed $ENVIRONMENTS at `date`
echo
echo
