import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import { tk, stars } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Curtain3D from '../components/Curtain3D.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user } = useAuth();
  const cart = useCart();
  const toast = useToast();

  const product = useFetch(() => api.product(id), [id]);
  const reviews = useFetch(() => api.productReviews(id), [id]);
  const [sizeKey, setSizeKey] = useState('3x5');
  const [form, setForm] = useState({ stars: 5, text: '' });
  const [posting, setPosting] = useState(false);

  if (product.loading) return <Loading />;
  if (product.error) return <ErrorBox error={product.error} />;
  const p = product.data;

  const size = settings.sizes.find((s) => s.key === sizeKey) || settings.sizes[0];
  const price = Math.round(p.basePrice * size.multiplier);

  const addToCart = (goToCart = false) => {
    cart.add({ productId: p._id, name: p.name, tone: p.tone, category: p.category, sizeKey: size.key, sizeLabel: size.label, unitPrice: price, qty: 1 });
    toast('Added to cart');
    if (goToCart) navigate('/cart');
  };

  const postReview = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return toast('Please write a short review');
    setPosting(true);
    try {
      await api.addReview(p._id, { stars: Number(form.stars), text: form.text.trim() });
      setForm({ stars: 5, text: '' });
      toast('Thanks! Your review is live');
      reviews.reload();
      product.reload();
    } catch (err) { toast(err.message); }
    finally { setPosting(false); }
  };

  const list = reviews.data || [];

  return (
    <>
      <Link className="muted" to="/shop">← Back to shop</Link>
      <div className="pdp" style={{ marginTop: 14 }}>
        <Curtain3D product={p} />

        <div>
          <span className="pill">{p.category}</span>
          <h1 style={{ marginTop: 10, fontSize: 34 }}>{p.name}</h1>
          <div className="stars">
            {p.reviewCount ? <>{stars(p.rating)} <span className="muted">({p.reviewCount} review{p.reviewCount > 1 ? 's' : ''})</span></> : <span className="muted">No reviews yet</span>}
          </div>
          <p className="muted">{p.description}</p>

          <div className="field">
            <label>Size</label>
            <div className="opt">
              {settings.sizes.map((s) => (
                <button key={s.key} className={size.key === s.key ? 'on' : ''} onClick={() => setSizeKey(s.key)}>{s.label}</button>
              ))}
            </div>
          </div>

          <div className="bigprice">{tk(price)} <span className="muted small" style={{ fontWeight: 400 }}>+ VAT {settings.vatRate}%</span></div>
          <p className="muted small">
            {p.stock > 0 ? `In stock: ${p.stock}` : <b style={{ color: 'var(--red)' }}>Out of stock</b>} · Delivery in {settings.deliveryDays?.dhaka ?? 5} days inside Dhaka
          </p>
          {settings.discount?.active && <div className="note">Offer: buy {settings.discount.minQty}+ items, get {settings.discount.pct}% off</div>}

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" disabled={p.stock < 1} onClick={() => addToCart(false)}>Add to cart</button>
            <button className="btn ghost" disabled={p.stock < 1} onClick={() => addToCart(true)}>Buy now</button>
          </div>

          <div className="card pad" style={{ marginTop: 24 }}>
            <h3>Reviews</h3>
            {list.length
              ? list.map((r) => (
                <div className="rev" key={r._id}>
                  <div className="spread"><b>{r.name}</b><span className="stars">{stars(r.stars)}</span></div>
                  <div className="muted">{r.text}</div>
                </div>
              ))
              : <p className="muted">Be the first to review.</p>}

            <div style={{ borderTop: '1px solid var(--line)', marginTop: 10, paddingTop: 12 }}>
              {user?.role === 'buyer' ? (
                <form onSubmit={postReview}>
                  <div className="field">
                    <label htmlFor="rvStars">Rating</label>
                    <select id="rvStars" value={form.stars} onChange={(e) => setForm({ ...form, stars: e.target.value })}>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="rvText">Your experience</label>
                    <textarea id="rvText" rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
                  </div>
                  <button className="btn sm" disabled={posting}>{posting ? 'Posting…' : 'Post review'}</button>
                </form>
              ) : (
                <p className="muted small"><Link to="/login" state={{ from: `/product/${p._id}` }}>Log in as a buyer</Link> to write a review.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
