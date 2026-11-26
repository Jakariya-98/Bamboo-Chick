import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Do not return a failed order/product response after the primary write succeeded.
export async function notify({ role, recipient, eventKey, title, message, link = '' }) {
  try {
    const users = recipient ? [{ _id: recipient }] : await User.find({ role }).select('_id').lean();
    if (!users.length) return;

    await Notification.bulkWrite(users.map(({ _id }) => ({ updateOne: {
      filter: { recipient: _id, eventKey },
      update: { $setOnInsert: { recipient: _id, eventKey, title, message, link, readAt: null, createdAt: new Date() } },
      upsert: true,
      timestamps: false
    } })), { ordered: false });
  } catch (err) {
    console.error('Notification write failed:', err.message);
  }
}

export function previousMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit' }).formatToParts(now);
  const year = Number(parts.find(p => p.type === 'year').value);
  const month = Number(parts.find(p => p.type === 'month').value);
  const previous = new Date(Date.UTC(year, month - 2, 1));
  return previous.toISOString().slice(0, 7);
}

export async function monthlyReportNotice(recipient, now = new Date()) {
  const month = previousMonth(now);
  await notify({ role: 'admin', recipient, eventKey: `monthly:${month}`, title: 'Monthly report',
    message: `Sales report for ${month} is available.`, link: `/admin/report?month=${month}` });
}