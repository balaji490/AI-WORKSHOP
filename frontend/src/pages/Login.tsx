import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      addToast('Welcome back!', 'success');
      navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err: any) {
      let msg = err.response?.data?.error;
      if (!msg) {
        if (!err.response) {
          msg = 'Unable to reach backend server. Please verify the backend is running.';
        } else {
          msg = 'Invalid email or password';
        }
      }
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 gradient-bg relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.4), transparent 70%)' }} />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">NxtWave</span>
          </Link>

          <h2 className="text-3xl font-bold mb-4 text-white">
            Welcome <span className="gradient-text">Back</span>
          </h2>
          <p className="text-lg" style={{ color: '#cbd5e1' }}>
            Log in to access your dashboard, check your referral stats, and prepare for the workshop.
          </p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12" style={{ background: '#0a0e1a' }}>
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">NxtWave</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Log in to your account</h1>
            <p style={{ color: '#94a3b8' }}>
              New here?{' '}
              <Link to="/signup" className="font-medium" style={{ color: '#a78bfa' }}>Create an account</Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="login-email" className="input-label">Email Address</label>
              <input id="login-email" type="email" className="input-field"
                placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="input-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" className="text-xs font-medium" style={{ color: '#a78bfa' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input id="login-password" type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10" placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: '#64748b' }} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> <span>Logging in...</span></>
              ) : (
                <><span>Log In</span> <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl text-center" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)' }}>
            <p className="text-xs" style={{ color: '#64748b' }}>
              Admin access? <Link to="/admin/login" style={{ color: '#a78bfa' }}>Use the admin login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
