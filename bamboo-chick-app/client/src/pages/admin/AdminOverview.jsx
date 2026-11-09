import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { tk } from '../../utils/format.js';
import StatusPill from '../../components/StatusPill.jsx';
import Loading, { ErrorBox } from '../../components/Loading.jsx';

const STATUSES = ['Pending', 'Shipped', 'Delivered', 'Cancellation requested', 'Cancelled'];

/** "Check total website" user story */
export default function AdminOverview() {
  const { data: d, error, loading } = useFetch(() => api.overview(), []);
  const health = useFetch(() => api.settings().then(() => 'Online').catch(() => 'Offline'), []);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const totalOrders = Object.values(d.statusCounts).reduce((a, b) => a + b, 0);
  const checks = [
    ['API server', health.data || '…'],
    ['Database', 'Online'],
    ['Order slip generator', 'Online'],
    ['Email notifications', 'Planned'],
    ['Online payment (bKash)', 'Planned']
  ];

  return (
    <>
      <div className="grid g4">
        <div className="card pad kpi"><div className="l">Total revenue</div><div className="n">{tk(d.totalRevenue)}</div></div>
        <div className="card pad kpi"><div className="l">Orders</div><div className="n">{totalOrders}</div></div>
        <div className="card pad kpi"><div className="l">Products</div><div className="n">{d.productCount}</div></div>
        <div className="card pad kpi"><div className="l">Buyers</div><div className="n">{d.users.buyer || 0}</div></div>
      </div>
      <div className="grid g2" style={{ marginTop: 18 }}>
        <div className="card pad">
          <h3>System health</h3>
          {checks.map(([n, s]) => (
            <div className="spread rev" key={n}><span>{n}</span><span className={`pill ${s === 'Planned' ? 'amber' : s === 'Offline' ? 'red' : ''}`}>{s}</span></div>
          ))}
        </div>
        <div className="card pad">
          <h3>Order status</h3>
          {STATUSES.map((s) => (
            <div className="spread rev" key={s}><StatusPill status={s} /><b>{d.statusCounts[s] || 0}</b></div>
          ))}
          <div className="spread rev"><span>Reviews</span><b>{d.reviewCount} (avg {d.avgRating}★)</b></div>
        </div>
      </div>
    </>
  );
}
