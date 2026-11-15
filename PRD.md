Earth Information Jukebox – Product Requirements Document
Owner: Rudra Kumar · Event: 2026 NASA Space Apps Challenge (challenge: The Earth Information Jukebox, Intermediate) · Build agent: OpenAI Codex · Version 1.0
1. Summary
One-line pitch: a web jukebox where you pick a NASA Earth Information Center (EIC) visualization and hear it. A playhead sweeps across the image and turns what it passes over (colour, brightness, position) into a musical, scale-locked soundscape generated live in the browser.
Why this shape: the challenge asks for an interface that pairs EIC visual frames with sonifications generated in real time, balances data fidelity with musicality, and treats accessibility as a core theme. This PRD deliberately delivers one excellent interaction (the sweep) on six curated tracks, rather than many half-finished features.
Time reality: the Space Apps weekend runs 14–15 November 2026. Check your event’s exact submission deadline now. The milestones in section 12 are ordered so that a demo-able product exists after every milestone; if time runs out, stop at the last completed milestone and submit.
2. Goals, non-goals, principles
Goals
1.  A judge can open the URL, click one track, and hear something beautiful within 5 seconds, with no sign-up and no setup.
2.  Sound is generated in real time in the browser from the pixels of the actual EIC frame (not pre-baked audio files).
3.  The output sounds like music, not noise: scale-locked, quantized, sparse, reverbed.
4.  Blind and low-vision users can use the whole product: keyboard operation, screen-reader labels, and a written description plus live narration for every track.
5.  Visual polish worthy of a NASA-adjacent demo: cohesive, calm, fast.
Non-goals (explicitly out of scope)
• No backend, accounts, database, or live calls to NASA APIs at runtime.
• No machine learning, video decoding, or animated frame sequences in v1.
• No audio export, MIDI, or user-uploaded images (possible post-event ideas, not v1).
• No more than 6 tracks. Quality of 6 beats quantity of 20.
Design principles
• Polish over features: every feature in P0 must be finished, tested and styled before any P1 work starts.
• Musicality beats literalness: the data chooses which notes sound and how loudly; the author chooses the key, scale and instruments, so it always sounds good.
• Deterministic and offline-safe: all assets are bundled and same-origin, so the demo cannot fail on venue Wi-Fi.
• Explainable: every mapping is simple enough to describe in one sentence on a slide.
3. Users and scenarios
User
Need
Scenario
Blind / low-vision learner
Access Earth science without sight
Navigates by keyboard and screen reader, reads the track description, listens to the sweep, follows live narration of what the playhead is passing over
Curious public / student
Feel Earth data, not just read it
Opens the jukebox on a phone, taps a track, watches the playhead while listening
Hackathon judge
Fast, memorable, credible demo
Evaluates in 2 minutes: instant sound, clear explanation, accessibility, scientific honesty
4. Scope
P0 – must ship
1.  Track selector (the jukebox): 6 track cards with thumbnail, title, EIC theme tag.
2.  Now Playing view: large image, animated vertical playhead, transport controls (play/pause, restart, speed 0.5×/1×/1.5×, volume, mute).
3.  Real-time sonification engine: image is analysed once on load into a grid; playhead sweeps the grid in musical time and triggers notes (spec in section 6).
4.  Click or tap on the image to move the playhead to that column.
5.  What you are hearing panel: sound key legend (colour to instrument, height to pitch, brightness to loudness), plus the track description and data credit.
6.  Accessibility layer: keyboard shortcuts, ARIA, visible focus, text description, throttled live-region narration, reduced-motion support.
7.  About page or drawer: the method in plain language, data credits, links to sources, AI-use disclosure.
8.  Deployed public URL plus README.
P1 – only after every P0 item meets its acceptance criteria
• Probe mode: hover or touch drag plays only the column under the pointer, for exploratory listening (strongly supports the challenge’s exploratory framing).
• Per-track subtle ambient texture (filtered noise) tied to overall image intensity.
• Installable PWA shell and offline caching.
5. UX specification
Screens
1.  Jukebox home: dark, atmospheric background (deep navy to black, soft Earth-glow gradient). Title, one-sentence explainer, and a grid or horizontal carousel of 6 track cards styled as record sleeves. First-visit hint: ‘Pick a record to listen to Earth.’
2.  Now Playing: image centre-stage with the playhead; below it the transport bar; right column (stacked under on mobile) holds ‘What you are hearing’, the sound key, description, and credit. A back button returns to the home view without stopping audio abruptly (fade out over 300 ms).
3.  About: method, credits, accessibility statement, AI disclosure.
Behaviour and states
• Audio never autoplays. Selecting a track is the user gesture that unlocks the audio context, and playback starts immediately after selection.
• Loading state: skeleton card and a short ‘tuning in…’ message while the image is analysed (target under 500 ms).
• Error state: if an image fails to load, show a friendly message with a retry; the rest of the app keeps working.
• Playhead loops continuously; loop point is crossfaded with a soft envelope so there is no click.
• Switching tracks crossfades (300 ms out, 300 ms in).
Visual design direction
Calm, cinematic, scientific. Neutral dark UI so the NASA imagery is the colour. One accent colour for the playhead and primary controls. One high-quality sans-serif for UI plus one display face for the title, with a tight type scale. Subtle motion only (playhead glow, card hover lift), all disabled under prefers-reduced-motion. Large touch targets (at least 44 px). Codex should use the frontend-design guidance if the skill is available, to avoid templated-looking output.
Keyboard map
Space = play/pause · R = restart · Left/Right = move playhead by one step (Shift = by 10) · Up/Down = volume · M = mute · [ and ] = slower/faster · Esc = back to home. All must be listed in a visible, screen-reader-accessible shortcuts list.
6. Sonification specification
All values below are defaults living in one config file (src/config/sonification.ts) so they can be tuned by ear without code changes elsewhere.
6.1 Analysis (once per track, on image load)
1.  Draw the bundled image to an offscreen canvas at 96 × 32 (columns × rows) using area averaging.
2.  For each cell store: hue, saturation, lightness (HSL or, preferably, Lab-based lightness and chroma).
3.  Compute the image’s median colour. For each cell compute salience = perceptual distance from the median, weighted by chroma. High salience means a hotspot (a fire cluster, a warm anomaly, an aerosol plume). Cells below a threshold are silent, which keeps the output sparse and musical.
4.  Precompute four quarter summaries (left to right) of dominant colour family and intensity for narration.
6.2 Mapping from pixels to sound
Visual feature
Audio parameter
Rule
Column position (left to right)
Time and stereo pan
Playhead advances one column per 16th note; pan sweeps from left to right with the playhead
Row (top to bottom)
Pitch
Rows bucketed onto scale degrees across about 3 octaves; top is high, bottom is low
Salience
Whether a note plays, and velocity
Up to 3 notes per step: the 3 most salient rows with a minimum pitch gap of one scale degree
Hue family
Instrument
Warm (red to orange): bright pluck. Green to yellow: soft mallet. Cool (cyan to purple): airy sine or triangle pad with a long release
Lightness
Note loudness and filter brightness
Brighter cells play louder with a brighter timbre
Whole-image mean lightness
Drone filter cutoff
A slow drone on the track root note opens or closes with overall brightness
Share of salient cells in a column
Density
More salient cells means more simultaneous voices and a slightly higher pulse register, conveying urgency in hot, active frames
6.3 Musicality rules (non-negotiable)
• The author, not the data, picks the key and scale per track (stored in track metadata): for example a Dorian or major-pentatonic feel for ocean and vegetation tracks, a minor or Phrygian feel for fire and disaster tracks. The data selects notes only inside that scale.
• All note events are quantized to a 16th-note grid; default tempo 84 BPM (about 17 seconds per sweep of 96 columns), overridable per track.
• Maximum 3 note voices plus the drone at any moment. Notes shorter than a 16th are not allowed.
• Master chain: gentle low-pass tone shaping, convolution or algorithmic reverb (wet about 30 percent), a compressor and a limiter. No clipping, ever.
• Default master volume is conservative; first sound must never startle.
6.4 Engine and architecture constraints
• Use Tone.js (Web Audio) for synths, transport, reverb and limiter.
• The mapping layer is a set of pure functions (cell grid in, note events out) with no audio or DOM imports, so it is unit-testable and swappable.
• The scheduler reads precomputed note events for each column; no per-frame pixel work during playback.
7. Content specification: the six tracks
Source: NASA Earth Information Center visualizations. The best starting points are the Scientific Visualization Studio galleries ‘Daily Visualizations’, ‘Main Dashboard’ and ‘Earth Information Center’ (svs.gsfc.nasa.gov/gallery), plus earth.gov and the Resources tab of the challenge page. The EIC covers nine themes: sea level change, air quality, biodiversity, wildfires, greenhouse gases, energy, disasters, water resources and agriculture.
Selection criteria (the agent must follow): (a) six different EIC themes; (b) strong, varied colour structure so the sweep is audibly interesting; (c) mix of calm and urgent tracks so the playlist has an emotional arc; (d) each is a still frame or key frame, exported at about 1600 px wide, converted to WebP under 300 KB; (e) a clearly stated NASA credit and source URL recorded per asset; confirm NASA media-usage terms for each item and keep credit lines visible in the UI.
Each track is one entry in src/data/tracks.json with: id, title, theme, imageFile, sourceUrl, credit, rootNote, scale, bpm, description (60–90 words, written for non-visual use: what the image shows, what the colours mean scientifically, how the sound maps to it), and legendOverrides if the colour meaning differs (for example, warm means hotter on a temperature map but denser on an aerosol map).
Suggested playlist arc (swap images freely if better ones exist): 1) calm and expansive ocean or sea-surface temperature; 2) vegetation or agriculture; 3) water resources; 4) air quality or aerosols; 5) greenhouse gases; 6) wildfires as the urgent closer.
Scientific honesty requirement: the app maps the picture’s colours, not raw measurements, and says so in the About text. Colour scales differ per visualization, so the description must state what the colours represent for that frame.
8. Accessibility requirements (target WCAG 2.2 AA)
• Every control reachable and operable by keyboard; logical tab order; visible focus ring with at least 3:1 contrast.
• Semantic HTML first (buttons, headings, lists); ARIA only where needed. Transport buttons have accessible names and state (aria-pressed for play/pause).
• Live narration: a polite aria-live region announces a short phrase when the playhead enters each quarter of the image (‘Left quarter: cool blues, quiet’), derived from the precomputed quarter summaries. Narration can be toggled off, and is never announced faster than every 3 seconds.
• Full text description for each track is visible and exposed to screen readers before playback.
• The image has meaningful alt text; the playhead is decorative (aria-hidden) and its position is exposed via a slider role with aria-valuetext.
• A visible ‘sound key’ legend gives non-audio users and deaf or hard-of-hearing users a visual map of how colours relate to sound; the playhead highlights the active salient cells so sound is also visible.
• Colour is never the only carrier of meaning in UI chrome; text contrast at least 4.5:1.
• prefers-reduced-motion disables glow, parallax and card animations. No flashing content.
• Touch targets at least 44 px; usable at 200 percent zoom and in portrait on a phone.
9. Technical specification
Stack: Vite + React + TypeScript, Tone.js, plain CSS modules or Tailwind (pick one and stay consistent), no UI component library. Static site deployed to Vercel, Netlify or GitHub Pages. Node 20+, pnpm or npm.
Suggested structure
src/
  config/sonification.ts     all tunable constants
  data/tracks.json           track metadata
  analysis/                  image to cell grid, salience, quarter summaries (pure)
  mapping/                   cell grid to note events, scales (pure)
  audio/                     Tone.js engine, voices, master chain
  ui/                        components: TrackGrid, NowPlaying, Controls, SoundKey, About
  a11y/                      narration, keyboard shortcuts, live region
