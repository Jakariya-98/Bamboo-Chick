/**
 * Tiny wrapper around fetch. Every API call in the app goes through here.
 * Adds the login token and turns error responses into thrown Errors.
 */
const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'bc_token';

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } }
};

async function request(path, { method = 'GET', body, query } = {}) {
  const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== '')) : '';
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path + qs, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Is the API running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  me: () => request('/auth/me'),

  // products
  products: (query) => request('/products', { query }),
  product: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  recommend: (answers) => request('/products/recommendations', { method: 'POST', body: answers }),

  // reviews
  productReviews: (productId) => request(`/reviews/product/${productId}`),
  addReview: (productId, data) => request(`/reviews/product/${productId}`, { method: 'POST', body: data }),
  allReviews: () => request('/reviews'),
  setReviewHidden: (id, hidden) => request(`/reviews/${id}/visibility`, { method: 'PATCH', body: { hidden } }),

  // orders
  quote: (data) => request('/orders/quote', { method: 'POST', body: data }),
  placeOrder: (data) => request('/orders', { method: 'POST', body: data }),
  myOrders: () => request('/orders/my'),
  order: (id) => request(`/orders/${id}`),
  requestCancel: (id, reason) => request(`/orders/${id}/cancel-request`, { method: 'PATCH', body: { reason } }),
  allOrders: (status) => request('/orders', { query: { status } }),
  setOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  decideCancel: (id, approve) => request(`/orders/${id}/cancel-decision`, { method: 'PATCH', body: { approve } }),

  // blogs
  blogs: () => request('/blogs'),
  createBlog: (data) => request('/blogs', { method: 'POST', body: data }),
  deleteBlog: (id) => request(`/blogs/${id}`, { method: 'DELETE' }),

  // settings
  settings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: data }),

  // reports
  monthlyReport: (month) => request('/reports/monthly', { query: { month } }),
  overview: () => request('/reports/overview'),
  users: () => request('/reports/users')
};
