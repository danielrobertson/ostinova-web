# Design preferences

The TickTick screenshot supplies compact navigation, restrained checkbox rows and subdued counts. Do not copy its personal task text or feature breadth.

## Current direction

A quiet local workspace with two destinations, Habits and Todos. Habits use a flat list with no goal headers, assignment picker or goal detail. Both destinations use a quiet inline entry bar. Habit schedules remain available in the entry bar and editor; the date picker remains in the header.

Desktop uses the existing animated sidebar and inset content pane with an 8px gutter, subtle border and 12px corners. Mobile uses edge-to-edge content and a focus-contained navigation drawer. The top Local workspace menu contains Appearance options. Sidebar collapse, hover peek and Cmd/Ctrl+B remain available.

## Tokens

- Dark canvas `#0a0a0a`, sidebar `#0e0e0e`, pane `#111111`, dividers `#292929`, primary text `#f4f4f5`. This follows the user's near-black shadcn reference. Primary blue uses the original shadcn setup token `oklch(0.424 0.199 265.638)`.
- Light canvas `#ffffff`, sidebar `#f7f7f9`, pane `#fafafb`, dividers `#e7e8ec`, primary text `#282b32`. Primary blue uses the original shadcn setup token `oklch(0.488 0.243 264.376)`.
- Inter Variable for headings, navigation, and body. A utility app benefits from restrained hierarchy rather than a decorative display font. Use tabular numerals for time and totals.
- Headings 23–25px, body 12–13px, metadata 10–11px. Keep metadata secondary but legible. Main controls need clear focus and sufficient touch space.
- Flat rows and small radii. Reserve elevation for dialogs and status messages.

The screenshot, not a generic dark SaaS dashboard, drives the neutral palette. Avoid oversized progress cards, decorative orbits, ornamental badges, gradients, and inspirational slogans. Labels should name actions: Start, Finish session, Save session, Up next.

## Interaction requirements

Theme follows system until changed, persists locally and resolves before first paint. Use semantic theme tokens and Base UI controls for standard popup behavior. Keyboard focus must stay visible. Drawer and popup interactions support Escape and focus restoration. Respect reduced motion.

Habits use compact flat rows with schedule metadata aligned right on desktop and beneath the name on narrow screens. Row actions appear on hover or keyboard focus and remain visible on touch. Count schedules expose plus, progress and minus controls. Clicking a habit name opens its editor.

Todos keep newest-first order within unfinished and completed items. Completion slides the item to the bottom of one continuous list, without a heading, count, separator, or extra gap. Completed items have muted text and a light strike-through. New rows use short entry motion; existing items do not animate on page entry. N focuses entry outside text fields or menus. Arrow keys and Home/End navigate checkboxes, and Space completes or undoes. Desktop checkbox space remains reserved during hover reveal; touch and narrow layouts keep checkboxes visible.

Show honest local storage failures. No cloud backup, reminder delivery or authenticated profile is implied.
