import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getPasswordStrength } from '../lib/utils';
import { Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

const Signup: React.FC = () => {
  const { signup, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next') || '/onboarding';
  const refCode = searchParams.get('ref') || localStorage.getItem('referralCode') || '';

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', branch: '', graduationYear: new Date().getFullYear() + 1,
    phone: '', referralCode: refCode,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(nextUrl, { replace: true });
  }, [isAuthenticated, navigate, nextUrl]);

  const passwordStrength = getPasswordStrength(form.password);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Need an uppercase letter';
    else if (!/[a-z]/.test(form.password)) errs.password = 'Need a lowercase letter';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Need a number';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.college.trim()) errs.college = 'College is required';
    if (!form.branch.trim()) errs.branch = 'Branch/Degree is required';
    if (!agreed) errs.agreed = 'You must agree to the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({
        ...form,
        graduationYear: Number(form.graduationYear),
      });
      addToast('Account created successfully!', 'success');
      navigate(nextUrl, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Signup failed. Please try again.';
      addToast(msg, 'error');
      if (err.response?.data?.code === 'EMAIL_EXISTS') {
        setErrors({ email: 'This email is already registered' });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const benefits = [
    'Build a working AI project from scratch',
    'No prior AI experience needed',
    'Get a unique referral link to share',
    'Join a community of aspiring engineers',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-5/12 gradient-bg relative overflow-hidden flex-col justify-center p-12">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }} />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">NxtWave</span>
          </Link>

          <h2 className="text-3xl font-bold mb-4 text-white">
            Join the <span className="gradient-text">AI Revolution</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: '#cbd5e1' }}>
            Your first step toward building real AI projects starts here.
          </p>

          <div className="space-y-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm" style={{ color: '#e2e8f0' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12" style={{ background: '#0a0e1a' }}>
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">NxtWave</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create your account</h1>
            <p style={{ color: '#94a3b8' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium" style={{ color: '#a78bfa' }}>Log in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="input-label">Full Name</label>
              <input id="name" type="text" className={`input-field ${errors.name ? 'error' : ''}`}
                placeholder="John Doe" value={form.name}
                onChange={(e) => updateField('name', e.target.value)} />
              {errors.name && <p className="input-error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">Email Address</label>
              <input id="email" type="email" className={`input-field ${errors.email ? 'error' : ''}`}
                placeholder="john@college.edu" value={form.email}
                onChange={(e) => updateField('email', e.target.value)} />
              {errors.email && <p className="input-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)} />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: '#64748b' }} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(30,41,59,0.5)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(passwordStrength.score / 6) * 100}%`, background: passwordStrength.color }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && <p className="input-error">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
              <div className="relative">
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter your password" value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ color: '#64748b' }} aria-label="Toggle confirm password visibility">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="input-error">{errors.confirmPassword}</p>}
            </div>

            {/* College & Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="college" className="input-label">College Name</label>
                <input id="college" type="text" className={`input-field ${errors.college ? 'error' : ''}`}
                  placeholder="IIT Delhi" value={form.college}
                  onChange={(e) => updateField('college', e.target.value)} />
                {errors.college && <p className="input-error">{errors.college}</p>}
              </div>
              <div>
                <label htmlFor="branch" className="input-label">Branch / Degree</label>
                <input id="branch" type="text" className={`input-field ${errors.branch ? 'error' : ''}`}
                  placeholder="Computer Science" value={form.branch}
                  onChange={(e) => updateField('branch', e.target.value)} />
                {errors.branch && <p className="input-error">{errors.branch}</p>}
              </div>
            </div>

            {/* Graduation Year & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gradYear" className="input-label">Graduation Year</label>
                <select id="gradYear" className="input-field" value={form.graduationYear}
                  onChange={(e) => updateField('graduationYear', parseInt(e.target.value))}>
                  {[2025, 2026, 2027, 2028, 2029].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="input-label">Phone (Optional)</label>
                <input id="phone" type="tel" className="input-field"
                  placeholder="+91 9876543210" value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)} />
              </div>
            </div>

            {/* Referral Code */}
            {refCode && (
              <div>
                <label className="input-label">Referral Code</label>
                <input type="text" className="input-field" value={form.referralCode} readOnly
                  style={{ opacity: 0.7 }} />
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input id="terms" type="checkbox" checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((p) => ({ ...p, agreed: '' })); }}
                className="mt-1 w-4 h-4 rounded" style={{ accentColor: '#7c3aed' }} />
              <label htmlFor="terms" className="text-sm" style={{ color: '#94a3b8' }}>
                I agree to the{' '}
                <a href="#" className="underline" style={{ color: '#a78bfa' }}>Terms of Service</a> and{' '}
                <a href="#" className="underline" style={{ color: '#a78bfa' }}>Privacy Policy</a>
              </label>
            </div>
            {errors.agreed && <p className="input-error">{errors.agreed}</p>}

            {/* Submit */}
            <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> <span>Creating account...</span></>
              ) : (
                <><span>Create Account & Register</span> <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
