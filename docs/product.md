# Ostinova product requirements

## Current direction

The MVP contains Todos and Habits. Goals and their code have been removed, including assignment, grouping, sessions, journals, and breadcrumbs. This supersedes the earlier goal-based brief.

## Implemented local behavior

- Two sidebar destinations: Habits and Todos, with active counts.
- Todos support quick entry, newest-first order, completion and undo. Completed items slide to the bottom of the same continuous list, without a divider, label, count, or extra spacing. No priorities, deadlines, tags, or subtasks.
- Habits are standalone compact rows. Inline creation and editing support daily, selected weekdays, 1–7 distinct days per Monday-based week, 1–9999 completions per day or week, and total completion targets.
- Binary habits allow one check-in per local date. Count habits allow individual completions up to their target. Undo applies to the selected date. Editing preserves history.
- A themed date picker supports today and earlier dates. Due habits and habits checked on the selected date remain visible for undo. Completed total targets remain visible and can reopen through undo or a higher target.
- Habits can be archived and restored without losing history. Missed days never erase accumulated totals.
- Light/dark/system themes, local persistence, responsive navigation, keyboard controls, and reduced motion remain available.

## Data compatibility

Current storage is `ostinova.workspace.v4`, containing only Todos and Habits. When absent, the app reads `ostinova.goals.v3`, preserves existing Todos and all habit IDs, schedules, check-ins and archive state, and removes habit goal references. Retired goals, sessions, journals, breadcrumbs and active sessions remain in the untouched v3 key as a backup; they are no longer available in the MVP UI. Breadcrumbs are not converted into Todos.

If v3 is absent, `ostinova.projects.v2` imports an empty workspace without inventing habits or Todos. The v2 backup remains untouched. `ostinova.v1` remains untouched and is not imported. Malformed current data produces a visible read error and is not overwritten or replaced with older data. Save failures remain visible.

## Still planned and unresolved

Authentication, Worker API, D1, cross-device sync, real URL routes, account export/deletion and native iOS remain unimplemented. Pricing, reminder guarantees, native scope and freeze rules remain open decisions. This is a local prototype.

## Acceptance checks

Create and complete/undo Todos; verify newest-first order and reload persistence. Create and edit each habit schedule; verify check-in undo, archive/restore, historical dates, Monday/year boundaries and reload persistence. Migrate v3 with assigned/archived habits and Todos, checking the original backup stays intact. Verify v2 fallback, corrupt storage, both themes, narrow layouts and keyboard navigation.
