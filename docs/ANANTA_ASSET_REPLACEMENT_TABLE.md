# Ananta Asset Replacement Table

This is the practical replacement checklist for the current local page.

- Normal page: `http://localhost:3000/`
- Controller page: `http://localhost:3000/?controller=1`
- Asset folder: `public/images/ananta`
- Machine-readable manifest: `docs/ANANTA_ASSET_REPLACEMENT_MANIFEST.json`

| Slot | Current File | Format | Suggested Replacement | Desktop / Mobile |
| --- | --- | --- | --- | --- |
| Main foreground keyed video | `public/images/ananta/rebel-main.mp4` | mp4 | vertical `9:16`, `810x1440` or higher | both |
| Main foreground fallback still | `public/images/ananta/look-the-rebel.png` | png | transparent portrait `1024x1820` | both, mobile thumbnail |
| Desktop timeline strip | `public/images/ananta/rebel-timeline-desktop.jpg` | jpg | `480x96` or same `5:1` ratio | desktop only |
| Mobile timeline strip | `public/images/ananta/rebel-timeline-mobile.jpg` | jpg | `1562x116` or same long-strip ratio | mobile only |
| Previous look still | `public/images/ananta/look-the-kiddo.png` | png | transparent portrait `1024x1820` | mobile thumbnail |
| Previous look thumbnail video | `public/images/ananta/ghost-the-kiddo.mp4` | mp4 | square video, `400x400` or higher | desktop thumbnail |
| Current look thumbnail video | `public/images/ananta/rebel-thumb.mp4` | mp4 | square video, `400x400` or higher | desktop thumbnail |
| Next look still | `public/images/ananta/look-the-warrior.png` | png | transparent portrait `1024x1820` | mobile thumbnail |
| Next look thumbnail video | `public/images/ananta/ghost-the-warrior.mp4` | mp4 | square video, `400x400` or higher | desktop thumbnail |
| Left far background video | `public/images/ananta/ghost-the-siren.mp4` | mp4 | square video, `400x400` or higher | hidden on narrow mobile |
| Left middle background video | `public/images/ananta/ghost-the-kiddo.mp4` | mp4 | square video, `400x400` or higher | both |
| Right middle background video | `public/images/ananta/ghost-the-warrior.mp4` | mp4 | square video, `400x400` or higher | both |
| Right far background video | `public/images/ananta/ghost-the-domina.mp4` | mp4 | square video, `400x400` or higher | hidden on narrow mobile |
| Product thumbnail 1 | `public/images/ananta/product-nikita-thumb.jpg` | jpg | portrait product thumbnail, `40x60` minimum | both |
| Product thumbnail 2 | `public/images/ananta/product-beatrix-thumb.jpg` | jpg | portrait product thumbnail, `40x60` minimum | both |
| Product detail image 1 | `public/images/ananta/product-nikita-body-black.jpg` | jpg | portrait product image, about `2000x3000` | reserved |
| Product detail image 2 | `public/images/ananta/product-beatrix-coat.jpg` | jpg | portrait product image, about `2000x3000` | reserved |

## How To Replace

1. Put the new files into `public/images/ananta`.
2. If the filenames stay the same, refresh the page and the template will pick them up.
3. If filenames change, update the file paths in `src/components/AnantaLookPage.tsx`.
4. Use `http://localhost:3000/?controller=1` to freeze angles and check the replacement visually.

## Important Mobile Replacements

The mobile page intentionally swaps resources:

- Timeline uses `rebel-timeline-mobile.jpg`.
- Look thumbnails use still PNG images instead of MP4 thumbnails.
- Product list collapses into `2 Products / View`.
