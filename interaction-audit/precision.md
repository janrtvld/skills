# Lane H — Precision

Nobody consciously notices a label that sits one point low. They notice that the app looks slightly off and cannot say why. These are the cheapest defects to fix and the ones a pass at arm's length never finds.

Screenshots are enough here, at full resolution and zoomed in. Check both platforms: font metrics differ.

## H1. Text sits in the optical centre of its container — SHOULD FIX

**Probe:** zoom into pills, chips, tabs, badges, buttons and avatars with initials. Compare the space above and below the text, and left and right.

**Passes when:** the difference is under 1pt. Check on Android separately; line-height and font padding push text down there.

## H2. Placeholders sit where typed text sits — SHOULD FIX

**Probe:** screenshot each kind of input empty, then with text.

**Passes when:** the placeholder and the typed text share a baseline and a left edge, and both are vertically centred in single-line fields.

## H3. Nothing is clipped — SHOULD FIX

**Probe:** look at headings with tall and low letters and accents, at text in tight rows, and at the first and last items of horizontal rows.

**Passes when:** no glyph is cut at the top or bottom of its line box and no item is cut by its container's edge.

## H4. Text that should stay on one line does — SHOULD FIX

**Probe:** feed the shortest and the longest realistic content into rows, bubbles, chips and buttons.

```
Can this text grow?
├── No (a time, a count, a status) → never wraps and never truncates; give it its own space
├── Yes, and the full text matters → wraps, with the layout built for it
└── Yes, and a summary is enough   → truncates with an ellipsis, and the full text is one tap away
```

## H5. The same part looks the same everywhere — SHOULD FIX

**Probe:** compare one component across the screens that use it: corner radius, padding, icon size, pressed state, spacing to neighbours.

**Passes when:** they match. Two sheets with different corners or two buttons with different heights mean two implementations.

## H6. Icons and text line up by eye — POLISH

**Probe:** zoom into icon-and-label pairs and into directional icons inside circles.

**Passes when:** they look aligned. Geometric centring is not always optical centring; a play triangle or a chevron needs a small nudge.

## H7. Fonts render as designed on both platforms — SHOULD FIX

**Probe:** compare each text weight on iOS and Android against the design.

**Passes when:** medium, semibold and bold are distinct on both. If a weight looks faked or missing on Android, the font file for it is not bundled.
