// Voiceover for a walkthrough (templates/walkthrough.html).
//
//   node scripts/narrate.cjs speak                        narration.json → out/narration/NN.<ext> + speech.json
//   node scripts/narrate.cjs mux out/silent.mp4 out/x.mp4 lays each chapter's speech where the page starts it,
//                                                         and writes out/x.chapters.json (title, text, start, duration, lines)
//
// narration.json (project root): { clip, voice?, touches: [...], chapters: [{ title, text, from? }] }
//
// Where the speech comes from, first that applies:
//   1. your own ElevenLabs key (ELEVENLABS_API_KEY, or ~/.config/walkthrough/elevenlabs-key): any voice, no limit;
//   2. the walkthrough service's hosted voice: the same voice, free, after a one-time GitHub sign-in;
//   3. `speak --local`, or when the hosted voice is used up: macOS `say`, which stays on this machine
//      (word timings are then spread by word length, so captions can run slightly ahead or behind).
// With 1 and 2 the narration text is sent over the network to be spoken. Each chapter is cached by text, provider and voice.
const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DIR = path.join(ROOT, "out", "narration");
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "narration.json"), "utf8"));
const account = require("./service.cjs");
const KEY = account.ownKey();
const LOCAL = process.argv.includes("--local") || process.env.WALKTHROUGH_LOCAL_VOICE === "1";
// The first that applies: --local, your own key, the hosted voice when signed in, the remembered "local" choice.
// WALKTHROUGH_HOSTED_VOICE=1 uses the hosted voice even when you have a key, to hear what others get.
let provider = LOCAL ? "say" : KEY && process.env.WALKTHROUGH_HOSTED_VOICE !== "1" ? "elevenlabs" : account.config.token ? "hosted" : account.config.mode === "local" ? "say" : "";
// Chris: a casual, conversational voice, closer to someone talking over their screen than to a narrator.
const CHRIS = "iP95p4xoKVk53GoZ742B";
const voiceFor = (source) => (source === "elevenlabs" ? config.voice || process.env.WALKTHROUGH_VOICE || CHRIS : source === "hosted" ? CHRIS : process.env.WALKTHROUGH_SAY_VOICE || "Samantha");
const MODEL = "eleven_multilingual_v2";

const duration = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());

function spread(text, total) {
  // No timings from `say`: give each word time by its length, plus a pause after punctuation.
  const words = text.split(/\s+/).filter(Boolean);
  const weight = (w) => w.length + 1.5 + (/[.!?]$/.test(w) ? 7 : /[,;:]$/.test(w) ? 3.5 : 0);
  const sum = words.reduce((s, w) => s + weight(w), 0);
  const lead = 0.06, usable = total - lead - 0.1;
  let at = lead;
  return words.map((w) => {
    const start = at;
    at += (weight(w) / sum) * usable;
    return { w, start, end: start + ((w.length + 1.5) / sum) * usable };
  });
}

function fromAlignment(a) {
  const words = [];
  let current = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { current = null; return; }
    if (!current) { current = { w: "", start: a.character_start_times_seconds[i], end: 0 }; words.push(current); }
    current.w += ch;
    current.end = a.character_end_times_seconds[i];
  });
  return words;
}

