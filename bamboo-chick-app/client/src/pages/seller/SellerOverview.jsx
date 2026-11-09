import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { tk } from '../../utils/format.js';
import StatusPill from '../../components/StatusPill.jsx';
import Loading, { ErrorBox } from '../../components/Loading.jsx';

export default function SellerOverview() {
  const ov = useFetch(() => api.overview(), []);
  const orders = useFetch(() => api.allOrders(), []);

  if (ov.loading) return <Loading />;
  if (ov.error) return <ErrorBox error={ov.error} />;
  const d = ov.data;

  return (
    <>
      <div className="grid g4">
        <div className="card pad kpi"><div className="l">Sales this month</div><div className="n">{tk(d.monthRevenue)}</div></div>
        <div className="card pad kpi"><div className="l">Orders this month</div><div className="n">{d.monthOrders}</div></div>
        <div className="card pad kpi"><div className="l">Pending</div><div className="n">{d.statusCounts.Pending || 0}</div></div>
        <div className="card pad kpi"><div className="l">Avg rating</div><div className="n">{d.avgRating}★</div></div>
      </div>
      <div className="grid g2" style={{ marginTop: 18 }}>
        <div className="card pad">
          <h3>Low stock</h3>
          {d.lowStock.length
            ? d.lowStock.map((p) => <div className="spread rev" key={p._id}><span>{p.name}</span><span className="pill red">{p.stock} left</span></div>)
            : <p className="muted">All good.</p>}
        </div>
        <div className="card pad">
          <h3>Latest orders</h3>
          {(orders.data || []).slice(0, 5).map((o) => (
            <div className="spread rev" key={o._id}>
              <Link to={`/orders/${o._id}`}><b>{o.orderNo}</b> · {o.customer.name}</Link>
              <StatusPill status={o.status} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
