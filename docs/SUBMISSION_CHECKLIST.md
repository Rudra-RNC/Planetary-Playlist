# Submission Checklist

## Local proof

- [x] Six local NASA SVS still frames bundled under `public/tracks/`.
- [x] Track descriptions, source URLs, credits, key, scale, and BPM in `src/data/tracks.json`.
- [x] `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, and `npm run build` pass.
- [x] Playwright smoke coverage selects a track and checks the playhead; axe reports no serious or critical landing-page violations.
- [ ] Verify the deployed URL on desktop and mobile, including actual audio output.
- [ ] Capture a short screen recording with the ocean and wildfire records.

## NASA media handling

The bundled frames are sourced from NASA Scientific Visualization Studio pages and credited in the player. NASA’s media guidance generally permits NASA content for educational or informational web pages when it is used factually, credited to NASA, and does not imply endorsement. The project uses no NASA insignia, logos, astronauts, or third-party promotional imagery. Review the current guidance before any commercial or promotional reuse:

https://www.nasa.gov/nasa-brand-center/images-and-media/

## Final submission fields

Use the deployed URL, repository URL, project name `Earth Information Jukebox`, and the challenge named in `PRD.md`. Explain that the app maps visible pixels rather than raw measurements, mention keyboard and live narration support, and disclose Codex assistance in scaffolding, implementation, tests, and UI iteration. Confirm the event’s local-time deadline before submitting.
