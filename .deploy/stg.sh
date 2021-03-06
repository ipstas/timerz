#!/bin/bash
echo
echo

#DEBUG=mup*
#rm -rf /tmp/*-*-*-*-*; 

.deploy/version.sh
ls -l .meteor/local/build/programs/web.browser/app/app.js.map
cp .deploy/mobile-config-prod.js mobile-config.js

export SENTRY_ORG=orangry
ROLLBAR_TOKEN=`jq -r '.private.rollbar.post_server_item' settings.json`
export SENTRY_AUTH_TOKEN=`jq -r '.private.sentry.deploy_token' settings.json`
VERSION=$(sentry-cli releases propose-version)
ENVIRONMENT='stg'
LOCAL_USERNAME=`whoami`
ver=$(git describe --abbrev=0)
complete=$(git describe)
branch=$(git rev-parse --abbrev-ref HEAD)
commit=$(git rev-parse HEAD)
timestamp=$(git log -1 --date=short --pretty=format:%cd)

jq '.public.version.ver = "'$ver'"' settings.json > tmp.$$.json && mv tmp.$$.json settings.json
jq '.public.version.complete = "'$complete'"' settings.json > tmp.$$.json && mv tmp.$$.json settings.json
jq '.public.version.branch = "'$branch'"' settings.json > tmp.$$.json && mv tmp.$$.json settings.json
jq '.public.version.commit = "'$commit'"' settings.json > tmp.$$.json && mv tmp.$$.json settings.json
jq '.public.version.timestamp = "'$timestamp'"' settings.json > tmp.$$.json && mv tmp.$$.json settings.json
jq '.public.code_version = "'$commit'"' settings.json > tmp.$$.json && mv tmp.$$.json settings.json

# Create a release
sentry-cli releases new -p timerz $VERSION
# Associate commits with the release
sentry-cli releases set-commits --auto $VERSION

#DEBUG=mup* 
#mup deploy --config .deploy/mup-stg.js --settings settings.json --cached-build --verbose
mup deploy --config .deploy/mup-stg.js --settings settings.json 
EXIT=$?

echo "deploy status" $EXIT
if [ $EXIT != 0 ]
then
	echo deploy failed $ENVIRONMENT at `date`
	exit
fi

sentry-cli releases -o orangry -p hundredgraphs files $VERSION upload-sourcemaps .meteor/local/build/programs/web.browser/app/
sentry-cli releases finalize $VERSION
sentry-cli releases deploys $VERSION new -e $ENVIRONMENT

# curl https://api.rollbar.com/api/1/deploy/ \
   # -F access_token=$ROLLBAR_TOKEN \
   # -F environment=$ENVIRONMENT \
   # -F revision=$commit \
   # -F version=$commit \
   # -F local_username=$LOCAL_USERNAME

curl https://api.rollbar.com/api/1/sourcemap \
   -F access_token=$ROLLBAR_TOKEN \
   -F environment=$ENVIRONMENT \
   -F revision=$commit \
   -F version=$commit \
   -F minified_url=//stg.timerz.net/ \
   -F source_map=@'.meteor/local/build/programs/web.browser/app/app.js.map'

# curl https://sentry.io/api/hooks/release/builtin/5214345/179c7de64f484bc49f701fead9971a6e6173cea2effbaa78edeb759c4940821a/ \
  # -X POST \
  # -H 'Content-Type: application/json' \
  # -d '{"version": "'$commit'"}'
# sentry-cli --auth-token $SENTRY_TOKEN releases -o orangry -p hundredgraphs new $commit
# 
# sentry-cli --auth-token $SENTRY_TOKEN releases -o orangry -p hundredgraphs finalize $commit
   
#cp mobile-config-dev.txt mobile-config.js
echo
echo SUCCESS deployed $ENVIRONMENT at `date`
echo
echo
