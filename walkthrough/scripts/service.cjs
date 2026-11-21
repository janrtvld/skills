// The walkthrough service: sign-in, and the calls the other scripts make to it (share.cjs, narrate.cjs).
// The sign-in and the server's address live in ~/.config/walkthrough/share.json.
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const SERVICE = "https://walkthrough.jan.computer";
const CONFIG = path.join(os.homedir(), ".config", "walkthrough", "share.json");
const config = fs.existsSync(CONFIG) ? JSON.parse(fs.readFileSync(CONFIG, "utf8")) : {};
const service = (process.env.WALKTHROUGH_SHARE_URL || config.url || SERVICE).replace(/\/$/, "");
const save = () => { fs.mkdirSync(path.dirname(CONFIG), { recursive: true }); fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 }); };
const stop = (message, code = 1) => { console.error(message); process.exit(code); };

async function call(method, route, body, type) {
  const response = await fetch(service + route, {
    method,
    headers: { ...(config.token ? { Authorization: "Bearer " + config.token } : {}), ...(type ? { "Content-Type": type } : {}) },
    body,
    signal: AbortSignal.timeout(300000),
  });
  const answer = await response.json().catch(() => ({}));
  if (response.status === 401 && config.token) { delete config.token; save(); }
  if (!response.ok) throw Object.assign(new Error(answer.error || `${service} answered ${response.status}`), { status: response.status });
  return answer;
}

// The person's own ElevenLabs key, if they have one: from the environment, or a private file outside any repository.
const KEY_FILE = path.join(os.homedir(), ".config", "walkthrough", "elevenlabs-key");
const ownKey = () => process.env.ELEVENLABS_API_KEY || (fs.existsSync(KEY_FILE) ? fs.readFileSync(KEY_FILE, "utf8").trim() : "");

// What the person chose for voice and sharing. Nothing here signs in by itself: the agent asks first,
// in the words below, so every agent explains it the same way.
const ASK = `Ask the person now, before recording, with your question tool if you have one. Use these words:
  Question: "How should the voice in your walkthrough sound?"
  1. "Natural voice (free)": "Sounds like a person talking you through the change. It is made on walkthrough.jan.computer, so you sign in with GitHub once. That only reads your public profile, and it is there so the free voice cannot be abused. You can then also share videos as a link."
  2. "Built-in Mac voice": "Sounds robotic, but needs no account and nothing leaves your Mac. You can switch to the natural voice later."
After 1: tell them "Opening GitHub in your browser. Press Authorize there, then come back here." and run: node scripts/service.cjs login
After 2: run: node scripts/service.cjs local`;

function status() {
  if (config.token) return { state: "signed-in", line: `signed-in: ${config.login} - natural hosted voice, share links available` };
  if (ownKey()) return { state: "own-key", line: "own-key: natural voice from your own ElevenLabs key; share links need a sign-in (ask before `login`)" };
  if (config.mode === "local") return { state: "local", line: "local: this Mac's built-in voice, no share links, nothing leaves the machine (chosen earlier)" };
  return { state: "undecided", line: "undecided: the person has not chosen a voice yet.\n" + ASK };
}

// Exit code 3 means "the person has not chosen this yet": ask them, never sign in on your own.
function needSession(what) {
  if (config.token) return;
  stop(`${what} needs the free GitHub sign-in, and the person has not signed in.\nAsk them first. If they agree: node scripts/service.cjs login`, 3);
}

// Sign-in with one link: the person opens it, presses Authorize on GitHub, and this command, which is
// waiting, collects the session. Run it only after they chose to sign in. It opens the link in their
// default browser; `login --no-open` only prints it (for a remote machine).
// Exit code 2: they have not finished yet. Give them the link it printed and run the command again.
async function login(open) {
  if (config.token) return console.log(`Already signed in as ${config.login}.`);
  let pending = config.pending && config.pending.link && config.pending.expires > Date.now() ? config.pending : null;
  if (!pending) {
    const start = await call("POST", "/api/login/start");
    pending = config.pending = { pairing: start.pairing, poll: start.poll, link: start.link, expires: Date.now() + (start.minutes - 1) * 60000 };
    save();
    if (open) try { process.platform === "win32" ? execFileSync("cmd", ["/c", "start", "", pending.link], { stdio: "ignore" }) : execFileSync(process.platform === "darwin" ? "open" : "xdg-open", [pending.link], { stdio: "ignore" }); } catch {}
  }
  for (const until = Date.now() + (open ? 100000 : 3000); Date.now() < until; ) {
    const answer = await call("POST", "/api/login/poll", JSON.stringify({ pairing: pending.pairing, poll: pending.poll }), "application/json").catch((error) => ({ error }));
    if (answer.error) { delete config.pending; save(); stop(answer.error.message); }
    if (answer.token) {
      Object.assign(config, { token: answer.token, login: answer.login });
      delete config.pending;
      delete config.mode;
      save();
      return console.log(`Signed in as ${answer.login}. Natural voice and share links are on.`);
    }
    await new Promise((done) => setTimeout(done, 2000));
  }
  stop(`Not signed in yet. Give the person this link and ask them to press Authorize on GitHub:\n  ${pending.link}\nThen run this command again.`, 2);
}

module.exports = { config, save, stop, call, service, ownKey, status, needSession };

//   node scripts/service.cjs status    what is set up: signed-in | own-key | local | undecided
//   node scripts/service.cjs login     GitHub sign-in: opens one link and waits for the person to press Authorize
//   node scripts/service.cjs local     remember: built-in voice, no sharing, no account
//   node scripts/service.cjs logout
if (require.main === module) {
  (async () => {
    const [command] = process.argv.slice(2);
    if (command === "status") console.log(status().line);
    else if (command === "login") await login(!process.argv.includes("--no-open"));
    else if (command === "local") { config.mode = "local"; delete config.pending; save(); console.log("Remembered: built-in voice, no share links, nothing leaves this machine.\nTell the person: for a more natural voice later, sign in (service.cjs login) or add their own ElevenLabs key in ~/.config/walkthrough/elevenlabs-key."); }
    else if (command === "logout") { delete config.token; delete config.login; delete config.pending; save(); console.log("Signed out."); }
    else console.log("usage: service.cjs status | login | local | logout");
  })().catch((error) => stop(error.message));
}
