# Skills

Agent skills by [Jan Rietveld](https://www.janrietveld.com) and [Pim](https://github.com/hey-pim).

- [walkthrough](walkthrough/SKILL.md): a short narrated video of work an agent just finished, like a colleague's Loom. It records the real app (iOS Simulator, web, phone-sized web, Electron), cuts it into chapters, and adds a voice, captions, a touch dot or cursor, and a clean device frame. See https://walkthrough.jan.computer
- [replicate](replicate/SKILL.md): faithfully reproduce designs, apps, websites, and service workflows through reference inspection, implementation, visual and behavioral comparison, and verification.
- [argent-extend](argent-extend/SKILL.md): verify mobile UI transitions by replaying with Argent and examining timestamped frames, including QuickTime capture on a physical iPhone.

## Install

```sh
npx skills add janrtvld/skills --skill walkthrough -g
npx skills add janrtvld/skills --skill replicate -g
npx skills add janrtvld/skills --skill argent-extend -g
```

Then ask your agent, for example:

```text
/walkthrough Show me what this pull request changed.
/replicate Match this design, including all the small details.
/argent-extend Check whether the composer jumps when I switch from the keyboard to Attach.
```

## walkthrough

Built on a Mac, where everything works. Web and Electron recording may work elsewhere but is untested. It needs Node, ffmpeg and a Chromium, and Xcode for the Simulator; its `SKILL.md` lists the setup.

- **Voice and sharing:** before the first video your agent asks once. Sign in with GitHub for the natural voice and share links (the narration script is sent to the walkthrough service to be spoken); keep everything on your Mac with its built-in voice and no account; or use your own ElevenLabs key via `ELEVENLABS_API_KEY` or `~/.config/walkthrough/elevenlabs-key`.
- **Share links:** ask your agent to "create a link". It uploads the video to a page with chapters and a transcript. It uses the same GitHub sign-in. Limits: 10 links a day, 50 MB per video. Links and their files are deleted after 30 days, and anyone who has a link can watch it.
- **The service:** the natural voice, sign-in and share links run on https://walkthrough.jan.computer. It is optional: without it the skill uses the Mac's built-in voice and makes videos entirely on your machine. Set `WALKTHROUGH_SHARE_URL` to point the skill at a different server.

The iPhone frame's measurements come from the MIT-licensed `device-frames` skill in [ibelick/ui-skills](https://github.com/ibelick/ui-skills).

Never commit credentials or private session data to this repository.
