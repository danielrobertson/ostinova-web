# Ostinova product requirements

Source: [Simple Habit Tracker + Dead-Simple Todos](https://app.notion.com/p/danielrobertson/Simple-Habit-Tracker-Dead-Simple-Todos-3e037740271381938555f5dfcbabd0d8?source=copy_link). Read in the signed-in browser on September 27, 2026. Market claims in that document are background research, not independently verified facts here.

## Which direction governs

The brief contains an original habit-grid concept, a September 26 project-habits pivot, and September 27 architecture decisions. The explicit pivot names project habits as v1 and defers binary habits to v2. The architecture says web first, iOS later; this supersedes the older simultaneous iOS/Android MVP language. Those are the working interpretations, not a claim that the document is internally consistent.

## Who and what

For someone returning to a long-running creative project, the problem is remembering where to restart. The home view should answer "what was I going to do next?" and let the person start in one action.

1. Start a project session. A focus timer is optional.
2. Finish with one line about the work and an optional dump of unfinished thoughts.
3. Save a single next step. Keep this close-out comfortably under 30 seconds.
4. Put that breadcrumb in Up next, ready for the next session. The journal keeps the summary, open loops, and next step together.

The brief defines the project streak as consecutive sessions with breadcrumbs, not consecutive calendar days. Do not reintroduce daily streak pressure through the activity grid.

## V1 requirements and acceptance

| Requirement | Acceptance | Current status |
| --- | --- | --- |
| Projects | Create a named project and start work on it | Local prototype |
| Sessions | One active session, survives refresh; elapsed time derives from start timestamp | Local prototype |
| Close-out | Summary and one next step required; open loops optional; one save records session and breadcrumb | Local prototype, one local state update |
| Up next | Breadcrumb-derived list, complete/reopen, drag to reorder; keyboard/touch alternatives | Local prototype |
| Journal | Browse session summaries, open loops, and breadcrumbs by project or across projects | Local prototype |
| Activity | Show actual session activity and cumulative totals without inventing history | 14-day local grid and all-time totals |
| Appearance | Dark/light/system, persistent choice, mobile layout, clear focus | Implemented |
| Quiet sounds | One mute setting, short confirmation, rare milestone cues, native silent-mode respect | Opt-in web confirmation tone only; native behavior and milestone cues deferred |
| Account/sync | Apple sign-in, Worker API, D1, same data across devices | Planned |
| Reminders | Explicit consent, timezone-aware schedules, measured delivery reliability | Planned; channel and timing policy undecided |
| Native | iOS client using shared HTTPS API and Keychain | Later; Android timing unresolved |

## Deferred original concept

V2 includes daily/specific-day/weekly-count binary habits, per-day journals, completion percentages, best-ever totals, intentional skips, and streak freezes. Native haptics, widgets, and Apple Health integration need separate native planning. Optional focus timer controls, milestones, advanced history, and attachments are not in this UI pass.

Goals in the starter app were design-system demos, not confirmed requirements. The old habits/goals storage remains under its original key; a future explicit import/export flow can recover or migrate it. The new model must not guess that a numeric goal is a project or that a habit check-in is a work session.

## Non-goals and constraints

No subtasks, tags, Kanban, calendars, Eisenhower matrices, leaderboards, currencies, inventories, punitive streak resets, or a second task-management system. Social features, if ever added, are opt-in and cooperative. Keep the game layer ignorable. Do not put core habit features behind arbitrary free-tier caps.

Sound is part of the brief. Web Audio cannot guarantee respect for every device's hardware silent switch; default off here and keep the mute control visible. Native clients must respect platform audio policies.

## Open decisions

- Confirm the pivot and web-first interpretation before scheduling binary-habit work.
- Decide whether older unfinished breadcrumbs accumulate or are replaced. The prototype retains them and completes the breadcrumb used to start a finished session. This is an implementation assumption.
- Decide pause/cancel and abandoned-session handling; current prototype supports finishing, not pause/cancel.
- Define reminders for project sessions, quiet hours, fallback channels, and what counts as successful delivery. Do not promise exact OS delivery times.
- Define project edit/archive/delete, export/import, and account deletion before production.
- Set freeze/skip/partial-credit arithmetic before v2 statistics.
- Resolve pricing: the brief considers subscription plus lifetime and one-time purchase. No price or billing model is approved.
- Review native Android scope. The newer architecture explicitly describes iOS only.
- Decide whether advanced history is paid: the brief both suggests this and says paid features should be cosmetic only.

## Next build order

Auth and owned D1 schema → session and breadcrumb API → client persistence adapter and explicit local import → reminder infrastructure and delivery testing → real URL routes and production recovery flows → iOS → binary habits. Keep each change independently testable.
