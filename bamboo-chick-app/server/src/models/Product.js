import mongoose from 'mongoose';

export const CATEGORIES = ['Roll-Up', 'Roman', 'Outdoor', 'Matchstick', 'Door'];
export const TONES = ['natural', 'honey', 'walnut', 'charcoal', 'ivory'];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    tone: { type: String, enum: TONES, default: 'natural' },      // colour, used for swatches + 3D view
    basePrice: { type: Number, required: true, min: 0 },          // price for the 3×5 ft size, in BDT
    stock: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, default: '' },
    images: [{ type: String }],                                    // image URLs (add real photos later)
    // Tags used by the recommendation quiz: rooms (living, bedroom, balcony, door),
    // needs (light, privacy, outdoor) and budget (low, mid, high)
    tags: [{ type: String, lowercase: true, trim: true }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
