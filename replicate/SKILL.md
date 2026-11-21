---
name: replicate
description: Reproduces designs, interfaces, apps, websites, and service workflows through systematic reference inspection, implementation, and measured comparison. Use when explicitly asked to replicate a reference, match a design faithfully, or recover details missed by an earlier implementation.
disable-model-invocation: true
---

# Replicate

Make fidelity an evidence-driven implementation loop. Inspect the reference, inventory its details, implement, compare, correct, and verify. A convincing first impression is not completion: preserve the small relationships and behaviors that make the reference distinctive.

## Start from the user's reference

1. Infer the target, scope, platform, and intentional differences from the conversation. This skill works for a screenshot, design file, component, existing implementation, app, website, or service. Do not require an interactive original when the user supplied a static design.
2. Inspect the actual reference before coding. Prefer the user's specified source; use installed software for behavior, design files for explicit design specifications, and full-resolution images for rendered appearance. When sources disagree, record the discrepancy and apply the user's stated priority rather than silently mixing them.
3. Inspect the existing implementation and project instructions. Preserve working features and user changes. If the task is a fidelity correction, fix the existing design instead of inventing a new direction.
4. Ask only for missing information that blocks meaningful progress. If access to the original is unavailable, continue with available evidence and state what cannot be verified. Never invent observations.
5. Establish a bounded set of flows or states and acceptance criteria. Do not interpret “replicate” as authorization to purchase, publish, contact others, copy credentials, or alter unrelated service data.

## Inspect before simplifying

Create a compact reference inventory using [evidence-template.md](evidence-template.md). For a small component this can be a few rows; do not turn a small edit into a large documentation project.

Inspect the whole reference, then individual regions. Record observed facts, measurements, estimates, and unknowns separately. Do not replace unusual details with familiar defaults just because they are easier to implement.

Inspect applicable details:
- Layout: alignment, containment, grid, margins, padding, gaps, proportions, layering, clipping, safe areas, and fixed/sticky elements.
- Typography: font family, weight, size, line height, tracking, baseline, wrapping, truncation, and alignment. Text length and real content are part of the layout.
- Surfaces: sampled colors, gradients, transparency, materials, borders, corner treatment, shadows, artwork crop, icon shape/weight, and optical alignment.
- States: selected, focused, pressed, loading, empty, error, disabled, expanded, scrolled, and keyboard-visible; light/dark or responsive variants when in scope.
- Behavior: hit areas, navigation, back behavior, state retention, search scope, menus, scrolling, overscroll, scrubbing, and interrupted gestures.
- Motion: trigger, delay, duration, easing/spring, travel, overshoot, fade, scaling, anchoring, interruption, and return to rest.
- Service workflows: input/output contracts, ordering, persistence, retries, errors, latency, and side effects visible to the user. Visual similarity alone does not reproduce a service.

For static references, match observable appearance first. Mark unshown interactions and responsive behavior as inferred; choose sensible behavior without claiming it was observed. For interactive references, explore complete transitions, not just their endpoints. Include rapid repeated input and partial/cancelled gestures where relevant.

## Choose tools for the evidence

Use available tools, not assumed tool names or capabilities. Read applicable tool/skill instructions before using them.
- Design files: use the relevant design integration to inspect nodes, styles, assets, and constraints, plus rendered previews. Export actual authorized assets when possible rather than approximating them.
- Apps: use Argent/device tools for operation, screenshots, accessibility frames, and repeatable routes. Default to a connected physical USB phone before considering a simulator. Apply platform setup/interaction skills when needed.
- Websites: use the available browser tooling for screenshots, viewport states, interactions, and layout inspection. Test the relevant responsive widths and input modes.
- Screenshots: inspect at full resolution and crop regions for analysis. Measure in logical units when device scale is known; do not confuse screenshot pixels with layout points.
- Motion: capture video with supported recording tools and inspect frames/contact sheets. Measure position against time, including the final settling frames. Use recordings to study motion, not to claim display FPS they cannot establish. For mobile transitions where timing or gestures matter, use `argent-extend` when available.
- Performance: use native profilers/Instruments for native apps or browser performance tooling for web apps. Read relevant profiling skills. Animation/UI-polish skills supplement reference evidence; their general preferences must not override the requested design.
- Services: use documented APIs, available connectors, and controlled test data to compare observable contracts. Avoid destructive probes and unnecessary paid requests.

