import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import { slats, TONES } from '../utils/swatch.js';
import { mediaUrl } from '../utils/media.js';
import { tk, date } from '../utils/format.js';
import RecommendationQuiz from '../components/RecommendationQuiz.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

const STATS = [
  ['84%', 'less water used in fiber production'],
  ['10 yr', 'craftsmanship warranty'],
  ['4.9/5', 'average customer rating']
];

const STEPS = [
  ['01', 'Source', 'Regeneratively grown bamboo and traceable natural fibers.'],
  ['02', 'Craft', 'Measured, cut, and finished by experienced curtain makers.'],
  ['03', 'Install', 'Delivered with a date and clear installation guidance.']
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const photoOf = (p) => (p?.images?.[0] ? mediaUrl(p.images[0]) : '');
const hasDiscount = (p) => p.discountPrice !== null && p.discountPrice !== undefined && p.discountPrice >= 0;
const percentOff = (p) => (hasDiscount(p) && p.basePrice > 0 ? Math.round((1 - p.discountPrice / p.basePrice) * 100) : 0);

/** Product photo that fills its (positioned) parent, with a bamboo-slat fallback. */
function Photo({ product, className = '' }) {
  const src = photoOf(product);
  const fallback = { background: slats(product?.tone) };
  if (!src) return <div className={`photo ${className}`} style={fallback} />;
  return (
    <img
      className={`photo ${className}`}
      src={src}
      alt={product.name}
      loading="lazy"
      style={fallback}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
    />
  );
}

export default function Home() {
  const products = useFetch(() => api.products(), []);
  const blogs = useFetch(() => api.blogs(), []);

  const [category, setCategory] = useState('All');
  const [pickedId, setPickedId] = useState(null);
  const [finish, setFinish] = useState(null);

  const list = products.data || [];
  const categories = ['All', ...new Set(list.map((p) => p.category).filter(Boolean))];
  const visible = (category === 'All' ? list : list.filter((p) => p.category === category)).slice(0, 6);

  const heroProduct = list.find((p) => p.images?.length) || null;
  const selected = list.find((p) => p._id === pickedId) || list[0] || null;
  const activeFinish = finish || selected?.tone || 'natural';
  const tint = (TONES[activeFinish] || TONES.natural)[0];
  const gallery = list.filter((p) => p.images?.length).slice(0, 10);

  const tryColor = (p) => {
    setPickedId(p._id);
    setFinish(null);
    document.getElementById('visualizer')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="hero-full">
        <div className="hero-bg" style={{ background: slats('natural', 9) }}>
          {heroProduct && <Photo product={heroProduct} />}
          <div className="shade-l" />
          <div className="shade-b" />
        </div>
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Natural light, thoughtfully framed</p>
            <h1>Woven by nature.<br />Made for home.</h1>
            <div className="hero-actions">
              <a className="cta gold" href="#collection">Explore the collection <span aria-hidden="true">↗</span></a>
              <p>Bamboo, linen, and woven wood window treatments crafted for calmer, healthier interiors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- why bamboo ---------- */}
      <section className="why">
        <div className="why-lead">
          <span className="eyebrow dark">01 — Why bamboo</span>
          <div>
            <p className="why-title">Beautiful materials.<br />A lighter footprint.</p>
            <p className="why-copy">Rapidly renewable bamboo, low-impact dyes, and considered production create window treatments designed to last beyond trends.</p>
          </div>
        </div>
        <div className="why-stats">
          {STATS.map(([value, label]) => (
            <div key={value}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- collection ---------- */}
      <section id="collection" className="block">
        <div className="container">
          <div className="block-head">
            <div>
              <p className="eyebrow dark">02 — The collection</p>
              <h2 className="display">Find your shade</h2>
            </div>
            <div className="filters" role="group" aria-label="Filter by category">
              {categories.map((c) => (
                <button key={c} type="button" className={category === c ? 'on' : ''} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
          </div>

          <ErrorBox error={products.error} />
          {products.loading ? <Loading /> : visible.length ? (
            <div className="collection">
              {visible.map((p, i) => (
                <article key={p._id} className="piece">
                  <div className="piece-img">
                    <Link to={`/product/${p._id}`} aria-label={`View ${p.name}`} className="piece-link"><Photo product={p} /></Link>
                    <div className="badges">
                      {i === 0 && category === 'All' && <span className="badge-gold">Bestseller</span>}
                      {percentOff(p) > 0 && <span className="badge-dark">−{percentOff(p)}%</span>}
                    </div>
                    <div className="piece-actions">
                      <Link to={`/product/${p._id}`} className="act light">View details</Link>
                      <button type="button" className="act dark" onClick={() => tryColor(p)}>Try color</button>
                    </div>
                  </div>
                  <div className="piece-meta">
                    <div>
                      <h3>{p.name}</h3>
                      <p>{p.category}</p>
                    </div>
                    <p className="piece-price">{tk(hasDiscount(p) ? p.discountPrice : p.basePrice)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-block">
              <p className="serif-lg">{list.length ? 'No products in this category yet.' : 'The collection is being curated.'}</p>
              <p>Products added by the seller will appear here.</p>
            </div>
          )}

          <div className="block-foot"><Link className="underlined" to="/shop">View all products</Link></div>
        </div>
      </section>

      {/* ---------- quiz (existing feature) ---------- */}
      <div className="container quiz-wrap"><RecommendationQuiz /></div>

      {/* ---------- visualizer ---------- */}
      {selected && (
        <section id="visualizer" className="viz">
          <div className="viz-stage">
            <Photo product={selected} className="viz-photo" />
            <div className="viz-tint" style={{ backgroundColor: tint }} />
            <div className="viz-fade" />
            <span className="viz-tag">Color preview</span>
          </div>
          <div className="viz-panel">
            <p className="eyebrow gold">03 — Studio preview</p>
            <h2 className="display light">See it in<br />your light.</h2>
            <p className="viz-copy">Explore material tones before you order. Our visualization studio helps you compare finishes and find the right warmth for your room.</p>

            <div className="viz-now">
              <div>
                <p className="micro">Previewing</p>
                <p className="serif-md">{selected.name}</p>
              </div>
              <Link to={`/product/${selected._id}`} className="cta gold sm">View product</Link>
            </div>

            <p className="micro spaced">Choose a finish</p>
            <div className="finishes">
              {Object.keys(TONES).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={activeFinish === key ? 'on' : ''}
                  onClick={() => setFinish(key)}
                  aria-label={`Preview ${cap(key)}`}
                  aria-pressed={activeFinish === key}
                  title={cap(key)}
                >
                  <span style={{ backgroundColor: TONES[key][0] }} />
                </button>
              ))}
            </div>
            <p className="viz-name">{cap(activeFinish)}</p>
          </div>
        </section>
      )}

      {/* ---------- craft ---------- */}
      <section id="craft" className="craft">
        <div className="container craft-grid">
          <div>
            <p className="eyebrow dark">04 — Made with care</p>
            <h2 className="display md">From field to<br />finished room.</h2>
          </div>
          <div className="steps">
            {STEPS.map(([n, title, copy]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- gallery ---------- */}
      {gallery.length > 1 && (
        <section aria-label="Bamboo Chick materials gallery" className="gallery">
          <div className="marquee-track">
            {[...gallery, ...gallery].map((p, i) => (
              <div key={`${p._id}-${i}`} className="gallery-tile" aria-hidden={i >= gallery.length ? 'true' : undefined}>
                <Photo product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- journal ---------- */}
      <section id="journal" className="block">
        <div className="container">
          <div className="block-head">
            <div>
              <p className="eyebrow dark">05 — The journal</p>
              <h2 className="display">Notes on living</h2>
            </div>
            <Link to="/blog" className="underlined">All stories</Link>
          </div>
          <ErrorBox error={blogs.error} />
          <div className="journal">
            {(blogs.data || []).slice(0, 3).map((b) => (
              <article key={b._id}>
                <div className="journal-img">
                  {b.coverImage
                    ? <img src={mediaUrl(b.coverImage)} alt={b.title} loading="lazy" />
                    : <div className="photo" style={{ background: slats(b.tone) }} />}
                </div>
                <p className="micro dim">{date(b.createdAt)}</p>
                <h3>{b.title}</h3>
                <p className="journal-copy">{b.body}</p>
              </article>
            ))}
            {!blogs.loading && !(blogs.data || []).length && !blogs.error && (
              <p className="journal-empty">New material guides and design notes are coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ---------- closing call to action ---------- */}
      <section className="closing">
        <p className="eyebrow dark">A room that feels like you</p>
        <h2 className="display">Let&apos;s frame your view.</h2>
        <p>Tell us about your space and receive a tailored material recommendation from a Bamboo Chick design specialist.</p>
        <a className="cta forest" href="#quiz">Find my fit <span aria-hidden="true">↗</span></a>
      </section>
    </>
  );
}