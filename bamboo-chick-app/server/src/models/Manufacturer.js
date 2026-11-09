import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: '' },
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const manufacturerSchema = new mongoose.Schema({
  key: { type: String, default: 'bamboo-chick', unique: true },
  title: { type: String, default: 'About Bamboo Chick' },
  description: { type: String, default: 'Bamboo Chick is a premium interior design and sustainable curtain manufacturer specialised in natural and bamboo window curtains. We bring eco-conscious elegance to homes and offices through curated products and expert design consultations.' },
  media: { type: [mediaSchema], default: [] }
}, { timestamps: true });

manufacturerSchema.statics.getPage = async function () {
  let page = await this.findOne({ key: 'bamboo-chick' });
  if (!page) page = await this.create({ key: 'bamboo-chick' });
  return page;
};

export default mongoose.model('Manufacturer', manufacturerSchema);
