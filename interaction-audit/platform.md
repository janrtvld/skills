# Lane G — Platform

People bring a decade of habits to every app: swipe from the edge to go back, pull to refresh, swipe between pages that sit side by side. An app that ignores one of them feels foreign, and no design file lists them, because designers assume them.

## G1. The platform's way back works everywhere — BLOCKER

**Probe:** on iOS, swipe from the left edge on every pushed screen, including ones with custom headers, horizontal scrollers and maps. On Android, press back on every screen and with each kind of overlay open.

**Passes when:** iOS goes back interactively, following the finger. Android closes one layer per press, in order: keyboard, then overlay, then screen.

**Common fails:** a custom header that disables the gesture; a horizontal pager that swallows it; back closing the screen while a sheet is still open.

## G2. Side-by-side pages swipe — SHOULD FIX

```
Is it a row of tabs above content inside one screen?
├── Yes → pages. They swipe, and the indicator follows the finger (lane B3).
└── No, it is the app's main tab bar → no swipe, no slide between tabs. Tabs switch at once and keep their state.
```

**Probe:** swipe horizontally on every screen that shows tabs above its content.

## G3. Lists of server data can be refreshed — SHOULD FIX

**Probe:** pull down on every list that shows remote content.

**Passes when:** the platform's refresh control appears and the list updates. A list that is always live may skip it; say so.

## G4. System surfaces are the system's — SHOULD FIX

```
Does the design draw its own version of a system surface?
(date and time picker, share sheet, photo picker, permission prompt, call screen, action sheet)
├── The project decided to draw its own → follow that decision
└── Otherwise → use the platform's. People know how it works, and it handles locale, accessibility and edge cases for free.
```

**Probe:** open every picker, share action and permission flow.

## G5. Long press, drag and swipe have room for intent — SHOULD FIX

**Probe:** long-press items with menus; start a reorder; swipe a row with actions.

**Passes when:** a long press opens at about 500ms and survives a little wobble (around 10px); releasing after it opens does not trigger the item under the finger; a drag starts only after about 10px of movement; a list scrolls when a dragged item nears its edge; a tap right after a drag is ignored.

## G6. Main tabs keep their state — SHOULD FIX

**Probe:** navigate deep inside one tab, switch to another and come back; tap the active tab.

**Passes when:** the stack and scroll position are preserved on return, and tapping the active tab goes to its root or scrolls to top.

## G7. The app survives the phone being a phone — SHOULD FIX

**Probe:** receive a notification, take a call or switch apps mid-flow; lock and unlock.

**Passes when:** the app returns to the same place with current content and no stuck indicator. Report anything the tools cannot drive as not verified.
