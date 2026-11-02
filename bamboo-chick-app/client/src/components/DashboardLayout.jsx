import { NavLink, Outlet } from 'react-router-dom';

/** Sidebar + content area used by the seller and admin dashboards. */
export default function DashboardLayout({ title, tabs, actions }) {
  return (
    <>
      <div className="spread"><h1>{title}</h1>{actions}</div>
      <div className="dash" style={{ marginTop: 16 }}>
        <nav className="side">
          {tabs.map(([to, label, badge]) => (
            <NavLink key={to} to={to} end>
              {label}{badge ? <span className="badge red">{badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div><Outlet /></div>
      </div>
    </>
  );
}
