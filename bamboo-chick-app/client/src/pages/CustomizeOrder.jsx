import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import { tk } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Curtain3D from '../components/Curtain3D.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

const TONES = [
  { key: 'natural', label: 'Natural Bamboo' },
  { key: 'honey', label: 'Honey Oak' },
  { key: 'walnut', label: 'Dark Walnut' },
  { key: 'charcoal', label: 'Charcoal Weave' },
];

const WEAVE_STYLES = ['Standard Roll-Up', 'Roman Fold', 'Fine Matchstick', 'Weather-Sealed Outdoor'];
const MOUNT_TYPES = ['Inside Window Frame', 'Outside Wall Mount', 'Ceiling Mount'];

export default function CustomizeOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const cart = useCart();
  const toast = useToast();

  // Fetch all products so user can switch curtain style on the customization page
  const productsReq = useFetch(() => api.products({}), []);
  const products = productsReq.data || [];

  const [selectedProductId, setSelectedProductId] = useState(id || '');
  const [sizeKey, setSizeKey] = useState('custom');
  const [customWidth, setCustomWidth] = useState(48); // inches
  const [customHeight, setCustomHeight] = useState(72); // inches
  const [tone, setTone] = useState('natural');
  const [weaveStyle, setWeaveStyle] = useState(WEAVE_STYLES[0]);
  const [mountType, setMountType] = useState(MOUNT_TYPES[0]);
  const [includeCordLock, setIncludeCordLock] = useState(true);
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState(1);

  // Set initial product once fetched
  useEffect(() => {
    if (!products.length) return;
    if (id && products.some((p) => p._id === id)) {
      setSelectedProductId(id);
    } else if (!selectedProductId) {
      setSelectedProductId(products[0]._id);
    }
  }, [products, id, selectedProductId]);

  const product = useMemo(
    () => products.find((p) => p._id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  // Sync default tone with selected product
  useEffect(() => {
    if (product?.tone) {
      setTone(product.tone);
    }
  }, [product]);

  if (productsReq.loading) return <Loading />;
  if (productsReq.error) return <ErrorBox error={productsReq.error} />;
  if (!product) return <p className="muted">No products available to customize.</p>;

  // Calculate unit price using the same rules as server pricing.js
  const sizeObj = settings.sizes?.find((s) => s.key === sizeKey) || {
    key: 'custom',
    label: 'Custom Size',
    multiplier: 2.6,
  };

  const hasDiscount =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice >= 0;
  const effectiveBase = hasDiscount ? product.discountPrice : product.basePrice;
  const unitPrice = Math.round(effectiveBase * sizeObj.multiplier);

  const subtotal = unitPrice * qty;
  const vatRate = settings.vatRate ?? 15;
  const estimatedVat = Math.round((subtotal * vatRate) / 100);
  const estimatedTotal = subtotal + estimatedVat;

  const buildCustomLabel = () => {
    const dimText = sizeKey === 'custom' ? `${customWidth}" × ${customHeight}"` : sizeObj.label;
    return `${dimText} · ${weaveStyle} · ${mountType}${includeCordLock ? ' · Cord Lock' : ''}`;
  };

  const handleAddCustomizedOrder = (goToCart = false) => {
    if (sizeKey === 'custom' && (customWidth < 12 || customHeight < 12)) {
      return toast('Minimum custom width and height is 12 inches.');
    }

    cart.add({
      productId: product._id,
      name: `${product.name} (Custom)`,
      tone,
      category: product.category,
      sizeKey: sizeObj.key, // stays compatible with server pricing validation ('3x5', '4x6', '5x7', 'custom')
      sizeLabel: buildCustomLabel(),
      customSpecs: {
        widthInches: sizeKey === 'custom' ? Number(customWidth) : null,
        heightInches: sizeKey === 'custom' ? Number(customHeight) : null,
        weaveStyle,
        mountType,
        includeCordLock,
        notes: notes.trim(),
      },
      unitPrice,
      qty: Number(qty),
    });

    toast('Customized curtain added to cart!');
    if (goToCart) navigate('/cart');
  };

  return (
    <>
      <div className="spread" style={{ marginBottom: 14 }}>
        <Link className="muted" to="/shop">← Back to collection</Link>
        <span className="pill">Bespoke Studio</span>
      </div>

      <h1>Customize your bamboo curtain</h1>
      <p className="muted">
        Configure exact window dimensions, bamboo finish, weave style, and mounting hardware with live pricing.
      </p>

      <div className="pdp" style={{ marginTop: 18 }}>
        {/* Left: Live 3D Preview */}
        <div>
          <Curtain3D product={{ ...product, tone }} />
          <div className="card pad" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Your Configuration Summary</h3>
            <ul className="muted small" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
              <li><b>Base Model:</b> {product.name} ({product.category})</li>
              <li>
                <b>Dimensions:</b>{' '}
                {sizeKey === 'custom' ? `${customWidth} in (W) × ${customHeight} in (H)` : sizeObj.label}
              </li>
              <li><b>Finish / Tone:</b> {TONES.find((t) => t.key === tone)?.label || tone}</li>
              <li><b>Weave &amp; Mount:</b> {weaveStyle} · {mountType}</li>
              <li><b>Cord Lock Safety:</b> {includeCordLock ? 'Included' : 'Standard Tie-up'}</li>
              {notes.trim() && <li><b>Special Note:</b> {notes.trim()}</li>}
            </ul>
          </div>
        </div>

        {/* Right: Customization Form */}
        <div className="card pad">
          {/* Step 1: Select Base Curtain */}
          <div className="field">
            <label htmlFor="baseProduct">1. Choose Base Curtain Model</label>
            <select
              id="baseProduct"
              value={product._id}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              {products.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} — Base {tk(item.discountPrice ?? item.basePrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Size Preset or Custom Dimensions */}
          <div className="field">
            <label>2. Select Size or Custom Measurements</label>
            <div className="opt">
              {(settings.sizes || []).map((s) => (
                <button
                  type="button"
                  key={s.key}
                  className={sizeKey === s.key ? 'on' : ''}
                  onClick={() => setSizeKey(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {sizeKey === 'custom' && (
            <div className="row" style={{ gap: 12, marginBottom: 14 }}>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="customW">Width (inches)</label>
                <input
                  id="customW"
                  type="number"
                  min={12}
                  max={180}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="customH">Height / Drop (inches)</label>
                <input
                  id="customH"
                  type="number"
                  min={12}
                  max={180}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Bamboo Tone / Finish */}
          <div className="field">
            <label>3. Bamboo Stain &amp; Tone</label>
            <div className="opt">
              {TONES.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  className={tone === t.key ? 'on' : ''}
                  onClick={() => setTone(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Weave Style & Mount */}
          <div className="row" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="weaveStyle">4. Weave Style</label>
              <select
                id="weaveStyle"
                value={weaveStyle}
                onChange={(e) => setWeaveStyle(e.target.value)}
              >
                {WEAVE_STYLES.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="mountType">5. Mounting Option</label>
              <select
                id="mountType"
                value={mountType}
                onChange={(e) => setMountType(e.target.value)}
              >
                {MOUNT_TYPES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 5: Hardware & Quantity */}
          <div className="row" style={{ gap: 12, alignItems: 'center', marginTop: 8 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="customQty">Quantity (Max 10)</label>
              <input
                id="customQty"
                type="number"
                min={1}
                max={10}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 14 }}>
              <input
                type="checkbox"
                checked={includeCordLock}
                onChange={(e) => setIncludeCordLock(e.target.checked)}
              />
              <span>Include brass pulley &amp; cord lock</span>
            </label>
          </div>

          {/* Step 6: Special Instructions */}
          <div className="field">
            <label htmlFor="customNotes">Tailoring Notes (optional)</label>
            <textarea
              id="customNotes"
              rows={2}
              maxLength={300}
              placeholder="e.g., Leave 1 inch clearance at the bottom, or match balcony railing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Live Price Breakdown */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 10 }}>
            <div className="spread muted small">
              <span>Unit price ({sizeObj.label})</span>
              <span>{tk(unitPrice)}</span>
            </div>
            <div className="spread muted small">
              <span>Subtotal ({qty} × {tk(unitPrice)})</span>
              <span>{tk(subtotal)}</span>
            </div>
            <div className="spread muted small">
              <span>Estimated VAT ({vatRate}%)</span>
              <span>{tk(estimatedVat)}</span>
            </div>
            <div className="bigprice" style={{ marginTop: 8 }}>
              {tk(estimatedTotal)}{' '}
              <span className="muted small" style={{ fontWeight: 400 }}>(incl. VAT, excl. delivery)</span>
            </div>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn"
              disabled={product.stock < 1}
              onClick={() => handleAddCustomizedOrder(false)}
            >
              Add custom order to cart
            </button>
            <button
              type="button"
              className="btn ghost"
              disabled={product.stock < 1}
              onClick={() => handleAddCustomizedOrder(true)}
            >
              Customize &amp; checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}