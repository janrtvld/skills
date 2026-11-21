---
name: walkthrough
description: Make a short narrated walkthrough video of work an agent just finished, like a colleague's Loom - the real app recorded and cut into chapters, a voice explaining what changed, captions, a touch dot or cursor, in a clean device frame. Works for iOS apps in the Simulator, web apps, phone-sized web pages and Electron apps. Use after building or changing UI when someone has to review it, or when asked for a walkthrough, demo, Loom, narrated video, PR video, or to show or explain the work on video. Not for backend-only or tiny changes with nothing visible to show.
---

# Walkthrough

A reviewer does not watch three minutes of an agent clicking through screens. They watch 45 seconds of a colleague showing what changed and saying why it matters. This skill makes that video: plan the explanation first, record the real app second, then cut the footage to the explanation. The video sits in the pull request for the person reviewing it, and it should also make sense to someone they forward it to, such as a product manager who has not seen the code.

The result is one MP4 (1920×1080, 60fps, with sound and burned-in captions) and a `chapters.json` beside it for whatever page plays it. The frame is plain: a light grey background, the device in the centre, a caption pill at the bottom, and at most two line annotations.

## When asked to "set up" or "install" the skill

There is nothing to prepare ahead of a video except the voice choice. Do only this:

1. Run the status check under "Ask once" below, and ask the voice question if it says `undecided`.
2. Say in one or two lines that it is ready and which voice videos will get.
3. Ask what the first video should show, or offer the most recent visible change you can see in the current project.

Do not create a project folder, install packages, or audit the machine until there is a change to show: the folder belongs to one video (step 2). Do not report tool versions, disk space or the like unless something needed is actually missing.

## Pick a change worth showing

