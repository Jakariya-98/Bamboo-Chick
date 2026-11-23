import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import ProductCard from '../components/ProductCard.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

const CATEGORIES = ['All', 'Roll-Up', 'Roman', 'Outdoor', 'Matchstick', 'Door'];

/** "View products" & "Search products" user stories */
export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All';
  const query = params.get('q') || '';

  const { data, error, loading } = useFetch(
    () => api.products(category === 'All' ? {} : { category }),
    [category]
  );

  // Filter fetched products by search query (matches name, category, or description)
  const filteredProducts = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || desc.includes(q);
    });
  }, [data, query]);

  const handleCategoryChange = (c) => {
    const next = {};
    if (c !== 'All') next.category = c;
    if (query.trim()) next.q = query.trim();
    setParams(next);
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    const next = {};
    if (category !== 'All') next.category = category;
    if (val) next.q = val;
    setParams(next);
  };

  const clearFilters = () => {
    setParams({});
  };

  return (
    <>
      <h1>Shop curtains</h1>
      <p className="muted">Natural, Roman, outdoor and door curtains — all made from bamboo.</p>

      {/* Search bar inside Shop page */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Filter by curtain name, style, or keyword..."
          aria-label="Filter products"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '0.95rem',
            flex: '1 1 260px',
            maxWidth: '420px'
          }}
        />
        {(query || category !== 'All') && (
          <button type="button" className="chip" onClick={clearFilters}>
            Reset filters
          </button>
        )}
      </div>

      <div className="chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'on' : ''}`}
            onClick={() => handleCategoryChange(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        filteredProducts.length
          ? <div className="grid g4">{filteredProducts.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          : <p className="muted">No products matched your search{query ? ` "${query}"` : ''}.</p>
      )}
    </>
  );
}