#!/usr/bin/env python3
"""follow.py <clip> <start_s> <end_s> <x0,y0,x1,y1 fractions> [axis=y|x] [search=0.5]
Follow one distinctive feature. The region is cut from the FIRST frame of the interval and searched for in every
later frame along one axis; prints its offset in clip pixels and the match error. More reliable than a whole-region
shift for slow motion and repeating rows: pick something unique (a title, an avatar, a tab pill, the touch marker).
Run it once on the content and once on the touch marker to see whether content moved because the finger did.
Read the error column: near 0 is a firm match, and a line marked LOST (error above `lost`, default 12) means the
feature left the screen, was covered or changed its look, so its offset is meaningless there."""
import sys
from _clip import frames
clip, s, e = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
x0, y0, x1, y1 = [float(v) for v in sys.argv[4].split(',')]
axis = sys.argv[5] if len(sys.argv) > 5 else 'y'; search = float(sys.argv[6]) if len(sys.argv) > 6 else 0.5
pts, fr, W, H, scale = frames(clip, s, e, 240)
X0, X1, Y0, Y1 = int(x0 * W), max(int(x1 * W), int(x0 * W) + 2), int(y0 * H), max(int(y1 * H), int(y0 * H) + 2)
tw, th = X1 - X0, Y1 - Y0
tpl = [fr[0][y * W + X0:y * W + X1] for y in range(Y0, Y1)]
rng = int(search * (H if axis == 'y' else W)); last = None
for i, f in enumerate(fr):
    best, bo = None, 0
    for o in range(-rng, rng + 1):
        ox, oy = (0, o) if axis == 'y' else (o, 0)
        if Y0 + oy < 0 or Y1 + oy > H or X0 + ox < 0 or X1 + ox > W: continue
        err = 0
        for r in range(0, th, 2):
            row = f[(Y0 + oy + r) * W + X0 + ox:(Y0 + oy + r) * W + X1 + ox]
            err += sum(abs(a - b) for a, b in zip(row[::2], tpl[r][::2]))
        if best is None or err < best: best, bo = err, o
    n = max(1, (th // 2 + th % 2) * (tw // 2 + tw % 2))
    line = (round(bo * scale), round((best or 0) / n, 1))
    if line != last: print(f"{pts[i]:.3f}  offset_px {line[0]:+d}  err {line[1]}" + ("  LOST" if line[1] > 12 else ""))
    last = line
