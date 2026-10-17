import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Loading.jsx';

const HOME_BY_ROLE = { seller: '/seller', admin: '/admin', buyer: '/' };

/** One login page for buyers, the seller and the admin ("Admin login" story). */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(location.state?.from || HOME_BY_ROLE[user.role] || '/', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card pad" style={{ maxWidth: 420, margin: '30px auto' }}>
      <h2>Log in</h2>
      <ErrorBox error={error} />
      <form onSubmit={submit}>
        <div className="field"><label htmlFor="em">Email</label><input id="em" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        <div className="field"><label htmlFor="pw">Password</label><input id="pw" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
        <button className="btn block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="muted small" style={{ marginTop: 14 }}>New customer? <Link to="/register" state={location.state}>Create an account</Link></p>
      {import.meta.env.DEV && (
        <p className="muted small">Dev accounts (after <code>npm run seed</code>): buyer@ / seller@ / admin@bamboochick.com — passwords buyer123 / seller123 / admin123</p>
      )}
    </div>
  );
}
