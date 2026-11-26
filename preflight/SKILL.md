---
name: preflight
description: "Before a long or unattended task, find everything the agent will need from the owner - permissions, credentials, settings changes, accounts, shared devices, machine capacity, hardware - and ask for all of it in one message, then tell the owner the moment something new blocks. Use at the start of any task expected to run for hours, any task that drives physical devices, builds and installs apps, or touches accounts and external services, and whenever the owner will not be watching. Triggers on: long task, overnight, autonomous, unattended, keep going until done, device testing, release build, install on phone, permissions, blocked, stuck."
---

# Preflight

A long task fails quietly at the edges of what the agent may do. It hits a permission prompt, a full disk, a phone someone else is using or a missing credential in hour three, works around it or parks it, and the owner finds out two days later in a final report. Almost every such blocker was visible in the first ten minutes.

This skill does one thing: ask early, in one go, and never sit on a blocker.

## Operating posture

You are about to be left alone. Assume the owner will not look again for a day. Anything you will need from them, you need now. Ten questions up front cost them a minute; one of them discovered at hour sixteen costs the run.

Two failure modes:

1. **Finding the wall by walking into it.** A permission that was always going to be needed is requested only when the step fails.
2. **Parking it politely.** A blocker goes into a progress file or a final summary instead of in front of the owner at once.

## Phase 1 — Read what is already decided

Read the project's recorded limits, grants and decisions first (agent instructions, progress notes, earlier answers). A recorded decision is not a question: do not ask again for what was granted, and do not ask for what was refused or set aside unless the task cannot be done without it, in which case say that.

## Phase 2 — Walk the task forward

Trace the whole task to its end, including what the skills it will load demand (a release build, a recording, a second platform), and write down every step that leaves the sandbox.

```
For each step: does it need something only the owner can give?
├── A system or app permission (photos, camera, microphone, notifications, screen recording, accessibility)
├── A setting changed on a device or the machine
├── A credential, account, test user or role
├── Access to an external service (push, signing, store, API keys)
├── A resource someone else may hold (a phone, a port, a simulator, a shared account)
├── Machine capacity (disk, memory, one build at a time) and a budget (builds, hours, spend)
├── Hardware (a second phone, a cable, a headset, storage space)
├── A decision that is the owner's (delete data, publish, spend money, sign out an account)
└── None → no question
```

## Phase 3 — Probe what can be probed

Do not ask what a harmless check can answer. A probe is read-only: it never signs in, sends, installs, launches, changes a setting or triggers a permission prompt.

- **Devices:** connected, OS version, which builds are installed and from which commit, free storage, and whether someone else is using them (recent install times, live tool sessions, files changed in the last hour).
- **Machine:** free disk and memory, build tools present, privacy grants the tools need.
- **Repository:** clean or not, ahead of or behind its remote, another process building.
- **Accounts and services:** which credentials exist and where they are stored. Whether they work is not a probe; ask, or state it as untested.
- **Reach:** what the device tools can and cannot drive (recording, lock button, notifications, permission changes, audio).

Report numbers. A value you could not read is listed as unread, never guessed. The walk finds what the task needs; the probes find what the environment lacks. Run both: each misses what the other catches.

## Phase 4 — One request

Send one message before starting, with numbered items of two lines each:

- **Needed to do the work at all:** the item, what it unlocks, the exact action for the owner.
- **Needed for the best result:** the item, and what stays unverified without it.
- **Standing permissions I would like:** a short charter for the whole task (for example: install builds on the test phones, change and restore named settings, make sound, record the screen, create test data as test accounts), and what will never be touched.
- **What I will do without an answer:** a default for each item, so silence does not stop the work.

A default never takes a shared resource, deletes someone else's data, publishes or spends. Where nothing can start without an answer, say so plainly at the top of the message.

Then start on everything that does not depend on the answers.

## Phase 5 — During the run

```
Something new blocks a step. Can another part of the task continue?
├── Yes → tell the owner now (what is blocked, what unblocks it, what you are doing meanwhile) and continue
└── No  → tell the owner now and stop. Do not loop on retries.
```

- A blocker goes to the owner the moment it is confirmed, by whatever reaches them fastest. It does not wait for a report.
- Say what waiting costs: what stays undone or unverified while it is open.
- When the owner answers, record the grant where later steps and other agents will find it.

## Hard rules

1. **Ask before the first step, not at the first failure.**
2. **One message, complete.** No drip of single questions across the first hour.
3. **Never work around a wall the owner built.** A withheld permission is a decision. Ask, with the reason it would help.
4. **Never round a missing permission up to a pass.** What could not be checked is reported as not verified, with what it needs.
5. **Leave things as found.** Record every setting changed under a grant and restore it at the end.
