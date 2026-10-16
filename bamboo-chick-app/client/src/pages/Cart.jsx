import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { swatchBg } from '../utils/swatch.js';
import { tk } from '../utils/format.js';
import PriceSummary from '../components/PriceSummary.jsx';
import { ErrorBox } from '../components/Loading.jsx';

/** "Add products to cart with auto calculator and different taxes" user story */
export default function Cart() {
  const cart = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [totals, setTotals] = useState(null);
  const [error, setError] = useState(null);

  // Ask the server for the real totals whenever the cart changes
  const key = JSON.stringify(cart.forApi());
  useEffect(() => {
    if (!cart.items.length) { setTotals(null); return; }
    let live = true;
    api.quote({ items: cart.forApi(), area: 'dhaka' })
      .then((d) => { if (live) { setTotals(d.totals); setError(null); } })
      .catch((e) => live && setError(e));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!cart.items.length) {
    return (
      <>
        <h1>Your cart</h1>
        <div className="card pad empty"><p className="muted">Your cart is empty.</p><Link className="btn" to="/shop">Browse curtains</Link></div>
      </>
    );
  }

  const d = settings.discount;
  const missing = d?.active ? d.minQty - cart.count : 0;

  return (
    <>
      <h1>Your cart</h1>
      <ErrorBox error={error} />
      <div className="cartgrid">
        <div className="card pad">
          {cart.items.map((c, i) => (
            <div className="ci" key={`${c.productId}-${c.sizeKey}`}>
              <div className="thumb" style={{ background: swatchBg(c) }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{c.name}</b>
                <div className="muted small">{c.sizeLabel} · {tk(c.unitPrice)} each</div>
                <div className="row" style={{ marginTop: 6 }}>
                  <span className="qty">
                    <button aria-label="Decrease" onClick={() => cart.setQty(i, c.qty - 1)}>−</button>
                    <span>{c.qty}</span>
                    <button aria-label="Increase" onClick={() => cart.setQty(i, c.qty + 1)}>+</button>
                  </span>
                  <button className="btn ghost sm" onClick={() => cart.remove(i)}>Remove</button>
                </div>
              </div>
              <b>{tk(c.unitPrice * c.qty)}</b>
            </div>
          ))}
          {missing > 0 && <div className="note" style={{ marginTop: 12 }}>Add {missing} more item(s) to unlock {d.pct}% off.</div>}
        </div>

        <div className="card pad">
          <h3>Price calculator</h3>
          {totals ? <PriceSummary t={totals} /> : <p className="muted">Calculating…</p>}
          <p className="muted" style={{ fontSize: 12 }}>Installation service and delivery area are chosen at checkout.</p>
          <button className="btn block" onClick={() => navigate('/checkout')}>Checkout</button>
        </div>
      </div>
    </>
  );
}
