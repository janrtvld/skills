# Reference and verification record

Adapt the size to the task. Keep this with project documentation for substantial work; a short working record is enough for one component. Never fill an observed/measured field with an assumption.

## Scope

- Reference source(s):
- Target implementation:
- In-scope states/flows:
- Intentional differences:
- Environment: device/viewport, OS/browser, display scale, theme, content/data:
- Unknowns/access limitations:

## Reference inventory

| Region/state/transition | Detail or behavior | Observed / measured / inferred | Evidence |
|---|---|---|---|
| Search, idle → focused | Container expands; keyboard appears; cancel action retains query | Observed | Recording + timestamps |
| Card title | Two lines; exact font weight unavailable | Observed wrapping, estimated weight | Full-resolution screenshot crop |

Use real observations from the current task; these example rows are not defaults to implement.

## Comparison and fixes

| Discrepancy | Expected / actual | Evidence | Change | Recheck result |
|---|---|---|---|---|

For image diffs record dimensions, scaling, threshold, excluded regions, and content differences. For motion record timestamps, tracked element, travel/settling, and recording limitations. For performance record workload, run count, instrumentation, metrics, and confounders.

## Acceptance and handoff

| Criterion | Verification method | Result | Evidence or limitation |
|---|---|---|---|

- Functional regression results:
- Remaining visual/behavioral differences:
- Inferred or inaccessible states:
- Final usable artifact/build:
- Cleanup performed:
