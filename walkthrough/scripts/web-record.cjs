// Records a web page or an Electron app one deterministic frame at a time, as the
// footage for templates/walkthrough.html.
//
//   node scripts/web-record.cjs flow.json   → out/<name>/f-0001.jpg…, out/<name>/frames.json
//
// flow.json:
//   { "name": "flow",
//     "url": "https://example.com"            or  "electron": "/path/to/app" (+ "electronBin"),
//     "viewport": [1512, 950], "dsf": 2, "scheme": "light",
//     "touch": false,                         true for a phone-sized page: taps instead of a cursor
//     "address": "example.com",               optional: shown in the address bar instead of localhost:<port>
//     "steps": [
//       { "wait": 0.8 },
//       { "click": "Sign in" },               visible text, or "css=<selector>"
//       { "hover": "css=.card" },
//       { "type": "hello@example.com" },      into the focused field; { "press": "Enter" }
//       { "scroll": 600 },                    px down (negative: up), optional "at": "css=…", "dur": 0.7
//       { "goto": "https://example.com/x" }
//     ] }
//
// The page's clock is paused and stepped 1/60s per frame, so animations are captured
// without dropped frames. A frame is written only when the picture changed; a frame
// where only the pointer moved reuses the last picture.
// Videos on the page are stepped with the same clock, so one that plays shows moving pictures.
// Page loads and in-app navigation are both followed: nothing in the flow has to announce them.
// frames.json holds, per frame, its time, its picture and the pointer ([x, y, pressed, overClickable], 0–1 of the page),
// plus `clicks` with the time and position of every click, `steps` with the time each step began,
// and `pages` with the title, address and favicon of each page that was loaded.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { _electron } = require("playwright-core");
const { launch } = require("./chrome.cjs");

const FPS = 60, STEP = 1000 / FPS;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

