# Ostinova product requirements

## Current direction

The latest design request allows standalone habits and groups the habit list into expandable goal sections, including a "Without a goal" section. This supersedes the earlier required goal assignment.

The user's follow-up explicitly changes the model to Goals with repeating Habits assigned to them. This supersedes the earlier interpretation of the [Notion brief](https://app.notion.com/p/danielrobertson/Simple-Habit-Tracker-Dead-Simple-Todos-3e037740271381938555f5dfcbabd0d8?source=copy_link) that deferred binary habits to v2. The brief remains background for simple interaction, forgiving progress, journals, sound, and Cloudflare architecture.

## Core loop

1. Create a goal describing what you want to achieve.
2. Create a habit, optionally assigning it to a goal.
3. Choose every day, selected weekdays, or a target number of days per week.
4. Check off today's occurrence. The habit repeats on its next scheduled day.

A habit may belong to one goal or stand alone without a goal. A goal can have many habits. Habit editing supports changing the name, schedule, and assigned goal without losing check-in history.

## Implemented local behavior

- Two sidebar destinations: Habits and Goals. Habits shows a selected local day, grouped by goal. Sidebar counters show total habits and active goals. A calendar picker supports today and earlier dates, with retrospective check-in and undo. Goals shows plain rows with assigned habit counts, cumulative check-ins for those habits, and finished session totals.
- Goal creation, goal detail, and recoverable removal. Removing a goal detaches habits and preserves check-ins, sessions, and breadcrumbs. Removed goals can be viewed and restored; restoration leaves habits standalone until explicitly reassigned. Removal is disabled during an active session for that goal.
- Session controls, ordered next steps, completed steps, and the journal are available inside expandable goal-detail sections. The active session appears in a compact footer.
- Repeating habit creation and editing, with optional goal assignment. The Habits page uses an inline entry bar: type a name and press Enter, optionally pick an existing goal or name a new goal. New goals and their first habit are saved together. New habits default to every day; schedules can be changed in the habit editor. Goal assignment appears as an icon only while the bar is focused or its picker is open. The bar retains the chosen goal for the next habit; adding returns to Today and expands its group.
- Daily, selected-weekday, and 1–7 distinct days per week schedules. Weeks start Monday; each habit allows one check-in per local date. These are explicit implementation defaults, not a multiple-count-per-day tracker.
- Habits use compact rows under expandable goal headers with counts. Standalone habits appear under "Without a goal". Expansion state lasts for the current view.
- The selected date shows due habits and habits checked on that date so completion can be undone. Goal detail shows all assigned habits, including those not due.
- Habits can be archived from their row action and restored from the Habits page's Archived habits section. Archiving preserves check-in history and excludes the habit from active counts and lists.
- Weekly targets stop appearing as due after reaching the target; checked-today habits remain visible for undo. Historical totals are not reset.
- Existing goal sessions, short journal close-outs, breadcrumbs, and ordered Up next remain available alongside repeating habits.
- Light/dark/system themes, responsive layout, opt-in confirmation sound, local persistence.

## Data compatibility

Current storage is `ostinova.goals.v3`. If absent, the app reads `ostinova.projects.v2`, maps projects to goals and project references to goal references, and preserves sessions, breadcrumbs, and active sessions. The old key remains as a backup. Migrated goals start with no habits rather than guessed schedules. The older `ostinova.v1` habits/goals demo remains untouched and needs a separate explicit import flow.

The original prototype gave new goals a purple default color. On load, only goals with that exact default color change to shadcn blue; other saved goal colors and all history remain intact. New goals also default to blue.

## Still planned

Worker API, D1, Sign in with Apple, cross-device sync, reminders, real URL routes, account export/deletion, and native iOS. Advanced habit history, intentional skips, freeze arithmetic, goal editing/permanent deletion, and habit archive/delete are not implemented. Session pause/cancel and optional focus countdown remain open.

## Product constraints

Keep the goal-to-habit relationship clear. Do not add tags, subtasks, boards, priority matrices, currencies, leaderboards, or punitive missed-day states. Preserve session journals and the single ordered breadcrumb list. No cloud sync or delivery promises while data is local. Pricing remains undecided.

## Acceptance checks

Create a goal, add daily and selected-day habits, verify they appear under the correct goal, change a habit's assignment, and confirm history is preserved. Check/undo today and reload. Verify weekly progress across Monday and year boundaries. Migrate a v2 workspace with an active session and journal history. Confirm both themes and narrow layouts still work.

Historical views apply current habit schedules and assignments, since schedule and assignment versions are not stored. Weekly due status ignores check-ins after the selected date; backfilling may raise a completed week above its target without deleting later completions. Future dates cannot be selected. Goals have cumulative progress, not a separate daily completion checkbox. Sidebar collapse preference persists locally; desktop hover or navigation keyboard focus peeks the sidebar over content. Mobile retains the navigation drawer.
