# Lane A — Response

A touch that gets no answer feels like a miss. People press again, and the app does the thing twice or not at all. Feedback has to land on the frame the finger does, and a wait has to say it is a wait.

## A1. Every control answers on press-in — BLOCKER when a primary action is silent, SHOULD FIX otherwise

The press state belongs to finger-down. The action belongs to release, because pressing and sliding off is how people cancel.

**Probe:** press and hold each kind of control (primary and secondary buttons, icon buttons, rows, chips, tabs, cards). Take a screenshot while held and compare it with the resting state.

A recording at 30 frames per second with a touch marker over the control cannot show whether the answer landed on the same frame; judge that it is present and distinct, and confirm from code that it is bound to press-in.

**Passes when:** something visibly changes while held, and the held look differs from the resting look for every variant, including disabled-looking and tinted ones.

```
Does the project define a pressed style?
├── Yes → use it everywhere, through one shared pressable
└── No  → scale to 0.97 (never below 0.95), 100–150ms ease-out in, ~150ms out. No colour change needed.
```

**Fix:** one pressable primitive that owns the feedback. A variant that "presses" to its own colour is the usual culprit.

## A2. Scrolling does not press — SHOULD FIX

A thumb that starts a scroll on a row is not choosing that row.

**Probe:** put a finger on a row or card inside a scroller and scroll.

**Passes when:** the row does not fire, and it does not flash a pressed state as the list moves. Rows wait about 100ms before showing pressed.

## A3. Work shows as work — BLOCKER when a submit can fire twice

**Probe:** tap every control that starts a request, then tap it again immediately. Repeat on a slow connection.

**Passes when:** one request goes out, and the control shows it is busy without changing size.

```
How long does the wait usually last?
├── Under ~150ms       → no indicator; update optimistically
├── 150ms to a second  → indicator appears after 150ms and stays at least 300ms once shown
└── Longer             → indicator at once, and progress or a way to cancel if it can run past a few seconds
```

A spinner that blinks for 50ms is worse than none.

## A4. Targets are large enough to hit — SHOULD FIX

**Probe:** read the frames of the smallest controls from the element tree (close buttons, icon buttons, chips, checkboxes).

**Passes when:** each touch area is at least 44pt on iOS and 48dp on Android, counting hit slop, and no two overlap.

## A5. Feedback you can feel sits on meaningful moments — POLISH

Haptics confirm a change of state. They fire on the same frame as the visual change, once per action, and never as the only feedback.

```
Did state change because of this touch?
├── Committed something (toggle, check, send, delete)   → light or medium impact
├── Picked something up, or opened a long-press menu     → selection or light impact
├── Crossed a snap point or a refresh threshold          → selection
└── Navigated, scrolled, or pressed a tab                → none
```

**Probe:** haptics cannot be recorded. Verify the code path and report it as not perceived.
