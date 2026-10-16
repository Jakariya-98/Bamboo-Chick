import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Setting from '../models/Setting.js';
import Counter from '../models/Counter.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { calculateTotals, estimateDeliveryDate, findSize, unitPrice, AREAS } from '../utils/pricing.js';

/**
 * Turns [{ productId, sizeKey, qty }] from the client into priced lines using
 * prices from the DATABASE (never trust prices sent by the browser).
 */
async function priceItems(rawItems = []) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new ApiError(400, 'Cart is empty');

  const ids = rawItems.map((i) => i.productId).filter((id) => mongoose.isValidObjectId(id));
  const products = await Product.find({ _id: { $in: ids }, isActive: true });
  const byId = Object.fromEntries(products.map((p) => [String(p._id), p]));

  return rawItems.map((i) => {
    const product = byId[String(i.productId)];
    if (!product) throw new ApiError(400, 'A product in your cart is no longer available');
    const size = findSize(i.sizeKey);
    if (!size) throw new ApiError(400, `Unknown size "${i.sizeKey}"`);
    const qty = Math.floor(Number(i.qty));
    if (!(qty >= 1)) throw new ApiError(400, 'Quantity must be at least 1');
    return {
      product: product._id,
      name: product.name,
      tone: product.tone,
      category: product.category,
      sizeKey: size.key,
      sizeLabel: size.label,
      unitPrice: unitPrice(product.basePrice, size.key),
      qty
    };
  });
}

function normaliseArea(area) {
  return AREAS.includes(area) ? area : 'dhaka';
}

async function loadOrder(id) {
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { orderNo: id };
  const order = await Order.findOne(query);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

function setStatus(order, status) {
  order.status = status;
  order.statusHistory.push({ status });
}

// POST /api/orders/quote  { items, area, installation } — live cart calculator (public)
export const quote = asyncHandler(async (req, res) => {
  const lines = await priceItems(req.body.items);
  const settings = await Setting.getStore();
  const area = normaliseArea(req.body.area);
  const totals = calculateTotals(lines, settings, { area, installation: Boolean(req.body.installation) });
  res.json({ lines, totals, deliveryDate: estimateDeliveryDate(settings, area) });
});

// POST /api/orders  (buyer) — place order, reduce stock, generate slip
export const createOrder = asyncHandler(async (req, res) => {
  const { items, customer = {}, installation = false } = req.body;
  if (!customer.name || !customer.phone || !customer.address) {
    throw new ApiError(400, 'Name, phone and address are required');
  }
  const area = normaliseArea(customer.area);
  const lines = await priceItems(items);
  const settings = await Setting.getStore();

  // Reserve stock. The $gte check stops two buyers from buying the last item at once.
  const reserved = [];
  try {
    for (const line of lines) {
      const ok = await Product.findOneAndUpdate(
        { _id: line.product, stock: { $gte: line.qty } },
        { $inc: { stock: -line.qty } }
      );
      if (!ok) throw new ApiError(409, `Not enough stock for ${line.name}`);
      reserved.push(line);
    }
  } catch (err) {
    // put back anything already reserved
    await Promise.all(reserved.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } })));
    throw err;
  }

  const seq = await Counter.next('order');
  const order = await Order.create({
    orderNo: `BC-${seq}`,
    buyer: req.user._id,
    customer: { name: customer.name, phone: customer.phone, address: customer.address, area },
    items: lines,
    installation: Boolean(installation),
    pricing: calculateTotals(lines, settings, { area, installation: Boolean(installation) }),
    deliveryDate: estimateDeliveryDate(settings, area),
    statusHistory: [{ status: 'Pending' }]
  });

  res.status(201).json(order);
});

// GET /api/orders/my  (buyer)
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id  (owner, seller, admin) — the order slip
export const getOrder = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  const isOwner = String(order.buyer) === String(req.user._id);
  if (!isOwner && !['seller', 'admin'].includes(req.user.role)) throw new ApiError(403, 'Not your order');
  res.json(order);
});

// PATCH /api/orders/:id/cancel-request  (buyer) { reason } — "Cancel order" story
export const requestCancel = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (String(order.buyer) !== String(req.user._id)) throw new ApiError(403, 'Not your order');
  if (order.status !== 'Pending') throw new ApiError(400, 'Only pending orders can be cancelled');
  order.cancelReason = req.body.reason || '';
  setStatus(order, 'Cancellation requested');
  await order.save();
  res.json(order);
});

// GET /api/orders?status=Pending  (seller, admin) — "Receive auto-generated order slips"
export const listOrders = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('buyer', 'name email');
  res.json(orders);
});

// PATCH /api/orders/:id/status  (seller, admin) { status: 'Shipped' | 'Delivered' }
export const updateStatus = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  const next = req.body.status;
  const allowed = { Pending: ['Shipped'], Shipped: ['Delivered'] };
  if (!allowed[order.status]?.includes(next)) {
    throw new ApiError(400, `Cannot change status from ${order.status} to ${next}`);
  }
  setStatus(order, next);
  await order.save();
  res.json(order);
});

// PATCH /api/orders/:id/cancel-decision  (seller, admin) { approve: true|false }
export const decideCancel = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (order.status !== 'Cancellation requested') throw new ApiError(400, 'No cancellation request on this order');

  if (req.body.approve) {
    setStatus(order, 'Cancelled');
    await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
  } else {
    setStatus(order, 'Pending');
  }
  await order.save();
  res.json(order);
});
