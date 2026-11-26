#!/usr/bin/env python3
"""column.py <clip> <start_s> <end_s> <x_frac> [y0_frac=0 y1_frac=1] [min_jump=40] [max_edges=6]
The boundaries along one vertical line, per frame: every y (as a fraction of the height) where brightness jumps by
at least `min_jump` grey levels. Pick an x that crosses the edges you care about (a sheet's top, a keyboard's top,
a header's bottom, the top of a composer) and read how each moves over time. Two parts that belong together should
change on the same frames. Prints a line only when the set of edges changes."""
import sys
from _clip import frames
clip, s, e, xf = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
y0 = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0; y1 = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
jump = int(sys.argv[7]) if len(sys.argv) > 7 else 40; mx = int(sys.argv[8]) if len(sys.argv) > 8 else 6
pts, fr, W, H, _ = frames(clip, s, e, 240)
x = min(W - 1, int(xf * W)); last = None
for i, f in enumerate(fr):
    col = [f[y * W + x] for y in range(H)]
    edges = []
    y = max(2, int(y0 * H))
    while y < min(H - 2, int(y1 * H)):
        d = col[y + 1] - col[y - 1]
        if abs(d) >= jump:
            edges.append((y, 'dark>light' if d > 0 else 'light>dark')); y += 4
        else: y += 1
    key = tuple(yy for yy, _ in edges[:mx])
    if key != last:
        print(f"{pts[i]:.3f}  " + '  '.join(f"{yy / H:.3f}({k})" for yy, k in edges[:mx]))
    last = key
