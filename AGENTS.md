# Repository Guidelines

## Project Structure & Module Organization

This repository is currently specification-first: `PRD.md` defines the Earth Information Jukebox and its acceptance criteria. The planned app is a Vite + React + TypeScript static site:

- `src/config/sonification.ts` — tuneable audio constants.
- `src/analysis/` and `src/mapping/` — pure image-analysis and note-mapping functions; keep these free of DOM and audio imports.
- `src/audio/` — Tone.js engine, voices, scheduling, and master effects.
- `src/ui/` and `src/a11y/` — React components, controls, keyboard support, and live narration.
- `src/data/tracks.json` — six track records, descriptions, credits, and source URLs.
- `public/tracks/` — optimized, same-origin WebP assets.
- `tests/` — Vitest unit tests and Playwright end-to-end/accessibility tests.

Keep mapping deterministic and independently testable. Do not add backend, accounts, runtime NASA API calls, or other features listed as out of scope in `PRD.md`.

## Build, Test, and Development Commands

Once the scaffold exists, use the scripts in `package.json` with one package manager consistently:

- `npm run dev` — start the local Vite server.
- `npm run build` — create the production bundle.
- `npm run lint` — run ESLint.
- `npm run typecheck` — run strict TypeScript checks.
- `npm test` — run Vitest unit tests.
- `npm run test:e2e` — run Playwright smoke and accessibility tests.

Run all four checks before declaring a milestone complete.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, semicolons, and the configured formatter/linter. Use `PascalCase` for React components, `camelCase` for functions/variables, and descriptive asset filenames. Prefer semantic HTML and use CSS modules or Tailwind consistently; avoid a component library.

## Testing Guidelines

Use Vitest for pure analysis, scale quantization, salience, note selection, and determinism. Use Playwright for load/select/playback smoke coverage and `@axe-core/playwright` scans. Name tests after behavior, such as `mapping-determinism.test.ts`; cover failures, keyboard controls, reduced motion, and repeated track switching.

## Commit & Pull Request Guidelines

No project Git history is available yet. Use small, imperative, milestone-focused commits, e.g. `Add deterministic note mapping`. Pull requests should describe the user-visible change, link the PRD milestone and acceptance criteria, list test results, and attach screenshots or a recording for UI/audio changes. Include NASA credits and source links for new tracks.

## Security & Configuration

Bundle assets same-origin to avoid canvas tainting and runtime network failures. Never commit credentials, private keys, or unverified media. Keep NASA credits and source URLs visible in the product and confirm media-usage terms for every asset.
