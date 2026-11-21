// Turns index.html into pictures or a video by asking the page for one moment at a time.
//
//   node scripts/render.cjs stills 2,8.5,14      → out/still-2.png … (seconds)
//   node scripts/render.cjs video out/silent.mp4 → 60fps H.264, no audio
//
// The page provides window.render(seconds), which may be async, and window.DURATION.
// SIZE=1920x1080 sets the canvas in CSS px; SCALE=2 doubles the pixels (3840×2160).
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { launch } = require("./chrome.cjs");

const FPS = 60;
const [mode, target] = process.argv.slice(2);
const [width, height] = (process.env.SIZE || "1920x1080").split("x").map(Number);
const scale = Number(process.env.SCALE || 1);
const outDir = path.join(process.cwd(), "out");

async function main() {
  if (mode !== "stills" && mode !== "video") {
    console.log("usage: render.cjs stills <seconds,…> | video <out.mp4>");
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  page.on("pageerror", (error) => { console.error("page error:", error.message); process.exitCode = 1; });
  await page.goto("file://" + path.join(process.cwd(), "index.html"));
  await page.evaluate(() => window.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const drawAt = (seconds) => page.evaluate((s) => window.render(s), seconds);

  if (mode === "stills") {
    for (const seconds of (target || "0").split(",").map(Number)) {
      await drawAt(Math.min(seconds, duration));
      const file = path.join(outDir, `still-${seconds}.png`);
      await page.screenshot({ path: file });
      console.log(file);
    }
  } else {
    const file = path.resolve(target || path.join(outDir, "silent.mp4"));
    const total = Math.round(duration * FPS);
    const encoder = spawn("ffmpeg", [
      "-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "pipe:0",
      "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p",
      "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", file,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const finished = new Promise((resolve, reject) => encoder.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)))));
    encoder.stdin.on("error", () => {}); // a failed encoder is reported through its exit code
    const started = Date.now();
    for (let frame = 0; frame < total; frame++) {
      await drawAt(frame / FPS);
      const picture = await page.screenshot({ type: "png" });
      if (!encoder.stdin.write(picture)) await new Promise((resolve) => encoder.stdin.once("drain", resolve));
      if (frame % 300 === 299) console.log(`${Math.round(((frame + 1) / total) * 100)}%  ${Math.round((Date.now() - started) / 1000)}s`);
    }
    encoder.stdin.end();
    await finished;
    console.log(`${file}  ${width * scale}x${height * scale}, ${duration.toFixed(1)}s`);
  }
  await browser.close();
}

main().catch((error) => { console.error(error.message); process.exit(1); });
