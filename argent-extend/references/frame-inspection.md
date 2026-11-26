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

## Measure instead of eyeballing

The scripts beside this skill read the clip with FFmpeg and print one line per frame or per change. Regions are fractions of the frame (`x0,y0,x1,y1`), times are seconds.

```sh
scripts/changes.py clip.mp4                             # intervals where frames differ: where to look
scripts/frames.sh clip.mp4 out 2.4 3.1 160              # every frame of an interval, out/sheet.png contact sheet, out/pts.txt timestamps
scripts/follow.py clip.mp4 2.5 6.2 0.91,0.22,0.97,0.25 x   # one feature's offset over time, along x or y
scripts/column.py clip.mp4 2.5 6.2 0.5                  # brightness boundaries along a vertical line, per frame
scripts/track.py clip.mp4 2.5 6.2 0.2,0.12,0.3,0.14     # mean brightness of a region; add `edge` for one clean edge
scripts/sheet.py clip.mp4 2.5 6.2                       # top edge of a bottom sheet and the dim of the page behind it
scripts/shift.py clip.mp4 2.5 6.2 0.0,0.05,1.0,0.20     # rough movement of a whole region between frames
```

- `follow.py` is dependable on a feature that is unique along the axis and stays on screen; run it on the touch marker too and compare. It misleads in two cases. A region that contains something static (a label over a moving pill) follows the static part. A plain or repeating region can match somewhere else with a low error. Low error is necessary, not sufficient: check one offset against a crop of that frame. A region as wide as the frame cannot move at all.
- `track.py` takes a final number to print only frames whose value moved by at least that much, which turns a long clip into a short list of changes.
- Two parts move as one when they change on the same frames from first to last.
- During a cross-fade, brightness and crops are ambiguous: everything is partly there. Compare the measured colour of a region with what it should be at that frame's opacity, with and without the element in question.
- A scroll-linked element is right when its movement stays in proportion to the content's. One frame that moves far more than its neighbours, while the touch marker did not, is a snap.
- Values are in clip pixels. Convert to points through the device's scale when reporting.

Worked example, a swipe between two pages held at two stops. The touch marker read −198 and −414 px at the stops and a feature on the page read −184 and −400 px: the page follows the finger, less the distance a drag needs to start. The tab indicator was first measured with `follow.py` on the tab row and read 0 at both stops, which looked like a failure. It was wrong: the indicator slides beneath labels that stay put, so the match followed the label. Brightness under the two neighbouring tabs with `track.py`, and a crop at each stop, showed the indicator moving with the page. Measure a second way before believing a failure.
