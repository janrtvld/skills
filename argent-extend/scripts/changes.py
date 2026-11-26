#!/usr/bin/env python3
"""changes.py <clip> [start_s end_s] [threshold=0.3] [ignore=x0,y0,x1,y1]
Which frames differ from the one before. Run this first on any clip: it turns "look at every frame" into "look at
every frame of these intervals". Prints the intervals of change (start..end, frames, peak difference) and, with -v,
every changing frame. `ignore` masks a region given as fractions (a clock, a touch marker, a system bar)."""
import sys
from _clip import frames
a = [x for x in sys.argv[1:] if x != '-v']; verbose = '-v' in sys.argv
clip = a[0]; s = float(a[1]) if len(a) > 2 else 0; e = float(a[2]) if len(a) > 2 else 99999
thr = float(a[3]) if len(a) > 3 else 0.3
ign = [float(v) for v in a[4].split(',')] if len(a) > 4 else None
pts, fr, W, H, _ = frames(clip, s, e, 135)
mask = bytearray(b'\x01' * (W * H))
if ign:
    for y in range(int(ign[1] * H), int(ign[3] * H)):
        for x in range(int(ign[0] * W), int(ign[2] * W)): mask[y * W + x] = 0
live = sum(mask) or 1
runs = []; cur = None
for i in range(1, len(fr)):
    d = sum(abs(p - q) for p, q, m in zip(fr[i - 1], fr[i], mask) if m) / live
    if verbose and d > thr: print(f"{pts[i]:.3f} diff {d:.1f}")
    if d > thr:
        if cur and pts[i] - cur[1] < 0.12: cur[1] = pts[i]; cur[2] += 1; cur[3] = max(cur[3], d)
        else:
            cur = [pts[i], pts[i], 1, d]; runs.append(cur)
print(f"{len(fr)} frames, {pts[0]:.3f}..{pts[-1]:.3f}s" if fr else "no frames")
for r in runs: print(f"change {r[0]:.3f}..{r[1]:.3f}s  {r[2]} frames  peak {r[3]:.1f}")
