# Lane E — Edges

An app that owns its screen looks intended all the way to the glass: behind the clock, under the home indicator, past the end of a scroll. An unowned edge is the fastest way to look like a web page in a wrapper.

Most checks here are resting states, so screenshots are enough. Take them on the release build: a development build can change status-bar behaviour.

## E1. System icons are readable on every screen and overlay — BLOCKER

**Probe:** screenshot the top of every screen, and of every modal, sheet and full-screen overlay while it is open and again after it closes.

**Passes when:** clock, signal and battery contrast with what is behind them everywhere, and the style returns correctly when an overlay closes.

```
What sits behind the status bar on this screen?
├── Dark or saturated surface → light icons
├── Light surface             → dark icons
└── It changes on scroll      → the style changes with it, or the header keeps a fixed backing
```

**Fix:** set the style in one place, tied to the focused screen (a navigator option or the shared header). Per-screen components race, and native modals have their own controller.

## E2. Overscroll reveals more of the same surface — SHOULD FIX

**Probe:** pull every scrolling screen down past its top and push it up past its bottom.

**Passes when:** the area revealed continues the surface it touches: a coloured or gradient header continues upward, the page colour continues downward. No band of another colour, on either platform.

## E3. Nothing important sits under a system area — BLOCKER when a control is unreachable

**Probe:** on a phone with a notch or island and a home indicator, and on Android with gesture and three-button navigation, check the top and bottom of every screen and every sheet.

**Passes when:** no text or control is under the notch, the home indicator or the navigation bar, and the system areas are painted with the adjoining surface, not left black or white.

## E4. Scrolling to either end cuts nothing off — SHOULD FIX

**Probe:** scroll each screen fully to the top and the bottom, and each horizontal row fully to both ends.

**Passes when:** the first and last items are fully visible with their padding, and anything that floats over the content can be scrolled clear of. Compare element frames from the tree; overlap is exact there. If the design itself draws an overlap, report it as a design question, not a fail.

## E5. Short and empty content does not pretend to be long — POLISH

**Probe:** scroll a screen whose content fits, and an empty state.

**Passes when:** it does not travel like a long page. A bounce is fine; scrolling an empty state away is not.

## E6. Scroll indicators sit at the container's edge — POLISH

**Probe:** scroll long content inside sheets, cards and inset lists.

**Passes when:** the indicator runs along the edge of its container, not across the content, or it is hidden.
