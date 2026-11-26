#!/bin/bash
# In-app screen recorder (needs no Mac permission). See references/in-app-recorder-iphone.md.
#   iphone-capture.sh start [seconds]   ask the app to start recording (default 60 s); then accept the system consent alert
#   iphone-capture.sh stop              finish early
#   iphone-capture.sh pull <dest.mov>   copy Documents/capture.mov (+ capture.log) from the phone
DEV=${CAPTURE_DEVICE:?set CAPTURE_DEVICE to the iPhone udid}
BID=${CAPTURE_BUNDLE_ID:?set CAPTURE_BUNDLE_ID to the app bundle id}
TMP=$(mktemp -d)
case "$1" in
  start) echo "${2:-60}" > "$TMP/capture.start"
         xcrun devicectl device copy to --device $DEV --domain-type appDataContainer --domain-identifier $BID \
           --source "$TMP/capture.start" --destination Documents/capture.start >/dev/null ;;
  stop)  echo 1 > "$TMP/capture.stop"
         xcrun devicectl device copy to --device $DEV --domain-type appDataContainer --domain-identifier $BID \
           --source "$TMP/capture.stop" --destination Documents/capture.stop >/dev/null ;;
  pull)  xcrun devicectl device copy from --device $DEV --domain-type appDataContainer --domain-identifier $BID \
           --source Documents/capture.mov --destination "$2" >/dev/null
         xcrun devicectl device copy from --device $DEV --domain-type appDataContainer --domain-identifier $BID \
           --source Documents/capture.log --destination "${2%.mov}.log" >/dev/null; tail -3 "${2%.mov}.log" ;;
  *) echo "usage: $0 start [s] | stop | pull dest.mov"; exit 1 ;;
esac
rm -rf "$TMP"
