#!/bin/bash
echo
echo
echo deployment started $ENVIRONMENTS at `date`
.deploy/version.sh

DEBUG=mup*

rm -rf /tmp/*-*-*-*-*; 


ls -l .meteor/local/build/programs/web.browser/app/app.js.map
cp .deploy/mobile-config-prod.js mobile-config.js
echo export const code_version = \"`git rev-parse --verify HEAD`\" > imports/startup/both/code_version.js
DEBUG=mup* mup deploy --config .deploy/mup-prod.js --settings settings.json --cached-build --verbose

EXIT=$?

echo "deploy status" $EXIT
 
if [ $EXIT != 0 ]
then
	echo "deploy failed!"
	exit
fi

ENVIRONMENT='prod'
# ACCESS_TOKEN='39492888a00a41ce9473e566797fda3d'

LOCAL_USERNAME=`whoami`
VERSION=`git --git-dir=.git  rev-parse master`
REVISION=`git log -n 1 --pretty=format:"%H"`

# curl https://api.rollbar.com/api/1/deploy/ \
  # -F access_token=$ACCESS_TOKEN \
  # -F environment=$ENVIRONMENT \
  # -F revision=$REVISION \
  # -F local_username=$LOCAL_USERNAME

# curl https://api.rollbar.com/api/1/sourcemap \
  # -F access_token=$ACCESS_TOKEN \
  # -F version=$VERSION \
  # -F source_map=@.meteor/local/build/programs/web.browser/app/app.js.map \
  # -F minified_url=https://stg.graffitiover.com/app/app.js

#cp mobile-config-dev.txt mobile-config.js

echo SUCCESS deployed $ENVIRONMENTS at `date`
echo
echo
