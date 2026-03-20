import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ADMIN_LOGIN_PATH } from '../../lib/adminPortalRoutes';

function LoadingView() {
  return (
    <div className="admin-shell">
      <div className="admin-loading">
        <div>
          <div className="admin-loading-spinner" />
          <p>Checking your admin session...</p>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedAdminRoute() {
  const location = useLocation();
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return <LoadingView />;
  }

  if (!isAdmin) {
    return (
      <Navigate
        to={ADMIN_LOGIN_PATH}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
