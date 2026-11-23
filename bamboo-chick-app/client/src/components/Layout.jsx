import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

/** Announcement bar, header, footer and the phone tab bar — links change by role. */
export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  const role = user?.role;
  const isHome = pathname === '/';

  // Sync header search input with URL query
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/shop?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/shop');
    }
  };

  // Phone tab bar (icons)
  let links;
  if (role === 'seller') links = [['/seller', 'Dashboard', '▤'], ['/', 'Store', '⌂'], ['/blog', 'Blog', '✎']];
  else if (role === 'admin') links = [['/admin', 'Admin', '⚙'], ['/', 'Store', '⌂'], ['/shop', 'Shop', '▦'], ['/manufacturer', 'Manufacturer', '⚒']];
  else {
    links = [
      ['/', 'Home', '⌂'],
      ['/shop', 'Shop', '▦'],
      ['/customize', 'Customize', '✂'],
      ['/manufacturer', 'Manufacturer', '⚒'],
      ['/blog', 'Blog', '✎'],
    ];
    if (user) links.push(['/orders', 'My orders', '☰']);
    links.push(['/cart', 'Cart', '🛒']);
  }

  // Desktop header links
  let navLinks;
  if (role === 'seller') navLinks = [['/seller', 'Dashboard'], ['/', 'Store'], ['/blog', 'Journal']];
  else if (role === 'admin') navLinks = [['/admin', 'Admin'], ['/', 'Store'], ['/shop', 'Collection'], ['/manufacturer', 'Our craft']];
  else {
    navLinks = [
      ['/shop', 'Collection'],
      ['/customize', 'Customize'],
      ['/manufacturer', 'Our craft'],
      ['/blog', 'Journal'],
    ];
    if (user) navLinks.push(['/orders', 'My orders']);
  }
  const showBag = role !== 'seller' && role !== 'admin';

  const portal = role === 'seller' ? ['/seller', 'Dashboard'] : role === 'admin' ? ['/admin', 'Admin'] : ['/login', 'Seller login'];

  const doLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <div className={`site-top${isHome ? ' home' : ''}`}>
        <div className="announce">Complimentary material samples with every design consultation</div>

        <header className={`top${isHome ? ' over' : ''}`}>
          <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/" className="logo">Bamboo Chick</Link>

            <nav className="main" aria-label="Main">
              {navLinks.map(([to, label]) => (
                <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
              ))}
            </nav>

            {/* Global Search Bar */}
            <form onSubmit={handleSearch} role="search" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search curtains..."
                aria-label="Search curtains"
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  minWidth: '170px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#222'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#2c4c3b',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Search
              </button>
            </form>

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
              <Link to="/customize">Customize Order</Link>
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