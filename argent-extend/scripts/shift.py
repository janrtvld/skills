#!/usr/bin/env python3
"""shift.py <clip.mov> <start_s> <end_s> <x0,y0,x1,y1 fractions> [maxshift=12]
Vertical movement of the content inside a region between consecutive frames: best match of the grey rows at
a small scale, printed in clip pixels at that scale's resolution (coarse steps). Slow movement and repeating rows
confuse it: prefer follow.py on one distinctive feature, and use this for a quick look at fast movement.
Use two regions (header, content) to see whether they move in proportion to the scroll and whether any frame
steps (a jump much larger than its neighbours). Pure stdlib; positive = content moved down."""
import subprocess, sys, re
clip, s, e = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
x0, y0, x1, y1 = [float(v) for v in sys.argv[4].split(',')]
mx = int(sys.argv[5]) if len(sys.argv) > 5 else 12
import subprocess as _sp
_w,_h=[int(v) for v in _sp.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height","-of","csv=p=0",clip],capture_output=True,text=True).stdout.strip().split(",")]
W = 221; H = max(2, round(_h*W/_w/2)*2)
vf = f"setpts=PTS-STARTPTS,trim=start={s}:end={e},showinfo,scale={W}:{H},format=gray"
p = subprocess.run(['ffmpeg','-hide_banner','-nostdin','-i',clip,'-map','0:v:0','-an','-vf',vf,'-fps_mode','passthrough','-f','rawvideo','-'],capture_output=True)
pts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', p.stderr.decode())]
d = p.stdout; n = len(d)//(W*H)
X0,X1,Y0,Y1 = int(x0*W),int(x1*W),int(y0*H),int(y1*H)
step = 2
def rows(i):
    f = d[i*W*H:(i+1)*W*H]
    return [bytes(f[y*W+X0:y*W+X1:step]) for y in range(H)]
prev = rows(0)
for i in range(1, n):
    cur = rows(i)
    best, bs = None, 0
    for sh in range(-mx, mx+1):
        err = 0; cnt = 0
        for y in range(Y0, Y1, 2):
            yy = y - sh
            if 0 <= yy < H:
                a = prev[yy]; b = cur[y]
                err += sum(abs(u-v) for u, v in zip(a, b)); cnt += 1
        err /= max(cnt, 1)
        if best is None or err < best: best, bs = err, sh
    print(f"{i} {pts[i]:.3f} shift_px {round(bs*_w/W):+d} err {best:.1f}")
    prev = cur