A walkthrough is for something a person can see: a new screen, a changed flow, a visible fix. Before anything else, look at what you were asked to show (the named change, or else the recent work: the branch's diff, the last merged pull requests, recent commits) and decide whether there is something to watch.

- **There is something visible:** show it. If you chose it yourself from the recent work, say which change you picked in one line before you start.
- **There is not** (a backend-only fix, a refactor, config, a dependency bump, a one-line tweak), **or it is unclear:** do not guess and do not make a video of nothing. Ask the user what the video should show. Use your question tool if you have one, and offer what you found: the last one or two changes that do have something visible, by title; a demo of an existing feature; or no video and a short written summary instead. This holds even when the user named the change themselves: tell them it has nothing to show on screen and ask what they want to see.

A change is worth a video when it takes at least two or three steps to show. A single changed label or colour is a screenshot.

## Ask once: how the voice should sound

Do this next, before any setup or recording, so nothing surprises the user ten minutes in.

```bash
node <this skill>/scripts/service.cjs status
```

- `signed-in`, `own-key` or `local`: already decided. Say in one line which voice the video will get and carry on. Do not ask again.
- `undecided`: the command prints the question to ask and both answers, word for word. Ask it with your question tool if you have one (in Claude Code, `AskUserQuestion`), otherwise in a message, and wait. Use its wording: it is written so the user understands why GitHub comes up at all (the natural voice is made on a server, and the sign-in keeps that free voice from being abused). If you also have to ask what the video should show, ask both in the same go.

Then act on the answer:

- **Natural voice:** say "Opening GitHub in your browser. Press Authorize there, then come back here." and run `node <this skill>/scripts/service.cjs login`. It opens one link in their default browser and waits up to about a minute and a half; when they press Authorize it answers "Signed in as …" and you carry on without asking anything. If it exits with code 2 they have not finished: give them the link it printed, as a clickable link, and run it again. On a remote machine use `login --no-open` and give them the link. Never press Authorize for them or sign in on their behalf.
- **Built-in Mac voice:** run `node <this skill>/scripts/service.cjs local`, then confirm in one or two lines: you'll use the Mac's built-in voice and nothing leaves the machine, and they can get the natural voice later by signing in or by adding their own ElevenLabs key (in `~/.config/walkthrough/elevenlabs-key`, or `ELEVENLABS_API_KEY`). Do not ask anything further; carry on.

An own ElevenLabs key is not a choice to offer up front: it is something the user sets up themselves. If `status` says `own-key` they already did. Never ask them to paste a key in the chat.

The choice is remembered in `~/.config/walkthrough/share.json`, so later videos do not ask again. `service.cjs login` or `local` changes it; `logout` signs out. The other scripts never sign in by themselves: when `speak` or `share.cjs` exits with code 3, the user has not chosen yet, so come back to this step.

**Opening things for the user.** When the user has to see a page, open it with the system default (`open <url>` on a Mac) or give them a clickable link. Never launch a particular browser by name: they may have several, and the one you pick is probably not theirs.

## 1. Pick the source

```
What is being shown?
├── A native iOS app (SwiftUI, React Native, Expo)      → record the Simulator        (§4)
├── A web app at desktop size                           → web-record.cjs, "safari"    (§5)
├── A web page at phone size                            → web-record.cjs, "iphone"    (§5)
└── An Electron app                                     → web-record.cjs, "window"    (§5)
```

A native macOS app that is not Electron is not covered.

## 2. Make the video's project folder

Do this once you know what the video will show, not before. Everything in this skill's folder is self-contained. Make a project folder for this video next to the user's other projects, named after their project (never only in a temp directory: it gets cleared), then:

```bash
cp -R <this skill>/scripts <project>/
cp <this skill>/templates/walkthrough.html <project>/index.html
cd <project> && npm init -y && npm i playwright-core
swiftc scripts/cursors.swift -o out-cursors && ./out-cursors cursors && rm out-cursors   # desktop web and Electron only
```

The last line draws the Mac's own arrow and hand cursors into `cursors/`; a phone or Simulator walkthrough shows a touch dot and does not need it.

Needs Node and ffmpeg; the Simulator source also needs Xcode. Run every script from the project root. Mention a tool only if it is missing; the user does not need a report of what is installed.

Recording and rendering drive their own invisible browser, never the user's. They use Google Chrome if it is installed, otherwise a private Chromium: if a script says none was found, run `npx playwright install chromium` once (about 150 MB). Do not point `CHROME_PATH` at the user's own browser (Brave, Arc, Dia and so on): it can pop up their windows and use their profile.

A take is about 1 GB of frames per minute. Check free disk space first, and delete `out/<clip>` folders of takes that are no longer used.

## 3. Plan the explanation before recording

1. Read the diff or the feature's code and write down the 3–5 things a reviewer has to see. Each becomes a chapter. Leave out setup, navigation they already know, and anything that did not change.
2. Decide who is speaking. By default it is the agent showing its own change, the way a colleague would on a call: "Here's what I added", "I'll open an episode to show both". It is not a product pitch. Use the author's own voice only when the user asks for a showcase in their name.
3. Write one or two sentences per chapter, 12–30 words. Say what changed and why it matters, in words a product manager would follow; never read button labels or describe the tap. Say only what the footage and the code support. Write numbers and times as spoken ("six thirty-eight").
4. Talk about the product, never about how the video was made. Leave out the simulator, the recorder, the browser automation, test accounts and test data, the build type, and what the agent could or could not check: "I'm in a simulator, so I can test this end to end" is the agent thinking aloud, not something the viewer needs. If a limit of the setup changes what the viewer sees, put it in the pull request text, not in the voice.
5. Do not address the viewer with requests or offers. No "comment on the PR and I'll fix it", "let me know", or "tell me what to change": the video may be watched by someone who is not the reviewer. Open with what was added, in one sentence, and close with one plain sentence on what now works.
6. Aim for 45–60 seconds. Over 90, cut a chapter before trimming words.
7. Rehearse the flow once without recording.

## 4. Record the iOS Simulator

The app runs in real time, so it is recorded while you drive it, and the cut is made afterwards.

1. Boot the simulator, launch the app, and put it on the first screen of the flow.
   - Record whatever build is already running; a development build served by a dev server is the default, because a walkthrough should take minutes, not a build.
   - A development build can answer taps late and stutter through transitions, and the video shows that as it is. Building a Release version first fixes it but can add 20 minutes or more. Do that only when the user asks for it or says the motion in a video looks off; say what it will cost in time before starting.
2. Clean the status bar: `xcrun simctl status_bar <udid> override --time "9:41" --batteryState charged --batteryLevel 100 --cellularMode active --cellularBars 4 --wifiBars 3 --dataNetwork wifi`.
3. `sh scripts/sim-record.sh start <udid> src/flow.mov`, drive the flow, `sh scripts/sim-record.sh stop src/flow.mov`.
   - Drive it with whatever simulator-control tool the session has. For every touch keep its wall-clock time in ms and its position as 0–1 of the screen. If the tool returns no timestamp, take the time right before the call.
   - Send the whole flow as one sequence with 2–2.5s between touches. Waiting is free while the screen is still: still stretches are cut.
   - Take a target's position from an inspection tool, not from pixels. After a scroll, take it from a frame of a rehearsal recording: the accessibility tree can report positions from before the scroll.
   - After a scroll, wait 3–4s before tapping in the list. A tap on a list that is still settling only stops it.
   - If a feature costs money per use (cloud analysis, paid APIs), prepare exactly one item and make sure the app does not process others in the background.
4. `node scripts/sim-frames.cjs src/flow.mov flow` writes `out/flow/` with one picture per screen change and `frames.json`.

## 5. Record a web page or an Electron app

`web-record.cjs` drives the page itself with Playwright. The page's clock is paused and moved 1/60s per frame, so nothing is dropped and the same flow always gives the same footage.

Write `flow.json`:

```json
{
  "name": "flow",
  "url": "http://localhost:3000",
  "viewport": [1512, 950],
  "steps": [
    { "wait": 0.6 },
    { "click": "Sign in" },
    { "type": "hello@example.com" },
    { "press": "Enter" },
    { "scroll": 600 },
    { "hover": "css=.card" }
  ]
}
```

- **Desktop web:** `"viewport": [1280, 760]`. Use `"frame": "safari"` in `narration.json`, or `"chrome"` when the work is specific to Chrome. Both are browser windows that show the page's own title, address and favicon, which the recorder captures; the address keeps host and path only, never a query string. For the page full-screen on a laptop instead, record at `[1512, 950]` and use `"frame": "macbook"`.
- **Phone-sized web:** `"viewport": [402, 781]`, `"dsf": 3`, `"touch": true`. Clicks become taps and scrolls become swipes. Use `"frame": "iphone"`: the frame leaves room for a status bar and draws the Dynamic Island.
- **Electron:** replace `url` with `"electron": "<app folder>"` (and `"electronBin"` when the binary is not in that folder's `node_modules/.bin`). Use `"frame": "window"` and set `"windowTitle"`. The title bar is drawn by the template, not recorded.
- `click` and `hover` take visible text or `css=<selector>`. A click that loads a new page, or navigates inside the app, needs nothing extra: the recorder follows both, and the title bar in the video follows too.
- **Videos on the page play.** The recorder steps them frame by frame with everything else, so an embedded video that the flow starts (or that autoplays) shows moving pictures. Its sound is not recorded.
- **Running the app.** If the project's usual port is taken, start the dev server on a free one from the command line and stop it when you are done; do not edit the project's config files for it. Add `"address": "example.com"` to `flow.json` to show the product's real address in the video's address bar instead of `localhost:<port>`.
- **Leave the user's repository as you found it.** The walkthrough project lives in its own folder beside it. Do not add files, config entries or patches to their repo for the sake of the video, and if a script in this skill seems to need a change to cope with their app, say so in your report: do not quietly patch your copy.
- Then `node scripts/web-record.cjs flow.json`. It prints when each step began and when each click landed; chapters are cut on those times.
- A playing `<video>` or anything else on a real-time clock is not stepped. Leave it paused during the recording.

## 6. Write `narration.json`

```json
{
  "clip": "out/flow",
  "frame": "iphone",
  "touches": [{ "ms": 1795084920109, "x": 0.5, "y": 0.238 }, { "ms": 1795084925217, "x": 0.5, "y": 0.6, "x2": 0.5, "y2": 0.2, "dur": 0.4 }],
  "chapters": [
    { "title": "What changed", "from": 0, "text": "Here's what I added: a chapter list, and automatic ad skipping." },
    { "title": "Auto-skip", "from": 12, "maxIdle": 1.1, "speechAt": 1.6, "text": "When the ad starts, playback jumps ahead.",
      "notes": [{ "label": "Ad skipped", "side": "right", "y": 0.85, "at": 15.1 }] },
    { "title": "That's it", "text": "So episodes now have chapters, and ads are skipped on their own." }
  ]
}
```

- `touches` is for a Simulator clip only: every touch as it was sent. A swipe adds `x2`, `y2` and `dur`. For a `web-record.cjs` clip leave it out; its clicks are used.
- A chapter's footage starts at `from` (the index of its first touch or click) or at `at` (seconds into the recording, for a chapter that opens on a scroll or the first frame). It runs to the next chapter's start. A chapter with neither holds the last picture.
- A chapter lasts as long as the longer of its footage and its speech.
- `speechAt` delays the voice inside the chapter so a sentence lands on the moment it describes. Measure that moment in the recording (for example the first frame where a banner's region changes, with ffmpeg's `signalstats` on a crop), turn it into seconds from the chapter's start, and subtract the key word's start from `speech.json`. If that leaves more than 3s of silence, add a sentence before the timed one.
- `maxIdle` (default 0.7) is the longest a still picture stays up in that chapter. Set it to 1.1 while a clock or progress bar ticks once a second, or playback runs visibly fast.
- `notes` draw a hairline from the device's edge at height `y` (0–1 of the screen) with a label on it, from `at` to `until` seconds into the chapter. At most two at a time, one or two words each, only for something on screen at that moment. Captions cover the bottom of a phone's screen, so never point a note there.

## 7. Voice, stills, render

```bash
node scripts/narrate.cjs speak                         # one audio file per chapter + out/narration/speech.json
node scripts/render.cjs stills 2,9.5,21                # look before rendering: one still per chapter
node scripts/render.cjs video out/silent.mp4           # 4–10 minutes for 50s; run it in the background
node scripts/narrate.cjs mux out/silent.mp4 out/<name>-<n>s.mp4
```

- **Voice:** `speak` uses what the user chose in "Ask once". With their own ElevenLabs key there is no limit, and `"voice"` in `narration.json` or `WALKTHROUGH_VOICE` can pick another voice id. Signed in, it uses the service's hosted voice: the same casual voice (Chris), about 50,000 characters a day per person (a video is about 900); when that runs out, `speak` says so and continues with the built-in voice on a Mac. With the local choice, or `speak --local`, it uses macOS `say`: robotic, with estimated word timings, and nothing sent anywhere. If `speak` exits with code 3 nobody chose yet: go back to "Ask once". With a key or the hosted voice the narration text is sent over the network to be spoken: say so if the change is confidential. Never put a key in a project or a repository, and never read one from another project without asking.
- Chapters are cached by text and voice. Changing one sentence re-voices one chapter.
- `mux` lays each chapter's speech where the page starts it, normalises loudness to about −16 LUFS, and writes `out/<name>-<n>s.chapters.json` (title, text, start, duration, and each sentence with the moment it is spoken).
- `SCALE=2 node scripts/render.cjs video …` renders 3840×2160 and takes about four times as long. Do it only when asked.
- After loading, the page exposes `window.CHAPTERS` (start, duration and touch times per chapter) and `window.OFFSET` (how the Simulator's clock was matched to the touch timestamps). When fewer than half the touches matched, check a still at every touch.

## 8. Check before sending

1. `ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate -show_entries format=duration out/<file>.mp4`
2. Contact sheet of the encoded file: `ffmpeg -i out/<file>.mp4 -vf "fps=24/<duration>,scale=640:-1,tile=6x4" -frames:v 1 out/contact.png`. Check that each touch dot or cursor sits on its target, each sentence's subject is on screen while it is spoken, and nothing is clipped.
3. Silences: `ffmpeg -i out/<file>.mp4 -af silencedetect=noise=-40dB:d=1.5 -vn -f null -`. One over 3s needs a sentence or a tighter cut.
4. Read the narration once more as the product manager: any mention of the simulator, the recording or the test setup, and any request to the viewer, comes out.

## 9. Hand it over

The user wants to watch it, not read about it.

1. Open the video so it plays (`open out/<file>.mp4`) and say you did. Then, in two or three lines: what it shows, how long it is, and where the file is. Say plainly that you have not listened to the audio, if that is so.
2. Offer one next step, not a menu. Signed in: ask whether they want a link to share it (§10). Built-in voice: nothing to ask; after their first video only, add one line that the natural voice is one sign-in away.
3. If they want something changed (wording, a cut, a different moment), change only that: speech is cached per chapter, and footage that is still right does not need recording again.
4. Later videos skip all the questions: the voice choice is remembered, so go straight from picking the change to recording.

## 10. Share a link

Only when the user asks for a link ("create a link", "share it", "send it to my coworker"). Uploading puts the video on the internet for anyone who has the link. It uses the same GitHub sign-in as the hosted voice, so someone who signed in at the start is not asked again.

```bash
node scripts/share.cjs out/<name>-<n>s.mp4 "Title of the change"
```

- It uploads the video, a poster, one still per chapter and the chapters, and prints a link to a page with the video, its chapters and the transcript. Use the pull request's title as the title.
- **Needs the sign-in.** If `share.cjs` exits with code 3 the user is not signed in (they chose the built-in voice or their own key). Tell them a share link needs the free GitHub sign-in, because uploads need an owner, ask whether they want it, and only then follow "Natural voice" under "Ask once". The sign-in is kept in `~/.config/walkthrough/share.json`; `service.cjs logout` removes it.
- The page shows the user's GitHub name as the author. The link ends in three random words and four characters (like `quiet-amber-falcon-x7k2`) and is not indexed. Everything is deleted 30 days after upload; tell the user the link and its expiry date.
- **Limits:** 10 links a day per account, 50 MB per video. A walkthrough is normally 5–15 MB; if one is larger, render it at 1080p and not 4K.

## How the picture is built

- **Frames:** the iPhone is drawn from measured hardware (case, display, corner profile, buttons, Dynamic Island); the MacBook is a front-view approximation. Those measurements come from the MIT-licensed `device-frames` skill in `ibelick/ui-skills`.
- **Browser windows:** `safari` is one 52pt toolbar with the window buttons, sidebar, back and forward, a centred address field with the lock and host, then share, new tab and tab overview. `chrome` is a tab strip with one tab (favicon, title, close) over a toolbar with back, forward, reload, the address pill with host and path, a profile dot and the menu. They follow the shape of those browsers on macOS and carry no logos; `window` is a plain app window with a title bar. All of this chrome is drawn, not recorded, and scales with the page.
- **Touch dot:** drawn only at touches that were sent. Between two touches up to 2.4s apart it glides from one to the next; after a longer rest it fades and comes back near the next touch. A swipe follows the swipe.
- **Cursor:** the real macOS arrow, and the hand over anything clickable, following the path the recorder moved the mouse along. `scripts/cursors.swift` writes the two images from the system during setup; they are not shipped with the skill.
- **Captions:** one dark pill at the bottom centre. A phrase ends at punctuation or after five words; the pill grows word by word.
- **Cutting:** a still picture is shown for at most 0.7s. The picture is identical on both sides of such a cut, so it never shows.
