# Lane F — Focus

The user is always doing one thing: typing in this field, reading this message, looking at what they just sent. The app's job is to keep that one thing visible and where they left it. The keyboard is the usual way to lose it.

Keyboard checks need hardware. A simulator's keyboard has a different height and timing.

## F1. The keyboard never touches or covers the active field — BLOCKER

**Probe:** focus every text input in the app, including ones inside sheets, at the bottom of long forms and inline in lists.

**Passes when:** the field and the controls that belong to it (send, attach, done) sit fully above the keyboard with a visible gap.

```
How big is the gap?
├── The design states it → that value
└── It does not         → 8pt above the keyboard, the same on every input
```

Repeat on Android with the suggestion strip on, and with a taller keyboard layout (emoji or password). Keyboard height is not a constant.

## F2. Content rides the keyboard frame by frame — SHOULD FIX

**Probe:** record opening and closing the keyboard on a chat, a comment thread and a form.

**Passes when:** content moves with the keyboard on every frame, with no jump at the start or the end, and never slides over or under the header.

**Fix:** a keyboard-tracking library that exposes the keyboard's own progress. A keyboard event plus a timed animation starts late and guesses the curve.

## F3. What was just submitted is visible — BLOCKER

**Probe:** with the keyboard up, send a message, post a comment, add an inline item.

**Passes when:** the new item is on screen above the keyboard without scrolling.

## F4. Every keystroke arrives — BLOCKER

**Probe:** type a long string quickly into each kind of input (automation: one string, no delays), then read the field's value back.

**Passes when:** the value equals what was typed, in order.

**Fix:** do not round-trip every keystroke through state that re-renders the input. Keep the native field as the source of truth while typing.

## F5. Focus is not stolen or dropped — SHOULD FIX

**Probe:** with a field focused, tap the buttons beside it; open and close a picker; return from a sheet.

**Passes when:** the keyboard stays up unless the action is meant to dismiss it, and typing continues where it was.

## F6. Leaving and returning keeps the user's place — SHOULD FIX

**Probe:** scroll partway down, open a detail and come back; switch tabs and return; background the app and return.

**Passes when:** scroll position, selected sub-tab, open sections and unsent text are as they were left.

## F7. The right keyboard and return key — POLISH

**Probe:** focus email, number, phone, search and multi-line fields.

**Passes when:** each shows the matching keyboard and a return key that says what it does.
