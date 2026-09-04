# Product Images — Drop-in Instructions

Real product photos go in this folder: `assets/images/products/`.

Current files are **placeholder SVGs** used by `data/products.js`.

## How to use real photos
1. Drop your photos here (`.jpg` / `.png` / `.webp` recommended).
2. Cover the whole card area (ideally square-ish, e.g. 800x800 or 600x520).
   CSS uses `object-fit: cover`, so off-ratio photos are cropped to fit neatly.
3. Update the product's `image` path in `data/products.js`, e.g.:

   ```js
   image: "assets/images/products/earbuds-pro.jpg",
   ```

## Option B — replace the file, no code change
Save your real photo with the **same filename as the existing placeholder**
(e.g. overwrite `earbuds-pro.svg` — but use `.jpg`/`.png` and update the code's
extension). The simplest, least error-prone path is to update the `image` string.

## Fallback behavior
If an image path is wrong or the file is missing, the card automatically falls
back to the product emoji placeholder — nothing breaks and no broken-image icon
is shown.

## Other image folders
- `assets/images/banners/`  → wide hero/offer banner images (not yet wired).
- `assets/images/branding/` → logo / favicon / social badges (not yet wired).
