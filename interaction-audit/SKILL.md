---
name: interaction-audit
description: Audit how a mobile app feels in use, on a real phone, against the principles that separate a finished interface from a working one - immediate response, motion that follows the hand, stable layout, parts that move as one, owned screen edges, focus kept in view, platform behaviour, exact small details, and grace under stress. Use after building or changing screens, before calling UI work done or showing it to anyone, and when the feedback is "it works but feels off". Works from a design alone; needs no reference app. Not for matching a design's pixels (use replicate) and not a code review.
---

# Interaction Audit

A design file shows one state per screen, and a screenshot proves one frame. What makes an app feel cheap happens between frames and at the edges: a header that snaps, a sheet that resizes, a keyboard that covers what was just typed. Those defects pass every static check. This audit looks for them on purpose, before the owner finds them.

The audit is a set of principles, each with the questions to ask and the usual ways it breaks. Apply the principles to whatever the app has. They are not a checklist of components.

## How to audit

**Use the build users get, on a phone.** Audit a release build on a physical device, the slowest one available first. Development builds run slower, draw their own chrome and hide system-bar and timing defects. Simulators invent keyboard and audio behaviour. A finding from either is a lead, not a verdict.

**Match the evidence to the claim.** A still image proves a settled state and nothing else.

| Claim | Evidence |
|---|---|
| A resting state: colour, alignment, wording | One screenshot |
| Something follows the finger | The gesture held at several points along its travel, or recorded frames |
| A transition, flash, jump or resize | Recorded frames across the whole interval, each one looked at |
| Sound or haptics | The code path, with a note that it was not perceived |

Use `argent-extend` to record and read frames.

**Start with what is shared.** List the app's shared interactive parts (header, tab row, sheet, list, text input, button, toast, menu) and audit each on one screen first. Most defects live there, and a fix there fixes every screen. Then sweep the screens. When something fails, look for the same class of failure everywhere that part is used.

**Use four verdicts:** pass, fail, not applicable, not verified. Not verified names what was missing. Never round it up to pass.

**Fix causes, and remove what cannot be made right.** A static header is better than one that collapses badly.

## The principles

### 1. It answers immediately

Every touch gets a visible answer on the same frame the finger lands, and every wait is acknowledged.

- Press each kind of control and hold. Something changes on press-in, and the pressed look differs from the resting look.
- Tap things that start work. Nothing can be triggered twice, and anything slower than a moment shows that it is working.
- Scroll with a finger resting on a row. The row does not fire.

*Breaks as:* controls that react only on release, variants whose pressed colour equals their resting colour, spinners that flash for an instant, dead time after a tap.

### 2. Motion follows the hand

Anything the user drags or scrolls is positioned by where the finger is, not triggered when the finger crosses a line. Animations can be caught and reversed.

- Move slowly and stop partway: a collapsing header, a sheet, a page between tabs, a swiped row. At each stopping point the element is where the finger put it.
- Fling it, then catch it mid-flight. It continues from where it is.
- Release with speed. The speed carries into the settle.

*Breaks as:* a header that jumps when scroll passes a threshold, an indicator that moves only after the swipe ends, a sheet that ignores the finger until release, an animation that must finish before input counts.

### 3. Nothing moves without a cause

What is on screen stays where it is unless the user moved it. Content arriving, loading finishing and state saving do not shift, resize or flash anything.

- Open each screen cold and warm, recorded. What was drawn first is still in the same place when data lands.
- Watch containers that load. They hold one size through loading and after.
- Complete an action that changes a list: send, reorder, tick. No frame shows the old state again, and nothing flickers when the server confirms.

*Breaks as:* a title that appears late and pushes its neighbours, a sheet that shrinks for a spinner and grows back, a dropped item that jumps home before settling, elements that animate in on load for no reason.

### 4. Parts that belong together move together

Two things the eye reads as one change share one timeline: a sheet and its backdrop, content and the keyboard under it, a page and its tab indicator, a panel that replaces another.

- Record the open and the close. Both parts start, travel and stop together.
- Swap one bottom panel for another, in both directions. There is no gap and no double movement.

