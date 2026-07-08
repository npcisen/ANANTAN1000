# Ananta THE REBEL Behavior Notes

Target: https://www.anantaparis.com/looks/heroines-drop/the-rebel

## Global
- Background is off-white `#f6f6f6`; UI bars are white `#fff`; text is near-black `#0a0a0a`.
- The site uses Eurostile Ananta: expanded bold for headings and compact uppercase demi for controls.
- Main viewport behaves like a full-screen lookbook scene. Header, look nav, info, product bar, and footer controls are fixed or sticky over the visual scene.

## Header
- Top-left header is fixed at `20px` desktop inset, two white rows with `3px` radius.
- Desktop row one contains the ANANTA SVG logo; row two contains `ALL 27`, `STORIES 04`, and `CART 00`.
- Mobile replaces the left menu links with `MENU` and keeps `CART 00`.
- Hover behavior: sibling buttons fade to medium gray while hovered item returns to black.

## Look Scene
- Original main figure is a looping autoplay muted video rendered through a canvas chroma-key pipeline. The clone uses the extracted transparent PNG because the raw mp4 contains a green-screen background.
- Pale adjacent look figures sit behind the main subject with low opacity, creating a carousel field.
- The scene is static in the clone; original uses canvas/video timing and scroll-driven page transitions.
- Video progress bar uses a narrow chronophotography image with a black cursor at roughly 14.8% / 360 degrees.

## Look Info
- Left info block shows `LOOK 03 / 11`, `THE REBEL`, progress chip `148° / 360°`, then Size, Coat, Body.
- Labels use 8px uppercase with 0.04em tracking; title uses expanded 30px uppercase at desktop and 20px mobile.

## Top Right Look Bar
- Fixed white bar at top right with `LOOK 03/11`, three thumbnails, and current item outlined in black.
- Thumbnails are 24px square desktop and 29px mobile.
- Hover on non-current thumbnails restores opacity; current thumbnail stays at full opacity.

## Product Bar
- Bottom-left bar contains two product rows: `NIKITA BODY black` and `BEATRIX COAT`, each with a 24px thumbnail and a gray `VIEW` suffix.
- Original opens product detail bars on hover/click; clone preserves visual hover affordance only.

## Footer
- Footer controls are sticky at bottom: left policy links, right email and Instagram.
- Manifesto appears below first viewport, centered, expanded bold uppercase:
  `Born on the road, made for the city. Technical, protective and unapologetically feminine, our pieces give women the confidence to move freely. A call to carve your own path, with no compromise and no concession.`

## Responsive
- Desktop reference: 1440px wide, 12-column grid, 20px gutter, 30px margin.
- Mobile reference: 390px wide, 8-column grid, 10px gutter, 20px margin.
- At mobile width the header spans most of the top, info moves near lower-left, product bar becomes horizontally scrollable, footer bars stack.
