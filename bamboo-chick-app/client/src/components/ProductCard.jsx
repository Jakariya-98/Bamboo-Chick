import { Link } from 'react-router-dom';
import { swatchBg } from '../utils/swatch.js';
import { tk } from '../utils/format.js';
import { mediaUrl } from '../utils/media.js';

export default function ProductCard({ product: p }) {
  const image = mediaUrl(p.images?.[0]);

  const hasDiscount = p.discountPrice !== null && p.discountPrice !== undefined && p.discountPrice >= 0;
  const percentOff = hasDiscount && p.basePrice > 0 ? Math.round((1 - p.discountPrice / p.basePrice) * 100) : 0;

  return (
    <Link to={`/product/${p._id}`} className="card prod">
      <div className="sw" style={{ background: swatchBg(p) }}>
        {image && (
          <img
            src={image}
            alt={p.name}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        <span className="tag">{p.category}</span>
        {percentOff > 0 && <span className="tag dark">−{percentOff}%</span>}

        {p.stock < 10 && (
          <span className="tag right">
            {p.stock ? `Only ${p.stock} left` : 'Out of stock'}
          </span>
        )}
      </div>

      <div className="b">
        <div className="spread">
          <div className="nm">{p.name}</div>
          {p.rating > 0 && <span className="stars small">★ {p.rating.toFixed(1)}</span>}
        </div>
        <span className="price">
          from {hasDiscount ? (
            <>
              <span className="was">{tk(p.basePrice)}</span>
              <span className="now">{tk(p.discountPrice)}</span>
            </>
          ) : (
            tk(p.basePrice)
          )}
        </span>
      </div>
    </Link>
  );
}