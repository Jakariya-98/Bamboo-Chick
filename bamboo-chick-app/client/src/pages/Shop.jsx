import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import ProductCard from '../components/ProductCard.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

const CATEGORIES = ['All', 'Roll-Up', 'Roman', 'Outdoor', 'Matchstick', 'Door'];

/** "View products" user story */
export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');

  const { data, error, loading } = useFetch(() => api.products(category === 'All' ? {} : { category }), [category]);

  // Filter products locally based on the search input query
  const filteredData = data?.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <h1>Shop curtains</h1>
      <p className="muted">Natural, Roman, outdoor and door curtains — all made from bamboo.</p>

      {/* Search Bar Component */}
      <div className="shop-search-container" style={{ margin: '16px 0' }}>
        <input
          type="text"
          placeholder="Search curtains by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
      </div>

      <div className="chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'on' : ''}`}
            onClick={() => setParams(c === 'All' ? {} : { category: c })}
          >
            {c}
          </button>
        ))}
      </div>

      <ErrorBox error={error} />

      {loading ? (
        <Loading />
      ) : (
        filteredData?.length ? (
          <div className="grid g4">
            {filteredData.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <p className="muted">No products found matching your search.</p>
        )
      )}
    </>
  );
}