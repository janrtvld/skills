# Lane I — Stress

The development setup is the best case: a fast phone, a fast network, a seeded account, default settings. Users bring the other cases. Run this lane once per platform across the app's core flow.

## I1. Every data view has four states — BLOCKER when a first screen is blank

**Probe:** for each list, feed and detail view, see it loading, empty, failed and full. Use a new account for empty, and cut the network for failed.

**Passes when:** each state is designed, says what is going on, and the failed state offers a way to retry.

## I2. A slow or failing network is handled in the open — BLOCKER when work is lost

**Probe:** throttle the connection and use the core flow; cut it mid-action; restore it.

**Passes when:** waits are visible, an optimistic change that fails rolls back and says so, nothing the user typed is lost, and the app recovers without a restart.

## I3. Indicators keep moving while the app is busy — SHOULD FIX

**Probe:** record spinners and progress during heavy work (uploads, large lists rendering, first load).

**Passes when:** they animate smoothly. A spinner that stutters means it is driven from the thread doing the work.

## I4. Coming back from the background shows a current screen — SHOULD FIX

**Probe:** background the app for half a minute and for several minutes, mid-flow, then return.

**Passes when:** content is current, live updates resume, and no indicator is stuck.

## I5. The largest text size does not break layouts — SHOULD FIX

**Probe:** set the system text size to its maximum and walk the core flow.

**Passes when:** text is not clipped, controls stay reachable, and rows grow instead of overlapping. Where the design caps scaling, the cap is deliberate and documented.

## I6. Reduced motion is gentler, not broken — SHOULD FIX

**Probe:** turn on the system's reduce-motion setting and walk the core flow.

**Passes when:** movement is replaced by fades, feedback is still there, and nothing gets stuck waiting for an animation that no longer runs.

## I7. The slow phone holds up — SHOULD FIX

**Probe:** on the oldest device available, with a realistic amount of content, scroll long lists, open sheets and type.

**Passes when:** scrolling, gestures and typing stay responsive. Frame-rate claims need a profiler; a recording shows visible stutter only.

## I8. Rotation is decided — POLISH

**Probe:** rotate the phone on a main screen.

**Passes when:** the layout adapts, or rotation is locked on purpose.