async function speak() {
  fs.mkdirSync(DIR, { recursive: true });
  // Never picks for the person: exit code 3 means ask them (SKILL.md, "Ask once").
  if (!provider) account.stop("No voice chosen yet. Ask the person: sign in for the natural voice and share links (node scripts/service.cjs login), or keep it on this machine with the built-in voice (node scripts/service.cjs local).", 3);
  const service = account;
  const chapters = [];
  for (const [i, chapter] of config.chapters.entries()) {
    let file, meta;
    const place = () => {
      const hash = crypto.createHash("sha1").update([provider, voiceFor(provider), MODEL, "casual-1", chapter.text].join("|")).digest("hex").slice(0, 12);
      file = path.join(DIR, `${String(i + 1).padStart(2, "0")}-${hash}.${provider === "say" ? "wav" : "mp3"}`);
      meta = file + ".json";
    };
    place();
    if (!fs.existsSync(file) || !fs.existsSync(meta)) {
      let words;
      if (provider === "hosted") {
        try {
          const body = await service.call("POST", "/api/speak", JSON.stringify({ text: chapter.text }), "application/json");
          fs.writeFileSync(file, Buffer.from(body.audio_base64, "base64"));
          words = fromAlignment(body.alignment);
        } catch (error) {
          if (error.status === 401) service.stop("The sign-in has expired. Ask the person, then: node scripts/service.cjs login", 3);
          if (process.platform !== "darwin") throw new Error(`${error.message} There is no local voice on this system: set ELEVENLABS_API_KEY to use your own key.`);
          console.error(`${error.message}\nUsing this Mac's built-in voice for the rest.`);
          provider = "say";
          place();
        }
      }
      if (provider === "say" && (!fs.existsSync(file) || !fs.existsSync(meta))) {
        if (process.platform !== "darwin") throw new Error("The local voice needs macOS. Sign in for the hosted voice (run without --local) or set ELEVENLABS_API_KEY.");
        const aiff = file + ".aiff";
        execFileSync("say", ["-v", voiceFor("say"), "-o", aiff, chapter.text]);
        execFileSync("ffmpeg", ["-v", "error", "-y", "-i", aiff, "-ar", "44100", file]);
        fs.rmSync(aiff);
        words = spread(chapter.text, duration(file));
      } else if (provider === "elevenlabs") {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceFor("elevenlabs")}/with-timestamps?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ text: chapter.text, model_id: MODEL, voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0, use_speaker_boost: true } }),
          signal: AbortSignal.timeout(60000),
          redirect: "error",
        });
        if (!response.ok) throw new Error(`ElevenLabs answered ${response.status} for chapter ${i + 1}`);
        const body = await response.json();
        fs.writeFileSync(file, Buffer.from(body.audio_base64, "base64"));
        words = fromAlignment(body.alignment);
      }
      if (words) fs.writeFileSync(meta, JSON.stringify({ duration: duration(file), words }));
    }
    chapters.push({ file: path.relative(ROOT, file), exact: !file.endsWith(".wav"), ...JSON.parse(fs.readFileSync(meta, "utf8")) });
    console.log(`${i + 1}. ${chapters[i].duration.toFixed(1)}s  ${chapter.title}`);
  }
  const exact = chapters.every((c) => c.exact);
  fs.writeFileSync(path.join(DIR, "speech.json"), JSON.stringify({ provider, voice: voiceFor(provider), exactTimings: exact, chapters }));
  console.log(`${provider} / ${voiceFor(provider)}: ${chapters.reduce((s, c) => s + c.duration, 0).toFixed(1)}s of speech`);
}

async function mux(silent, out) {
  const browser = await require("./chrome.cjs").launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.join(ROOT, "index.html"));
  await page.evaluate(() => window.ready);
  const audio = await page.evaluate(() => window.AUDIO);
  const chapters = await page.evaluate(() => window.CHAPTERS.map((c) => ({ title: c.title, text: c.text, start: Number(c.start.toFixed(2)), duration: Number(c.duration.toFixed(2)) })));
  // Each chapter's sentences with the moment they are spoken, for a transcript beside the video.
  const speech = JSON.parse(fs.readFileSync(path.join(DIR, "speech.json"), "utf8"));
  chapters.forEach((chapter, i) => {
    chapter.lines = [];
    let line = null;
    for (const word of speech.chapters[i].words) {
      if (!line) { line = { t: Number((audio[i].at + word.start).toFixed(2)), text: word.w }; chapter.lines.push(line); }
      else line.text += " " + word.w;
      if (/[.!?]$/.test(word.w)) line = null;
    }
  });
  await browser.close();

  const inputs = audio.flatMap((a) => ["-i", path.join(ROOT, a.file)]);
  const delays = audio.map((a, i) => `[${i + 1}:a]adelay=${Math.round(a.at * 1000)}:all=1[a${i}]`).join(";");
  const mix = audio.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${audio.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]`; // web loudness
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", silent, ...inputs,
    "-filter_complex", `${delays};${mix}`,
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out,
  ]);
  // The video carries no chapter titles; the page that plays it reads them from here.
  fs.writeFileSync(out.replace(/\.[^.]+$/, "") + ".chapters.json", JSON.stringify(chapters, null, 2) + "\n");
  console.log(out);
}

const [mode, a, b] = process.argv.slice(2);
(mode === "speak" ? speak() : mode === "mux" && a && b ? mux(a, b) : Promise.reject(new Error("usage: narrate.cjs speak | mux <silent.mp4> <out.mp4>")))
  .catch((error) => { console.error(error.message); process.exit(1); });
