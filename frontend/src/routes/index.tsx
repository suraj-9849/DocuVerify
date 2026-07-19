import { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PageSpinner } from '@/components/layout/PageSpinner';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DocumentDetailPage = lazy(() => import('@/pages/DocumentDetailPage'));
const CreateDocumentPage = lazy(() => import('@/pages/CreateDocumentPage'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function withSuspense(node: React.ReactNode) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSpinner />}>{node}</Suspense>
    </ErrorBoundary>
  );
}

const router = createHashRouter([
  { path: '/', element: withSuspense(<LandingPage />) },
  { path: '/login', element: withSuspense(<LoginPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          { path: '/dashboard', element: withSuspense(<DashboardPage />) },
          { path: '/documents/:id', element: withSuspense(<DocumentDetailPage />) },
          {
            element: <ProtectedRoute allowedRoles={['AUTHOR']} />,
            children: [{ path: '/documents/new', element: withSuspense(<CreateDocumentPage />) }],
          },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [{ path: '/admin/users', element: withSuspense(<AdminUsersPage />) }],
          },
          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
