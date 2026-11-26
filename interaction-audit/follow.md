# Lane B — Follow

When a finger moves something, that thing is the finger. The moment it lags, waits for a threshold or ignores a catch, it reads as a video playing near the hand instead of an object in it.

Every check here needs a held gesture or recorded frames. A still proves nothing in this lane. Injected touches can arrive in bursts: before calling a jump a defect, confirm in the same frames that the touch marker moved smoothly across it.

## B1. Scroll-linked motion is a function of scroll position — BLOCKER on main screens

A collapsing header, a fading title, a shrinking avatar: each is positioned by the current scroll offset, clamped at both ends. Nothing starts an animation when the offset crosses a number.

**Probe:** scroll slowly and stop at about a quarter, a half and three quarters of the element's travel. Capture each stop. Then record one slow continuous scroll through the range and one fast fling there and back.

**Passes when:** the element's geometry at each stop is in proportion to the offset; in the recording no single frame moves far more than its neighbours; after the fling it rests in the correct end state.

```
At the three stops, what does the element look like?
├── Three different, evenly spaced states      → pass
├── Same state twice, then the end state       → threshold. Fail.
└── Lags behind and catches up after release   → driven from the JavaScript thread. Fail.
```

**Fix:** derive the style from the scroll offset on the UI thread (an animated scroll handler and an interpolation, clamped). Animate transform and opacity, never height or top.

## B2. Dragged things track 1:1 and decide on release — BLOCKER for sheets and pagers

**Probe:** drag a sheet, a page between inner tabs, a swipeable row or a reorderable item slowly, and stop partway. Release from a short distance, from a long distance, and with a flick.

**Passes when:** the element sits under the finger at every stop, and the outcome on release follows both distance and speed.

```
On release:
├── Past the commit distance (about a quarter of the travel for a dismiss)   → commit
├── Short distance but fast in the commit direction                          → commit
├── Fast in the opposite direction                                           → cancel
└── Otherwise                                                                → return, no bounce
```

A decision on distance alone ignores flicks. A decision on speed alone commits on a twitch.

## B3. Indicators follow the gesture, not its result — SHOULD FIX

A tab indicator, a page dot, a progress edge that belongs to a swipe moves with the swipe.

**Probe:** swipe between pages slowly and stop halfway.

**Passes when:** the indicator is halfway too. Tapping a tab animates the indicator in about 250ms.

## B4. Motion can be caught and reversed — SHOULD FIX

**Probe:** start an open, a close or a page change, and grab or reverse it mid-flight. Tap a control while a transition is still running.

**Passes when:** the element continues from where it is, with no jump to an end state, and input during a transition is not swallowed.

## B5. Speed carries into the settle — POLISH

**Probe:** record a fast release and a slow one.

**Passes when:** the fast release reaches rest in clearly fewer frames than the slow one, and the first frames after release continue at about the finger's last speed instead of restarting from zero. Bounce appears only where the gesture had momentum, and stays small.

## B6. Limits give, they do not stop dead — POLISH

**Probe:** drag past the end of a range (a sheet above its top, a list past its first item).

**Passes when:** the element keeps following with increasing resistance and returns on release, or the platform's own overscroll does it.
