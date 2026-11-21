// Turns a simulator recording into numbered PNG frames plus their timestamps.
//
//   node scripts/sim-frames.cjs src/rec.mov [name]   → out/<name>/f-0001.png…, out/<name>/frames.json
//
// `simctl io recordVideo` writes a frame only when the screen changes, so the
// file is variable frame rate. Every source frame is kept with its own
// timestamp; the page picks the frame for each output time itself.
// frames.json: { width, height, duration, startMs, pts: [seconds…], bursts: [seconds…] }
// A burst is the first frame after the screen sat still for ≥ 0.25s, usually the
// first visible response to a touch. startMs is the wall-clock start that
// sim-record.sh saved next to the recording; the page uses both to place touches.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const [src, nameArg] = process.argv.slice(2);
if (!src) {
  console.log("usage: node scripts/sim-frames.cjs <recording.mov> [name]");
  process.exit(1);
}
const name = nameArg || path.basename(src, path.extname(src));
const dir = path.join(process.cwd(), "out", name);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

const probe = JSON.parse(
  execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-show_entries", "frame=pts_time",
    "-show_entries", "format=duration", "-of", "json", src,
  ], { maxBuffer: 1 << 28 }).toString()
);
const pts = probe.frames.map((f) => Number(f.pts_time));
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-i", src, "-fps_mode", "passthrough",
  "-start_number", "1", path.join(dir, "f-%04d.png"),
]);
const written = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).length;
if (written !== pts.length) throw new Error(`decoded ${written} frames, probed ${pts.length}`);

const bursts = pts.filter((t, i) => i > 0 && t - pts[i - 1] >= 0.25);
const { width, height } = probe.streams[0];
const startMs = fs.existsSync(src + ".start") ? Number(fs.readFileSync(src + ".start", "utf8")) : null;
fs.writeFileSync(
  path.join(dir, "frames.json"),
  JSON.stringify({ width, height, duration: Number(probe.format.duration), startMs, pts, bursts })
);
console.log(`${dir}: ${pts.length} frames, ${width}x${height}, bursts at ${bursts.map((b) => b.toFixed(2)).join(", ")}`);
