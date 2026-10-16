import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as products from '../controllers/productController.js';
import * as orders from '../controllers/orderController.js';
import * as reviews from '../controllers/reviewController.js';
import * as blogs from '../controllers/blogController.js';
import * as settings from '../controllers/settingController.js';
import * as reports from '../controllers/reportController.js';

const router = Router();
const staff = [protect, authorize('seller', 'admin')];
const adminOnly = [protect, authorize('admin')];
const buyer = [protect, authorize('buyer')];

router.get('/health', (_req, res) => res.json({ ok: true, service: 'bamboo-chick-api' }));

/* ---------- Auth ---------- */
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

/* ---------- Products ---------- */
router.get('/products', products.listProducts);
router.post('/products/recommendations', products.recommend);
router.get('/products/:id', products.getProduct);
router.post('/products', ...staff, products.createProduct);
router.put('/products/:id', ...staff, products.updateProduct);
router.delete('/products/:id', ...staff, products.deleteProduct);

/* ---------- Orders ---------- */
router.post('/orders/quote', orders.quote);
router.post('/orders', ...buyer, orders.createOrder);
router.get('/orders/my', ...buyer, orders.myOrders);
router.get('/orders', ...staff, orders.listOrders);
router.get('/orders/:id', protect, orders.getOrder);
router.patch('/orders/:id/cancel-request', ...buyer, orders.requestCancel);
router.patch('/orders/:id/status', ...staff, orders.updateStatus);
router.patch('/orders/:id/cancel-decision', ...staff, orders.decideCancel);

/* ---------- Reviews ---------- */
router.get('/reviews/product/:productId', reviews.productReviews);
router.post('/reviews/product/:productId', ...buyer, reviews.addReview);
router.get('/reviews', ...staff, reviews.allReviews);
router.patch('/reviews/:id/visibility', ...adminOnly, reviews.setVisibility);

/* ---------- Blogs ---------- */
router.get('/blogs', blogs.listBlogs);
router.post('/blogs', ...staff, blogs.createBlog);
router.delete('/blogs/:id', ...staff, blogs.deleteBlog);

/* ---------- Settings (taxes, delivery, discount) ---------- */
router.get('/settings', settings.getSettings);
router.put('/settings', ...staff, settings.updateSettings);

/* ---------- Reports & admin ---------- */
router.get('/reports/monthly', ...staff, reports.monthlySales);
router.get('/reports/overview', ...staff, reports.overview);
router.get('/reports/users', ...adminOnly, reports.listUsers);

export default router;
