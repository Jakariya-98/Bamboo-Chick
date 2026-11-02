import mongoose from 'mongoose';

export const ORDER_STATUS = ['Pending', 'Shipped', 'Delivered', 'Cancellation requested', 'Cancelled'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },          // copied so the slip never changes
    tone: String,
    category: String,
    sizeKey: { type: String, required: true },
    sizeLabel: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, unique: true },          // e.g. BC-1001
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      area: { type: String, enum: ['dhaka', 'outside'], default: 'dhaka' }
    },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    installation: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    pricing: {
      itemCount: Number,
      subtotal: Number,
      discount: Number,
      discountPct: Number,
      vatRate: Number,
      vat: Number,
      installation: Number,
      installationVatRate: Number,
      installationVat: Number,
      delivery: Number,
      total: Number
    },
    deliveryDate: { type: Date, required: true },
    status: { type: String, enum: ORDER_STATUS, default: 'Pending', index: true },
    cancelReason: String,
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, _id: false }]
  },
  { timestamps: true }   // createdAt = date the order was placed
);

export default mongoose.model('Order', orderSchema);