public/tracks/               optimized WebP images
tests/                       Vitest unit tests, Playwright e2e
AGENTS.md  README.md  docs/PRD.md
Performance budget: first contentful paint under 1.5 s on broadband; initial JS under 250 KB gzipped excluding Tone.js lazy chunk; total images under 2 MB; track analysis under 500 ms; zero audio dropouts on a mid-range phone.
Browser support: current Chrome, Edge, Firefox, Safari (desktop) and iOS Safari and Android Chrome. Handle the iOS audio-unlock requirement and the silent-switch behaviour gracefully (show a hint if the context stays suspended).
10. Quality bar and acceptance criteria
Area
Pass condition
First sound
From landing to audible sound in 2 interactions or fewer and under 5 seconds on broadband
Musicality
Blind A/B check by two people: output reads as music, not noise; no clipping at any master volume
Determinism
Same image and settings always produce identical note events (unit-tested)
Accessibility
Automated axe checks report zero serious or critical issues on all screens; manual pass with keyboard only and with VoiceOver or NVDA
Lighthouse
Accessibility at least 95, Best Practices at least 95, Performance at least 90 (desktop)
Robustness
No console errors; image-load failure handled; works after switching tracks 20 times in a row
Visual polish
Consistent spacing and type scale; no layout shift; works from 360 px to 1920 px wide
Credits
Every track shows NASA credit and source link; About page lists all sources
Testing plan: Vitest unit tests for scale quantization, salience, note selection, and determinism; Playwright smoke test (load, select track, press play, assert playback state and no console errors); @axe-core/playwright accessibility scan per screen.
11. Risks and mitigations
Risk
Mitigation
Output sounds like chaotic noise
Salience threshold, max 3 voices, scale lock, 16th-note quantization, reverb and limiter; tune constants by ear
Browser audio autoplay and iOS restrictions
Start audio only on a user gesture; resume the context on every play; show a hint if suspended
Canvas tainted by cross-origin images
Bundle all images same-origin from public/tracks
Image rights or credit confusion
Record source URL and credit per asset; show credits in UI; verify NASA media usage terms
Colour-scale ambiguity misleads
Per-track description states what colours mean; About states that colours, not raw values, are sonified
Scope creep
P1 items are locked until every P0 acceptance criterion passes
Time lost on setup
Use the milestone order and hand Codex one milestone at a time
12. Milestones (each ends in a demo-able state)
#
Milestone
Done when
Suggested time
M0
Scaffold
Vite + React + TS, lint, format, Vitest, Playwright, AGENTS.md, CI-less local checks, deployed hello page
30 min
M1
Content
6 optimized images, tracks.json complete with descriptions and credits
45 min
M2
Core engine
Analysis and mapping pure functions with tests; Tone.js engine plays a sweep for one hard-coded track
90 min
M3
Jukebox UI
Track grid, Now Playing view, transport, clickable playhead, sound key, all 6 tracks play
90 min
M4
Accessibility
Keyboard map, ARIA, live narration, reduced motion, axe clean
45 min
M5
Polish and deploy
Visual pass, loading and error states, About page, performance budget, public URL, README
60 min
M6 (P1)
Probe mode
Only if M0–M5 pass every acceptance criterion
45 min
13. Working with Codex
Recommended setup
• AGENTS.md at the repo root (Codex reads it automatically). Put in it: the stack, the commands (dev, build, test, lint, e2e), the folder rules (mapping and analysis must stay pure), the definition of done below, and the non-goals list. Keep it under about 150 lines.
• Plan first: ask Codex for a short plan and file list for each milestone before it writes code, and approve it.
• Browser verification: connect a Playwright MCP server (and optionally Chrome DevTools MCP) so Codex can load the page, take screenshots, check console errors and iterate on visual polish itself.
• Up-to-date docs: connect a docs MCP such as Context7 so Codex looks up current Tone.js, Vite and React APIs instead of guessing.
• Quality tooling: ESLint, Prettier, TypeScript strict mode, Vitest, @axe-core/playwright. Require Codex to run lint, typecheck, unit tests and e2e before declaring a milestone done.
• Review pass: after each milestone use Codex’s review command or a fresh review prompt against the acceptance criteria, then commit. Small commits per milestone make rollbacks cheap.
• Skills or reusable instructions: if your Codex version supports skills, add one for frontend design polish and one for accessibility checks. Confirm the current names and config format in Codex’s documentation, since these features evolve quickly.
Prompting cadence
1.  Paste this PRD into docs/PRD.md and tell Codex: read docs/PRD.md and AGENTS.md, then implement only Milestone N, plan first.
2.  One milestone per session; state the acceptance criteria from section 10 that apply.
3.  After each milestone: run the app yourself, listen, and give Codex concrete feedback (for example ‘the warm pluck is too sharp; lower brightness mapping and the filter ceiling’).
4.  Never let Codex add features outside section 4. If it proposes one, log it in a docs/IDEAS.md file.
Definition of done (per milestone)
Typecheck, lint, unit tests and e2e pass; no console errors; axe scan clean for screens touched; acceptance criteria for that milestone demonstrably met; changes committed with a clear message.
Suggested split for learning
Because the mapping module is the creative and scientific heart of the project, consider writing src/mapping/ and the constants in src/config/sonification.ts yourself (Codex can scaffold the surrounding app and tests). That also gives you first-hand answers when judges ask how the sonification works.
14. Submission and demo package
• Public URL and GitHub repo with README: pitch, screenshots, how it works (the mapping table), how to run, credits, accessibility notes.
• AI-use disclosure: document where Codex was used (scaffolding, tests, UI) and what you authored. Space Apps submissions typically ask teams to declare AI use, so check the form and be specific.
• Two-minute demo script: (1) the problem: Earth science is mostly shown, not heard, which excludes blind and low-vision users (15 s). (2) Open the jukebox and play the ocean track (20 s). (3) Show the sound key and live narration, then use the keyboard only (25 s). (4) Play the wildfire track to show urgency in the sound (25 s). (5) How it works in one slide: the mapping table, with the author-picks-the-scale idea (25 s). (6) Credits and next steps (10 s).
• Keep a screen recording as a backup in case of connectivity problems.
15. Open questions to resolve before building
1.  What is your event’s exact submission deadline and format (video, slides, URL)?
2.  Do the official Resources tab links offer anything better than the SVS EIC galleries (for example pre-extracted frames or a download package)? If so, prefer them and update section 7.
3.  Which six frames will you choose? Lock these in M1 before any engine work, because they shape the tuning of the mapping.
