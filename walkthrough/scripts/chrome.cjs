// Finds a Chromium to drive, always headless so no window appears: CHROME_PATH, then installed
// Google Chrome, then a Chromium that Playwright downloaded (~/Library/Caches/ms-playwright).
// Never the person's own everyday browser.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright-core");

function downloaded() {
  const cache = path.join(os.homedir(), "Library", "Caches", "ms-playwright");
  if (!fs.existsSync(cache)) return null;
  const builds = fs.readdirSync(cache).filter((name) => /^chromium-\d+$/.test(name)).sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
  for (const build of builds) {
    for (const folder of ["chrome-mac-arm64", "chrome-mac"]) {
      for (const app of ["Google Chrome for Testing", "Chromium"]) {
        const binary = path.join(cache, build, folder, `${app}.app`, "Contents", "MacOS", app);
        if (fs.existsSync(binary)) return binary;
      }
    }
  }
  return null;
}

async function launch(args = []) {
  const flags = ["--force-color-profile=srgb", "--allow-file-access-from-files", ...args];
  if (process.env.CHROME_PATH) return chromium.launch({ executablePath: process.env.CHROME_PATH, args: flags, headless: true });
  try {
    return await chromium.launch({ channel: "chrome", args: flags, headless: true });
  } catch {
    const binary = downloaded();
    if (!binary) throw new Error("No browser to record with. Run `npx playwright install chromium` once: it downloads a private Chromium and does not touch your own browser.");
    return chromium.launch({ executablePath: binary, args: flags, headless: true });
  }
}

module.exports = { launch };
