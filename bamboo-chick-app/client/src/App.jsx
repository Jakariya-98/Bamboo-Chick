import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ReviewsTable from './components/ReviewsTable.jsx';

import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSlip from './pages/OrderSlip.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Blog from './pages/Blog.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

import SellerLayout from './pages/seller/SellerLayout.jsx';
import SellerOverview from './pages/seller/SellerOverview.jsx';
import SellerOrders from './pages/seller/SellerOrders.jsx';
import SellerCancellations from './pages/seller/SellerCancellations.jsx';
import SellerProducts from './pages/seller/SellerProducts.jsx';
import SellerOffers from './pages/seller/SellerOffers.jsx';
import SellerBlogs from './pages/seller/SellerBlogs.jsx';
import SellerReport from './pages/seller/SellerReport.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

const buyer = (el) => <ProtectedRoute roles={['buyer']}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="blog" element={<Blog />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Buyer */}
        <Route path="checkout" element={buyer(<Checkout />)} />
        <Route path="orders" element={buyer(<MyOrders />)} />
        {/* Order slip: buyer (own orders), seller and admin */}
        <Route path="orders/:id" element={<ProtectedRoute><OrderSlip /></ProtectedRoute>} />

        {/* Seller */}
        <Route path="seller" element={<ProtectedRoute roles={['seller', 'admin']}><SellerLayout /></ProtectedRoute>}>
          <Route index element={<SellerOverview />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="cancellations" element={<SellerCancellations />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="offers" element={<SellerOffers />} />
          <Route path="reviews" element={<ReviewsTable />} />
          <Route path="blogs" element={<SellerBlogs />} />
          <Route path="report" element={<SellerReport />} />
        </Route>

        {/* Admin */}
        <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="reviews" element={<ReviewsTable moderate />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
