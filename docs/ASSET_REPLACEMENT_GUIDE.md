# Asset Replacement Guide

This page records the main media slots used by the Ananta look template.
Use it as the size checklist when replacing the current assets for a new
project.

Local template measurement viewport: `1192 x 986`, device pixel ratio `1.25`.

Original-site reference measurement:

- URL: `https://www.anantaparis.com/looks/heroines-drop/the-rebel`
- Browser viewport: `1920 x 1080`
- Screenshot size captured from the in-app browser: `1904 x 1080`
- Reference screenshot: `docs/design-references/ananta-original-iab-1920x1080.png`
- Measured overlay: `docs/design-references/ananta-original-iab-1920x1080-measured.png`
- Raw measured data: `docs/design-references/ananta-original-iab-1920x1080-measured.json`

## Original 1920x1080 Visual Proportions

The original page draws the foreground and background figures into a single
full-screen canvas. The boxes below are visual measurements from the
`1920 x 1080` original-site screenshot, not DOM element boxes.

| Figure | Box x/y | Box size | Center | Height vs main | Viewport height |
| --- | ---: | ---: | ---: | ---: | ---: |
| Left far figure | `24, 330` | `78 x 348` | `63, 504` | `41%` | `32.2%` |
| Left middle figure | `330, 250` | `181 x 534` | `420.5, 517` | `63%` | `49.4%` |
| Main figure | `776, 115` | `304 x 845` | `928, 537.5` | `100%` | `78.2%` |
| Right middle figure | `1352, 289` | `177 x 485` | `1440.5, 531.5` | `57%` | `44.9%` |
| Right far figure | `1779, 402` | `99 x 272` | `1828.5, 538` | `32%` | `25.2%` |

Important layout ratios for the template:

- Main figure should occupy roughly `78%` of viewport height at `1920 x 1080`.
- Middle background figures should be about `57-63%` of the main figure height.
- Far background figures should be about `32-41%` of the main figure height.
- All figure centers sit near the vertical middle: around `y = 504-538`.
- The main figure center is slightly left of exact center in the captured screenshot: `x = 928` on a `1904px` screenshot.

Original UI measurements at `1920 x 1080`:

| UI element | Original display size | Notes |
| --- | ---: | --- |
| Full background canvas | `1905 x 1080`, intrinsic `2381 x 1350` | Device pixel ratio scaling from `1.25`. |
| Timeline strip | `175.4 x 24` | Source delivered as `1919 x 384`, visually a `5:1` strip. |
| Look thumbnail videos | `24 x 24` | Source video size `100 x 100`. |
| Product bar | `626.7 x 28` | Bottom-left bar at `x=20`, `y=1032`. |
| Product thumbnails | `24 x 24` | Source image size `40 x 60`, object-fit contain. |

## Main Video Slots

| Slot | File | Source size | Duration | Desktop display | CSS rule | Notes |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Foreground hero video | `public/images/ananta/rebel-main.mp4` | `810 x 1440` | `6s` | `506 x 900` | `height: min(92vh, 900px)`, `aspect-ratio: 1024 / 1820` | Main chroma-key video. Best replacement: vertical video around `9:16`, ideally `810 x 1440` or higher. |
| Back ghost A | `public/images/ananta/ghost-the-siren.mp4` | `100 x 100` | `5s` | `100 x 100` | `aspect-ratio: 1 / 1`, `width/height: 100px` | Background video only. No static outline. |
| Back ghost B | `public/images/ananta/ghost-the-kiddo.mp4` | `100 x 100` | `5s` | `100 x 100` | `aspect-ratio: 1 / 1`, `width/height: 100px` | Background video only. No static outline. |
| Back ghost C | `public/images/ananta/ghost-the-warrior.mp4` | `100 x 100` | `5s` | `100 x 100` | `aspect-ratio: 1 / 1`, `width/height: 100px` | Background video only. No static outline. |
| Back ghost D | `public/images/ananta/ghost-the-domina.mp4` | `100 x 100` | `5s` | `100 x 100` | `aspect-ratio: 1 / 1`, `width/height: 100px` | Background video only. No static outline. |

## Chroma Key Notes

The videos are drawn to canvas and green pixels are removed in
`src/components/AnantaLookPage.tsx`.

Recommended replacement rules:

