# Ostinova

A Todos and Habits MVP built with TanStack Start, React, shadcn/ui, Tailwind CSS, and Cloudflare Workers.

Add standalone todos and complete or undo them. Create habits with daily, selected-day, weekly, or count targets. Check in today or on an earlier date, edit schedules without losing history, and archive/restore habits. Light, dark, and system themes and responsive navigation are available.

## Development

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

## Product context

- [Agent instructions](AGENTS.md)
- [Product requirements and current scope](docs/product.md)
- [Design preferences](docs/design.md)
- [Cloudflare implementation plan](docs/cloudflare-plan.md)

## Data and limitations

Todos and Habits save locally to `ostinova.workspace.v4`. Existing v3 Todos and habit history migrate automatically without goal assignments. Old goal/session history stays in the untouched `ostinova.goals.v3` backup. The v2 key remains untouched and imports an empty workspace if v3 is absent. `ostinova.v1` is untouched and not displayed. No data is uploaded.

Authentication, D1, cloud sync, reminders, and native apps are not implemented. Navigation uses component state. Pricing, reminder guarantees, native scope, and freeze rules remain open decisions.

## Deployment

The existing `wrangler.jsonc` targets Cloudflare Workers. When deployment is intended, `pnpm deploy` builds and deploys using the configured Cloudflare account. See the integration plan before provisioning backend resources.
