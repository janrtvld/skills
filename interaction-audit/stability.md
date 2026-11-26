# Lane C — Stability

The eye tracks position. When something on screen moves and the user did not move it, they lose their place, and the app reads as unsure of itself. Data arriving, loading finishing and a server confirming are not reasons for anything to shift.

Record every probe in this lane. A shift lasts a few frames.

## C1. Arriving data fills space, it does not make space — BLOCKER on first screens

**Probe:** record opening each data screen in three conditions: the app cold (after a force-quit), the screen cold (first visit since launch), and warm (a return visit). Each can fail alone. Compare the first frame that shows the screen with the settled frame.

**Passes when:** everything drawn in the first frame is in the same place in the last.

```
Does the screen already know the value? (route params, list row it came from, cache)
├── Yes → render it on the first frame. A blank title that fills in later is a defect.
└── No
    Is the final size known?
    ├── Yes → reserve it (fixed box, skeleton of the same size)
    └── No  → place the unknown below or after everything stable, never above
```

## C2. Containers keep one size through loading — BLOCKER for sheets and dialogs

A sheet that shrinks to fit a spinner and grows back when content lands looks like a crash and a recovery.

**Probe:** record opening every sheet, dialog and expandable area whose content loads.

**Passes when:** the outer size is the same before, during and after loading.

**Fix:** fix the height before content loads, or load before presenting.

## C3. The user's own change never visibly un-happens — BLOCKER

**Probe:** record a send, a tick, a rename and a reorder, through to a second after the server responds.

**Passes when:** no frame after the gesture shows the old state, and nothing flickers when the confirmation lands.

```
What can overwrite the local state?
├── The echo of this client's own change   → ignore it, or apply it only if it differs from what is shown
├── A refetch started before the change     → discard its result for the changed item
└── A change from someone else              → apply it, without moving what the user is touching
```

## C4. Lists hold their position while they grow — SHOULD FIX

**Probe:** record content arriving above and below the visible area, and the user's own item being added.

**Passes when:** the visible content does not jump, the user's own new item is in view, and no "jump to latest" control appears because of it.

## C5. Nothing animates on arrival without a reason — SHOULD FIX

**Probe:** record entering each screen.

**Passes when:** resting elements are in place on the first frame. An indicator sliding to its home, a counter counting up, a list fading in row by row on every visit: each is motion with no cause.

## C6. Changing numbers do not jitter — POLISH

**Probe:** watch timers, counters and prices as they change.

**Passes when:** the surrounding layout does not move. Use tabular figures or a fixed-width box.

## C7. Pressed, selected and loading states do not change size — POLISH

**Probe:** compare a control at rest, pressed, selected and busy.

**Passes when:** its outer box is the same in all four. A weight change or a swapped label that reflows neighbours is a fail.
