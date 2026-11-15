# Earth Information Jukebox

An accessible web jukebox for hearing NASA Earth Information Center visualizations. Pick a record, and a playhead sweeps the bundled frame while its visible color, brightness, contrast, and position generate a live, scale-locked soundscape in the browser.

## Development

Requires Node 20+ and npm.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

## Deployment

The project is configured for Vercel as a static site: use `npm run build` with `dist` as the output directory. No runtime environment variables are required. After deployment, verify the public URL in a current desktop browser and on a phone; then use that URL in the NASA Space Apps project submission.

From the repository root, redeploy the latest local build with `npx vercel --prod` while authenticated to the Vercel project. The current public URL is `https://planetary-playlist.vercel.app/`.

The mapping and analysis modules are pure and deterministic. Tone.js is isolated in `src/audio/`; the UI, keyboard map, and live narration are in `src/App.tsx`. Track metadata lives in `src/data/tracks.json`, and all six still frames are bundled under `public/tracks/` for offline-safe playback.

## Scientific and media notes

This project sonifies the visible pixels of each frame; it does not claim to sonify raw measurements. Each record links to its NASA Scientific Visualization Studio source and keeps the credit visible in the player. Read `PRD.md` for the full mapping specification, accessibility targets, acceptance criteria, and non-goals.

AI use is disclosed in the project narrative: Codex assisted with scaffolding, implementation, tests, and UI iteration; the team remains responsible for source selection, scientific wording, tuning, and final review.
