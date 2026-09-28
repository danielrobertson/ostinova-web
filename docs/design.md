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

The sidebar selection is the page title on desktop. There is no repeated page heading or date bar. Mobile retains a small menu button. Goal detail names the selected goal beside its back link.

Habit filters and habit form dropdowns use Base UI select primitives styled with the app's shadcn tokens, so their menus match both themes. Use the same component for future standard selectors.
