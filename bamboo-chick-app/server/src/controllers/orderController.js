import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Setting from '../models/Setting.js';
import Counter from '../models/Counter.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { calculateTotals, estimateDeliveryDate, findSize, unitPrice, AREAS } from '../utils/pricing.js';

const MAX_ITEM_LIMIT = 10;
const MAX_TOTAL_CART_ITEMS = 20;

async function priceItems(rawItems = []) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new ApiError(400, 'Cart is empty');

  let totalCartQuantity = 0;
  for (const item of rawItems) {
    const q = Number(item.qty || 0);
    if (!(q >= 1)) throw new ApiError(400, 'Quantity must be at least 1');
    totalCartQuantity += q;
  }

  if (totalCartQuantity > MAX_TOTAL_CART_ITEMS) {
    throw new ApiError(400, `Total cart items cannot exceed ${MAX_TOTAL_CART_ITEMS} units`);
  }

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
    if (qty > MAX_ITEM_LIMIT) {
      throw new ApiError(400, `Maximum allowed quantity per item and size is ${MAX_ITEM_LIMIT}`);
    }
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

export const quote = asyncHandler(async (req, res) => {
  const lines = await priceItems(req.body.items);
  const settings = await Setting.getStore();
  const area = normaliseArea(req.body.area);
  const totals = calculateTotals(lines, settings, { area, installation: Boolean(req.body.installation) });
  res.json({ lines, totals, deliveryDate: estimateDeliveryDate(settings, area) });
});

export const createOrder = asyncHandler(async (req, res) => {
  const { items, customer = {}, installation = false } = req.body;
  if (!customer.name || !customer.phone || !customer.address) {
    throw new ApiError(400, 'Name, phone and address are required');
  }
  const area = normaliseArea(customer.area);
  const lines = await priceItems(items);
  const settings = await Setting.getStore();

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

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  const isOwner = String(order.buyer) === String(req.user._id);
  if (!isOwner && !['seller', 'admin'].includes(req.user.role)) throw new ApiError(403, 'Not your order');
  res.json(order);
});

export const requestCancel = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (String(order.buyer) !== String(req.user._id)) throw new ApiError(403, 'Not your order');
  if (order.status !== 'Pending') throw new ApiError(400, 'Only pending orders can be cancelled');
  order.cancelReason = req.body.reason || '';
  setStatus(order, 'Cancellation requested');
  await order.save();
  res.json(order);
});

export const listOrders = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('buyer', 'name email');
  res.json(orders);
});

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