(async () => {
  const flow = JSON.parse(fs.readFileSync(path.resolve(process.argv[2] || "flow.json"), "utf8"));
  const name = flow.name || "flow";
  if (!/^[A-Za-z0-9][\w.-]*$/.test(name)) throw new Error(`flow.name "${name}" must be a plain folder name (letters, digits, dot, dash, underscore).`);
  const dir = path.join(process.cwd(), "out", name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  let closer, page;
  if (flow.electron) {
    const app = await _electron.launch({
      executablePath: flow.electronBin || path.join(flow.electron, "node_modules", ".bin", "electron"),
      args: [flow.electron],
      colorScheme: flow.scheme || "light",
    });
    page = await app.firstWindow();
    closer = () => app.close();
  } else {
    const browser = await launch();
    const [width, height] = flow.viewport || [1512, 950];
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: flow.dsf || 2,
      colorScheme: flow.scheme || "light",
      hasTouch: !!flow.touch,
      isMobile: !!flow.touch,
    });
    page = await context.newPage();
    closer = () => browser.close();
  }
  await page.clock.install();
  // A video runs on the real clock, which this recording does not follow. Take over play and pause,
  // keep every video paused for real, and move the ones that "play" forward one frame at a time.
  await page.addInitScript(() => {
    const proto = HTMLMediaElement.prototype, reallyPause = proto.pause, state = new WeakMap();
    const of = (el) => state.get(el) || state.set(el, { playing: false, seen: false }).get(el);
    proto.play = function () { const s = of(this); s.seen = true; if (!s.playing) { s.playing = true; if (this.readyState === 0) { this.preload = "auto"; this.load(); } this.dispatchEvent(new Event("play")); this.dispatchEvent(new Event("playing")); } return Promise.resolve(); };
    proto.pause = function () { const s = of(this); s.seen = true; if (s.playing) { s.playing = false; this.dispatchEvent(new Event("pause")); } };
    Object.defineProperty(proto, "paused", { configurable: true, get() { return !of(this).playing; } });
    window.__stepMedia = (seconds) => {
      let moving = 0;
      for (const el of document.querySelectorAll("video, audio")) {
        const s = of(el);
        if (!s.seen) { s.seen = true; if (el.autoplay) { s.playing = true; if (el.readyState === 0) { el.preload = "auto"; el.load(); } } }
        reallyPause.call(el);
        if (!s.playing || !(el.duration > 0)) continue;
        let at = el.currentTime + seconds * (el.playbackRate || 1);
        if (at >= el.duration) { if (el.loop) at %= el.duration; else { at = el.duration; s.playing = false; el.dispatchEvent(new Event("ended")); } }
        el.currentTime = at;
        if (el.tagName === "VIDEO") moving++;
      }
      return moving;
    };
  });

  // Pause the page's clock, hide the real cursor, and hold CSS animations to the fake clock.
  async function prepare() {
    await page.waitForLoadState("load");
    await page.evaluate(() => document.fonts.ready);
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
    await page.addStyleTag({ content: "nextjs-portal{display:none!important} *{cursor:none!important} ::-webkit-scrollbar{display:none}" });
    await page.evaluate(() => { window.__birth = new Map(); });
    for (let i = 0; i < 60; i++) await page.clock.runFor(STEP);
    await describePage();
    where = await page.evaluate(() => location.href + "|" + document.title);
  }

  // What a browser's title bar would show for this page. The address keeps host and path only:
  // query strings and fragments can carry tokens, so they never reach the video.
  let frameNo = 0, where = "";
  const pages = [], icons = new Map();
  async function describePage() {
    const info = await page.evaluate(() => {
      const link = [...document.querySelectorAll('link[rel~="icon"]')].pop();
      return { title: document.title, protocol: location.protocol, host: location.host, path: location.pathname, iconUrl: link ? link.href : location.protocol === "file:" ? "" : location.origin + "/favicon.ico" };
    }).catch(() => null);
    if (!info) return;
    if (info.iconUrl && !icons.has(info.iconUrl)) {
      icons.set(info.iconUrl, await page.evaluate(async (address) => {
        try {
          const response = await fetch(address);
          if (!response.ok) return null;
          const blob = await response.blob();
          if (blob.size >= 200000) return null;
          return await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); });
        } catch { return null; }
      }, info.iconUrl).catch(() => null));
    }
    const file = info.protocol === "file:", local = file || /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(info.host);
    const shown = local && flow.address ? String(flow.address).replace(/^https?:\/\//, "").replace(/\/$/, "") : null;
    const entry = { t: Number((frameNo / FPS).toFixed(2)), title: info.title, host: shown || (file ? "Local file" : info.host.replace(/^www\./, "")), path: file ? "" : info.path.replace(/\/$/, ""), secure: shown ? true : info.protocol === "https:", local: shown ? false : local, icon: icons.get(info.iconUrl) || null };
    const last = pages[pages.length - 1];
    if (last && last.t === entry.t) pages[pages.length - 1] = entry; else pages.push(entry);
  }
  if (flow.url) await page.goto(flow.url, { waitUntil: "load" });
  else if (flow.electron) await page.reload({ waitUntil: "load" }); // so the page starts on the fake clock
  await prepare();

  const size = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  const pts = [], img = [], track = [], clicks = [], steps = [];
  let written = 0, lastHash = "", lastPointer = "";
  let pointer = flow.touch ? [size.width / 2, size.height / 2] : [size.width * 0.62, size.height * 0.58];
  let pressed = false;

  async function frame() {
    if (!flow.touch) await page.mouse.move(pointer[0], pointer[1]);
    await page.clock.runFor(STEP);
    const look = async () => {
      // Move playing videos on by one frame, and give each a moment of real time to show that picture.
      if (await page.evaluate((seconds) => window.__stepMedia(seconds), STEP / 1000)) {
        for (let tries = 0; tries < 60 && (await page.evaluate(() => [...document.querySelectorAll("video")].some((v) => v.seeking))); tries++) await new Promise((done) => setTimeout(done, 5));
      }
      return page.evaluate(([x, y]) => {
      const now = performance.now();
      for (const a of document.getAnimations()) {
        if (a.playState === "finished") continue;
        if (!window.__birth.has(a)) window.__birth.set(a, now);
        const age = now - window.__birth.get(a);
        const end = a.effect?.getComputedTiming().endTime ?? 0;
        if (Number.isFinite(end) && age >= end) a.finish();
        else { a.pause(); a.currentTime = age; }
      }
      return { hand: !!document.elementFromPoint(x, y)?.closest("a,button,summary,label,select,[role=button],[role=tab],[role=switch],[role=link],[role=menuitem],[data-clickable]"), where: location.href + "|" + document.title };
      }, pointer);
    };
    // A click may have loaded a new page: its clock is not prepared yet, so the first look fails. Prepare it and look again.
    const seen = await look().catch(async () => { await prepare(); return look(); });
    const hand = seen.hand;
    // The address or title changed, by a page load or inside the app: note what the title bar shows from here on.
    if (seen.where !== where) { where = seen.where; await describePage(); }
    const shot = await page.screenshot({ type: "jpeg", quality: 93 });
    const hash = crypto.createHash("sha1").update(shot).digest("hex");
    const at = [pointer[0] / size.width, pointer[1] / size.height, pressed ? 1 : 0, hand ? 1 : 0];
    const key = at.join(",");
    if (hash !== lastHash) {
      written++;
      fs.writeFileSync(path.join(dir, `f-${String(written).padStart(4, "0")}.jpg`), shot);
      lastHash = hash;
    }
    if (written && (img[img.length - 1] !== written || key !== lastPointer)) {
      pts.push(Number((frameNo / FPS).toFixed(4)));
      img.push(written);
      track.push(at.map((v) => Number(v.toFixed(4))));
      lastPointer = key;
    }
    frameNo++;
  }
  const hold = async (seconds) => { for (let i = 0; i < Math.round(seconds * FPS); i++) await frame(); };

  async function target(what) {
    const locator = what.startsWith("css=") ? page.locator(what.slice(4)) : page.getByText(what, { exact: true });
    const first = locator.first();
    await first.scrollIntoViewIfNeeded().catch(() => {});
    const box = await first.boundingBox();
    if (!box) throw new Error(`not found: ${what}`);
    // Low and right of centre, so the cursor does not cover the label.
    return flow.touch ? [box.x + box.width / 2, box.y + box.height / 2] : [box.x + Math.min(box.width * 0.72, box.width - 6), box.y + Math.min(box.height * 0.7, box.height - 4)];
  }
  async function glideTo(to, seconds = 0.55) {
    if (flow.touch) { pointer = to; return; }
    const from = pointer, frames = Math.max(2, Math.round(seconds * FPS));
    const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
    const ctrl = [(from[0] + to[0]) / 2 - dy * 0.1, (from[1] + to[1]) / 2 + dx * 0.1];
    for (let f = 1; f <= frames; f++) {
      const u = ease(f / frames);
      pointer = [0, 1].map((k) => (1 - u) ** 2 * from[k] + 2 * (1 - u) * u * ctrl[k] + u * u * to[k]);
      await frame();
    }
  }

  await hold(flow.lead ?? 0.6);
  for (const step of flow.steps) {
    steps.push({ t: Number((frameNo / FPS).toFixed(2)), step: Object.keys(step)[0] });
    if (step.wait !== undefined) await hold(step.wait);
    else if (step.goto) { await page.goto(step.goto, { waitUntil: "load" }); await prepare(); await hold(0.4); }
    else if (step.hover) { await glideTo(await target(step.hover)); await hold(step.after ?? 0.5); }
    else if (step.click) {
      await glideTo(await target(step.click));
      await hold(0.15);
      clicks.push({ t: Number((frameNo / FPS).toFixed(4)), x: pointer[0] / size.width, y: pointer[1] / size.height });
      pressed = true;
      if (flow.touch) await page.touchscreen.tap(pointer[0], pointer[1]);
      else { await page.mouse.down(); await hold(0.08); await page.mouse.up(); }
      if (flow.touch) await hold(0.08);
      pressed = false;
      await hold(step.after ?? 0.7);
    } else if (step.type !== undefined) {
      for (const ch of step.type) { await page.keyboard.type(ch); await hold(0.05); }
      await hold(step.after ?? 0.4);
    } else if (step.press) { await page.keyboard.press(step.press); await hold(step.after ?? 0.6); }
    else if (step.scroll !== undefined) {
      if (step.at) await glideTo(await target(step.at));
      const seconds = step.dur ?? 0.7, frames = Math.round(seconds * FPS);
      // On a phone the page follows a finger: the swipe is recorded so the dot can travel with it.
      if (flow.touch) clicks.push({ t: Number((frameNo / FPS).toFixed(4)), x: 0.5, y: step.scroll > 0 ? 0.68 : 0.36, x2: 0.5, y2: step.scroll > 0 ? 0.36 : 0.68, dur: seconds });
      let done = 0;
      for (let f = 1; f <= frames; f++) {
        const want = step.scroll * ease(f / frames);
        if (flow.touch) await page.evaluate((dy) => window.scrollBy(0, dy), want - done);
        else await page.mouse.wheel(0, want - done);
        done = want;
        await frame();
      }
      await hold(step.after ?? 0.5);
    }
  }
  await hold(flow.tail ?? 0.8);
  await closer();

  const bursts = pts.filter((t, i) => i > 0 && t - pts[i - 1] >= 0.25);
  fs.writeFileSync(path.join(dir, "frames.json"), JSON.stringify({
    width: size.width, height: size.height, ext: "jpg", duration: frameNo / FPS, startMs: null,
    pointer: flow.touch ? "touch" : "cursor", pts, img, track, clicks, steps, pages, bursts,
  }));
  console.log(steps.map((s, i) => `${i} ${s.step} at ${s.t}s`).join("\n"));
  console.log(`${dir}: ${written} pictures, ${pts.length} frames, ${(frameNo / FPS).toFixed(1)}s, ${clicks.length} clicks at ${clicks.map((c) => c.t.toFixed(1)).join(", ")}`);
})().catch((error) => { console.error(error); process.exit(1); });
