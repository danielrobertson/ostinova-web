# Cloudflare integration plan

Status: proposed implementation plan, not provisioned infrastructure. Existing configuration already runs TanStack Start through the Cloudflare Vite plugin and `@tanstack/react-start/server-entry`. Keep it. No database, Apple credentials, queue, or reminder sender has been configured in this change.

## Architecture

Browser / future URLSession iOS client → `/api/*` Worker → D1. The same deployment serves the web app. Start with REST and refetch after mutations/focus. The brief explicitly defers a per-user Durable Object WebSocket hub and R2 attachments.

[Cloudflare's TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/) supports retaining the existing framework integration. [D1](https://developers.cloudflare.com/d1/) provides SQLite storage accessible through Worker bindings. Use a `DB` binding in server-only code; clients never receive database credentials.

## Phase 1: identity and owned data

1. Register Apple web service and native client identifiers and exact callback URLs. Implement `POST /api/auth/apple` with server-generated, expiring nonce/state. Verify Apple's JWT signature with cached JWKS plus issuer, audience, expiry, and nonce. Bind Apple `sub` to an internal user ID, not email. See [Apple's token verification requirements](https://developer.apple.com/documentation/signinwithapplerestapi/verifying-a-user).
2. Issue approximately 15-minute access tokens and rotating refresh tokens; store refresh hashes and token-family metadata in D1. Reuse of an old refresh token revokes the family. Logout revokes the session. Verify the precise library/runtime integration before choosing an auth library.
3. Web proposal: short-lived access token in memory, refresh in Secure/HttpOnly/SameSite cookie, CSRF and Origin checks on cookie-authenticated mutations. Do not put refresh or access tokens in localStorage. Native uses Keychain and Bearer tokens. Protect only intended web origins with CORS; CORS does not replace auth.
4. Add bounded payloads, auth rate limiting, and server-side Turnstile validation where appropriate for web. Native Apple auth needs its own abuse controls; do not require an unplanned browser challenge on every native request. Secrets remain Worker secrets.
5. Add separate development/staging/production D1 databases and versioned migrations. Every user-owned table has `user_id`; parent references must enforce the same owner through composite keys or owner-checked transactional writes.

Proposed schema:

| Table | Main fields and constraints |
| --- | --- |
| users | id, apple_sub unique, timezone, created_at |
| auth_sessions | id, user_id, refresh_hash unique, family_id, expires_at, revoked_at |
| projects | id, user_id, name, color, archived_at, version |
| sessions | id, user_id, project_id, started_at, finished_at, version; at most one unfinished session per user |
| journal_entries | id, user_id, session_id unique, summary, open_loops |
| breadcrumbs | id, user_id, project_id, session_id unique, text, completed_at, position, version |
| reminder_rules | id, user_id, project_id, timezone, schedule, next_due_at, enabled |
| push_subscriptions | id, user_id, platform, endpoint/token, revoked_at |
| reminder_outbox | id, user_id, rule_id, occurrence_at, status; unique rule/occurrence |
| mutation_receipts | user_id, idempotency_key, request_hash, response, expires_at; unique user/key |

Breadcrumbs are the v1 todos. Avoid a duplicate `todos` table unless manual todos become an approved feature. V2 adds habits, schedules, check_ins, and per-day journal relations. Store UTC timestamps and IANA timezones. Calendar dates and weekly boundaries are user-local concepts, not UTC truncations.

Acceptance: anonymous requests rejected; user A cannot read, reorder, or mutate user B's data; invalid/expired/replayed Apple and refresh tokens rejected; secrets absent from client bundle; migrations tested locally.

## Phase 2: product API

| Method/path | Behavior |
| --- | --- |
| GET/POST `/api/projects` | List/create owned projects |
| PATCH `/api/projects/:id` | Rename/archive, expected version |
| GET `/api/sessions?projectId=&cursor=` | Paginated journal/session history |
| POST `/api/sessions` | Start, idempotency key, one active session per user |
| GET `/api/sessions/active` | Recover active session across reload/devices |
| POST `/api/sessions/:id/finish` | Atomically finish session, save journal, complete source breadcrumb, create next breadcrumb |
| GET `/api/breadcrumbs` | Ordered pending/completed steps |
| PATCH `/api/breadcrumbs/:id` | Complete/reopen with expected version |
| PUT `/api/breadcrumbs/order` | Validate same-user IDs, reorder atomically, detect stale list version |
| GET `/api/activity?from=&to=&timezone=` | Session counts, cumulative totals, timezone-aware buckets |
| POST `/api/import` | Explicit, validated, idempotent local project import |
| GET/PUT `/api/preferences` | Theme, sound, timezone, reminder settings |
| POST `/api/auth/refresh`, `/api/auth/logout` | Rotate/revoke tokens |

Use a stable JSON error shape, field validation, pagination and size limits. Return 409 with current state on conflicting versions, not silent overwrite. Record idempotency receipts with the mutation in a transaction; retrying finish must create exactly one journal entry and breadcrumb. D1 transactional batch operations and constraints should cover this without introducing a Durable Object solely for CRUD.

Acceptance: two concurrent starts leave one active session; retried finish creates one next step; stale edits and reorder collisions preserve data; cross-user parent IDs cannot be attached to records.

## Phase 3: connect the web client

Replace local operations with a repository/API adapter and optimistic updates that roll back on failure. Keep a visible saving/error status. Add actual TanStack URL routes for Today, Journal, Completed, and project detail. Keep the prototype data import explicit, preview its contents, and never upload sample data automatically. Do not silently convert `ostinova.v1` binary habits/goals to project sessions.

For the initial online release, REST plus refetch is sufficient. If offline editing is added, use IndexedDB mutations with stable operation IDs, version checks, retries, and account-specific caches. Clear private cached data on logout. An offline queue is a separate feature, not implied by localStorage.

Acceptance: refresh during a session recovers it; device B sees device A's finished session after refresh; API failure leaves a recoverable draft; imported data is not duplicated on retry; empty/loading/error states are explicit.

## Phase 4: reliable reminders

Use [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) to scan indexed due reminders in UTC. Compute each next occurrence with the user's IANA timezone and an explicit DST policy. Write an outbox event before sending; enqueue through [Queues](https://developers.cloudflare.com/queues/) with retry and dead-letter handling. Consumers use Web Push for opted-in supported browsers and APNs for future iOS. Native local notifications can provide a fallback, with deduplication against remote reminders.

Queues can redeliver: deduplicate by reminder occurrence and device. Recheck enabled state, quiet hours, revoked subscriptions, and completed/cancelled work before delivery. Keep provider response/error details and timestamps without logging journal text or tokens. Alert on growing outbox age, retry rates, and dead letters. Provider acceptance is not proof the OS displayed a notification.

Define target latency and operational ownership before launch. Test DST transitions, timezone changes, sleep/offline devices, permission revocation, provider failures, duplicate delivery, and token rotation. Run a real-device delivery trial; the brief ranks reliability above feature breadth. Cron execution is UTC and is not an exact-time mobile alarm guarantee.

## Later services, only when needed

- Durable Objects: per-user live update hub when REST refresh demonstrably fails the sync experience. Keep D1 authoritative, authorize connections, and emit events after committed mutations.
- R2: private journal attachments with owner-scoped short-lived upload/download access, size/type limits, and database metadata. No public bucket by default.
- Native iOS: URLSession + Codable + Keychain on the same API, platform sound/silent behavior, haptics and notification permissions. Android needs a separate scope decision.
- No Workers AI, Vectorize, KV datastore, or Workflows requirement is established by this brief. Avoid adding them speculatively.

## Release gates

Use generated binding types and pinned Wrangler schema when adding bindings. Apply migrations to staging before production. Run authorization isolation, auth rotation, concurrent session, idempotency, and timezone tests in the Workers runtime. Validate backup/restore and account export/deletion procedures. Keep logs structured and free of user journal contents. Deploy only after environment values, Apple configuration, and reminder policy are concrete and reviewed. No production deployment is part of this UI/documentation pass.
