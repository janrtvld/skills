// Puts a finished walkthrough behind a link that expires after 30 days.
//
//   node scripts/share.cjs out/<name>.mp4 "<title>"   uploads and prints the link
//
// The video needs its <name>.chapters.json beside it (narrate.cjs mux writes it).
// Sharing needs the GitHub sign-in (service.cjs login), so uploads have an owner and a daily limit.
// It never starts a sign-in itself: without one it exits with code 3, which means ask the person first.
// The sign-in itself is in service.cjs.
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { config, save, stop, call, needSession } = require("./service.cjs");

async function share(video, title) {
  const chaptersFile = video.replace(/\.[^.]+$/, "") + ".chapters.json";
  if (!fs.existsSync(video) || !fs.existsSync(chaptersFile)) stop(`Need ${video} and ${chaptersFile}`);
  const chapters = JSON.parse(fs.readFileSync(chaptersFile, "utf8"));
  needSession("A share link");
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "walkthrough-share-"));
  const still = (seconds, file, width) => { execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(seconds), "-i", video, "-frames:v", "1", "-vf", `scale=${width}:-1`, "-q:v", "3", path.join(work, file)]); return [file, path.join(work, file), "image/jpeg"]; };
  const files = [["video.mp4", video, "video/mp4"], still(Math.min(1.5, chapters[0].duration / 2), "poster.jpg", 1280), ...chapters.map((chapter, i) => still(chapter.start + chapter.duration * 0.7, `chapter-${i + 1}.jpg`, 352))];
  try {
    const { id } = await call("POST", "/api/shares");
    for (const [name, file, type] of files) await call("PUT", `/api/shares/${id}/${name}`, fs.readFileSync(file), type);
    // meta.json goes last: it is what publishes the page.
    const done = await call("PUT", `/api/shares/${id}/meta.json`, JSON.stringify({ title: title || path.basename(video, path.extname(video)), chapters }), "application/json");
    console.log(done.url);
    console.log(`Expires ${done.expires.slice(0, 10)}. Anyone with the link can watch it.`);
  } catch (error) {
    if (error.status === 401) stop("The sign-in has expired. Ask the person, then: node scripts/service.cjs login", 3);
    throw error;
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

(async () => {
  const [first, second] = process.argv.slice(2);
  if (first) await share(path.resolve(first), second);
  else console.log('usage: share.cjs <video.mp4> ["title"]');
})().catch((error) => stop(error.stderr ? String(error.stderr).trim().split("\n").slice(-6).join("\n") : error.message));
