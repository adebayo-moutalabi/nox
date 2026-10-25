# Nox — Hackathon submission texts (English)

OpenAI DevDay Community Hackathon Paris 2026 · Track: **Impact / Disability inclusion**
Copy-paste ready. Pick the length each form field asks for.

---

## Project name
**Nox**

## Tagline (≤ 60 characters)
The desktop companion that makes the first move.

## One-liner (≤ 140 characters)
Nox is a voice-first desktop companion that helps people with ADHD start, stay on and come back to a task, one tiny step at a time.

## Short description (≤ 300 characters)
For people with ADHD, the hardest part of work isn't the work: it's starting, staying on it and coming back. Nox is a little robot on your desktop that talks to you first, shrinks any task to one tiny step, opens the right tool, and gently brings you back when you drift. Powered by OpenAI.

---

## Full description

### The problem
Millions of adults live with ADHD, and many more struggle with procrastination. They usually know exactly what to do. What fails is the **first move**: starting the task, staying on it after one notification, finding their place again after a break.
Every productivity tool assumes the opposite. To-do lists, calendars and timers all **wait for you to open them**. They help people who are already organised.

### Our solution
Nox is a small animated robot that lives in the corner of your Windows desktop and **makes the first move for you**:
- **It talks to you first.** It greets you, asks what you're working on, and checks in. Real-time voice, and you can interrupt it like a person. Typing works too.
- **One tiny step at a time.** Say "I need to write my internship report" and Nox breaks it into 2-to-10-minute steps, shows **only the first one**, starts a timer, and offers to open the right tool (Word, Google Docs, VS Code, PowerPoint…).
- **It notices when you drift.** With your permission, Nox reads only the **title** of the active window. Twenty seconds on YouTube during a task, and it gently says: *"Those cats can wait for a break. Let's hop back to your Google Doc."*
- **It holds your place.** Step away, come back, and Nox tells you where you were.
- **It never shames you.** Warm tone, fleeting emotions (it blushes, it worries, it's proud of you), XP and skills you unlock, never a streak to lose.
- **It fits your brain.** A 5-question spoken onboarding (under a minute) picks a research-backed method: the 5-minute rule, Pomodoro, body doubling, "if… then…" plans, time-boxing.

### How we built it
- **Electron** desktop app (Windows): transparent always-on-top window, vector mascot animated in real time (blinking, eyes following the cursor, mouth driven by the real audio volume).
- **OpenAI Realtime API over WebRTC** (`gpt-realtime-2.1`, voice `marin`, semantic voice activity detection): the main process creates an **ephemeral token**, so the renderer never sees the API key. Actions run through **function calling**: `set_task`, `start_timer`, `stop_timer`, `complete_step`, `open_app`, `set_mood`, `add_note`…
- **Proactive events** (drift, return after absence, hyperfocus, timer end, upcoming meeting) are injected into the session, so Nox speaks on its own.
- **Fallback when real-time voice isn't available**: `gpt-6.1-sol` for conversation, `gpt-4o-mini-transcribe` / Whisper for speech-to-text, `gpt-4o-mini-tts` for the voice.
- **Privacy by design**: everything stays in a local file; secrets are encrypted with Windows (safeStorage); window watching is opt-in and title-only; a Rest mode makes Nox sleep and stay silent.
- Optional connections: Google Calendar (iCal), Gmail (IMAP), Telegram.
- Fully bilingual (English / French), one-click installer, automated end-to-end tests (52 checks) and an automated demo scenario.

### Challenges
- Making an AI **proactive without being annoying**: short check-ins, gentle tone, fleeting emotions that fade after a few seconds, and permission before watching anything.
- **Never interrupting itself**: question cards now wait until Nox finishes its sentence.
- Keeping the onboarding **under a minute**: an ADHD brain spends its energy on setup before it even starts.

### What we're proud of
- The demo video is **not staged**: it's a real capture of the installed app with the real model, including Nox spotting YouTube on its own.
- Everything we designed comes from ADHD research: point-of-performance help, externalised time, tiny steps with immediate rewards (Barkley; Safren et al.'s randomised trial; Gollwitzer & Sheeran's meta-analysis on if-then plans).

### What's next: this is just the beginning
Nox makes the first move in front of the computer. That's what people with ADHD need, and it's what **anyone the computer leaves behind** needs:
- **Paperwork made easy**: Nox explains each field of an administrative form in plain words and fills it with you. **You check it and you send it, never Nox.**
- **People with low vision**: everything by voice, with Nox reading and describing the screen.
- **Older people**: a simple step-by-step mode, endless patience, and a warning when an email looks like a scam.
- **Everywhere**: phone, Chrome extension, Mac, tools via MCP, and a server-held key so nobody has to paste an API key.

---

## Track justification (Disability inclusion)
ADHD is a recognised disability that affects executive function: starting, sustaining attention, managing time. Nox doesn't add another list to manage. It provides **support at the point of performance**: a companion that is present when you work, speaks first, and adapts to how you function. Our roadmap extends the same "first move" to low-vision users and older people who struggle with computers.

## OpenAI technologies used
- Realtime API (WebRTC, `gpt-realtime-2.1`, ephemeral client secrets, function calling, server-side voice activity detection)
- Chat model `gpt-6.1-sol` (fallback conversation and task breakdown)
- `gpt-4o-mini-tts` (voice) and `gpt-4o-mini-transcribe` / Whisper (speech-to-text)

## Built with
Electron · JavaScript · OpenAI Realtime API (WebRTC) · Playwright (tests and demo) · FFmpeg (video) · GitHub Pages

---

## Links
- **Website:** https://get-nox.github.io
- **Demo video (2 min):** https://get-nox.github.io/#video
- **Code:** https://github.com/adebayo-moutalabi/nox
- **Download (Windows):** https://github.com/adebayo-moutalabi/nox/releases/latest

## Team
**Adebayo Moutalabi** — design and development
Portfolio: https://adebayo-moutalabi.github.io/ · LinkedIn: https://www.linkedin.com/in/adebayo-moutalabi/

## How to try it (for the jury)
1. Download `Nox Setup 1.4.0.exe` from the link above and double-click it (if Windows SmartScreen appears: **More info → Run anyway**, the installer isn't signed yet).
2. Paste an OpenAI API key (stored encrypted on your PC), or choose **Try without a key** for demo mode.
3. Answer the 5 questions, then say or type: *"I need to write my report in Google Docs."*
4. Open YouTube for 20 seconds and watch Nox react.

---

## Short email version

**Subject:** Nox — Hackathon submission (Impact / Disability inclusion)

Hello,

Here is my submission for the OpenAI DevDay Community Hackathon Paris.

**Nox** is a voice-first desktop companion for people with ADHD. Instead of waiting to be opened like every to-do app, it makes the first move: it talks to you, shrinks your task to one tiny step, opens the right tool, and gently brings you back when you drift to YouTube. Powered by the OpenAI Realtime API.

- Demo video (2 min): https://get-nox.github.io/#video
- Website: https://get-nox.github.io
- Code: https://github.com/adebayo-moutalabi/nox
- Download (Windows): https://github.com/adebayo-moutalabi/nox/releases/latest

Best regards,
Adebayo Moutalabi
