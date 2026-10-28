import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Sparkles, LogOut, LayoutDashboard, User, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = isAdminRoute
    ? [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/registrations', label: 'Registrations' },
        { to: '/admin/ambassadors', label: 'Ambassadors' },
        { to: '/admin/campaigns', label: 'Campaigns' },
      ]
    : [
        { to: '/', label: 'Workshop', hash: '' },
        { to: '/#what-youll-build', label: "What You'll Build", hash: 'what-youll-build' },
        { to: '/#how-it-works', label: 'How It Works', hash: 'how-it-works' },
        { to: '/#faq', label: 'FAQ', hash: 'faq' },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(10, 14, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
    }}>
      <div className="page-wrapper">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to={isAdminRoute ? '/admin' : '/'} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">
              NxtWave{' '}
              <span className="gradient-text">
                {isAdminRoute ? 'Admin' : 'AI Workshop'}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {(!isAuthenticated || isAdminRoute) &&
              navLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: location.pathname === link.to ? '#a78bfa' : '#cbd5e1',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseOut={(e) => {
                    if (location.pathname !== link.to)
                      e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  {link.label}
                </a>
              ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isAdmin && !isAdminRoute && (
                  <Link to="/admin" className="btn-ghost">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {!isAdminRoute && (
                  <Link to="/dashboard" className="btn-ghost">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white' }}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <button onClick={handleLogout} className="btn-ghost text-rose-400 hover:text-rose-300">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                  <span>Register Free</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{ color: '#cbd5e1' }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{
          background: 'rgba(10, 14, 26, 0.95)',
          borderColor: 'rgba(139, 92, 246, 0.1)',
        }}>
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className="block px-4 py-3 rounded-lg text-sm"
                style={{ color: '#cbd5e1' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="border-t pt-4 mt-4" style={{ borderColor: 'rgba(139, 92, 246, 0.1)' }}>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 rounded-lg text-sm"
                    style={{ color: '#a78bfa' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 inline mr-3" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-lg text-sm text-rose-400"
                  >
                    <LogOut className="w-4 h-4 inline mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-lg text-sm"
                    style={{ color: '#cbd5e1' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 mt-1 rounded-lg text-sm text-center btn-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>Register Free</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