*Breaks as:* a backdrop that darkens before the sheet moves, content that jumps after the keyboard has finished, a blank band during a handoff, fixed delays that only line up on a fast phone.

### 5. The app owns the whole screen

Status bar, home indicator, navigation bar, the space behind a bounce and the area around the keyboard all look intended, on every screen and inside every overlay.

- Look at the top of every screen and overlay. System icons are readable against what is behind them.
- Pull past the top and push past the bottom. What shows continues the surface it adjoins.
- Scroll to both ends. Nothing is cut off by an inset or hidden under a system area.
- Scroll short and empty content. It does not behave like a long page.

*Breaks as:* dark icons on a dark header, a white or black band on overscroll, content under the notch, a control sitting in the system navigation area, a bar style that is wrong inside a modal.

### 6. What the user is doing stays in view

The field being typed in, the thing just sent and the place the user was reading remain visible and stay put.

- Focus every text input. It sits clear of the keyboard with breathing room, on each keyboard height the platform has.
- Submit something. The result is visible without scrolling.
- Leave a screen and come back, switch tabs and return. Position and state are where they were.
- Type fast. Every character arrives.

*Breaks as:* a keyboard touching or covering the field, a new comment hidden behind the keyboard, a list that loses its place, a "jump to latest" prompt after the user's own message, dropped keystrokes.

### 7. It behaves like the platform

Gestures and system features people already know work the way they do everywhere else on that phone.

- Try the platform's way back from every screen and with every overlay open. It closes one layer at a time.
- Swipe where pages sit side by side. Pull where a list can refresh.
- Check pickers, sharing, calls and permissions use the system's own surfaces unless the product decided otherwise.
- Feel for haptics on commits, toggles and pick-ups, and their absence on scrolling and plain navigation.

*Breaks as:* a custom header that kills the back swipe, tabs above content that cannot be swiped, a hand-drawn picker where the system one is expected, a back button that closes two things or none.

### 8. Small things are exact

Text sits in the optical centre of its container, nothing is clipped, and the same part looks the same wherever it appears.

- Zoom into pills, tabs, badges, buttons and input placeholders.
- Feed the shortest and longest realistic content. Lines that should stay single stay single; nothing is cut off; truncation is deliberate.
- Compare the same component across screens: radius, padding, pressed state.
- Check small targets are large enough to hit and do not overlap.

*Breaks as:* a label one pixel low, a clipped ascender, a timestamp wrapping onto its own line, a row of tabs cut at the edge, two sheets with different corners.

### 9. It holds under stress

The app keeps its composure when conditions are not ideal.

- Slow and failing network: every screen has loading, empty and error states, and optimistic changes roll back visibly.
- Interruptions: background the app mid-flow, rotate once, take a call, come back.
- System settings: largest text size, reduced motion.
- The slowest phone, with real amounts of content.

*Breaks as:* an endless spinner, a stale screen after returning, a layout that collapses at large text, motion that stutters on older hardware.

## Sensible defaults

Use the project's own values when it has them. Otherwise:

- **Press feedback:** scale to about 0.97, within 100 to 150 ms, from one shared primitive.
- **Durations:** small changes 150 to 250 ms, sheets and overlays 200 to 300 ms, nothing in the interface longer than 400 ms. Exits a little faster than entrances. Frequent actions get less animation, not more.
- **Easing:** ease-out for things arriving, never ease-in. Springs without bounce, except where a gesture carried momentum.
- **Waiting:** show an indicator after about 150 ms, keep it at least 300 ms once shown.
- **Touch targets:** 44 points on iOS, 48 dp on Android.
- **Threads:** scroll- and gesture-linked motion runs off the main JavaScript thread and animates transform and opacity only.

## Report

Lead with what fails, most severe first. For each: the principle, where it shows, what happens, the device and build, the evidence, and the shared part it traces to. Then what was not verified and why, what was fixed during the audit and how it was re-checked, and which principles or platforms were not covered. An audit that looked at one platform or skipped a principle says so in its first line.