- Foreground video: use a vertical green-screen video, `9:16`, minimum `810 x 1440`.
- Background ghost videos: use square videos if keeping the current layout, `100 x 100` minimum. Larger square files such as `400 x 400` will look cleaner while still displaying at `100 x 100`.
- Keep background videos square unless the CSS is changed. Non-square files will either crop awkwardly or need a new layout rule.
- Current ghost fallback images are present in the DOM but fully transparent. They are not part of the visible background layer.

## Main Image Slots

| Slot | File | Source size | Desktop display | Notes |
| --- | --- | ---: | ---: | --- |
| Hero fallback / look still | `public/images/ananta/look-the-rebel.png` | `1024 x 1820` | hidden, same frame box as hero video: `506 x 900` | Used as fallback only; opacity is `0` in the current page. |
| Ghost A fallback | `public/images/ananta/look-the-siren.png` | `1024 x 1820` | hidden, `100 x 100` box | Not visible in current page. |
| Ghost B fallback | `public/images/ananta/look-the-kiddo.png` | `1024 x 1820` | hidden, `100 x 100` box | Also used as right-top look thumbnail. |
| Ghost C fallback | `public/images/ananta/look-the-warrior.png` | `1024 x 1820` | hidden, `100 x 100` box | Also used as right-top look thumbnail. |
| Ghost D fallback | `public/images/ananta/look-the-domina.png` | `1024 x 1820` | hidden, `100 x 100` box | Not visible in current page. |
| Look nav thumbnail: Kiddo | `public/images/ananta/look-the-kiddo.png` | `1024 x 1820` | container `24 x 24`; image scales to about `24 x 43` and is clipped | Tall figure thumbnail, top aligned. |
| Look nav thumbnail: Rebel | `public/images/ananta/look-the-rebel.png` | `1024 x 1820` | container `24 x 24`; image scales to about `24 x 43` and is clipped | Current selected look. |
| Look nav thumbnail: Warrior | `public/images/ananta/look-the-warrior.png` | `1024 x 1820` | container `24 x 24`; image scales to about `24 x 43` and is clipped | Tall figure thumbnail, top aligned. |
| Timeline strip | `public/images/ananta/rebel-timeline-desktop.jpg` | `480 x 96` | `130 x 24` | Covered by a white overlay and cursor. Replace with a horizontal film-strip image. |
| Timeline strip mobile | `public/images/ananta/rebel-timeline-mobile.jpg` | `1562 x 116` | not used by current component | Available if mobile timeline is split later. |
| Product thumb: Nikita | `public/images/ananta/product-nikita-thumb.jpg` | `40 x 60` | `24 x 24` box, contained | Small product thumbnail in bottom product bar. |
| Product thumb: Beatrix | `public/images/ananta/product-beatrix-thumb.jpg` | `40 x 60` | `24 x 24` box, contained | Small product thumbnail in bottom product bar. |
| Product detail: Nikita | `public/images/ananta/product-nikita-body-black.jpg` | `2000 x 3000` | not visible on current landing view | Reserve for product detail expansion. |
| Product detail: Beatrix | `public/images/ananta/product-beatrix-coat.jpg` | `2000 x 3000` | not visible on current landing view | Reserve for product detail expansion. |

## Other Look Still Assets

All look still PNGs use the same portrait size: `1024 x 1820`.

- `look-the-avenger.png`
- `look-the-domina.png`
- `look-the-explorer.png`
- `look-the-kiddo.png`
- `look-the-rebel.png`
- `look-the-rider.png`
- `look-the-shadow.png`
- `look-the-siren.png`
- `look-the-twist.png`
- `look-the-velvet.png`
- `look-the-warrior.png`

## Mobile Display Rules

Current mobile breakpoint: `max-width: 900px`.

| Slot | Mobile display rule |
| --- | --- |
| Foreground hero video | `height: 68vh`, `top: 62%` |
| Background ghost videos | `86 x 86`, only B and C remain visible |
| Look nav | moves below header at `top: 106px` |
| Product bar | bottom `10px`, horizontal scroll |

## Best New-Project Asset Pack

For a clean replacement set, prepare:

- `1` foreground green-screen video: vertical `9:16`, `810 x 1440` or higher.
- `4` background green-screen videos: square, ideally `400 x 400` or higher, displayed at `100 x 100`.
- `11` look still PNGs: portrait `1024 x 1820`.
- `1` timeline strip: horizontal image around `480 x 96`.
- `2+` product thumbnails: portrait `40 x 60` minimum; higher resolution is fine.
- `2+` product detail images: portrait `2000 x 3000` if product pages are added later.
