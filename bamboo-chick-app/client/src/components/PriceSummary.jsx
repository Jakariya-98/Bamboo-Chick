import { tk, AREA_LABEL } from '../utils/format.js';

/** Price breakdown. `t` is the totals object returned by the server. */
export default function PriceSummary({ t, area = 'dhaka', totalLabel = 'Total' }) {
  if (!t) return null;
  return (
    <div className="sum">
      <div><span>Subtotal ({t.itemCount} items)</span><span>{tk(t.subtotal)}</span></div>
      {t.discount > 0 && <div className="disc"><span>Discount ({t.discountPct}%)</span><span>−{tk(t.discount)}</span></div>}
      <div><span>VAT on goods ({t.vatRate}%)</span><span>{tk(t.vat)}</span></div>
      {t.installation > 0 && (
        <>
          <div><span>Installation</span><span>{tk(t.installation)}</span></div>
          <div><span>VAT on service ({t.installationVatRate}%)</span><span>{tk(t.installationVat)}</span></div>
        </>
      )}
      <div><span>Delivery ({AREA_LABEL[area] || area})</span><span>{tk(t.delivery)}</span></div>
      <div className="tot"><span>{totalLabel}</span><span>{tk(t.total)}</span></div>
    </div>
  );
}
