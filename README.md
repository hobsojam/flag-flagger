# Flag Flagger

A web-based quiz for learning country flags. Answers are tracked per-flag, and
a confidence-based scheduler biases the quiz toward flags you get wrong, so
practice naturally focuses on your weak spots instead of repeating flags you
already know.

## Getting started

```
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | Lint the codebase (oxlint) |
| `npm run preview` | Preview a production build locally |

## How it works

- `src/domain/` holds the adaptive scheduler as plain, framework-free
  functions: per-flag confidence tracking (`progress.ts`) and weighted-random
  question selection biased toward low-confidence flags (`scheduler.ts`).
- `src/domain/storage.ts` persists progress to `localStorage` behind a small
  interface, so a different backend can be swapped in later without touching
  the scheduling logic.
- `src/data/countries.ts` is generated, not hand-written — see
  `scripts/generate-flag-metadata.mjs`. It tags each country with continent,
  flag layout (stripes, cross, canton, etc.), color count, and area, derived
  from the flag-icons SVGs and a public country dataset. Re-run the script to
  regenerate it after adding countries or updating flag-icons.

## License

MIT — see [LICENSE](LICENSE).
