# Bamboo Chick

E-commerce web app for **Bamboo Chick**, a sustainable bamboo-curtain manufacturer.
CSE-412 Software Engineering · Section 01 · Team 02.

- **Frontend:** React 18 + Vite + React Router (`/client`). Responsive, so it works as a website on desktop and looks like an app on phones.
- **Backend:** Node.js + Express REST API + MongoDB (Mongoose) + JWT login with roles (`/server`)
- **Roles:** `buyer`, `seller`, `admin`

The UI and sample data come from the clickable prototype shown to the client.

---

## 1. Run it on your computer

### Requirements
- **Node.js 18+** (`node -v`)
- **MongoDB**: either
  - **MongoDB Atlas** (free, cloud, easiest for a team): create a free M0 cluster, add a database user, allow your IP, and copy the connection string; or
  - **MongoDB Community Server** installed locally (`mongodb://127.0.0.1:27017/bamboo_chick`)

### Steps

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
#    → open .env and set MONGO_URI and JWT_SECRET
npm run seed                 # loads sample products, users, orders (deletes existing data!)
npm run dev                  # API on http://localhost:5000/api

# 2. Frontend (in a second terminal)
cd client
npm install
npm run dev                  # app on http://localhost:5173
```

Or, from the project root, run both at once:

```bash
npm install            # installs "concurrently"
npm run install:all    # installs server + client packages
npm run dev            # starts API and frontend together
```

### Test accounts (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Buyer | buyer@bamboochick.com | buyer123 |
| Seller | seller@bamboochick.com | seller123 |
| Admin | admin@bamboochick.com | admin123 |

New customers can also sign up at `/register` (sign-up always creates a **buyer** account).

### Tests
```bash
cd server && npm test     # unit tests for the price / tax / discount calculator
```

> **To preview the phone layout:** open Chrome DevTools (F12) → toggle the device toolbar (Ctrl+Shift+M) → pick a phone.

---

## 2. Folder structure

```
bamboo-chick-app/
├── server/
│   ├── src/
│   │   ├── server.js              # starts the API (connects to MongoDB first)
│   │   ├── app.js                 # Express app: middleware + routes
│   │   ├── config/db.js
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── User.js            # buyer / seller / admin, hashed password
│   │   │   ├── Product.js         # category, tone, basePrice, stock, tags
│   │   │   ├── Order.js           # items, pricing breakdown, status, delivery date
│   │   │   ├── Review.js          # stars, text, hidden (admin moderation)
│   │   │   ├── Blog.js
│   │   │   ├── Setting.js         # VAT rates, delivery charges, discount offer (one document)
│   │   │   └── Counter.js         # order numbers BC-1001, BC-1002, …
│   │   ├── controllers/           # the logic behind each endpoint
│   │   ├── routes/index.js        # every URL + who is allowed to call it
│   │   ├── middleware/            # auth (protect / authorize), error handler
│   │   ├── utils/pricing.js       # ★ price, discount, VAT and delivery calculation
│   │   └── seed/seed.js           # sample data
│   ├── tests/pricing.test.js
│   └── .env.example
└── client/
    ├── index.html
    ├── vite.config.js             # proxies /api → localhost:5000 in development
    └── src/
        ├── main.jsx, App.jsx      # providers + all routes
        ├── api/client.js          # every API call in one place
        ├── context/               # Auth, Cart (localStorage), Settings, Toast
        ├── components/            # Layout, ProductCard, Curtain3D, RecommendationQuiz, PriceSummary, …
        ├── pages/                 # buyer pages
        ├── pages/seller/          # seller dashboard tabs
        ├── pages/admin/           # admin panel tabs
        ├── utils/                 # format (৳), swatch colours, useFetch hook
        └── styles/global.css
