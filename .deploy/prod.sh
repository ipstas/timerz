#!/bin/bash
echo
echo

#.git/hooks/post-commit

DEBUG=mup*

rm -rf /tmp/*-*-*-*-*; 

.deploy/version.sh
ls -l .meteor/local/build/programs/web.browser/app/app.js.map
cp .deploy/mobile-config-prod.js mobile-config.js
DEBUG=mup* mup deploy --config .deploy/mup-prod.js --settings settings.json --cached-build --verbose

EXIT=$?

echo "deploy status" $EXIT
 
if [ $EXIT != 0 ]
then
	echo "deploy failed!"
	exit
fi

ACCESS_TOKEN='e6dd9721d83849b584d964ad76f818fb'
ENVIRONMENT='production'
LOCAL_USERNAME=`whoami`
REVISION=`git rev-parse --verify HEAD`
curl https://api.rollbar.com/api/1/deploy/ -F access_token=$ACCESS_TOKEN -F environment=$ENVIRONMENT -F revision=$REVISION -F local_username=$LOCAL_USERNAME

# curl https://api.rollbar.com/api/1/sourcemap \
  # -F access_token=$ACCESS_TOKEN \
  # -F version=$VERSION \
  # -F source_map=@.meteor/local/build/programs/web.browser/app/app.js.map \
  # -F minified_url=https://stg.graffitiover.com/app/app.js

#cp mobile-config-dev.txt mobile-config.js

echo SUCCESS deployed $ENVIRONMENTS at `date`
echo
echo
