import { useState } from 'react';
import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { tk } from '../../utils/format.js';
import Loading, { ErrorBox } from '../../components/Loading.jsx';

const thisMonth = () => new Date().toISOString().slice(0, 7);

/** "Monthly product sales report" user story */
export default function SellerReport() {
  const [month, setMonth] = useState(thisMonth());
  const { data, error, loading } = useFetch(() => api.monthlyReport(month), [month]);
  const max = Math.max(1, ...(data?.products || []).map((p) => p.revenue));

  return (
    <div className="card pad">
      <div className="spread">
        <h3>Product sales report</h3>
        <div className="row noprint">
          <input type="month" style={{ width: 'auto' }} value={month} onChange={(e) => setMonth(e.target.value)} />
          <button className="btn ghost sm" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        <>
          <p className="muted" style={{ marginTop: 0 }}>
            {data.month} · {data.orders} orders · {tk(data.productRevenue)} product revenue · {tk(data.grossTotal)} collected incl. VAT &amp; delivery · cancelled orders excluded
          </p>
          {data.products.length === 0 ? <p className="muted">No sales in this month.</p> : (
            <>
              <div className="bars">
                {data.products.map((p) => (
                  <div className="bar" key={p.productId}>
                    <span>{p.name}</span>
                    <div className="t"><i style={{ width: `${(p.revenue / max) * 100}%` }} /></div>
                    <b style={{ textAlign: 'right' }}>{tk(p.revenue)}</b>
                  </div>
                ))}
              </div>
              <div className="tablewrap" style={{ marginTop: 18 }}>
                <table>
                  <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th><th>Share</th></tr></thead>
                  <tbody>
                    {data.products.map((p) => (
                      <tr key={p.productId}><td>{p.name}</td><td>{p.unitsSold}</td><td>{tk(p.revenue)}</td><td>{p.share}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
