# Verify on a release build

Judge motion, timing, keyboard behaviour and system bars on the build users get. A development build is a different program in the ways that matter here.

## What a development build changes

- **Speed.** JavaScript runs with development checks and without the release optimisations, so the JavaScript thread is slower. Anything driven from it stutters or lags in ways the release build does not, and work that looks fine in development can still be too slow where the release build is tighter on timing.
- **Timing.** Effects can run twice, bundles load from a dev server, and reloads change when things mount. Races between a server response and a local update show up differently. A flash that only appears with release timing is invisible in development.
- **Chrome.** A dev client adds its own launcher, menu and overlays, and can change how the status bar and splash screen behave. A status-bar defect can be masked completely.
- **Errors.** Development shows an error screen. Release fails silently or crashes.

Simulators and emulators add their own distortions: keyboard, audio session, haptics, performance and safe areas differ from hardware. Use them for leads.

## The loop

1. Iterate in development while building the behaviour.
2. Before judging how it feels, make a release build and install it on the physical phone.
3. Replay and record on that build. Fix, rebuild, replay under the same conditions.

Make step 2 one command per platform, so it gets run. Script it once per project:

- **Build** in release configuration for the connected device. In an Expo or React Native project that is the release configuration of the iOS scheme and the release variant on Android. A local release build needs a signing setup the device accepts (a development profile that includes the device on iOS; any installable signing on Android).
- **Install and launch** on the device by its id.
- **Stamp the build.** Show or log the commit the build came from, and check it on the device before recording. Recording a stale build is the most common way to "verify" a fix that is not installed. When the project has no stamp, build from a clean tree and compare a hash of the built package with the installed one (on Android, the path from `pm path` and a SHA-256 of both files). Do not amend or rewrite commits after building; the hash you noted for the installed build no longer names it.

Keep it fast:

- When only JavaScript changed, the native build is incremental and the cost is mostly re-bundling. Do not clean between runs.
- Stop the development server before a release build so the two do not compete, and run one native build at a time on a small machine.
- Batch fixes: one rebuild per round of changes, not per change. Set a build budget, and look at every frame around the fix on the first build for neighbouring defects before spending the next.

## Reporting

Name the build type and device beside every verdict. A check made on a development build or a simulator is reported as provisional until it has been replayed on a release build on a phone.
