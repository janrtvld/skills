#!/bin/sh
# Records a booted iOS simulator's screen at native resolution.
#
#   sh scripts/sim-record.sh start <udid> src/flow.mov   returns at once; recording runs in the background
#   sh scripts/sim-record.sh stop  src/flow.mov          finalizes the file
#
# start writes <file>.start: the wall-clock time in ms at which recording began.
# A tap sent at wall-clock time T lands near (T - start) / 1000 seconds into the file.
set -e
cmd=$1
now() { perl -MTime::HiRes=time -e 'printf "%d\n", time * 1000'; }

case "$cmd" in
  start)
    udid=$2; out=$3
    [ -n "$udid" ] && [ -n "$out" ] || { echo "usage: sim-record.sh start <udid> <out.mov>"; exit 1; }
    mkdir -p "$(dirname "$out")"
    rm -f "$out" "$out.start" "$out.pid" "$out.log"
    now > "$out.start"
    nohup xcrun simctl io "$udid" recordVideo --codec h264 --force "$out" > "$out.log" 2>&1 &
    echo $! > "$out.pid"
    for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
      grep -q "Recording started" "$out.log" 2>/dev/null && { echo "recording $out (start $(cat "$out.start"))"; exit 0; }
      kill -0 "$(cat "$out.pid")" 2>/dev/null || { cat "$out.log"; exit 1; }
      perl -e 'select(undef, undef, undef, 0.25)'
    done
    echo "recording did not start"; cat "$out.log"; exit 1
    ;;
  stop)
    out=$2
    pid=$(cat "$out.pid")
    kill -INT "$pid"
    while kill -0 "$pid" 2>/dev/null; do perl -e 'select(undef, undef, undef, 0.2)'; done
    rm -f "$out.pid"
    ls -l "$out"
    ;;
  *)
    echo "usage: sim-record.sh start <udid> <out.mov> | stop <out.mov>"; exit 1
    ;;
esac
