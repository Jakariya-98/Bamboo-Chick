# Bamboo Chick: merge notes

Two zips were merged into one project:

| Zip | What it contained |
|---|---|
| `Bamboo-Chick-merged.zip` ("**Zip A**") | Original project + **Manufacturer page**, uploads, blog cover images |
| `Bamboo-Chick-arena-0d05c199-bamboo-chick.zip` ("**Zip B**") | Original project + **discount prices, cart limits, product photos, review/order fixes** |

## Step-by-step working

1. **Unzipped both** and compared every file (`diff -r`), ignoring `node_modules`.
2. **Worked out who changed what.** There was no git history, so I used file timestamps and the diffs.
   - Zip A's edits were all Manufacturer-related (plus its own `MERGE_NOTES.md`).
   - Zip B's edits were all product/cart/order/review-related.
   - **No file was edited by both zips, so there were no conflicts.**
3. **Used Zip B as the base** (it holds the 30 MB of product photos and `package-lock.json`) and **copied Zip A's 19 changed/new files on top**.
4. **Verified the result**:
   - merged vs Zip B differs *only* in Zip A's files, and merged vs Zip A differs *only* in Zip B's files;
   - `npm install` + `npm test` in `server`: **5/5 tests pass**;
   - `vite build` in `client`: builds successfully (77 modules);
   - the server starts, unknown routes return 404, and upload and order endpoints return 401 without login.

## Backend changes

### From Zip A (Manufacturer page)
| File | Change |
|---|---|
| `server/src/models/Manufacturer.js` | NEW: title, description, media list |
| `server/src/controllers/manufacturerController.js` | NEW: get/update page, add/delete media |
| `server/src/controllers/uploadController.js` | NEW: generic file upload |
| `server/src/middleware/upload.js` | NEW: dependency-free multipart parser (regex bug fixed) |
| `server/src/routes/index.js` | 5 new routes: `GET/PUT /manufacturer`, `POST/DELETE /manufacturer/media`, `POST /uploads` (admin only except GET) |
| `server/src/app.js` | Serves `/uploads` as static files |
| `server/src/models/Blog.js` | New `coverImage` field |
| `server/src/controllers/blogController.js` | `createBlog` saves `coverImage` |

### From Zip B (pricing, cart, reviews)
| File | Change |
|---|---|
| `server/src/models/Product.js` | New optional `discountPrice` field |
| `server/src/utils/pricing.js` | `unitPrice(base, size, discountPrice)` uses the discount price when set |
| `server/src/controllers/productController.js` | `discountPrice` accepted on create and update |
| `server/src/controllers/orderController.js` | Server-side limits: **max 10 per item/size, max 20 units per cart**; order lines priced with `discountPrice` |
| `server/src/controllers/reviewController.js` | **One review per buyer per product** (returns 409 if repeated) |
| `server/tests/pricing.test.js` | Tests extended for `discountPrice` |

## Frontend changes

### From Zip A (Manufacturer page)
- NEW `pages/Manufacturer.jsx` (public `/manufacturer`) and `pages/admin/AdminManufacturer.jsx` (`/admin/manufacturer`)
- `App.jsx`: two new routes
- `AdminLayout.jsx`: "Manufacturer page" tab
- `Layout.jsx`: "Manufacturer" nav link
- `Home.jsx`: "Learn more →" link
- `BlogCard.jsx`: shows blog cover image when present
- `api/client.js`: `uploadRequest` + manufacturer/upload calls
- `styles/global.css`: manufacturer styles appended
- `vite.config.js`: proxies `/uploads` to the API
- `.gitignore`: ignores `server/uploads/`

### From Zip B (shop, cart, orders)
- `ProductCard.jsx`: shows the product photo; shows struck-through base price + red discount price
- `ProductDetail.jsx`: price uses the discount price (times the size multiplier)
- `CartContext.jsx`: same 10 per item / 20 per cart limits, with alerts; saved carts are clamped
- `seller/SellerProducts.jsx`: new "Discount price" and "Images" (filenames) columns and fields
- `MyOrders.jsx`, `seller/SellerOrders.jsx`, `seller/SellerCancellations.jsx`: show `pricing.grandTotal ?? pricing.total`; empty-state message; safer `customer?.name`
- NEW `components/ProductGallery.jsx` (see note below)
- NEW `client/public/products/` (product photos); the unused `client/public/images/` folder was removed during cleanup
- NEW root `package-lock.json`

## Things to know
1. **`ProductGallery.jsx` is not used yet.** Nothing imports it and its CSS (`.product-gallery`, `.gallery-*`) does not exist, so the product page still shows no gallery. This was already the case in Zip B; I did not change it.
2. **Product photos only show once filenames are entered** in Seller → Products → Images (e.g. `IMG_9773.JPG`). The seed script does not assign images.
3. **`grandTotal` does not exist on the server.** The order total is `pricing.total`; the frontend falls back to it, so totals display correctly.
4. **Uploads are stored on local disk** (`server/uploads`). On hosts with ephemeral disks, files vanish on redeploy.

## Run it
```bash
cd bamboo-chick-app
cd server && npm install && cp .env.example .env && npm run dev
cd ../client && npm install && npm run dev
```
Admin login: admin@bamboochick.com / admin123. No re-seed is needed for the merge.

## Cleanup completed

- Removed the unused `client/public/images/` folder and the unreferenced root-level `Bamboo Chick(Updated).jpg`.
- Kept `client/public/products/` because the product card and product gallery load files from `/products/`.
- Kept `client/public/favicon.svg` as the website favicon.
- Kept both `.env.example` templates. No real `.env` file or live credential was present in the archive.
- Updated `.gitignore` to ignore `.env` and `.env.*` files while allowing `.env.example` templates to remain in the project.
