# Bamboo Chick

A full-stack e-commerce web app for **Bamboo Chick**, a premium interior-design and sustainable
bamboo-curtain manufacturer. Buyers browse and configure curtains, get an automatic price with VAT
and delivery, place an order and receive a numbered order slip; the seller runs orders, stock,
discounts, blogs and reports; the admin moderates reviews and keeps the whole site healthy.

| | |
|---|---|
| **Course** | CSE-412 Software Engineering |
| **Section / Team** | Section 01 · Team 02 |
| **Stack** | React 18 + Vite (client) · Node.js + Express + MongoDB/Mongoose (server) · JWT auth with roles |
| **Roles** | `buyer`, `seller`, `admin` |

---

## 1. What the website does

### Buyer
- Browse bamboo curtains by category, search, and see ratings from real reviews.
- Open a product to pick a **size** (3×5, 4×6, 5×7, custom) — the price scales by a multiplier — and preview it in a CSS-3D window.
- Take the **recommendation quiz** (room · need · budget) for up to 4 tailored products.
- Add to cart; the cart recalculates **subtotal, bulk discount, VAT, installation + service VAT and delivery** on every change. Limits are enforced on the server: **max 10 units per item/size and 20 units per cart**.
- Check out with name, phone and address (inside/outside Dhaka) and receive an **order slip** with a generated number (`BC-1001`, `BC-1002`, …) and an estimated delivery date.
- Track orders, request a cancellation while an order is still *Pending*, and leave **one review per product**.
- Read the manufacturer story and blog posts.

### Seller
- Receive **auto-generated order slips** and cancellation requests; move orders along their lifecycle.
- Approve or decline a cancellation (approving restores stock).
- Manage the catalogue: add products, set base price, **discount price**, stock, photos and swatches.
- Run offers (VAT rates, delivery charges, bulk-discount rule), publish blogs, and read the **monthly sales report** and dashboard KPIs (sales, orders, low stock, average rating).

---

## 2. Project structure

```
bamboo-chick-app/
├── server/
│   ├── src/
│   │   ├── server.js              # starts the API (connects to MongoDB first)
│   │   ├── app.js                 # Express app: middleware, /uploads, routes
│   │   ├── config/db.js           # Mongoose connection
│   │   ├── models/                # User, Product, Order, Review, Blog, Setting, Counter, Manufacturer
│   │   ├── controllers/           # auth, product, order, review, blog, setting, report, manufacturer, upload
│   │   ├── routes/index.js        # every URL + who may call it
│   │   ├── middleware/            # auth (protect/authorize), error handler, multipart upload parser
│   │   ├── utils/pricing.js       # ★ price, discount, VAT, delivery and delivery-date rules
│   │   └── seed/seed.js           # sample data (products, users, orders, reviews, blogs)
│   └── tests/pricing.test.js      # unit tests for the pricing engine
└── client/
    ├── index.html · vite.config.js
    └── src/
        ├── main.jsx · App.jsx     # providers + all routes
        ├── api/client.js          # every API call in one place (token in memory, never localStorage)
        ├── context/               # Auth, Cart (localStorage), Settings, Toast
        ├── components/            # Layout, ProductCard, ProductGallery, Curtain3D, PriceSummary, …
        ├── pages/                 # buyer pages
        ├── pages/seller/          # seller dashboard tabs
        ├── pages/admin/           # admin panel tabs
        ├── utils/                 # format (৳), swatch colours, media helpers, useFetch hook
        └── styles/global.css
```

---

## 3. Run it locally

**Requirements:** Node.js 18+ and MongoDB (a local install, or a free MongoDB Atlas cluster).

```bash
# 1. API
cd bamboo-chick-app/server
npm install
npm run seed          # ⚠ wipes existing data, then loads sample products/users/orders
npm run dev           # http://localhost:5000/api

# 2. Client (second terminal)
cd bamboo-chick-app/client
npm install
npm run dev           # http://localhost:5173
```

Or from `bamboo-chick-app/`:

```bash
npm install           # installs "concurrently"
npm run install:all
npm run dev           # API + client together
```


## 4. Business rules (single source of truth: `server/src/utils/pricing.js`)

- **Size multipliers** on the base price: 3×5 → ×1, 4×6 → ×1.55, 5×7 → ×2.2, custom → ×2.6.
- If a product has a **discount price**, that price is multiplied instead of the base price.
- **VAT** 15 % on goods; **installation** ৳350 per unit with its own 5 % service VAT.
- **Delivery** ৳120 inside Dhaka, ৳250 outside; estimated date +5 / +7 days.
- **Bulk discount** 10 % when a cart reaches 3 units (threshold and rate are editable by the seller).
- **Cart limits:** max 10 units per item/size, max 20 units per cart — enforced on the server, not just the UI.
- Prices are **always recalculated server-side**; the browser never dictates a total.
- **One review per buyer per product** (returns `409` on a repeat).

**Order lifecycle:** `Pending` → `Shipped` → `Delivered`, plus `Cancellation requested`
(buyer, while Pending) → `Cancelled` (seller approves and stock is restored) or back to `Pending`
(seller declines). Every transition is appended to `statusHistory`.

---


## 5. Data and database

Mongoose models: **User, Product, Order, Review, Blog, Setting, Counter, Manufacturer**.

> **No database dump or data file is included in this repository.** The only data that exists here
> is the sample data written by `server/src/seed/seed.js` (`npm run seed`). The real production
> dataset will be supplied separately and is *not* part of this commit.

Uploaded media is written to `bamboo-chick-app/server/uploads/` and is git-ignored.

---

## 6. Testing

```bash
cd bamboo-chick-app/server && npm test    # 5/5 pricing tests
cd bamboo-chick-app/client && npm run build
```

`pricing.test.js` covers size multipliers, the discount-price override, the bulk-discount threshold,
VAT on goods vs. service, and inside/outside-Dhaka delivery.

---

## 7. Deployment notes

- `client/public/_redirects` (`/* /index.html 200`) makes client-side routing work on Netlify-style hosts.
- The client expects the API under `/api` on the same origin (or `VITE_API_URL`).
- `server/uploads/` is local disk. On hosts with ephemeral filesystems uploaded media disappears on redeploy — move uploads to object storage before going live.
- Always set a strong `JWT_SECRET` and allow-list `CLIENT_URL` in production.

---

## 10. Known limitations / next steps

- `ProductGallery` component exists but no page renders it yet; product pages show a single photo.
- Order totals read `pricing.total` (a `grandTotal` alias is not emitted by the server).
- Online payment (bKash) and email notifications are shown as "Planned" on the admin health panel.
- The 3D curtain preview is CSS-based; the plan is to move it to Three.js.
