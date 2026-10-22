
import { Link } from 'react-router-dom';
import { swatchBg } from '../utils/swatch.js';
import { tk } from '../utils/format.js';

export default function ProductCard({ product: p }) {
  const image = p.images?.[0]
    ? (p.images[0].startsWith('/')
        ? p.images[0]
        : `/products/${p.images[0]}`)
    : null;

  return (
    <Link to={`/product/${p._id}`} className="card prod">
      <div className="sw" style={{ background: swatchBg(p) }}>
        {image && (
          <img
            src={image}
            alt={p.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        )}

        <span className="tag">{p.category}</span>

        {p.stock < 10 && (
          <span className="tag right">
            {p.stock ? `Only ${p.stock} left` : 'Out of stock'}
          </span>
        )}
      </div>

      <div className="b">
        <div className="nm">{p.name}</div>
        <div className="spread">
          <span className="price">from {tk(p.basePrice)}</span>
          {p.rating > 0 && (
            <span className="stars small">
              ★ {p.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
