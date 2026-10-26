import { Link } from 'react-router-dom';
import { swatchBg } from '../utils/swatch.js';
import { tk } from '../utils/format.js';

export default function ProductCard({ product: p }) {
  const hasDiscount = p.discountPrice !== null && p.discountPrice !== undefined && p.discountPrice >= 0;

  return (
    <Link to={`/product/${p._id}`} className="card prod">
      <div className="sw" style={{ background: swatchBg(p) }}>
        <span className="tag">{p.category}</span>
        {p.stock < 10 && <span className="tag right">{p.stock ? `Only ${p.stock} left` : 'Out of stock'}</span>}
      </div>
      <div className="b">
        <div className="nm">{p.name}</div>
        <div className="spread">
          <span className="price">
            from {hasDiscount ? (
              <>
                <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: '6px' }}>{tk(p.basePrice)}</span>
                <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>{tk(p.discountPrice)}</span>
              </>
            ) : (
              tk(p.basePrice)
            )}
          </span>
          {p.rating > 0 && <span className="stars small">★ {p.rating.toFixed(1)}</span>}
        </div>
      </div>
    </Link>
  );
}