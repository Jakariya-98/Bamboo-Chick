import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Loading.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card pad" style={{ maxWidth: 480, margin: '30px auto' }}>
      <h2>Create an account</h2>
      <ErrorBox error={error} />
      <form onSubmit={submit}>
        <div className="field"><label htmlFor="rn">Full name</label><input id="rn" value={form.name} onChange={set('name')} required /></div>
        <div className="field"><label htmlFor="re">Email</label><input id="re" type="email" value={form.email} onChange={set('email')} required /></div>
        <div className="grid g2">
          <div className="field"><label htmlFor="rp">Phone</label><input id="rp" value={form.phone} onChange={set('phone')} /></div>
          <div className="field"><label htmlFor="rw">Password</label><input id="rw" type="password" minLength={6} value={form.password} onChange={set('password')} required /></div>
        </div>
        <div className="field"><label htmlFor="ra">Address</label><textarea id="ra" rows={2} value={form.address} onChange={set('address')} /></div>
        <button className="btn block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted small" style={{ marginTop: 14 }}>Already have an account? <Link to="/login" state={location.state}>Log in</Link></p>
    </div>
  );
}
