#!/bin/bash
# frames.sh <clip.mov> <outdir> [start_s end_s] [width]
#   every decoded frame in the interval -> outdir/NNNN.png (+ outdir/pts.txt: "index pts_time"), then
#   outdir/sheet.png = contact sheet of the interval (8 columns, labelled with pts_time).
CLIP=$1; OUT=$2; S=${3:-0}; E=${4:-9999}; W=${5:-200}
rm -rf "$OUT"; mkdir -p "$OUT"
ffmpeg -hide_banner -nostdin -i "$CLIP" -map 0:v:0 -an \
  -vf "setpts=PTS-STARTPTS,trim=start=$S:end=$E,showinfo,scale=$W:-1" -fps_mode passthrough -start_number 0 "$OUT/%04d.png" 2> "$OUT/showinfo.log"
grep -o "n: *[0-9]* .*pts_time:[0-9.]*" "$OUT/showinfo.log" | sed -E 's/n: *([0-9]+) .*pts_time:([0-9.]+)/\1 \2/' > "$OUT/pts.txt"
N=$(wc -l < "$OUT/pts.txt"); echo "$N frames, $(head -1 "$OUT/pts.txt" | cut -d' ' -f2)s .. $(tail -1 "$OUT/pts.txt" | cut -d' ' -f2)s"
# contact sheet, row-major, 8 per row, index = row*8+col (pts in pts.txt; no drawtext: not every ffmpeg build has it)
ffmpeg -hide_banner -nostdin -v error -y -i "$OUT/%04d.png" -start_number 0 -vf "tile=8x$(( (N+7)/8 ))" -frames:v 1 "$OUT/sheet.png"
