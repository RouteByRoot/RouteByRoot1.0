import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/signin' }: Props) {
  const { user, loading } = useAuth();

  // Synchronously check for mock user in localStorage BEFORE the async auth state resolves.
  // This prevents a flash-redirect to login on hard refresh when the user is a demo/mock user.
  const mockUserStr = localStorage.getItem('routebyroot_mock_user');
  const mockUser = (() => {
    try { return mockUserStr ? JSON.parse(mockUserStr) : null; } catch { return null; }
  })();

  const effectiveUser = user || mockUser;

  if (loading && !effectiveUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--gray-50)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!effectiveUser) return <Navigate to={redirectTo} replace />;

  if (allowedRoles && !allowedRoles.includes(effectiveUser.role)) {
    const roleHome = effectiveUser.role === 'admin' ? '/admin/dashboard' : effectiveUser.role === 'guide' ? '/guide/dashboard' : '/dashboard';
    return <Navigate to={roleHome} replace />;
  }

  return <>{children}</>;
}
