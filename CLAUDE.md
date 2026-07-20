# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A static, dependency-free HTML/CSS/JS prototype of a Silpo (Ukrainian grocery retailer) product listing and product detail page, built to demo a Nutri-Score / nutrient-tag feature. There is no `package.json`, no build step, no bundler, and no test suite — every page is plain HTML that pulls in a few `<script>` tags which render the UI into the DOM at load time via string templates + `innerHTML`.

The repo root has two unrelated project folders:
- **`nutriscore/`** — the active project. All current work lives here.
- **`template/`** — an earlier, independent starter prototype (a "Фрукти, овочі" category page) with its own `products.js`/`script.js`. It is *not* used by `nutriscore/` and shares no code with it beyond similar hand-rolled conventions. Treat it as a historical reference only, not a dependency.

## Commands

There is no build/lint/test tooling. To preview a page, serve the folder over HTTP (opening the HTML files directly with `file://` will break the `fetch`-free but still relative-path-based asset/script loading in some browsers):

```bash
npx http-server nutriscore -p 4173
```

This matches `.claude/launch.json` (`silpo-static` config), which the Claude Code preview tooling uses automatically — prefer that over starting a server manually.

There is no single-file "run a test" command because there are no automated tests. Verify changes by loading the relevant page in a browser and checking the affected flow (listing → click a card → product page → back).

## Architecture

### Two parallel demo variants, one dataset

`nutriscore/` contains **two fully parallel page pairs** that render the same product data with two different Nutri-Score visual treatments, for side-by-side comparison:

| Variant | Listing | Listing JS | Product page | Product JS |
|---|---|---|---|---|
| Pill Nutri-Score | `index.html` | `script.js` | `product.html` | `pdp.js` |
| Square Nutri-Score | `index-2.html` | `script-2.js` | `product-2.html` | `pdp-2.js` |

Each pair links only to itself (`index.html` cards → `product.html`, `index-2.html` cards → `product-2.html`, and "similar products" on each PDP link back into the same pair). There is no `?from=` query-param switch anymore — that was an earlier approach and has been replaced by fully separate files.

**`script.js`/`script-2.js` and `pdp.js`/`pdp-2.js` are near-duplicates of each other.** The diff between each pair is intentionally tiny — which Nutri-Score asset/CSS class is used (`nutri-score-badge` + `nutri-score-small-*.svg` vs `nutri-score-badge-square` + `nutri-score-square-*.svg`, and `pill`/`big-*.svg` vs `square`/`square-*.svg` on the PDP) and which page it links to (`product.html` vs `product-2.html`). **When changing shared behavior — card layout, pricing, accordion logic, similar-products carousel, etc. — the change must be made in both files of the pair.** `diff script.js script-2.js` / `diff pdp.js pdp-2.js` shows exactly what's supposed to differ.

### Shared files (loaded by every page)

- **`common.js`** — `BADGES` lookup (promo badges like "Ціна тижня", "Зроблено в Україні") + footer accordion toggle.
- **`products.js`** — the single source of truth for product data: the `PRODUCTS` array and the `TAG_META` lookup (nutrient tag codes/labels like `БЦ`/"Без цукру", `АГ`/"Алерген Горіх", `В`/"Веган", etc., shared between the listing's compact tag circles and the product page's labelled tag row).
- **`styles.css`** — one stylesheet for both variants and both page types, organized with `/* ===== Section ===== */` comment headers (Header, Product grid, Nutri-Score, Badge tooltips, Product detail page, PDP nutrients card, then responsive breakpoints at the bottom). Variant-specific look is achieved with modifier classes (e.g. `.nutri-score-badge` vs `.nutri-score-badge-square`, `.listing-tag` vs `.listing-tag.lg`, `.pdp-nutrients-score-icon.pill` vs `.square`) rather than separate stylesheets.

### Rendering pattern

Nothing is componentized — each listing script builds every product card's HTML via template literals against `PRODUCTS`/`PRODUCT_ROWS` and injects it with `grid.innerHTML = ...`; `pdp.js`/`pdp-2.js` read `?id=<slug>` from the URL, look the product up in `PRODUCTS`, and fill in the static `product.html`/`product-2.html` skeleton (gallery, price, a 3-item accordion — "Опис" open by default, "Загальна інформація" and "Деталі акції" collapsed — the "Харчова цінність" nutrients card, and a "Схожі товари" carousel) by setting `textContent`/`innerHTML` on a fixed set of `id="pdp-*"` elements. To add a product, add an entry to `PRODUCTS` in `products.js`; to change what a card or the PDP renders, edit the template-literal functions in the relevant script.

### Nutri-Score assets

`assets/nutri-score/` holds 8 SVGs = 2 grades (**A** and **D** — those are the only grades used anywhere in `PRODUCTS` today) × 4 size/shape variants, three of which are actually referenced from code:
- `nutri-score-big-{a,d}.svg` — enlarged pill, used by `pdp.js`'s nutrients card.
- `nutri-score-small-{a,d}.svg` — compact pill, used by `script.js`'s listing cards.
- `nutri-score-square-{a,d}.svg` — square badge, used by both `script-2.js` (listing) and `pdp-2.js` (PDP) for the second demo variant.
- `nutri-score-{a,d}.svg` (no size suffix) — an unused leftover from an earlier iteration, before the big/small split existed. Not referenced by any current script.

Introducing a new grade (B/C/E) means sourcing matching pixel-perfect SVG exports for all the size variants actually in use before wiring up data — there's no programmatic/CSS-generated fallback.

### Deployment (GitHub Pages)

The site is deployed via GitHub Pages, "deploy from a branch", configured to serve from a specific top-level folder (not the repo root) on `master`. GitHub Pages runs a Jekyll build by default, which fails on this plain static site — the published folder must contain a `.nojekyll` file (present today) to make Pages skip Jekyll and serve files as-is. **If the top-level project folder is renamed, the GitHub Pages source folder setting on github.com must be updated to match, and `.nojekyll` must exist inside the new folder**, or Pages will start returning 404s / Jekyll build failures again.
