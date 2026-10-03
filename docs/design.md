# Design preferences

The user supplied a TickTick dark desktop screenshot as a visual reference. Borrow its compact left navigation, subtle separators, checkbox rows, subdued counts, and right detail pane. Do not copy its feature breadth or personal task content.

## Direction

A quiet workspace for returning to goals. The distinctive element is the saved breadcrumb: it starts a session, appears in close-out, and returns to the top-level list. The activity grid is context, not a demand for a perfect streak.

Desktop: three-item sidebar, Habits, Goals, and Todo, alongside a single content column. Goals use plain progress rows. Up next and Session appear directly on goal detail; completed steps and the journal remain expandable. A compact active-session footer replaces the persistent detail pane. On mobile, navigation becomes a drawer. Task text wraps rather than truncating the actionable step. On mobile, arrow controls replace drag handles for ordering.

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

The workspace header names the current page beside the sidebar toggle, separated by a subtle vertical divider. Habits and Goals use their destination names; goal detail uses a Goals > goal name breadcrumb in the header, with Goals linking back to the list. Long names truncate in the header and remain available in the title tooltip. The goal-detail content has no repeated breadcrumb. A header action opens goal renaming. There is no repeated Habits heading above the list.

Habit filters and habit form dropdowns use Base UI select primitives styled with the app's shadcn tokens, so their menus match both themes. Use the same component for future standard selectors.

The Habits page has a quiet, borderless idle entry bar with a subtle fill, plus, and placeholder, following the TickTick reference. Focusing it reveals a single target icon for goal assignment and a thin focus border. The icon opens a searchable goal picker with in-place creation. The goal name appears in the empty input placeholder after selection. Enter or the plus adds a habit with the chosen schedule. A borderless, muted text-and-chevron trigger opens a small schedule popover with daily, count-per-day, count-per-week, total, selected-weekday, and distinct-days-per-week options. Count targets use a themed number stepper inside the popover. The entry bar shows only a short summary such as “2× per week”. The bar stays on one line on narrow screens. Goal-detail creation retains its existing form.

Sidebar refinement: the compact outlined checkmark and wordmark share a tighter baseline, with two evenly spaced navigation rows. The favicon uses the same unfilled checkmark mark. A bottom Local workspace user menu opens an Appearance submenu containing Light, Dark, and System choices. The menu uses Base UI radio items and preserves the existing local theme preference; it does not imply an authenticated profile.

Habit and goal lists use compact flat rows without per-row separators or shadows and a subtle shared hover/focus fill. Habit edit controls and goal action menus appear on pointer hover or keyboard focus without shifting content. Goal removal lives in the row menu; the menu stays visible while open. Touch and narrow layouts keep row actions visible. Goal totals align to the right on desktop and wrap below the name on mobile. Session next-step controls use the same progressive reveal. Reduced-motion preferences disable these transitions.

Habit and active-goal totals appear as subdued right-aligned sidebar counters. The Habits heading is removed. The ghost calendar button sits in the workspace header on the Habits page and opens a themed month grid with Today/Yesterday shortcuts, arrow-key date navigation, and disabled future dates. Desktop sidebar can collapse to an icon rail; hover and keyboard navigation reveal labels temporarily without shifting the main content. The explicit toggle pins the expanded layout, with a locally saved preference.

Sidebar implementation now uses the supplied beui animated-sidebar component, adapted to Ostinova. Motion animates collapse, menu selection, and the mobile drawer; the omitted hover/easing helpers are local implementations. The header toggle and edge rail support pinned collapse, Cmd/Ctrl+B toggles outside text fields, and temporary desktop peek retains the collapsed content width. Mobile uses the component’s 767px breakpoint, focus containment, Escape dismissal, scroll lock, and focus restoration. Reduced motion is respected. Habits/Goals counters and the existing Appearance submenu remain; demo destinations and fictional account details are not included.

Goals-page rows begin directly with the goal name, without repeated goal icons. Mobile metadata aligns beneath the name.

List spacing refinement: desktop habits have a 36px minimum row height and goal rows 40px. Group headers use 8px horizontal insets, with habit checkboxes indented to 32px. Group spacing is 16px. Inline rows, group highlights, and the habit composer share a 6px radius. Mobile habits retain 48px minimum rows and visible 40px actions. Rows grow naturally for wrapped names; keyboard focus and hover highlights remain.

Count habits show a quiet plus, current/target progress, and a minus to undo one completion on the selected date. Finished total targets remain visible with a checkmark. Click a habit name to edit its schedule or assignment. Keyboard focus remains explicit on borderless controls.

Todo uses the same quiet inline entry bar. Enter adds a standalone item to the top and keeps input focus. A short opacity, vertical movement, and scale animation introduces new rows; layout motion follows completion and undo. Existing items do not animate on page entry. Completed items have muted text and a light strike-through, below a subdued Completed divider and count. Base UI checkboxes support keyboard toggling, and reduced motion disables movement. Order within both groups remains newest created first.

Todo checkbox reveal: on desktop with a fine pointer and hover support, both unfinished and completed row checkboxes appear only on row hover or keyboard focus within the row. Their space stays reserved so text never shifts. Touch and narrow layouts keep checkboxes visible, and reduced motion disables the reveal transition.

Linear-inspired workspace refinement: all destinations share a desktop inset content pane with a subtle border, 12px corners, and an 8px outer gutter against the sidebar surface. Mobile remains edge-to-edge. Headers are 48px with compact titles; New goal now lives at the right of the Goals header. Content uses consistent 24px desktop insets, muted metadata, and whole-row hover/focus fills without breadcrumb row separators. Todo supports N to focus entry outside text fields or menus, ArrowDown from entry into the list, Up/Down and Home/End through checkboxes, and ArrowUp from the first item back to entry. Space retains native checkbox completion and undo. The data model and newest-first order are unchanged.

The Local workspace menu now occupies the top sidebar header, replacing the logo and wordmark. Its compact avatar, workspace label, and downward chevron open preferences below the trigger. Appearance remains a themed keyboard-accessible submenu. Collapsed sidebar keeps the avatar trigger; the mobile close button remains beside it. No authenticated profile or unfinished Settings destination is implied.

Desktop inset boundary: the content pane alone draws the border beside navigation. The sidebar panel has no vertical edge border and the collapse rail has no hover line, so neither crosses the rounded pane corner. The rail remains clickable; mobile drawer borders are unchanged.

Linear reference polish: neutral menu highlights, a charcoal content pane above a near-black sidebar in dark mode, consistent 1.65-unit Lucide strokes, and 16px navigation icons. Goals uses a simple flag instead of concentric target rings. Icons use a dedicated muted token; active navigation and completion retain stronger contrast. Checkbox boundaries remain distinct from decorative separators. Navigation uses 6px corners without press scaling; buttons transition colors only. Floating pickers use short origin-aware transitions and shared shadow tokens. Reduced motion disables CSS transitions. These are local prototype changes; pricing, reminders, native scope, and freeze rules remain unresolved.
