import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';
import { PageSpinner } from './PageSpinner';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

// Client-side gating is purely a UX convenience (skip the flash of a page
// the user can't use) — it is NOT the security boundary. The server
// enforces every permission independently; hiding a route here does not
// substitute for that.
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
