# Design preferences

The user supplied a TickTick dark desktop screenshot as a visual reference. Borrow its compact left navigation, subtle separators, checkbox rows, subdued counts, and right detail pane. Do not copy its feature breadth or personal task content.

## Direction

A quiet workspace for returning to goals. The distinctive element is the saved breadcrumb: it starts a session, appears in close-out, and returns to the top-level list. The activity grid is context, not a demand for a perfect streak.

Desktop: two-item sidebar, Habits and Goals, alongside a single content column. Goals use plain progress rows. Session history, completed steps, and next steps live in expandable goal-detail sections. A compact active-session footer replaces the persistent detail pane. On mobile, navigation becomes a drawer. Task text wraps rather than truncating the actionable step. On mobile, arrow controls replace drag handles for ordering.

## Tokens

- Dark canvas `#0a0a0a`, sidebar `#0e0e0e`, pane `#111111`, dividers `#292929`, primary text `#f4f4f5`. This follows the user's near-black shadcn reference. Primary blue uses the original shadcn setup token `oklch(0.424 0.199 265.638)`.
- Light canvas `#ffffff`, sidebar `#f7f7f9`, pane `#fafafb`, dividers `#e7e8ec`, primary text `#282b32`. Primary blue uses the original shadcn setup token `oklch(0.488 0.243 264.376)`.
- Inter Variable for headings, navigation, and body. A utility app benefits from restrained hierarchy rather than a decorative display font. Use tabular numerals for time and totals.
- Headings 23–25px, body 12–13px, metadata 10–11px. Keep metadata secondary but legible. Main controls need clear focus and sufficient touch space.
- Flat rows and small radii. Reserve elevation for dialogs and status messages.

The screenshot, not a generic dark SaaS dashboard, drives the neutral palette. Avoid oversized progress cards, decorative orbits, ornamental badges, gradients, and inspirational slogans. Labels should name actions: Start, Finish session, Save session, Up next.

## Interaction requirements

Theme follows system until explicitly changed. Persist the preference and apply it before first paint. Both themes share semantic Tailwind/shadcn tokens. All controls must work by keyboard. Dialogs contain focus, support Escape, and should restore focus to their trigger. Respect reduced motion. Keep sounds optional and muted initially on web. Show honest save failures; never claim unsaved work is synced.

## Habit list

Implemented: expandable goal headers with chevrons and subdued counts, compact checkbox rows, and schedule metadata aligned right on desktop and beneath the name on mobile. Standalone habits appear in a "Without a goal" group. Completed check-ins stay in their group so undo remains close at hand. Goal assignment is optional in the habit editor.

The workspace header names the current page beside the sidebar toggle, separated by a subtle vertical divider. Habits and Goals use their destination names; goal detail uses the selected goal name. Long names truncate in the header, with the full name retained beside the goal-detail back link. There is no repeated Habits heading above the list.

Habit filters and habit form dropdowns use Base UI select primitives styled with the app's shadcn tokens, so their menus match both themes. Use the same component for future standard selectors.

The Habits page has a quiet, borderless idle entry bar with a subtle fill, plus, and placeholder, following the TickTick reference. Focusing it reveals a single target icon for goal assignment and a thin focus border. The icon opens a searchable goal picker with in-place creation. The goal name appears in the empty input placeholder after selection. Enter or the plus adds a daily habit; schedules remain available in the habit editor. The bar stays on one line on narrow screens. Goal-detail creation retains its existing form.

Sidebar refinement: the compact outlined checkmark and wordmark share a tighter baseline, with two evenly spaced navigation rows. The favicon uses the same unfilled checkmark mark. A bottom Local workspace user menu opens an Appearance submenu containing Light, Dark, and System choices. The menu uses Base UI radio items and preserves the existing local theme preference; it does not imply an authenticated profile.

Habit and goal lists use compact flat rows without per-row separators or shadows and a subtle shared hover/focus fill. Habit edit controls and goal action menus appear on pointer hover or keyboard focus without shifting content. Goal removal lives in the row menu; the menu stays visible while open. Touch and narrow layouts keep row actions visible. Goal totals align to the right on desktop and wrap below the name on mobile. Session next-step controls use the same progressive reveal. Reduced-motion preferences disable these transitions.

Habit and active-goal totals appear as subdued right-aligned sidebar counters. The Habits heading is removed. The ghost calendar button sits in the workspace header on the Habits page and opens a themed month grid with Today/Yesterday shortcuts, arrow-key date navigation, and disabled future dates. Desktop sidebar can collapse to an icon rail; hover and keyboard navigation reveal labels temporarily without shifting the main content. The explicit toggle pins the expanded layout, with a locally saved preference.

Sidebar implementation now uses the supplied beui animated-sidebar component, adapted to Ostinova. Motion animates collapse, menu selection, and the mobile drawer; the omitted hover/easing helpers are local implementations. The header toggle and edge rail support pinned collapse, Cmd/Ctrl+B toggles outside text fields, and temporary desktop peek retains the collapsed content width. Mobile uses the component’s 767px breakpoint, focus containment, Escape dismissal, scroll lock, and focus restoration. Reduced motion is respected. Habits/Goals counters and the existing Appearance submenu remain; demo destinations and fictional account details are not included.

Goals-page rows begin directly with the goal name, without repeated goal icons. Mobile metadata aligns beneath the name.

List spacing refinement: desktop habits have a 36px minimum row height and goal rows 40px. Group headers use 8px horizontal insets, with habit checkboxes indented to 32px. Group spacing is 16px. Inline rows, group highlights, and the habit composer share a 6px radius. Mobile habits retain 48px minimum rows and visible 40px actions. Rows grow naturally for wrapped names; keyboard focus and hover highlights remain.
