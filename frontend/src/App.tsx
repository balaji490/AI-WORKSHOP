import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Background from './components/Background';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ReferralRedirect from './pages/ReferralRedirect';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminAmbassadors from './pages/AdminAmbassadors';
import AdminCampaigns from './pages/AdminCampaigns';

const AppLayout: React.FC = () => {
  const location = useLocation();

  // Hide default navbar/footer on auth pages (they have their own layout)
  const authPages = ['/signup', '/login', '/admin/login'];
  const isAuthPage = authPages.some(p => location.pathname.startsWith(p));

  return (
    <>
    <Background />
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/r/:code" element={<ReferralRedirect />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected user routes */}
          <Route path="/onboarding" element={
            <ProtectedRoute><Onboarding /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Protected admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/registrations" element={
            <ProtectedRoute requiredRole="admin"><AdminRegistrations /></ProtectedRoute>
          } />
          <Route path="/admin/ambassadors" element={
            <ProtectedRoute requiredRole="admin"><AdminAmbassadors /></ProtectedRoute>
          } />
          <Route path="/admin/campaigns" element={
            <ProtectedRoute requiredRole="admin"><AdminCampaigns /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
              <div className="text-center">
                <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
                <p className="text-lg mb-6" style={{ color: '#94a3b8' }}>Page not found</p>
                <a href="/" className="btn-primary"><span>Go Home</span></a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