```

---

## 3. User stories → where they live

| User story | Backend | Frontend |
|---|---|---|
| **Buyer:** View products | `GET /products`, `GET /products/:id` | `pages/Shop.jsx`, `pages/ProductDetail.jsx` |
| Read manufacturer description | — | `pages/Home.jsx` (About section) |
| Add to cart, auto calculator + taxes | `POST /orders/quote`, `utils/pricing.js` | `pages/Cart.jsx`, `pages/Checkout.jsx`, `components/PriceSummary.jsx` |
| Cancel order | `PATCH /orders/:id/cancel-request` | `pages/MyOrders.jsx` |
| Give reviews | `POST /reviews/product/:id` | `pages/ProductDetail.jsx` |
| Receive order slip with delivery date | `POST /orders`, `GET /orders/:id` | `pages/OrderSlip.jsx` |
| Customized recommendations | `POST /products/recommendations` | `components/RecommendationQuiz.jsx` |
| 3D view | — | `components/Curtain3D.jsx` (CSS 3D, to be replaced with Three.js) |
| **Seller:** Receive auto-generated order slips | `GET /orders`, `PATCH /orders/:id/status` | `pages/seller/SellerOrders.jsx` |
| Receive cancellation requests | `PATCH /orders/:id/cancel-decision` | `pages/seller/SellerCancellations.jsx` |
| See customer reviews | `GET /reviews` | `components/ReviewsTable.jsx` |
| Add blogs | `POST /blogs` | `pages/seller/SellerBlogs.jsx` |
| Change price rate / Update stock | `PUT /products/:id` | `pages/seller/SellerProducts.jsx` |
| Add discounts | `PUT /settings` | `pages/seller/SellerOffers.jsx` |
| Monthly product sales report | `GET /reports/monthly?month=YYYY-MM` | `pages/seller/SellerReport.jsx` |
| **Admin:** Login | `POST /auth/login` | `pages/Login.jsx` |
| See reviews (+ hide) | `GET /reviews`, `PATCH /reviews/:id/visibility` | `components/ReviewsTable.jsx` (`moderate`) |
| Check total website | `GET /reports/overview`, `GET /reports/users` | `pages/admin/AdminOverview.jsx`, `AdminUsers.jsx` |

---

## 4. API reference

All URLs start with `/api`. Protected routes need the header `Authorization: Bearer <token>` (the frontend adds it automatically).

| Method | URL | Who | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create buyer account → `{ token, user }` |
| POST | `/auth/login` | public | Log in (any role) → `{ token, user }` |
| GET | `/auth/me` | logged in | Current user |
| GET | `/products?category=&q=` | public | List products (with rating) |
| GET | `/products/:id` | public | One product |
| POST | `/products/recommendations` | public | `{ room, need, budget }` → up to 4 products |
| POST | `/products` | seller, admin | Add product |
| PUT | `/products/:id` | seller, admin | Update price, stock, details |
| DELETE | `/products/:id` | seller, admin | Hide product (soft delete) |
| POST | `/orders/quote` | public | `{ items, area, installation }` → price breakdown |
| POST | `/orders` | buyer | Place order → order slip |
| GET | `/orders/my` | buyer | My orders |
| GET | `/orders/:id` | owner, seller, admin | Order slip |
| PATCH | `/orders/:id/cancel-request` | buyer | `{ reason }` (only while Pending) |
| GET | `/orders?status=` | seller, admin | All orders |
| PATCH | `/orders/:id/status` | seller, admin | `{ status: 'Shipped' \| 'Delivered' }` |
| PATCH | `/orders/:id/cancel-decision` | seller, admin | `{ approve: true \| false }` (approve restores stock) |
| GET | `/reviews/product/:id` | public | Visible reviews |
| POST | `/reviews/product/:id` | buyer | `{ stars, text }` |
| GET | `/reviews` | seller, admin | All reviews |
| PATCH | `/reviews/:id/visibility` | admin | `{ hidden }` |
| GET / POST | `/blogs` | public / seller, admin | List / publish |
| DELETE | `/blogs/:id` | seller, admin | Delete |
| GET / PUT | `/settings` | public / seller, admin | VAT, delivery, installation, discount, sizes |
| GET | `/reports/monthly?month=2026-10` | seller, admin | Sales per product for a month |
| GET | `/reports/overview` | seller, admin | Dashboard numbers |
| GET | `/reports/users` | admin | All users |

**Order status flow:** `Pending → Shipped → Delivered`, or `Pending → Cancellation requested → Cancelled` (or back to `Pending` if the request is rejected).

**Pricing rule** (`server/src/utils/pricing.js`): `total = subtotal − bulk discount + VAT on goods + installation + VAT on installation + delivery`. The browser never decides a price: every total is recalculated on the server from prices in the database.

---

## 5. Who owns what (suggested split)

| Member | Owns |
|---|---|
| **Ismail** (lead) | `server/` core: models, auth, `orderController`, `pricing.js`, seed, deployment; `client/src/api`, `context`, `App.jsx` |
| **Fardin** | Buyer storefront: `pages/Home`, `Shop`, `ProductDetail`, `Cart`, `Checkout`, `MyOrders`, `OrderSlip`, `components/Layout`, `ProductCard` |
| **Sanzida** | `pages/seller/*`, `productController` (price/stock), `settingController`, `blogController`, `reportController.monthlySales` |
| **Antora** | `reviewController`, `components/ReviewsTable`, `pages/admin/*`, `RecommendationQuiz` + `/products/recommendations`, `Curtain3D` → Three.js, tests |

### Git workflow
```bash
git checkout -b feature/seller-report     # one branch per feature
# ...work, commit often...
git push -u origin feature/seller-report  # open a Pull Request → lead reviews → merge to main
git checkout main && git pull             # every day before starting
```

---

## 6. Next steps (backlog)

- [ ] Replace sample text and swatches with the client's real **logo, photos, products and prices** (add image URLs to `Product.images`)
- [ ] **3D view with Three.js** (`npm i three @react-three/fiber @react-three/drei` in `client/`)
- [ ] **PWA** ("install as app"): `npm i -D vite-plugin-pwa` and add a manifest + icons
- [ ] Online payment (bKash / SSLCommerz) alongside cash on delivery
- [ ] Email/SMS when an order is placed, shipped or cancelled
- [ ] Server-side PDF order slips (`pdfkit`); the browser's "Print / save PDF" works for now
- [ ] Image upload for products (Cloudinary)
- [ ] More tests: API integration tests with `supertest` + `mongodb-memory-server`

## 7. Deploying (free)

1. **Database:** MongoDB Atlas M0 cluster.
2. **API:** Render.com → New Web Service → root directory `server`, build `npm install`, start `npm start`, add the `.env` values as environment variables (set `CLIENT_URL` to your frontend URL).
3. **Frontend:** Vercel or Netlify → root directory `client`, build `npm run build`, output `dist`, environment variable `VITE_API_URL=https://<your-api>.onrender.com/api`.
   For Netlify, `client/public/_redirects` is already included so page refreshes work. On Vercel, add a `vercel.json` rewrite of all routes to `/index.html`.
