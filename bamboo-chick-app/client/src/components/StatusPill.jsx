const COLOURS = { Pending: 'amber', Shipped: '', Delivered: '', 'Cancellation requested': 'red', Cancelled: 'grey' };

export default function StatusPill({ status }) {
  return <span className={`pill ${COLOURS[status] ?? ''}`}>{status}</span>;
}
