import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../auth/useSession';

export default function RequireSession() {
  const { session, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return <div className="workspace-loading" role="status" aria-label="Restoring session"><span /><span /><span /></div>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
