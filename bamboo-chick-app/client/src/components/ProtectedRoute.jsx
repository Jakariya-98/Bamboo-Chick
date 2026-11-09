import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from './Loading.jsx';

/** <ProtectedRoute roles={['seller','admin']}> … </ProtectedRoute> */
export default function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) {
    return <div className="card pad empty"><h2>No access</h2><p className="muted">This page is for {roles.join(' / ')} accounts.</p></div>;
  }
  return children;
}
