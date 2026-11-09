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
  const { data, error, loading } = useFetch(() => api.products(category === 'All' ? {} : { category }), [category]);

  return (
    <>
      <h1>Shop curtains</h1>
      <p className="muted">Natural, Roman, outdoor and door curtains — all made from bamboo.</p>
      <div className="chips">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setParams(c === 'All' ? {} : { category: c })}>{c}</button>
        ))}
      </div>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        data?.length
          ? <div className="grid g4">{data.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          : <p className="muted">No products in this category yet.</p>
      )}
    </>
  );
}