Use small measurement scripts when they resolve uncertainty. Prefer reproducible sampling over a guessed color, font, spacing, or spring. Do not install a large toolchain for a small comparison when existing tools suffice.

## Implement a complete slice

1. Reproduce one complete representative flow or component with real content before expanding. Choose one that exercises the important layout and state transitions.
2. Encode shared measured values coherently. Keep component identity, navigation state, and layout stable across transitions.
3. Use native/platform mechanisms where they match the reference. Use lower-level implementation only when observation or testing demonstrates a mismatch. Do not assume a default sheet, menu, or spring matches merely because it looks native.
4. Preserve text, assets, ordering, and distinctive visual details. Do not add gradients, decoration, placeholder sections, copy changes, or “improvements” absent from the reference unless requested.
5. Keep functional behavior correct while matching appearance. Loading, preprocessing, or animations should not unnecessarily block an action that can already proceed.

## Compare and correct

Run this loop after each meaningful slice:
1. Put reference and implementation in comparable states: same content, viewport/device, scale, theme, scroll position, keyboard, and relevant data/playback state.
2. Capture both. Compare the full composition and then regions. Use overlays/diffs when useful and inspect the actual images, not only a score. Keep exclusion masks explicit and limited to genuinely variable areas.
3. Record concrete discrepancies, their evidence, and severity. Fix the largest structural differences first, then typography/surfaces, then motion and small interaction details. Revisit structure if later observations contradict it.
4. For motion, compare the entire transition, including the first frame, cancellation, overshoot, safe-area coverage, and final settling. Look for flashes, late background changes, disappearing bars, icon rescaling, and content rebuilding.
5. Repeat the affected checks after fixes, plus relevant behavioral regressions. Do not keep repeating broad tests once they pass without new evidence that warrants it.

Do not treat pixel mismatch as a universal similarity score. State the exact state, device/viewport, threshold, and masks behind quantitative claims. Matching one screenshot does not establish whole-product parity. Rendering/font differences can be legitimate constraints; identify them rather than hiding them behind broad thresholds.

## If it looks right but feels wrong

Separate motion design from execution performance. Profile before changing durations or springs at random.
- Repeat the same representative workload before and after the change, with comparable observation overhead.
- Avoid per-frame screenshots/accessibility queries during timing-sensitive measurements. Capture visual evidence separately when instrumentation changes the workload.
- Investigate repeated data transforms, excessive state invalidation, view reconstruction, synchronous I/O, decoding, layout work, and duplicate gesture callbacks.
- Change the demonstrated bottleneck, then verify both performance and appearance. Retaining views/caches trades memory for speed: bound them and handle invalidation/lifecycle correctly.
- Report what was measured and its limitations. Video resampling is not display FPS; differing workloads are not a valid numerical baseline.

## Finish with evidence

Complete the authorized implementation and verification, not just an audit or plan, unless the user requested research only.

Before calling the work done:
- Every in-scope acceptance criterion has implementation and verification evidence, or an explicit unresolved limitation.
- Important static states have been compared to the reference; important transitions have been exercised when observable.
- Functional checks cover the behavior the change could break. Use repeatable routes for substantial flows; avoid tests that merely restate trivial styling code.
- Known intentional differences are distinguished from defects and unknowns.
- Final report states what changed, what was actually tested, and remaining differences. Link useful comparison evidence; do not claim “pixel-perfect” or “exact behavior” beyond what was verified.

Keep host resource limits in mind. Serialize heavy builds/profiling on constrained machines. Close only windows, apps, devices, and services started for this task that are no longer needed. Preserve existing user work and required services. Keep secrets and personal session data out of evidence and source control. Do not delete reference evidence without authorization; retain useful final captures and measurements.

## Invocation examples

- `/replicate Match this screenshot in the existing page. Pay attention to the typography and spacing.`
- `/replicate Implement this design file, including its mobile variants. Preserve the existing checkout behavior.`
- `/replicate Recreate this app's player and search flows. Compare both apps on the connected phone.`
- `/replicate The current implementation missed details from this design. Inspect both and finish the fidelity pass.`
- `/replicate Reproduce this service's import workflow with our backend, including progress, retry, and failure states.`
