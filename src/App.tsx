import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ListingsProvider } from './contexts/ListingsContext';
import { BookingsProvider } from './contexts/BookingsContext';
import { ChatProvider } from './contexts/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages (lazy loaded for performance)
const HomePage        = React.lazy(() => import('./pages/HomePage'));
const SignInPage      = React.lazy(() => import('./pages/auth/SignInPage'));
const SignUpPage      = React.lazy(() => import('./pages/auth/SignUpPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const AdminLogin      = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard  = React.lazy(() => import('./pages/admin/AdminDashboard'));
const CustomerDashboard = React.lazy(() => import('./pages/customer/CustomerDashboard'));
const GuideDashboard  = React.lazy(() => import('./pages/guide/GuideDashboard'));
const NotFoundPage    = React.lazy(() => import('./pages/NotFoundPage'));
import { hydrateFromSupabase } from './lib/supabaseSync';

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>
    <div className="spinner" />
  </div>
);

function App() {
  React.useEffect(() => {
    hydrateFromSupabase();
  }, []);

  return (
    <AuthProvider>
      <ListingsProvider>
        <BookingsProvider>
          <ChatProvider>
            <BrowserRouter>
        <React.Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/"           element={<HomePage />} />
            <Route path="/signin"     element={<SignInPage />} />
            <Route path="/signup"     element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes */}
            <Route path="/1234/admin"           element={<AdminLogin />} />
            <Route path="/admin/login"          element={<AdminLogin />} />
            <Route path="/admin/dashboard"      element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Traveler Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['traveler']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />

            {/* Guide Routes */}
            <Route path="/guide/dashboard" element={
              <ProtectedRoute allowedRoles={['guide', 'admin']}>
                <GuideDashboard />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="/404"          element={<NotFoundPage />} />
            <Route path="/unauthorized" element={<NotFoundPage />} />
            <Route path="*"             element={<Navigate to="/404" replace />} />
          </Routes>
        </React.Suspense>
            </BrowserRouter>
          </ChatProvider>
        </BookingsProvider>
      </ListingsProvider>
    </AuthProvider>
  );
}

export default App;
