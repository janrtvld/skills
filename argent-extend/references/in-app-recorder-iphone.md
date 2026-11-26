# Record a physical iPhone from inside the app

Use this when the app is your own and QuickTime capture is not available or not allowed (it needs camera access for the recording app on the Mac and control of the Mac's screen). The app records its own windows with ReplayKit and writes a movie into its documents folder. Nothing on the Mac needs permission.

## What it gives and what it does not

- Real presentation timestamps at the display's rate, with frames written only while the screen changes. Gaps in the timestamps are a still screen; a burst of frames is the transition.
- Sheets, modals and the keyboard are included.
- The system status bar, other apps and system dialogs are not. Check those with screenshots.
- No audio is recorded.

## Add it once

1. Copy [`scripts/QACapture.swift.template`](../scripts/QACapture.swift.template) into the app's iOS code (a local native module is the tidy place) as `QACapture.swift`.
2. Call `QACapture.shared.startFromLaunchArguments()` when the app finishes launching.
3. The file compiles only under `DEBUG` or the `QA_CAPTURE` compilation condition. For motion checks, make a release build with `QA_CAPTURE` set so the timing is release timing, for example with an environment-driven line in the module's podspec:

   ```ruby
   s.pod_target_xcconfig = { 'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited) QA_CAPTURE' } if ENV['QA_CAPTURE']
   ```

   Never ship a build that has it. Confirm the store build is made without the condition.

## Record

```sh
export CAPTURE_DEVICE=<iPhone udid> CAPTURE_BUNDLE_ID=<app bundle id>
scripts/iphone-capture.sh start 30        # seconds; the app polls for the request once a second
```

- Alternative on a fresh launch: start the app with the launch arguments `-QACapture 30`.
- The first recording after each app launch shows the system's screen-recording consent alert. Accept it through the device tools: put the system UI under automation, tap the allow button, then give the app back. Do this only while the alert is showing.
- Replay the gesture in one sequence. Keep element-tree queries out of the timed part.
- The recording ends by itself. `scripts/iphone-capture.sh stop` ends it early.

## Pull and clean up

```sh
scripts/iphone-capture.sh pull /path/clip.mov      # also pulls the recorder's log
```

Inspect the clip with the frame tools in [frame-inspection.md](frame-inspection.md). Delete clips when the check is done; they hold the app's screen content.
