# Driving a gesture and judging the recording

Lessons from running this loop on real phones. Each one prevented, or would have prevented, a false verdict.

## Before touching

Read what is under the finger before any hold, slow drag, fling or catch, and start on something inert: empty space, a heading, plain text. A hold on a row that calls, sends, deletes or pays does exactly that. On a full list the inert place is a gap between sections; a slow sideways drag that starts on a row can begin a reorder or a row action. If the only place to start is a live control, pick another screen for the check.

## Driving

- **Put a whole timed gesture in one call.** Separate calls add tool latency between actions and the timing under test is gone. Keep element-tree queries out of the timed part. Batching also saves context: each separate device call can return the whole element tree, a sequence returns it once.
- **A held gesture is one drag with stops.** About 500ms per leg and 600ms at each stop, at least two stops, with intermediate points interpolated so the finger moves smoothly. Reverse or release at the end.
- **A fling is a short, fast drag;** a catch is a second touch a fraction of a second later. A catch can also tap what is under the finger, so place it on something inert.
- **Record with touch markers on** where the recorder offers it. The marker is the only record of where the injected finger really was.
- **A cold start belongs inside the recording.** Start recording first, then force-stop and launch the app; a restart helper can return after the app has already drawn, and the launch is then missing from the clip.
- **Use the path the stop call returns.** The finished recording may not be at the path the start call printed.
- **Start recording before the action, let the screen settle, stop promptly.** Keep real time: turn off any trimming of still stretches when timing matters.

## Know your recorder

- An Android screen recording is typically 30 frames per second. It cannot show whether feedback landed on the same frame as the touch, and a one-frame flash can fall between frames. Claims finer than a frame are not verified by it.
- Markers and watermarks are drawn into the frames and can cover the control being pressed. Mask them, or choose regions that avoid them.
- An in-app iPhone recording writes frames only while the screen changes and leaves out the system status bar.

## Tool artefact or app defect

Injected touches can arrive in bursts. The content then jumps in one frame, which looks exactly like an app snapping at a threshold.

```
The content stepped in a single frame. Did the touch marker step in the same frame?
├── Yes → the tool delivered the touch late. Not a finding. Replay.
└── No, the marker moved smoothly across it → the app stepped. Finding.
```

Follow the marker and the content with the same script over the same frames and compare.

## Reading the clip

1. Watch it once at normal speed.
2. Run `changes.py` to list the intervals where frames differ. "Look at every frame" means every frame of those intervals.
3. Make a contact sheet of each interval with `frames.sh` and look at it.
4. Measure the claim: `follow.py` for one feature's position over time, `column.py` for boundaries along a line (a sheet's top against a keyboard's top), `track.py` for a region's brightness (a backdrop), `sheet.py` for a bottom sheet against its dim.

Choosing what to follow: a feature that is unique along the axis of movement and stays on screen for the whole interval. A match error near zero is firm; a line marked LOST means the offset is meaningless. `shift.py` compares whole regions and is confused by slow movement and repeating rows; use it for a quick look only.

## How much counts

- **Measure a failure a second way.** A different script, a crop, or the element tree. One measurement method can be wrong in a way that looks exactly like a defect.
- **Reproduce before reporting.** Replay every failure once more under the same conditions. A defect that does not come back is "seen once, not reproduced", not a finding.
- **Report counts.** "5 of 5 cold starts" or "2 of 3 runs" says how real it is.
- **A flash of one or two frames that repeats is a defect.** One that appeared once may be the recorder.
- **Two parts that should move together** are together when they start and stop within a frame or two of each other. A lag of several frames (100ms or more) is a defect.
- **Following the finger** means the followed feature stays within a few pixels of the marker's movement at every stop, allowing for the small distance a drag needs before it starts.

## When geometry is the claim

For "this control overlaps that one" or "the field clears the keyboard", read element frames from the accessibility tree. They are exact, cost nothing, and are better evidence than a screenshot.
