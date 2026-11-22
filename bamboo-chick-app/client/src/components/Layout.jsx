import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

/** Announcement bar, header, footer and the phone tab bar — links change by role. */
export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = user?.role;
  const isHome = pathname === '/';

  // Phone tab bar (icons) — unchanged behaviour
  let links;
  if (role === 'seller') links = [['/seller', 'Dashboard', '▤'], ['/', 'Store', '⌂'], ['/blog', 'Blog', '✎']];
  else if (role === 'admin') links = [['/admin', 'Admin', '⚙'], ['/', 'Store', '⌂'], ['/shop', 'Shop', '▦'], ['/manufacturer', 'Manufacturer', '⚒']];
  else {
    links = [['/', 'Home', '⌂'], ['/shop', 'Shop', '▦'], ['/manufacturer', 'Manufacturer', '⚒'], ['/blog', 'Blog', '✎']];
    if (user) links.push(['/orders', 'My orders', '☰']);
    if (user?.role === 'buyer') links.push(['/profile', 'My profile', '👤']);
    links.push(['/cart', 'Cart', '🛒']);
  }

  // Desktop header links (same destinations, labelled as in the design)
  let navLinks;
  if (role === 'seller') navLinks = [['/seller', 'Dashboard'], ['/', 'Store'], ['/blog', 'Journal']];
  else if (role === 'admin') navLinks = [['/admin', 'Admin'], ['/', 'Store'], ['/shop', 'Collection'], ['/manufacturer', 'Our craft']];
  else {
    navLinks = [['/shop', 'Collection'], ['/manufacturer', 'Our craft'], ['/blog', 'Journal']];
    if (user) navLinks.push(['/orders', 'My orders']);
    if (user?.role === 'buyer') navLinks.push(['/profile', 'My profile']);
  }
  const showBag = role !== 'seller' && role !== 'admin';

  const portal = role === 'seller' ? ['/seller', 'Dashboard'] : role === 'admin' ? ['/admin', 'Admin'] : ['/login', 'Seller login'];

  const doLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <div className={`site-top${isHome ? ' home' : ''}`}>
      <div className="announce">Complimentary material samples with every design consultation</div>

      <header className={`top${isHome ? ' over' : ''}`}>
        <div className="wrap">
          <Link to="/" className="logo">Bamboo Chick</Link>
          <nav className="main" aria-label="Main">
            {navLinks.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
          </nav>
          <div className="head-actions">
            {user
              ? <button className="linkish" onClick={doLogout} title={user.email}>Log out</button>
              : <NavLink to="/login" className="login-link">Log in</NavLink>}
            {showBag && (
              <NavLink to="/cart" className="bag">
                Bag{count > 0 && <span className="badge">{count}</span>}
              </NavLink>
            )}
          </div>
        </div>
      </header>
      </div>

      <main className={isHome ? 'home' : ''}>
        {isHome ? <Outlet /> : <div className="wrap"><Outlet /></div>}
      </main>

      <footer>
        <div className="container foot-grid">
          <div>
            <p className="foot-logo">Bamboo Chick</p>
            <p className="foot-copy">Natural window treatments for thoughtful homes.</p>
          </div>
          <div className="foot-links">
            <div>
              <Link to="/shop">Collection</Link>
              <Link to="/manufacturer">Our craft</Link>
              <Link to="/blog">Journal</Link>
            </div>
            <div>
              <Link to="/">Home</Link>
              {role === 'buyer' && <Link to="/orders">My orders</Link>}
              <Link to={portal[0]}>{portal[1]}</Link>
            </div>
          </div>
          <div>
            <p className="foot-head">Trade &amp; care</p>
            <p className="foot-copy">Sellers manage inventory, orders, reviews, offers, and reports from the secure trade portal.</p>
          </div>
        </div>
        <div className="container foot-base">
          <span>© {new Date().getFullYear()} Bamboo Chick</span>
          <span>{user ? `Signed in as ${user.name} (${user.role})` : 'Crafted naturally'}</span>
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