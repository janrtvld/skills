#!/usr/bin/env python3
"""sheet.py <clip.mov> <start_s> <end_s> [x_frac=0.02] [dim_y=0.5] [white=252]
Per frame: where the top edge of a bottom sheet is (fraction of the screen height, 1.00 = no sheet) and how dark the
page behind it is. Sheet top = first row going up from the bottom of the column at x_frac that stops being white
(>= `white`); dim = grey level of the page at (x_frac, dim_y) (page colour 255 = undimmed; read it against the
settled "closed" value). Use it to see that the sheet and the dim move together on open and on close (a sheet that
is gone while the dim is still fading shows as top = 1.00 with dim still rising). Pure stdlib."""
import subprocess, sys, re
clip, s, e = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
xf = float(sys.argv[4]) if len(sys.argv) > 4 else 0.02
dy = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5
white = int(sys.argv[6]) if len(sys.argv) > 6 else 252
W, H = 221, 480
vf = f"setpts=PTS-STARTPTS,trim=start={s}:end={e},showinfo,scale={W}:{H},format=gray"
p = subprocess.run(['ffmpeg','-hide_banner','-nostdin','-i',clip,'-map','0:v:0','-an','-vf',vf,'-fps_mode','passthrough','-f','rawvideo','-'],capture_output=True)
pts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', p.stderr.decode())]
d = p.stdout; n = len(d)//(W*H)
x = max(0, min(W-1, int(xf*W)))
for i in range(n):
    f = d[i*W*H:(i+1)*W*H]
    y = H-1
    while y > 0 and f[y*W+x] >= white: y -= 1
    top = (y+1)/H
    dim = f[int(dy*H)*W+x]
    print(f"{i} {pts[i]:.3f} sheet_top {top:.3f} page_grey {dim}")
