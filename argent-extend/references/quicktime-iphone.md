# Record a physical iPhone with QuickTime

QuickTime runs on the Mac with the iPhone connected over USB. The agent needs access to that Mac's GUI and to the saved movie. If Argent drives the phone from another host, verify the movie can be read from the analysis host using an authorized location.

## Capture

1. Connect and unlock the iPhone. Confirm Argent can target the intended device and bring the test app to the starting state. If the Mac or iPhone requires a trust, unlock, or access step you cannot perform, get it resolved before relying on capture.
2. In QuickTime Player choose **File → New Movie Recording**. Open the menu beside Record and select the connected iPhone as the capture source. Check the preview shows the actual phone screen. Use High quality for the initial trial. Check the audio source before recording. If capture would collect audio outside the task's authorization, use a permitted setup or skip this capture path.
3. Start recording, replay the interaction through Argent, wait for the UI to settle, and stop. Capture each direction of a round trip in the same short clip or in two clearly named clips. Use a short bounded session and stop even if replay fails. Save the movie locally with a name that identifies the device and build.
4. Open the saved movie and check that it contains the full transition. When trying this setup for the first time, record a short harmless gesture while Argent controls the phone. This establishes whether recording and replay work concurrently and whether the agent can access the file. If the check concerns system chrome, compare the capture against the physical screen or a device screenshot first and make sure the relevant area is faithfully represented.

If QuickTime is unavailable, a tester can use the iPhone's built-in screen recording and supply the clip, if allowed. Where only stills are available, capture reachable held states and endpoints and report any unobserved motion.

[Apple's QuickTime recording guide](https://support.apple.com/en-gb/guide/quicktime-player/qtp356b55534/mac) · [Apple's iPhone screen recording guide](https://support.apple.com/en-us/102653)
