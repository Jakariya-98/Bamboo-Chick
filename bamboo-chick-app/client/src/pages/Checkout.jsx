import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { tk, AREA_LABEL } from '../utils/format.js';
import PriceSummary from '../components/PriceSummary.jsx';
import { ErrorBox } from '../components/Loading.jsx';

export default function Checkout() {
  const cart = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', area: 'dhaka' });
  const [installation, setInstallation] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [placing, setPlacing] = useState(false);

  const key = JSON.stringify([cart.forApi(), form.area, installation]);
  useEffect(() => {
    if (!cart.items.length) return;
    api.quote({ items: cart.forApi(), area: form.area, installation })
      .then((d) => { setQuote(d); setError(null); })
      .catch(setError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!cart.items.length) return <Navigate to="/cart" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const place = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) return toast('Please fill name, phone and address');
    setPlacing(true);
    try {
      const order = await api.placeOrder({ items: cart.forApi(), customer: form, installation });
      cart.clear();
      toast('Order placed — slip generated');
      navigate(`/orders/${order._id}`);
    } catch (e) {
      setError(e);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Link className="muted" to="/cart">← Back to cart</Link>
      <h1 style={{ marginTop: 10 }}>Checkout</h1>
      <ErrorBox error={error} />
      <div className="cartgrid">
        <div className="card pad">
          <div className="grid g2">
            <div className="field"><label htmlFor="n">Full name</label><input id="n" value={form.name} onChange={set('name')} /></div>
            <div className="field"><label htmlFor="ph">Phone</label><input id="ph" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" /></div>
          </div>
          <div className="field"><label htmlFor="ad">Delivery address</label><textarea id="ad" rows={2} value={form.address} onChange={set('address')} /></div>

          <div className="field">
            <label>Delivery area</label>
            <div className="opt">
              {Object.keys(settings.delivery || {}).map((a) => (
                <button key={a} className={form.area === a ? 'on' : ''} onClick={() => setForm({ ...form, area: a })}>
                  {AREA_LABEL[a] || a} ({tk(settings.delivery[a])})
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Installation service</label>
            <div className="opt">
              <button className={!installation ? 'on' : ''} onClick={() => setInstallation(false)}>I&apos;ll install myself</button>
              <button className={installation ? 'on' : ''} onClick={() => setInstallation(true)}>Install for me ({tk(settings.installRate)}/item)</button>
            </div>
          </div>

          <div className="field">
            <label>Payment</label>
            {/* TODO: bKash / card payment in a later sprint */}
            <div className="opt"><button className="on">Cash on delivery</button></div>
          </div>
        </div>

        <div className="card pad">
          <h3>Order summary</h3>
          {quote ? <PriceSummary t={quote.totals} area={form.area} /> : <p className="muted">Calculating…</p>}
          {quote && <p className="muted small">Estimated delivery: <b>{new Date(quote.deliveryDate).toDateString()}</b></p>}
          <button className="btn block" style={{ marginTop: 10 }} onClick={place} disabled={placing || !quote}>
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </div>
    </>
  );
}
