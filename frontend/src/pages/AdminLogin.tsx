import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Shield, ArrowRight, Loader2 } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && isAdmin) navigate('/admin', { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.user.role !== 'admin') {
        setError('This account does not have admin privileges.');
        addToast('Access denied — not an admin account', 'error');
        return;
      }
      addToast('Welcome to the admin dashboard', 'success');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0e1a' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>NxtWave Growth Platform — Administration</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="input-label">Admin Email</label>
              <input id="admin-email" type="email" className="input-field" placeholder="admin@nxtwave.tech"
                value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div>
              <label htmlFor="admin-password" className="input-label">Password</label>
              <div className="relative">
                <input id="admin-password" type={showPassword ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)} style={{ color: '#64748b' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Authenticating...</span></> : <><span>Access Dashboard</span><ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#475569' }}>
          <Link to="/login" style={{ color: '#a78bfa' }}>← Back to user login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
