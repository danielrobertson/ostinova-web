# Ostinova

A habits and goals journal built with TanStack Start, React, shadcn/ui, Tailwind CSS, and Cloudflare Workers.

## Run locally

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite. To check the production Worker build locally:

```bash
pnpm build
pnpm preview
```

## Deploy

```bash
pnpm deploy
```

Sign in to Cloudflare with `pnpm exec wrangler login` first. The Worker configuration is in `wrangler.jsonc`.

## Data

Habits, check-ins, and goals currently save in the browser's local storage. The starter entries are examples and can be edited or deleted. Data stays on the same browser and is not shared between devices. No Cloudflare database or account system is configured yet.
