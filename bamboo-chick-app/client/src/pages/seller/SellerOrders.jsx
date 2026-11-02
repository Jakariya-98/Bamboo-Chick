import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { tk, date } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Loading, { ErrorBox } from '../../components/Loading.jsx';

const FILTERS = ['', 'Pending', 'Shipped', 'Delivered', 'Cancellation requested', 'Cancelled'];

/** "Receive auto-generated order slips" user story */
export default function SellerOrders() {
  const [status, setStatus] = useState('');
  const { data, error, loading, reload } = useFetch(() => api.allOrders(status), [status]);
  const toast = useToast();

  const move = async (o, next) => {
    try { await api.setOrderStatus(o._id, next); toast(`${o.orderNo} → ${next}`); reload(); }
    catch (e) { toast(e.message); }
  };

  return (
    <div className="card pad tablewrap">
      <div className="spread">
        <h3>Order slips</h3>
        <select style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
          {FILTERS.map((f) => <option key={f} value={f}>{f || 'All statuses'}</option>)}
        </select>
      </div>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Delivery</th><th>Total</th><th>Status</th><th /></tr></thead>
          <tbody>
            {data.map((o) => (
              <tr key={o._id}>
                <td><b>{o.orderNo}</b></td>
                <td>{o.customer.name}</td>
                <td>{date(o.createdAt)}</td>
                <td>{date(o.deliveryDate)}</td>
                <td>{tk(o.pricing.total)}</td>
                <td><StatusPill status={o.status} /></td>
                <td>
                  <div className="row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                    <Link className="btn ghost sm" to={`/orders/${o._id}`}>Slip</Link>
                    {o.status === 'Pending' && <button className="btn sm" onClick={() => move(o, 'Shipped')}>Mark shipped</button>}
                    {o.status === 'Shipped' && <button className="btn sm" onClick={() => move(o, 'Delivered')}>Mark delivered</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
