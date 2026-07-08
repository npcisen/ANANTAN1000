# Ananta Clone Page Layout Description

Source page: https://www.anantaparis.com/looks/heroines-drop/the-rebel

Local page: http://localhost:3000/

Controller page: http://localhost:3000/?controller=1

Replacement table: `docs/ANANTA_ASSET_REPLACEMENT_TABLE.md`

Replacement manifest: `docs/ANANTA_ASSET_REPLACEMENT_MANIFEST.json`

## Responsive Rules

- Main breakpoint: `900px`.
- Desktop branch: `min-width: 901px`.
- Mobile branch: `max-width: 900px`.
- Desktop reference scale: `--ananta-rem` follows the smaller side of `100vw / 1440` and `100vh / 810`, clamped between `0.86px` and `1px`.
- Mobile reference scale: `--ananta-rem` follows `100vw / 393`, clamped between `0.86px` and `1px`.
- Desktop behavior keeps bars compact and spread around the viewport.
- Mobile behavior collapses some UI into full-width bars and replaces several resources.

## Controller

The page exposes a browser-side controller for testing through the in-app/proxy browser:

```js
window.anantaPageController.getState()
window.anantaPageController.setProgress(0.5)
window.anantaPageController.setAngle(180)
window.anantaPageController.openProducts()
window.anantaPageController.closeProducts()
window.anantaPageController.toggleProducts()
window.anantaPageController.pause()
window.anantaPageController.play()
window.anantaPageController.openMenu()
window.anantaPageController.closeMenu()
window.anantaPageController.toggleMenu()
window.anantaPageController.describe()
```

`setProgress` accepts `0` to `1`. If a value above `1` is passed, it is treated as degrees out of `360`.

For proxy-browser workflows, the most reliable entry is the visible controller panel:

- Open `http://localhost:3000/?controller=1`.
- Use the progress slider or the `0`, `90`, `180`, `270` buttons to seek the look.
- The controller freezes the look after seeking; use `Play` to resume.
- Use `Open menu` / `Close menu` to test the mobile menu branch.
- Use `Open products` / `Close products` to test the mobile product panel branch.

The root element also exposes readable state attributes:

```html
<main
  class="ananta-page"
  data-controller-ready="true"
  data-menu-open="false"
  data-paused="false"
  data-products-open="false"
  data-progress="0.4111"
>
```

## Page Sections

### Header

- Location: fixed top-left.
- Desktop content: logo, `All 27`, `Stories 04`, `Cart 00`.
- Mobile content: logo, `Menu`, `Cart 00`.
- Interaction: `Menu` toggles the hidden mobile menu.
- Text interaction: button labels use scramble text on hover/focus.

### Look Navigation

- Location: fixed top-right on desktop, below header on mobile.
- Content: `Look 03/11` and three look thumbnails.
- Desktop resource behavior: thumbnail videos are shown when available.
- Mobile resource behavior: static thumbnail images replace videos.
- Current state: `THE REBEL` thumbnail has an outline.

### Look Information

- Location: left side over the hero section.
- Content: `Look 03 / 11`, title `The Rebel`, timeline scrubber, size details.
- Mobile behavior: degree text is hidden and the timeline expands to a wider mobile bar.

### Video Progress Bar

- Desktop image: `/images/ananta/rebel-timeline-desktop.jpg`.
- Mobile image: `/images/ananta/rebel-timeline-mobile.jpg`.
- Switching method: `<picture>` with `(max-width: 900px)`.
- Interaction: pointer drag updates progress and seeks the main look video.

### Figure Field

- Layer: center hero visual field.
- Main asset: `/images/ananta/rebel-main.mp4`.
- Fallback image: `/images/ananta/look-the-rebel.png`.
- Supporting background figures:
  - `/images/ananta/ghost-the-siren.mp4`
  - `/images/ananta/ghost-the-kiddo.mp4`
  - `/images/ananta/ghost-the-warrior.mp4`
  - `/images/ananta/ghost-the-domina.mp4`
- Rendering behavior: green-screen keyed video is drawn into canvas.
- Mobile behavior: side figures are simplified and the main figure is resized lower in the viewport.

### Product Bar

- Desktop behavior: products are visible as inline product bars.
- Mobile behavior: products collapse into one summary bar, `2 Products / View`.
- Mobile interaction: tapping `View` expands the product panel; tapping again closes it.
- Products:
  - `NIKITA BODY black`, image `/images/ananta/product-nikita-thumb.jpg`.
  - `BEATRIX COAT`, image `/images/ananta/product-beatrix-thumb.jpg`.

### Footer

- Content: policy links, email, Instagram, manifesto text.
- Mobile behavior: footer link bars stack into full-width rows.

## Current Asset Replacement Map

| Area | Desktop | Mobile |
| --- | --- | --- |
| Timeline | `rebel-timeline-desktop.jpg` | `rebel-timeline-mobile.jpg` |
| Look thumbnails | video thumbnails | static images |
| Products | expanded product bars | collapsed summary plus expandable panel |
| Header menu | `All`, `Stories`, `Cart` visible | `Menu`, `Cart` visible |

## Notes For New Content

- Keep a desktop and mobile timeline image when the timeline is important.
- Provide static thumbnail images even when desktop video thumbnails exist.
- Product data should include title, thumbnail image, and destination link.
- Main character video should keep the same transparent/keyed workflow or be replaced by a clean transparent PNG/video pipeline.
