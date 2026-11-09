import mongoose from 'mongoose';

/**
 * Store-wide settings. There is only ever ONE document (key: 'store').
 * The seller edits these from the dashboard (taxes, delivery, discount offer).
 */
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'store', unique: true },
    vatRate: { type: Number, default: 15, min: 0, max: 100 },        // % VAT on goods
    installVatRate: { type: Number, default: 5, min: 0, max: 100 },  // % VAT on installation service
    installRate: { type: Number, default: 350, min: 0 },             // BDT per item installed
    delivery: {
      dhaka: { type: Number, default: 120 },
      outside: { type: Number, default: 250 }
    },
    deliveryDays: {
      dhaka: { type: Number, default: 5 },
      outside: { type: Number, default: 7 }
    },
    discount: {
      active: { type: Boolean, default: true },
      minQty: { type: Number, default: 3, min: 1 },
      pct: { type: Number, default: 10, min: 0, max: 90 }
    }
  },
  { timestamps: true }
);

/** Returns the store settings, creating them with defaults the first time. */
settingSchema.statics.getStore = async function getStore() {
  const existing = await this.findOne({ key: 'store' });
  if (existing) return existing;
  try {
    return await this.create({ key: 'store' });
  } catch (err) {
    if (err.code === 11000) return this.findOne({ key: 'store' }); // created by a parallel request
    throw err;
  }
};

export default mongoose.model('Setting', settingSchema);
