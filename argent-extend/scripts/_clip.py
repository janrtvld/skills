"""Shared helpers: decode a clip interval to small grey frames with real timestamps. Pure stdlib + ffmpeg/ffprobe."""
import re, subprocess

def size(clip):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                          '-of', 'csv=p=0', clip], capture_output=True, text=True).stdout.strip().split(',')
    return int(out[0]), int(out[1])

def frames(clip, start, end, width=240, fmt='gray'):
    """Returns (pts list, frame list of bytes, W, H, scale) where scale = clip pixels per decoded pixel."""
    cw, ch = size(clip)
    W = width; H = max(2, round(ch * W / cw / 2) * 2)
    vf = f"setpts=PTS-STARTPTS,trim=start={start}:end={end},showinfo,scale={W}:{H},format={fmt}"
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', clip, '-map', '0:v:0', '-an', '-vf', vf,
                        '-fps_mode', 'passthrough', '-f', 'rawvideo', '-'], capture_output=True)
    pts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', p.stderr.decode())]
    bpp = 3 if fmt == 'rgb24' else 1
    n = len(p.stdout) // (W * H * bpp)
    fr = [p.stdout[i * W * H * bpp:(i + 1) * W * H * bpp] for i in range(n)]
    return pts[:n], fr, W, H, cw / W
