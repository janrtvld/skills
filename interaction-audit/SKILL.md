---
name: interaction-audit
description: "Audit how a mobile app feels in the hand, on a real phone, and fix what makes it feel unfinished. Sweeps nine lanes a design file and a screenshot cannot show: response to touch, motion that follows the finger, layout stability, parts that move together, screen edges and system bars, keyboard and focus, platform behaviour, small-detail precision, and behaviour under stress. Use after building or changing screens in a React Native, Expo or native app, before calling UI work done or showing it to anyone, and when the feedback is \"it works but feels off\". Works from a design alone; needs no reference app. Triggers on: interaction audit, feel, feels off, feels cheap, janky, jumpy, polish pass, device QA, before review, layout shift, flicker, snap, collapsing header, bottom sheet, keyboard covers input, status bar, overscroll, safe area, press feedback, swipe between tabs, back gesture, release build."
---

# Interaction Audit

An audit skill. It does one thing: put a mobile app in a real hand before a person does, find what makes it feel unfinished, and fix it.

A design file shows one state per screen. A screenshot proves one frame. What makes an app feel cheap lives between frames and at the edges: a header that snaps past a threshold, a sheet that shrinks for a spinner, a keyboard that covers the comment just typed, a white band behind a bounce. Every one of those passes a static check, and static checks are what an agent reaches for by default.

| Lane | File | What it catches |
| --- | --- | --- |
| A. Response | [response.md](response.md) | Touches with no answer, waits with no sign of work |
| B. Follow | [follow.md](follow.md) | Motion triggered by thresholds instead of driven by the finger |
| C. Stability | [stability.md](stability.md) | Things that move, resize or flash without the user causing it |
| D. Together | [together.md](together.md) | Parts of one change running on separate timelines |
| E. Edges | [edges.md](edges.md) | System bars, safe areas and overscroll that look unowned |
| F. Focus | [focus.md](focus.md) | The keyboard, and losing what the user was doing |
| G. Platform | [platform.md](platform.md) | Gestures and system surfaces that do not behave like the phone |
| H. Precision | [precision.md](precision.md) | Off-centre labels, clipped text, inconsistent parts |
| I. Stress | [stress.md](stress.md) | Slow network, interruptions, large text, slow hardware |

Each lane file is a short catalog of checks: why it matters, how to probe it on the device, when it passes, and the direction of the fix. Load a lane file when you sweep that lane. Recording, driving held gestures, reading frames and telling a tool artefact from an app defect are the job of `argent-extend`: load it before the first motion check. Matching a design's pixels is `replicate`.

## Operating posture

You are a design engineer doing the pass nobody asked for, the one that decides whether the owner's first five minutes with the app go well. Assume the happy path works and the screens match the design. Assume nothing about what happens while a finger is moving, while data is arriving, or while the keyboard is up, because nobody has looked.

Three failure modes, worst first:

1. **Passing motion from a still.** A screenshot before and a screenshot after says nothing about the frames between. A lane B, C or D check passed from stills is not passed.
2. **Auditing the wrong build.** A development build is slower, mounts things at different moments and draws its own chrome. A simulator has no real keyboard, audio or thermal limits. Both hide real defects and invent false ones.
3. **Fixing the screen instead of the part.** The defect seen on one screen lives in the header, sheet, list or input that twenty screens share. A local patch leaves nineteen copies.

## Hard rules

1. **Release build, physical phone, slowest device first.** Anything else is a lead. Name the build type and device beside every verdict.
2. **Evidence matches the claim.**

   | Claim | Evidence |
   | --- | --- |
   | A resting state | One screenshot |
   | Position follows the finger | The gesture stopped at three or more points of its travel, or recorded frames |
   | A transition, flash, jump or resize | Recorded frames across the whole interval, every frame looked at |
   | Two things overlap, or one clears another | Element frames from the accessibility tree |
   | Sound, haptics | The code path, stated as not perceived |

3. **A verdict per check: pass, fail, not applicable, not verified.** Not verified names what was missing. Never round it up. Replay every fail once before reporting it and state how often it occurred (3 of 3). Seen once and not reproduced is not verified.
4. **Every lane, every time.** A lane skipped for budget is listed as not run in the first line of the report.
5. **Shared parts first.** Audit each shared interactive part once before sweeping screens. When one fails, check every place it is used.
6. **Look before you touch.** Before any hold, slow drag, fling or catch, read what is under the finger and start on something inert. Never rest on a control that calls, sends, deletes or pays. Use test data, and leave real data unchanged.
7. **Fix causes.** The fix goes into the shared part or the shared rule. After it, replay the same probe under the same conditions.
8. **Remove what cannot be made right.** A header that stays put beats one that collapses badly. Say that it was removed.
9. **Defects, not taste.** A finding names what the user sees and when. "The sheet could feel nicer" is not a finding. "The backdrop is fully dark four frames before the sheet starts to move" is.
10. **Use the project's motion values and components.** Extend its tokens and primitives; never add a parallel sheet, press handler or timing scale during an audit.
11. **Respect recorded decisions and the design.** If the project documents a deliberate choice, or the design itself draws what a check would fail, report it as a question for the owner. Do not fix it and do not count it as a fail.

