import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import { tk, date } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import StatusPill from '../components/StatusPill.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

/** Buyer's orders + "Cancel order" user story */
export default function MyOrders() {
  const { data, error, loading, reload } = useFetch(() => api.myOrders(), []);
  const toast = useToast();

  const cancel = async (o) => {
    const reason = window.prompt('Reason for cancellation (optional):', 'Changed my mind');
    if (reason === null) return;
    try {
      await api.requestCancel(o._id, reason);
      toast('Cancellation request sent to seller');
      reload();
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <>
      <h1>My orders</h1>
      <p className="muted">Track orders, view your slip, or request a cancellation before it ships.</p>
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : data?.length ? (
        <div className="card pad tablewrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Placed</th>
                <th>Delivery</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o._id}>
                  <td>
                    <b>{o.orderNo}</b>
                  </td>
                  <td>{date(o.createdAt)}</td>
                  <td>{date(o.deliveryDate)}</td>
                  <td>{tk(o.pricing?.grandTotal ?? o.pricing?.total ?? 0)}</td>
                  <td>
                    <StatusPill status={o.status} />
                  </td>
                  <td>
                    <div className="row" style={{ justifyContent: 'flex-end' }}>
                      <Link className="btn ghost sm" to={`/orders/${o._id}`}>
                        Slip
                      </Link>
                      {o.status === 'Pending' && (
                        <button className="btn red sm" onClick={() => cancel(o)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card pad empty">
          <p className="muted">No orders yet.</p>
          <Link className="btn" to="/shop">
            Start shopping
          </Link>
        </div>
      )}
    </>
  );
}