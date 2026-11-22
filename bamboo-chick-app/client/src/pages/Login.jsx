import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Loading.jsx';
import '../styles/login.css';

const HOME_BY_ROLE = { seller: '/seller', admin: '/admin', buyer: '/' };

const ROLES = [
  { value: 'buyer', label: 'Buyer', hint: 'Shop and manage orders', icon: '◌' },
  { value: 'seller', label: 'Seller', hint: 'Manage your storefront', icon: '↗' },
  { value: 'admin', label: 'Admin', hint: 'Access platform controls', icon: '◆' }
];

/** One login page for buyers, the seller and the admin ("Admin login" story). */
export default function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  // New design only: highlights the account-type tile. Login itself is unchanged.
  const [role, setRole] = useState('buyer');
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      // The selected account type must match the real role of the account.
      if (user.role !== role) {
        logout();
        const chosen = ROLES.find((r) => r.value === role).label;
        setError(new Error(`This is not a ${chosen} account. Please select the correct account type.`));
        return;
      }
      navigate(location.state?.from || HOME_BY_ROLE[user.role] || '/', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lg-page">
      <div className="lg-auth-shell">
        <section className="lg-visual-panel" aria-label="Bamboo Chick welcome panel">
          <div className="lg-visual-topline">
            <Link className="lg-brand lg-brand-light" to="/" aria-label="Bamboo Chick home">
              <img src="/Bamboo-Chick-logo.png" alt="Bamboo Chick" />
            </Link>
            <Link className="lg-back-link" to="/">Back to website <span aria-hidden="true">→</span></Link>
          </div>

          <div className="lg-scene" aria-hidden="true">
            <div className="lg-orb lg-orb-one" />
            <div className="lg-orb lg-orb-two" />
            <div className="lg-ring lg-ring-one" />
            <div className="lg-ring lg-ring-two" />
          </div>

          <div className="lg-visual-copy">
            <p className="lg-eyebrow">Bamboo Chick</p>
            <h1>Capturing Moments,<br /><em>Creating Memories</em></h1>
            <div className="lg-slide-indicator" aria-label="Slide 1 of 3"><span /><span /><span className="lg-active" /></div>
          </div>
        </section>

        <section className="lg-form-panel">
          <div className="lg-form-wrap">
            <div className="lg-mobile-brand">
              <Link className="lg-brand" to="/" aria-label="Bamboo Chick home"><img src="/Bamboo-Chick-logo.png" alt="Bamboo Chick" /></Link>
            </div>
            <div className="lg-form-heading">
              <p className="lg-eyebrow">Welcome back</p>
              <h2>Sign in to<br /><span>your account</span></h2>
              <p className="lg-heading-copy">Choose your account type to continue securely.</p>
            </div>

            <ErrorBox error={error} />
            <form onSubmit={submit}>
              <fieldset className="lg-role-picker">
                <legend>Account type</legend>
                {ROLES.map((r) => (
                  <label key={r.value} className={`lg-role-option${role === r.value ? ' lg-selected' : ''}`}>
                    <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
                    <span className="lg-role-icon">{r.icon}</span>
                    <span><strong>{r.label}</strong><small>{r.hint}</small></span>
                    <span className="lg-radio-dot" />
                  </label>
                ))}
              </fieldset>

              <div className="lg-field-group">
                <label htmlFor="em">Email address</label>
                <input id="em" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="lg-field-group">
                <div className="lg-label-row"><label htmlFor="pw">Password</label></div>
                <div className="lg-password-field">
                  <input id="pw" type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button className="lg-password-toggle" type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((v) => !v)}>{showPw ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <button className="lg-submit-button" disabled={busy}>{busy ? 'Logging in…' : <>Continue <span aria-hidden="true">→</span></>}</button>
            </form>

            <p className="lg-signup-prompt">New customer? <Link className="lg-text-button" to="/register" state={location.state}>Create an account</Link></p>
            {import.meta.env.DEV && (
              <p className="lg-security-note">Dev accounts (after npm run seed): buyer@ / seller@ / admin@bamboochick.com — passwords buyer123 / seller123 / admin123</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}