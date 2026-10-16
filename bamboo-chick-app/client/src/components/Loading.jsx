export default function Loading({ text = 'Loading…' }) {
  return <p className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>{text}</p>;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="error">{error.message || String(error)}</div>;
}
