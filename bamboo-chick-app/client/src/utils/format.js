/** ৳ with Bangladeshi/Indian digit grouping: ৳2,21,390 */
export const tk = (n) => '৳' + Math.round(Number(n) || 0).toLocaleString('en-IN');

export const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

export const date = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const AREA_LABEL = { dhaka: 'Dhaka', outside: 'Outside Dhaka' };
