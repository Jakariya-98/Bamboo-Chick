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

### Admin
- Log in with role-based access and see a whole-site health panel plus overall revenue, orders, products and buyer counts.
- Moderate reviews (hide/unhide → 409-guarded one-review-per-buyer rule stays intact).
- Manage the **Manufacturer page** (title, description, uploaded media) and browse all users.

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

### Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Buyer | `buyer@bamboochick.com` | `buyer123` |
| Seller | `seller@bamboochick.com` | `seller123` |
| Admin | `admin@bamboochick.com` | `admin123` |

Sign-up at `/register` always creates a **buyer** account.

---

## 4. Configuration — environment variables

**No environment file is shipped in this repository** (deliberately: credentials must never be
committed). Create `bamboo-chick-app/server/.env` yourself with these keys:

| Key | Example | Purpose |
|---|---|---|
| `PORT` | `5000` | Port the API listens on |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/bamboo_chick` | MongoDB connection string (local or Atlas `mongodb+srv://…`) |
| `JWT_SECRET` | a long random string | Signs login tokens — always change it |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin (comma-separate several) |

The client needs nothing by default (it calls `/api` on the same origin, proxied by Vite in
development). For a separate API host set `VITE_API_URL=https://<your-api>/api` at build time.

---

## 5. Business rules (single source of truth: `server/src/utils/pricing.js`)

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

## 6. API reference

All routes are prefixed with `/api`. Protected routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create a buyer account → `{ token, user }` |
| POST | `/auth/login` | public | Log in (any role) → `{ token, user }` |
| GET | `/auth/me` | logged in | Current user |
| GET | `/products?category=&q=` | public | List products with rating |
| GET | `/products/:id` | public | One product |
| POST | `/products/recommendations` | public | `{ room, need, budget }` → up to 4 products |
| POST | `/products` | seller, admin | Add a product |
| PUT | `/products/:id` | seller, admin | Update price, discount price, stock, photos |
| DELETE | `/products/:id` | seller, admin | Soft delete (hide) |
| POST | `/orders/quote` | public | `{ items, area, installation }` → price breakdown |
| POST | `/orders` | buyer | Place an order → order slip |
| GET | `/orders/my` | buyer | My orders |
| GET | `/orders/:id` | owner, seller, admin | Order slip |
| PATCH | `/orders/:id/cancel-request` | buyer | `{ reason }` (only while Pending) |
| GET | `/orders?status=` | seller, admin | All orders |
| PATCH | `/orders/:id/status` | seller, admin | `{ status: 'Shipped' \| 'Delivered' }` |
| PATCH | `/orders/:id/cancel-decision` | seller, admin | `{ approve: true \| false }` |
| GET | `/reviews/product/:id` | public | Visible reviews |
| POST | `/reviews/product/:id` | buyer | `{ stars, text }` |
| GET | `/reviews` | seller, admin | All reviews incl. hidden |
| PATCH | `/reviews/:id/visibility` | admin | `{ hidden }` |
| GET / POST | `/blogs` | public / seller, admin | List / publish |
| DELETE | `/blogs/:id` | seller, admin | Delete |
| GET / PUT | `/settings` | public / seller, admin | VAT, delivery, installation, discount, sizes |
| GET / PUT | `/manufacturer` | public / admin | Manufacturer page content |
| POST / DELETE | `/manufacturer/media` | admin | Add / remove page media |
| POST | `/uploads` | seller, admin | Upload an image or video |
| GET | `/reports/monthly?month=YYYY-MM` | seller, admin | Sales per product for a month |
| GET | `/reports/overview` | seller, admin | Dashboard numbers |
| GET | `/reports/users` | admin | All users |

---

## 7. Data and database

Mongoose models: **User, Product, Order, Review, Blog, Setting, Counter, Manufacturer**.

> **No database dump or data file is included in this repository.** The only data that exists here
> is the sample data written by `server/src/seed/seed.js` (`npm run seed`). The real production
> dataset will be supplied separately and is *not* part of this commit.

Uploaded media is written to `bamboo-chick-app/server/uploads/` and is git-ignored.

---

## 8. Testing

```bash
cd bamboo-chick-app/server && npm test    # 5/5 pricing tests
cd bamboo-chick-app/client && npm run build
```

`pricing.test.js` covers size multipliers, the discount-price override, the bulk-discount threshold,
VAT on goods vs. service, and inside/outside-Dhaka delivery.

---

## 9. Deployment notes

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
