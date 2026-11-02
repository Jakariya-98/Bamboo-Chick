/**
 * Pricing rules — the single source of truth for every price shown to buyers.
 *
 * The client never decides a total. It sends items + options and the server
 * calculates (Cart "auto calculator" + "different taxes" user story).
 */

// Standard sizes. Price = product.basePrice × multiplier.
export const SIZES = [
  { key: '3x5', label: '3×5 ft', multiplier: 1 },
  { key: '4x6', label: '4×6 ft', multiplier: 1.55 },
  { key: '5x7', label: '5×7 ft', multiplier: 2.2 },
  { key: 'custom', label: 'Custom', multiplier: 2.6 }
];

export const AREAS = ['dhaka', 'outside'];

const round2 = (n) => Math.round(n * 100) / 100;

export function findSize(sizeKey) {
  return SIZES.find((s) => s.key === sizeKey) || null;
}

export function unitPrice(basePrice, sizeKey) {
  const size = findSize(sizeKey);
  if (!size) throw new Error(`Unknown size "${sizeKey}"`);
  return Math.round(basePrice * size.multiplier);
}

/**
 * @param {Array<{unitPrice:number, qty:number}>} lines   priced cart lines
 * @param {object} settings  Setting document (vatRate, installVatRate, installRate, delivery, discount)
 * @param {{area?:'dhaka'|'outside', installation?:boolean}} options
 */
export function calculateTotals(lines, settings, { area = 'dhaka', installation = false } = {}) {
  const qty = lines.reduce((a, l) => a + l.qty, 0);
  const subtotal = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);

  const d = settings.discount || {};
  const discountApplies = Boolean(d.active) && qty >= (d.minQty || 0);
  const discount = discountApplies ? subtotal * (d.pct || 0) / 100 : 0;

  const vat = (subtotal - discount) * settings.vatRate / 100;            // VAT on goods
  const installationFee = installation ? qty * settings.installRate : 0;
  const installationVat = installationFee * settings.installVatRate / 100; // VAT on service
  const delivery = qty ? (settings.delivery?.[area] ?? 0) : 0;

  const total = subtotal - discount + vat + installationFee + installationVat + delivery;

  return {
    itemCount: qty,
    subtotal: round2(subtotal),
    discount: round2(discount),
    discountPct: discountApplies ? d.pct : 0,
    vatRate: settings.vatRate,
    vat: round2(vat),
    installation: round2(installationFee),
    installationVatRate: settings.installVatRate,
    installationVat: round2(installationVat),
    delivery: round2(delivery),
    total: round2(total)
  };
}

export function estimateDeliveryDate(settings, area = 'dhaka', from = new Date()) {
  const days = settings.deliveryDays?.[area] ?? 5;
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}
