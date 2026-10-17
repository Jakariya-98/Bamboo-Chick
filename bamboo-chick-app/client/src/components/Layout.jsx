import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

/** Header (desktop), bottom tab bar (phones) and footer — links change by role. */
export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const role = user?.role;

  let links;
  if (role === 'seller') links = [['/seller', 'Dashboard', '▤'], ['/', 'Store', '⌂'], ['/blog', 'Blog', '✎']];
  else if (role === 'admin') links = [['/admin', 'Admin', '⚙'], ['/', 'Store', '⌂'], ['/shop', 'Shop', '▦']];
  else {
    links = [['/', 'Home', '⌂'], ['/shop', 'Shop', '▦'], ['/blog', 'Blog', '✎']];
    if (user) links.push(['/orders', 'My orders', '☰']);
    links.push(['/cart', 'Cart', '🛒']);
  }

  const doLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <header className="top">
        <div className="wrap">
          <Link to="/" className="logo"><i />Bamboo Chick</Link>
          <nav className="main">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>
                {label}{to === '/cart' && count > 0 && <span className="badge">{count}</span>}
              </NavLink>
            ))}
            {user
              ? <button className="linkish" onClick={doLogout} title={user.email}>Log out</button>
              : <NavLink to="/login">Log in</NavLink>}
          </nav>
        </div>
      </header>

      <main><div className="wrap"><Outlet /></div></main>

      <footer>
        <div className="wrap spread">
          <span>© {new Date().getFullYear()} Bamboo Chick — natural &amp; bamboo window curtains</span>
          <span>{user ? `Signed in as ${user.name} (${user.role})` : 'CSE-412 Team 02'}</span>
        </div>
      </footer>

      <nav className="tabbar">
        {links.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'}>
            <b>{icon}</b>{label}{to === '/cart' && count > 0 ? ` (${count})` : ''}
          </NavLink>
        ))}
        {user
          ? <button onClick={doLogout}><b>⎋</b>Log out</button>
          : <NavLink to="/login"><b>☺</b>Log in</NavLink>}
      </nav>
    </>
  );
}