## Workflow

### Phase 1 — Recon

- **Devices and builds:** what is connected, which build is installed, whether it is the commit under audit.
- **Shared parts:** header, tab bar, inner tabs, sheet, dialog, list, text input, button and pressable, toast, menu. Note which screens use which.
- **Screens:** every route, grouped by the parts it uses.
- **Conventions:** motion tokens, press primitive, keyboard library, sheet component, how the status bar is set.
- **Reach:** what the tools can drive on each phone and what they cannot (recording, lock button, notifications). Anything out of reach is reported as not verified, up front.

### Phase 2 — Shared parts

Run every lane that applies against each shared part, on one representative screen. Fix before going wider. Most findings end here.

### Phase 3 — Sweep

Walk every screen through the six questions below. Each "yes" points at a lane.

```
1. Can it be touched?                      → A. Response, H. Precision
2. Does anything move with a finger or a scroll?   → B. Follow
3. Does anything load, save or change by itself?   → C. Stability
4. Do two things change at once?           → D. Together
5. Does it scroll, or reach a screen edge? → E. Edges
6. Can the user type, or leave and return? → F. Focus, G. Platform
```

Run lane I once per platform across the app's core flow.

### Phase 4 — Vet and rank

Replay every finding once more before reporting it. Then walk this, top to bottom, and stop at the first yes:

```
Does it lose or hide the user's work, or block a core action?
├── Yes → BLOCKER
└── No
    Will a typical user of either platform see it in the first five minutes?
    ├── Yes → BLOCKER
    └── No
        Does it show only on one device model, one data state or one system setting?
        ├── Yes → SHOULD FIX
        └── No → POLISH
```

### Phase 5 — Fix and replay

Skip this phase when asked to audit only; report "nothing fixed".

Before editing anything, reproduce the finding yourself and measure it a second, independent way (a different script, a crop, the element tree). A finding that does not reproduce, or that the second measurement contradicts, is reported as such and nothing is changed. Defects can be intermittent: when the first replay is clean, replay at least three more times before calling it not reproduced, and report the rate.


Fix blockers, then should-fix items, in the shared part. Rebuild in release, replay the probe that failed, and replay it on the other platform; if that platform is not available, say so in the first line of the report. Confirm with a comparison of the two builds that the fix changed nothing else on screen. A fix that the replay shows did not work is reverted in the same session, and the finding stays open with what was learned. Batch fixes per release build, and look at the first build for neighbours of the fix before spending the next.

## Flag on sight

These are almost always wrong. No deliberation needed:

- A scroll handler that starts an animation when an offset crosses a number.
- A layout property (`height`, `width`, `top`, margins) animated, or animation state updated from JavaScript every frame.
- A keyboard listener paired with a timed animation.
- A fixed delay (`setTimeout`) used to line two animations up.
- A container whose size depends on whether its content has loaded.
- A pressable with no pressed style, or a pressed style equal to its resting style.
- A status-bar style set per screen component instead of in one place.
- A hand-written sheet, pager, drag list or zoom view where the project already has a library for it.
- A second sheet component.
- A spinner with no minimum display time.
- A text input whose value is controlled on every keystroke with no guard against dropped characters.

## Output format

Lead with the verdict. Do not bury the one thing that matters.

- **First line:** devices, builds, lanes run, lanes not run.
- **Verdict:** **Not ready**, **Ready with fixes applied**, or **Ready**. Not ready means a blocker remains.
- **Fixed:** what was wrong, the shared part it lived in, the commit, and the replay that confirmed it on each platform.
- **Open blockers and should-fix:** what the user sees, where, on which device and build, the evidence (clip and timestamps or frames), the suspected cause.
- **Not verified:** each check that could not be made and what it needs.
- **Polish:** short, clearly optional.

Be specific. "The header is jumpy" is weak. "On the Projects screen the header stays expanded until scroll offset 60, then collapses in one frame; held at offsets 20, 40 and 60 it shows the same geometry twice and then the final one" is a finding.

## What earns a pass

The app is ready when every touch answers on press, everything that moves with a finger tracks it, nothing shifts without cause, paired parts move as one, every edge looks intended, the keyboard never hides the user's work, the platform's gestures all work, small controls are exact, and none of that breaks on the slow phone, the slow network or the largest text. If the sweep finds nothing, say so plainly and list what was checked. Manufactured findings waste the reader's trust.
