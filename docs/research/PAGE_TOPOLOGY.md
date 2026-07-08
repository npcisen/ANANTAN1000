# Ananta THE REBEL Page Topology

## Page Order
1. Fixed header in the top-left corner.
2. Fixed look navigation bar in the top-right corner.
3. Full viewport look scene with looping central subject video and pale adjacent figures.
4. Fixed left look information panel.
5. Fixed bottom-left product bar.
6. Footer bar and centered manifesto below the first viewport.

## Layers
- `z-index 1`: off-white page background and adjacent ghost figures.
- `z-index 2`: central autoplay video / fallback image.
- `z-index 10`: look information panel.
- `z-index 20`: product and look bars.
- `z-index 30`: header.
- `z-index 5`: footer content after the hero viewport.

## Interaction Models
- Header: hover-driven color change; mobile menu is represented visually, not expanded.
- Main look: time-driven video loop; no real video scrubber implemented.
- Look thumbnails: hover opacity only.
- Products: hover outline/text emphasis only.
- Footer: link hover color changes.

## Assets
- Main video: `public/images/ananta/rebel-main.mp4`
- Main fallback image: `public/images/ananta/look-the-rebel.png`
- Adjacent look images: `look-the-siren.png`, `look-the-kiddo.png`, `look-the-warrior.png`, `look-the-domina.png`
- Timeline strip: `rebel-timeline-desktop.jpg`, `rebel-timeline-mobile.jpg`
- Product thumbnails: `product-nikita-thumb.jpg`, `product-beatrix-thumb.jpg`
- Font files: `public/fonts/EurostileLTStd-BoldEx2.7ea899f8.woff2`, `public/fonts/EurostileLTStd-Demi.49350957.woff2`
