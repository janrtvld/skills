---
name: argent-extend
description: Verify mobile UI transitions by replaying gestures with Argent and inspecting timestamped video frames. Use when testing or fixing flicker, layout shifts, keyboard and sheet transitions, scroll-linked motion, loading changes, or interrupted gestures on a phone, simulator, or emulator.
---

# Argent Extend

Use Argent to drive the interaction and a screen recording to see what happened between actions. Use `replicate` when the task also requires matching a design or an interactive reference.

## Define the check

Write down the starting state, action, expected intermediate behavior, and settled state. Include the return path or a cancellation when it matters. Use one short representative flow first. Compare on the same device with equivalent data, theme, build mode, and gesture timing. For a shared component, repeat the affected interaction on each target platform when available.

Example: with a draft and the keyboard open, tap Attach, then tap the composer to return to typing. The draft stays visible, the composer stays attached to the active panel, and neither panel leaves a blank gap during the handoff. Check both directions because they can fail differently. Type a short token on return and confirm it appears once after the original draft.

## Capture and replay

1. Drive the flow using the applicable Argent device tools. Reuse an existing replay if it exercises the reported timing. Otherwise use a short sequence with the needed tap, drag, hold, or reversal. Avoid inserting waits or accessibility queries between actions whose timing you are testing.
2. Use Argent screen recording where supported. For a physical iPhone without native Argent recording, use the [QuickTime capture procedure](references/quicktime-iphone.md). Start recording before the action, let the UI settle, and stop promptly. Confirm the clip contains the trigger and outcome. Use test data and follow the task's capture and retention constraints.
3. When fixing a defect, capture it before editing if reproducible. Replay under the same conditions after the fix. If an interactive design reference is available, use its observed behavior as the expectation. When the reference only shows endpoints, state the expected transition as an inference or an explicit product decision.

## Inspect and report

Review the clip at normal speed, then use [FFmpeg to inspect individual frames](references/frame-inspection.md) around the relevant moment. Include the state before the trigger, the suspect interval, and the settled state. For a brief flash or jump, inspect every captured frame in the interval. A recording can miss a single display refresh. For intermittent or very brief defects, replay several comparable cycles, inspect timestamp gaps near the trigger, and report occurrences per run count for each build. For a geometry claim, track a consistent edge in a crop and report its movement in pixels, or convert to logical units if the scale is known. Use the clip for visible behavior and a profiler for display frame rate or rendering performance.

Report the flow, device, build, observed behavior, verdict, and timestamps tied to the relevant clip or frames. A reproduced defect followed by a passing equivalent replay verifies the fix under those conditions. When the baseline does not reproduce, report whether the current build passes the stated check and say the before-and-after fix is unconfirmed. If the recording cannot show the relevant interval at the needed temporal detail, report the transition as inconclusive. Endpoint screenshots can still verify the endpoint states.
