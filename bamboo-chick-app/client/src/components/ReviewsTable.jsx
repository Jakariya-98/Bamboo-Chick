import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import { stars, date } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import Loading, { ErrorBox } from './Loading.jsx';

/**
 * Seller: "See customer reviews" (read-only).
 * Admin:  "See reviews" + hide/show (moderate = true).
 */
export default function ReviewsTable({ moderate = false }) {
  const { data, error, loading, reload } = useFetch(() => api.allReviews(), []);
  const toast = useToast();

  const toggle = async (r) => {
    try { await api.setReviewHidden(r._id, !r.hidden); toast(r.hidden ? 'Review visible again' : 'Review hidden'); reload(); }
    catch (e) { toast(e.message); }
  };

  return (
    <div className="card pad tablewrap">
      <h3>Customer reviews</h3>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        <table>
          <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Date</th>{moderate && <th />}</tr></thead>
          <tbody>
            {data.map((r) => (
              <tr key={r._id} style={{ opacity: r.hidden ? 0.45 : 1 }}>
                <td>{r.product?.name || '—'}</td>
                <td>{r.name}</td>
                <td className="stars">{stars(r.stars)}</td>
                <td>{r.text}</td>
                <td className="small">{date(r.createdAt)}</td>
                {moderate && <td><button className="btn ghost sm" onClick={() => toggle(r)}>{r.hidden ? 'Show' : 'Hide'}</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
