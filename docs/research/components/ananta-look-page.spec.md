# AnantaLookPage Specification

## Overview
- Target file: `src/components/AnantaLookPage.tsx`
- Screenshot: `docs/design-references/ananta-rebel-desktop-full.png`
- Interaction model: static central figure with hover-driven UI bars. Original source uses a chroma-key video, but the clone uses the transparent PNG asset to avoid exposing the green-screen source.

## DOM Structure
- `main.ananta-page`
  - `AnantaHeader`
  - `LookNavBar`
  - `section.look-hero`
    - `LookInfo`
    - `FigureField`
    - `ProductBar`
  - `footer.ananta-footer`

## Computed Style Source
- Original CSS snapshot: `docs/research/ananta-original.css`
- Relevant tokens:
  - `--color-off-black: #0a0a0a`
  - `--color-medium-grey: #b2b2b2`
  - `--color-divider: #e6e6e6`
  - `--color-off-white: #f6f6f6`
  - `--color-inner-background: #fff`
  - `--gap: 10px`
  - `--grid-gutter: 20px`
  - `--viewport-inset: 20px`
  - `--bar-height: 28px`
  - `--border-radius: 3px`

## Key Styles
- Body font: `Eurostile Ananta`, fallback Helvetica/Arial.
- Base text: `8px`, uppercase, `letter-spacing: .04em`, line-height `1.1`.
- Heading: `30px`, expanded/bold, uppercase, line-height `1`.
- Header: fixed top-left, width about `326px`, white rows, 28px row height except logo row 30px.
- Product bar: fixed bottom-left desktop, white group bar, each product min width about `220px`.
- Footer manifesto: centered, width about 430px desktop, 30px uppercase, margin 100px auto.

## States & Behaviors
- Header and footer links: gray siblings on group hover, hovered link black.
- Look thumbnails: inactive opacity `.4`, current outline black and opacity `1`.
- Timeline cursor: black outline rectangle at 14.8% progress.
- Figure: transparent PNG from Sanity. Raw mp4 was downloaded for evidence but not rendered because it needs the original site's canvas chroma-key shader.

## Text Content
- Logo: ANANTA SVG mark.
- Header: `ALL 27`, `STORIES 04`, `CART 00`.
- Look info: `LOOK 03 / 11`, `THE REBEL`, `148° / 360°`, `SIZE 178CM`, `COAT S`, `BODY S`.
- Top right: `LOOK 03/11`.
- Products: `NIKITA BODY black VIEW`, `BEATRIX COAT VIEW`.
- Footer: `TERMS OF SERVICE`, `SHIPPING POLICY`, `SIZE GUIDE`, `HELLO@ANANTAPARIS.COM`, `INSTAGRAM`.

## Responsive Behavior
- Desktop 1440px: full-width scene, left info around 30px from left and 140px from top, central figure about 44vw wide with max height 92vh.
- Tablet/mobile below 900px: header width expands to available viewport; title becomes 20px; top-right look bar stays compact; product bar scrolls horizontally; central video width increases to fill the narrow view.
- Mobile 390px: info is lower and compact so header does not overlap; footer bars stack.
