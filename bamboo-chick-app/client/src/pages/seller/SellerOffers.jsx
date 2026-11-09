import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/** "Add discounts" user story + tax / delivery settings */
export default function SellerOffers() {
  const { settings, setSettings } = useSettings();
  const toast = useToast();
  const [f, setF] = useState(null);

  useEffect(() => {
    setF({
      active: settings.discount.active, minQty: settings.discount.minQty, pct: settings.discount.pct,
      vatRate: settings.vatRate, installVatRate: settings.installVatRate, installRate: settings.installRate,
      dhaka: settings.delivery.dhaka, outside: settings.delivery.outside
    });
  }, [settings]);

  if (!f) return null;
  const num = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    try {
      const updated = await api.updateSettings({
        discount: { active: f.active, minQty: Number(f.minQty), pct: Number(f.pct) },
        vatRate: Number(f.vatRate), installVatRate: Number(f.installVatRate), installRate: Number(f.installRate),
        delivery: { dhaka: Number(f.dhaka), outside: Number(f.outside) }
      });
      setSettings(updated);
      toast('Settings saved');
    } catch (e) { toast(e.message); }
  };

  return (
    <div className="card pad" style={{ maxWidth: 560 }}>
      <h3>Bulk discount</h3>
      <p className="muted">Give a discount when a customer buys at least a set number of items.</p>
      <div className="grid g2">
        <div className="field"><label>Minimum items</label><input type="number" min="1" value={f.minQty} onChange={num('minQty')} /></div>
        <div className="field"><label>Discount %</label><input type="number" min="0" max="90" value={f.pct} onChange={num('pct')} /></div>
      </div>
      <div className="field">
        <label>Status</label>
        <div className="opt">
          <button className={f.active ? 'on' : ''} onClick={() => setF({ ...f, active: true })}>Active</button>
          <button className={!f.active ? 'on' : ''} onClick={() => setF({ ...f, active: false })}>Off</button>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '20px 0' }} />
      <h3>Taxes &amp; charges</h3>
      <div className="grid g2">
        <div className="field"><label>VAT on goods %</label><input type="number" value={f.vatRate} onChange={num('vatRate')} /></div>
        <div className="field"><label>VAT on installation %</label><input type="number" value={f.installVatRate} onChange={num('installVatRate')} /></div>
        <div className="field"><label>Installation fee per item (৳)</label><input type="number" value={f.installRate} onChange={num('installRate')} /></div>
        <div />
        <div className="field"><label>Delivery — Dhaka (৳)</label><input type="number" value={f.dhaka} onChange={num('dhaka')} /></div>
        <div className="field"><label>Delivery — outside Dhaka (৳)</label><input type="number" value={f.outside} onChange={num('outside')} /></div>
      </div>
      <button className="btn" onClick={save}>Save all</button>
    </div>
  );
}
