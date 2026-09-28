# Design preferences

The user supplied a TickTick dark desktop screenshot as a visual reference. Borrow its compact left navigation, subtle separators, checkbox rows, subdued counts, and right detail pane. Do not copy its feature breadth or personal task content.

## Direction

A quiet workspace for returning to projects. The distinctive element is the saved breadcrumb: it starts a session, appears in close-out, and returns to the top-level list. The activity grid is context, not a demand for a perfect streak.

Desktop: project sidebar | ordered next steps and activity | current session. At narrower widths the session pane moves below the list, then navigation becomes a drawer. Task text wraps rather than truncating the actionable step. On mobile, arrow controls replace drag handles for ordering.

## Tokens

- Dark canvas `#1e1e20`, sidebar `#232325`, pane `#202022`, dividers `#303034`, primary text `#e3e3e7`, accent `#8999f1`.
- Light canvas `#ffffff`, sidebar `#f7f7f9`, pane `#fafafb`, dividers `#e7e8ec`, primary text `#282b32`, accent `#5264cc`.
- Inter Variable for headings, navigation, and body. A utility app benefits from restrained hierarchy rather than a decorative display font. Use tabular numerals for time and totals.
- Headings 23–25px, body 12–13px, metadata 10–11px. Keep metadata secondary but legible. Main controls need clear focus and sufficient touch space.
- Flat rows and small radii. Reserve elevation for dialogs and status messages.

The screenshot, not a generic dark SaaS dashboard, drives the neutral palette. Avoid oversized progress cards, decorative orbits, ornamental badges, gradients, and inspirational slogans. Labels should name actions: Start, Finish session, Save session, Up next.

## Interaction requirements

Theme follows system until explicitly changed. Persist the preference and apply it before first paint. Both themes share semantic Tailwind/shadcn tokens. All controls must work by keyboard. Dialogs contain focus, support Escape, and should restore focus to their trigger. Respect reduced motion. Keep sounds optional and muted initially on web. Show honest save failures; never claim unsaved work is synced.
