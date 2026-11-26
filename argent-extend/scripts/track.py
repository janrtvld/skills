#!/usr/bin/env python3
"""track.py <clip.mov> <start_s> <end_s> <x0,y0,x1,y1 as 0..1 fractions> [lum|edge]
Per decoded frame (real pts) of a capture: mean luminance of the region (lum, default: e.g. backdrop dimming) or
the y (0..1) of the first row inside the region where the mid column jumps by > 30 grey levels (edge: only
meaningful on a region with ONE clean edge, e.g. a column through the sheet top over a dark backdrop).
Frames are decoded by ffmpeg at 1/4 scale, gray. Pure stdlib."""
import subprocess, sys, re
clip, s, e = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
x0, y0, x1, y1 = [float(v) for v in sys.argv[4].split(',')]
mode = sys.argv[5] if len(sys.argv) > 5 else 'lum'
import subprocess as _sp
_w,_h=[int(v) for v in _sp.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height","-of","csv=p=0",clip],capture_output=True,text=True).stdout.strip().split(",")]
W = 221; H = max(2, round(_h*W/_w/2)*2)
vf = f"setpts=PTS-STARTPTS,trim=start={s}:end={e},showinfo,scale={W}:{H},format=gray"
p = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', clip, '-map', '0:v:0', '-an', '-vf', vf, '-fps_mode', 'passthrough',
                    '-f', 'rawvideo', '-'], capture_output=True)
pts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', p.stderr.decode())]
data = p.stdout
n = len(data) // (W * H)
for i in range(n):
    f = data[i * W * H:(i + 1) * W * H]
    X0, X1, Y0, Y1 = int(x0 * W), int(x1 * W), int(y0 * H), int(y1 * H)
    if mode == 'lum':
        tot = 0
        for y in range(Y0, Y1):
            tot += sum(f[y * W + X0:y * W + X1])
        print(f"{i} {pts[i]:.3f} {tot / ((X1 - X0) * (Y1 - Y0)):.1f}")
    else:
        xm = (X0 + X1) // 2
        hit = -1
        for y in range(Y0 + 1, Y1):
            if abs(f[y * W + xm] - f[(y - 1) * W + xm]) > 30:
                hit = y; break
        print(f"{i} {pts[i]:.3f} {hit / H if hit >= 0 else -1:.4f}")
