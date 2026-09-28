# Ostinova

A project-session prototype built with TanStack Start, React, shadcn/ui, Tailwind CSS, and Cloudflare Workers.

Start a session, write what you did, and leave a next step. The next step appears in Up next; the journal keeps the session history. The UI has light, dark, and system themes, an optional quiet confirmation tone, and responsive navigation.

## Development

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

## Project context

- [Agent instructions](AGENTS.md)
- [Product requirements and current scope](docs/product.md)
- [Design preferences](docs/design.md)
- [Cloudflare implementation plan](docs/cloudflare-plan.md)

## Data and limitations

Example projects and starter steps are included. Sessions, breadcrumbs, and projects save to `ostinova.projects.v2` in this browser. The earlier habits/goals data at `ostinova.v1` is preserved but not displayed. There is no automatic migration or upload.

This is not yet connected to authentication, D1, cloud sync, or reminders. Navigation views currently use component state. The focus clock measures elapsed wall time; it is not a Pomodoro timer and has no pause/cancel controls yet. Sounds start muted. Pricing and native app work are not implemented.

## Deployment

The existing `wrangler.jsonc` targets Cloudflare Workers. When deployment is intended, `pnpm deploy` builds and deploys using the configured Cloudflare account. See the integration plan before provisioning backend resources.
