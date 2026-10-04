# Cloudflare integration plan

Status: proposed, unprovisioned. The local MVP contains only Todos and Habits. Goals, sessions, journals and breadcrumbs have been removed from the implementation scope.

Keep TanStack Start/React and the existing Cloudflare Vite integration. Browser and future iOS clients call `/api/*` on a Worker; only the Worker accesses D1.

## Proposed identity and schema

Verify Sign in with Apple identity on the server, using nonce/state and signature, issuer, audience and expiry checks. Derive identity from verified auth rather than request bodies. Use secure rotating refresh sessions; native credentials belong in Keychain. Apply CSRF/Origin checks to cookie-authenticated mutations.

Every user-owned row and query must be scoped to the authenticated user. Use bound SQL parameters, input validation and atomic target checks. Proposed tables are users, auth_sessions, todos, habits, check_ins, mutation_receipts, and later reminder_rules, push_subscriptions and reminder_outbox. Habits have no goal reference. Todos contain text, creation and completion timestamps. Check-ins need individual completion IDs and idempotency keys for count schedules; binary schedules enforce one completion per habit/local date.

## Proposed API

- GET/POST `/api/todos` and PATCH `/api/todos/:id` for creation, completion and undo.
- GET/POST `/api/habits` and PATCH `/api/habits/:id` for names, schedules and archive/restore.
- PUT/DELETE `/api/habits/:id/check-ins/:date` for binary check-ins.
- POST/DELETE `/api/habits/:id/completions[/:completionId]` for individual count completions and undo.
- GET/PUT `/api/preferences` for theme and timezone.
- POST `/api/auth/apple`, `/api/auth/refresh`, `/api/auth/logout` for identity and sessions.
- POST `/api/import` for explicit validated import of local Todos and Habits. Never upload legacy or sample data automatically.

Store UTC timestamps and IANA timezones. Apply account-local calendar dates and Monday-based week boundaries. Test DST/year boundaries, retry idempotency, concurrent target enforcement and cross-user isolation. Use stable errors, pagination and expected-version conflict checks.

## Client integration and later work

Replace local operations with an API adapter and rollback on failed optimistic writes. Add actual routes for Habits and Todos. Start with REST and refetch after mutations/focus. Offline mutation queues are separate work. Keep all old browser keys as backups until an explicit user-directed cleanup or import.

Reminders remain a proposal using Cron, Queues, an outbox and deduplication, with Web Push and later APNs. Delivery guarantees, DST policy, quiet hours and native scope need decisions and real-device trials. Pricing and freeze rules remain open. No infrastructure or production deployment is authorized by this document.
