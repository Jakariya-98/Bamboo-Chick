import mongoose from 'mongoose';

/**
 * Atomic counter used to create readable order numbers.
 * seq counts orders (1, 2, 3 …); next() returns 1000 + seq → BC-1001, BC-1002, …
 */
const ORDER_NO_START = 1000;

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});

counterSchema.statics.next = async function next(name) {
  const c = await this.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return ORDER_NO_START + c.seq;
};

export default mongoose.model('Counter', counterSchema);
