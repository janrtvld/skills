# Inspect a transition frame by frame

Review the recording once to locate the trigger and settle time. Work on a short interval around the issue. When comparing builds, align the intervals to the observed trigger in each clip instead of assuming both recordings began at the same time.

Use FFmpeg to extract every decoded frame in that interval. Replace the example times with seconds from the start of the video. Run in a scratch directory with a fresh output folder.

```sh
mkdir frames
ffmpeg -hide_banner -nostdin -i capture.mov -map 0:v:0 -an \
  -vf 'setpts=PTS-STARTPTS,trim=start=1.2:end=2.1,showinfo' \
  -fps_mode passthrough -start_number 0 frames/frame-%04d.png \
  2> frames/timestamps.log
```

The `showinfo` lines report the frame index `n` and seconds from the first video frame as `pts_time`. Index 0 corresponds to `frame-0000.png`. Use the timestamps for evidence; capture intervals may vary. If the sequence is long, view a few evenly spaced frames for orientation, then inspect all captured frames in the suspect interval so a short defect isn't skipped. Avoid interpolating frames.

For close inspection, add `crop=WIDTH:HEIGHT:X:Y` before `showinfo`, or crop the exported PNGs. Compare the same region and scale between captures. Keep enough surrounding content to tell whether the tested element moved, the viewport moved, or the gesture itself produced the expected motion.

[FFmpeg filter documentation](https://ffmpeg.org/ffmpeg-filters.html)
