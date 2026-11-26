# Lane D — Together

Some changes have two moving parts: a sheet and the dim behind it, content and the keyboard under it, a page and its indicator, one panel replacing another. The eye reads each pair as one event. When the parts run on separate clocks, the seam shows.

Record every probe. Look at the first and last five frames in particular; drift shows at the ends.

## D1. One progress value drives both parts — BLOCKER for sheets and overlays

**Probe:** record opening and closing each sheet, dialog, drawer and menu, by tap and by drag.

**Passes when:** both parts start on the same frame, travel in proportion and stop on the same frame, in both directions.

```
Which part is the leader?
├── A gesture or a single animation → derive the other from the same value
│   (dim opacity = progress, not a second animation with matching numbers)
└── The system (keyboard, navigation transition) → track the system's own progress frame by frame
```

Two animations given the same duration and curve still drift, because they start on different frames.

**Common fails:** the dim reaches full darkness before the sheet has moved; the sheet is gone while the dim is still fading; the dim pops in on the first frame.

## D2. A replacement is a handoff, not a close and an open — SHOULD FIX

**Probe:** record swapping one bottom panel for another (keyboard to a picker panel and back, one sheet to another), in both directions.

**Passes when:** whatever sits above the panels stays attached throughout; there is no empty band between them and no double movement.

Each direction fails differently. Check both.

## D3. Sequences wait for completion, not for a timer — SHOULD FIX

**Probe:** on the slowest phone, record flows where one surface closes and another opens (sheet to dialog, picker to camera, modal to modal).

**Passes when:** the second surface starts after the first has finished, on every device.

**Fix:** chain on the completion event. A fixed delay that works on a fast phone overlaps or stalls on a slow one.

## D4. Layers stack in one order — SHOULD FIX

**Probe:** show a toast while a sheet is open; open a sheet from a modal screen; open a menu inside a sheet.

**Passes when:** each new layer appears above the one that opened it, and a toast is never hidden behind an overlay.

## D5. One layer closes at a time — SHOULD FIX

**Probe:** with several layers open, use the platform's back action and tap outside.

**Passes when:** only the topmost layer closes.
