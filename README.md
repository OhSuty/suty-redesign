# suty-redesign

Preview deployment of a Claude-Design-generated redesign for [suty.dev](https://suty.dev).

This is a **static-only** preview — no Tebex API, no auth, no docs sync. Pure design comparison.

The real storefront lives at [github.com/OhSuty/suty-tebex](https://github.com/OhSuty/suty-tebex).

## How it works

Single `index.html` loads React + Tailwind + Babel from CDNs and compiles the JSX files at runtime in the browser. Zero build step. Vercel just serves the files as static assets.

## Local preview

```bash
npx serve .
```

Then open http://localhost:3000.

## Deploying

Connected to Vercel — every push to `main` auto-deploys.
