import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotals, unitPrice } from '../src/utils/pricing.js';

const settings = {
  vatRate: 15, installVatRate: 5, installRate: 350,
  delivery: { dhaka: 120, outside: 250 },
  discount: { active: true, minQty: 3, pct: 10 }
};

test('size multiplier is applied to base price', () => {
  assert.equal(unitPrice(2400, '3x5'), 2400);
  assert.equal(unitPrice(2400, '4x6'), 3720);
  assert.throws(() => unitPrice(2400, 'huge'));
});

test('no discount below minimum quantity', () => {
  const t = calculateTotals([{ unitPrice: 3900, qty: 1 }], settings);
  assert.equal(t.discount, 0);
  assert.equal(t.vat, 585);
  assert.equal(t.total, 3900 + 585 + 120);
});

test('bulk discount, VAT on goods, installation + service VAT, delivery', () => {
  // Same cart as the prototype demo: 1 × 3900 + 2 × 2100
  const t = calculateTotals(
    [{ unitPrice: 3900, qty: 1 }, { unitPrice: 2100, qty: 2 }],
    settings,
    { area: 'dhaka', installation: true }
  );
  assert.equal(t.subtotal, 8100);
  assert.equal(t.discount, 810);
  assert.equal(t.vat, 1093.5);
  assert.equal(t.installation, 1050);
  assert.equal(t.installationVat, 52.5);
  assert.equal(t.delivery, 120);
  assert.equal(t.total, 9606);
});

test('outside Dhaka delivery charge', () => {
  const t = calculateTotals([{ unitPrice: 1000, qty: 1 }], settings, { area: 'outside' });
  assert.equal(t.delivery, 250);
});

test('discount switched off', () => {
  const t = calculateTotals([{ unitPrice: 1000, qty: 5 }], { ...settings, discount: { active: false, minQty: 3, pct: 10 } });
  assert.equal(t.discount, 0);
});
