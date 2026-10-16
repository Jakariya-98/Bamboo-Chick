import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { tk } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import Loading, { ErrorBox } from '../../components/Loading.jsx';

/** "Receive order cancellation requests" user story */
export default function SellerCancellations() {
  const { data, error, loading, reload } = useFetch(() => api.allOrders('Cancellation requested'), []);
  const toast = useToast();

  const decide = async (o, approve) => {
    try {
      await api.decideCancel(o._id, approve);
      toast(approve ? 'Order cancelled, stock restored' : 'Request rejected');
      reload();
    } catch (e) { toast(e.message); }
  };

  return (
    <div className="card pad">
      <h3>Cancellation requests</h3>
      <ErrorBox error={error} />
      {loading ? <Loading /> : data.length ? data.map((o) => (
        <div className="rev spread" key={o._id}>
          <div>
            <b>{o.orderNo}</b> · {o.customer.name} · {tk(o.pricing.total)}
            <div className="muted small">Reason: {o.cancelReason || '—'}</div>
          </div>
          <div className="row">
            <button className="btn red sm" onClick={() => decide(o, true)}>Approve</button>
            <button className="btn ghost sm" onClick={() => decide(o, false)}>Reject</button>
          </div>
        </div>
      )) : <p className="muted">No pending requests.</p>}
    </div>
  );
}
