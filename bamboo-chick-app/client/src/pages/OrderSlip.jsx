import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import { tk, date, AREA_LABEL } from '../utils/format.js';
import StatusPill from '../components/StatusPill.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

/** "Receive generated order slip with a delivery date" — buyer and seller both use this page. */
export default function OrderSlip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: o, error, loading } = useFetch(() => api.order(id), [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const t = o.pricing;

  return (
    <div className="slip">
      <div className="hd">
        <div>
          <div className="logo" style={{ fontSize: 20 }}><i />Bamboo Chick</div>
          <div className="muted small">Order slip</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <b>{o.orderNo}</b>
          <div className="muted small">Placed {date(o.createdAt)}</div>
          <StatusPill status={o.status} />
        </div>
      </div>

      <div className="grid g2" style={{ fontSize: 14, marginBottom: 12 }}>
        <div>
          <label>Deliver to</label>
          {o.customer.name}<br />{o.customer.phone}<br />{o.customer.address}
        </div>
        <div>
          <label>Estimated delivery</label>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>{date(o.deliveryDate)}</div>
          <span className="muted">{AREA_LABEL[o.customer.area]}</span>
        </div>
      </div>

      <div className="tablewrap">
        <table>
          <thead><tr><th>Item</th><th>Size</th><th>Qty</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            {o.items.map((i, k) => (
              <tr key={k}><td>{i.name}</td><td>{i.sizeLabel}</td><td>{i.qty}</td><td style={{ textAlign: 'right' }}>{tk(i.unitPrice * i.qty)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sum" style={{ marginTop: 10, fontSize: 14 }}>
        <div><span>Subtotal</span><span>{tk(t.subtotal)}</span></div>
        {t.discount > 0 && <div><span>Discount ({t.discountPct}%)</span><span>−{tk(t.discount)}</span></div>}
        <div><span>VAT ({t.vatRate}%)</span><span>{tk(t.vat)}</span></div>
        {t.installation > 0 && <div><span>Installation + VAT</span><span>{tk(t.installation + t.installationVat)}</span></div>}
        <div><span>Delivery</span><span>{tk(t.delivery)}</span></div>
        <div className="tot"><span>Total (cash on delivery)</span><span>{tk(t.total)}</span></div>
      </div>
      {o.cancelReason && <p className="muted small">Cancellation reason: {o.cancelReason}</p>}

      <div className="row noprint" style={{ marginTop: 16 }}>
        <button className="btn sm" onClick={() => window.print()}>Print / save PDF</button>
        <button className="btn ghost sm" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}
