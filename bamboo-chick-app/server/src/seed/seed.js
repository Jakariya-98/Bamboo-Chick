/**
 * Fills the database with sample data (same as the clickable prototype).
 * Run:  npm run seed      ⚠ This DELETES existing data in every collection.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Blog from '../models/Blog.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import Counter from '../models/Counter.js';
import { SIZES, unitPrice, calculateTotals } from '../utils/pricing.js';

const PRODUCTS = [
  { name: 'Classic Roll-Up Chick', category: 'Roll-Up', tone: 'natural', basePrice: 2400, stock: 42, tags: ['living', 'bedroom', 'light', 'mid'], description: 'Hand-split natural bamboo with cotton cords. Rolls up to let soft, filtered light in.' },
  { name: 'Honey Roman Blind', category: 'Roman', tone: 'honey', basePrice: 3900, stock: 18, tags: ['living', 'privacy', 'high'], description: 'Folds into neat pleats. Lined option blocks up to 80% light for privacy.' },
  { name: 'Walnut Tortoise Weave', category: 'Roman', tone: 'walnut', basePrice: 4600, stock: 9, tags: ['bedroom', 'privacy', 'high'], description: 'Dark-stained tortoise weave for a warm, premium look in bedrooms and studies.' },
  { name: 'Outdoor Split-Bamboo Chick', category: 'Outdoor', tone: 'natural', basePrice: 3200, stock: 25, tags: ['balcony', 'outdoor', 'mid'], description: 'Weather-treated split bamboo for verandas and balconies. Blocks sun and rain splash.' },
  { name: 'Charcoal Matchstick Blind', category: 'Matchstick', tone: 'charcoal', basePrice: 2100, stock: 31, tags: ['living', 'bedroom', 'light', 'low'], description: 'Fine matchstick slats with a modern charcoal finish.' },
  { name: 'Bamboo Bead Door Curtain', category: 'Door', tone: 'honey', basePrice: 1500, stock: 50, tags: ['door', 'light', 'low'], description: 'Strings of bamboo beads for doorways — airflow with a touch of privacy.' },
  { name: 'Ivory Light-Filter Roll-Up', category: 'Roll-Up', tone: 'ivory', basePrice: 2700, stock: 6, tags: ['bedroom', 'living', 'light', 'mid'], description: 'Bleached bamboo for bright, airy rooms. Pairs well with white walls.' },
  { name: 'Heavy-Duty Veranda Chick', category: 'Outdoor', tone: 'walnut', basePrice: 5200, stock: 12, tags: ['balcony', 'outdoor', 'privacy', 'high'], description: 'Thick slats with PVC edging for large verandas and rooftop sit-outs.' }
];

async function seed() {
  await connectDB();
  await Promise.all([User, Product, Review, Blog, Order, Setting, Counter].map((M) => M.deleteMany({})));

  const settings = await Setting.getStore();

  // users.create (not insertMany) so the password hook runs
  const [admin, seller, buyer] = await User.create([
    { name: 'Site Admin', email: 'admin@bamboochick.com', password: 'admin123', role: 'admin' },
    { name: 'Bamboo Chick Store', email: 'seller@bamboochick.com', password: 'seller123', role: 'seller' },
    { name: 'Demo Buyer', email: 'buyer@bamboochick.com', password: 'buyer123', role: 'buyer', phone: '01700000000', address: 'Dhanmondi, Dhaka' }
  ]);

  const products = await Product.insertMany(PRODUCTS);

  await Review.insertMany([
    { product: products[0]._id, user: buyer._id, name: 'Nusrat J.', stars: 5, text: 'Looks exactly like the photos. Fitting team was on time.' },
    { product: products[3]._id, user: buyer._id, name: 'Rakib H.', stars: 4, text: 'Good for our balcony, keeps the afternoon sun out.' },
    { product: products[1]._id, user: buyer._id, name: 'Farhana A.', stars: 5, text: 'Premium finish. The lining really helps with privacy.' },
    { product: products[4]._id, user: buyer._id, name: 'Tanvir R.', stars: 3, text: 'Nice colour but delivery took 2 days longer than the slip said.' }
  ]);

  await Blog.insertMany([
    { title: 'How to measure your window for a bamboo chick', tone: 'natural', author: seller._id, body: 'Measure width at three points and use the smallest. For outside-mount, add 3 inches each side…' },
    { title: 'Caring for bamboo curtains in monsoon', tone: 'honey', author: seller._id, body: 'Wipe with a dry cloth, keep rolled up during heavy rain and air them on sunny days…' }
  ]);

  // Sample orders spread over the current month so the monthly report has data
  const names = ['Sabbir', 'Mim', 'Arif', 'Jannat', 'Shuvo', 'Ritu', 'Imran', 'Tania', 'Kawsar', 'Lima'];
  const now = new Date();
  const days = Math.max(1, now.getDate() - 1);
  let seq = 1000;
  const orders = [];
  for (let d = 1; d <= days; d++) {
    for (let k = 0; k < ((d * 7) % 3) + 1; k++) {
      const p = products[(d * 3 + k * 5) % products.length];
      const size = SIZES[(d + k) % 3];
      const lines = [{ product: p._id, name: p.name, tone: p.tone, category: p.category, sizeKey: size.key, sizeLabel: size.label, unitPrice: unitPrice(p.basePrice, size.key), qty: 1 + ((d + k) % 3) }];
      const placed = new Date(now.getFullYear(), now.getMonth(), d, 10 + k);
      const delivery = new Date(placed); delivery.setDate(delivery.getDate() + 5);
      const status = d < days - 4 ? 'Delivered' : d < days - 1 ? 'Shipped' : 'Pending';
      orders.push({
        orderNo: `BC-${++seq}`, buyer: buyer._id,
        customer: { name: names[(d + k) % names.length], phone: '017XXXXXXXX', address: 'Dhanmondi, Dhaka', area: 'dhaka' },
        items: lines, pricing: calculateTotals(lines, settings, { area: 'dhaka' }),
        deliveryDate: delivery, status, statusHistory: [{ status, at: placed }],
        createdAt: placed, updatedAt: placed
      });
    }
  }
  orders[orders.length - 1].status = 'Cancellation requested';
  orders[orders.length - 1].cancelReason = 'Ordered the wrong size';
  const inserted = await Order.insertMany(orders);
  // Back-date the sample orders (Mongoose sets createdAt = now on insert)
  await Order.collection.bulkWrite(
    inserted.map((doc, i) => ({
      updateOne: { filter: { _id: doc._id }, update: { $set: { createdAt: orders[i].createdAt, updatedAt: orders[i].createdAt } } }
    }))
  );
  await Counter.create({ _id: 'order', seq: seq - 1000 }); // next real order continues the numbering

  console.log(`Seeded: 3 users, ${products.length} products, 4 reviews, 2 blogs, ${orders.length} orders`);
  console.log('Logins → admin@bamboochick.com / admin123 · seller@bamboochick.com / seller123 · buyer@bamboochick.com / buyer123');
  console.log(`(${admin.email} is the admin account)`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
