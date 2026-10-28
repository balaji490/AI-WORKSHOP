import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registrationAPI, workshopAPI } from '../lib/api';
import { getReferralUrl, copyToClipboard, getWhatsAppShareUrl } from '../lib/utils';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Copy, Share2, MessageCircle, ArrowRight, Sparkles,
  Calendar, Clock, Laptop, BookOpen, Loader2
} from 'lucide-react';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'confirmed'>('welcome');
  const [loading, setLoading] = useState(false);
  const [workshop, setWorkshop] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if already registered
        const { data: statusData } = await registrationAPI.getMyStatus();
        if (statusData.registered) {
          setRegistration(statusData.registration);
          setStep('confirmed');
        }
        // Get workshop
        const { data: wsData } = await workshopAPI.getAll();
        if (wsData.workshops?.length) setWorkshop(wsData.workshops[0]);
      } catch {
        // Workshop may not be set up yet
      }
    };
    init();
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const referralCode = localStorage.getItem('referralCode') || undefined;
      const channel = localStorage.getItem('channel') || 'direct';
      const { data } = await registrationAPI.register({
        workshopId: workshop?._id,
        channel,
        referralCode,
      });
      setRegistration(data.registration);
      setStep('confirmed');
      addToast('Successfully registered! 🎉', 'success');
      localStorage.removeItem('referralCode');
      localStorage.removeItem('channel');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setStep('confirmed');
        const { data } = await registrationAPI.getMyStatus();
        if (data.registration) setRegistration(data.registration);
      } else {
        addToast(err.response?.data?.error || 'Registration failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = user?.referralCode ? getReferralUrl(user.referralCode) : '';

  const handleCopy = async () => {
    await copyToClipboard(referralUrl);
    setCopied(true);
    addToast('Referral link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `Hey! 🚀 I just registered for a free AI Workshop — "Build Your First AI Project in 60 Minutes." It's perfect for engineering students. Register here: ${referralUrl}`;
    window.open(getWhatsAppShareUrl(text), '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NxtWave AI Workshop',
          text: 'Build Your First AI Project in 60 Minutes — Free workshop!',
          url: referralUrl,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  const prepChecklist = [
    { icon: Laptop, text: 'Have a laptop with a web browser ready' },
    { icon: BookOpen, text: 'No prior AI experience needed' },
    { icon: Calendar, text: 'Block 60 minutes on your calendar' },
    { icon: Sparkles, text: 'Come with an open mind and curiosity' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {step === 'welcome' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold mb-3 text-white">
              Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-lg mb-8" style={{ color: '#94a3b8' }}>
              You're one step closer to building your first AI project.
            </p>

            <div className="glass-card p-6 mb-8 text-left">
              <h3 className="font-semibold text-white mb-4">Workshop Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-sm" style={{ color: '#e2e8f0' }}>
                    {workshop?.title || 'Build Your First AI Project in 60 Minutes'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm" style={{ color: '#e2e8f0' }}>
                    {workshop?.scheduledDate
                      ? new Date(workshop.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Schedule to be announced'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm" style={{ color: '#e2e8f0' }}>
                    {workshop?.duration || 60} minutes — Free & Online
                  </span>
                </div>
              </div>
            </div>

            <button onClick={handleRegister} className="btn-primary text-base px-10 py-3.5" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> <span>Confirming...</span></>
              ) : (
                <><span>Confirm My Registration</span> <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </motion.div>
        )}

        {step === 'confirmed' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Success header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold mb-2 text-white">You're Registered! 🎉</h1>
              <p className="text-lg" style={{ color: '#94a3b8' }}>
                Your seat is confirmed, {user?.name?.split(' ')[0]}.
              </p>
            </div>

            {/* Prep checklist */}
            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-white mb-4">How to Prepare</h3>
              <div className="space-y-3">
                {prepChecklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="text-sm" style={{ color: '#e2e8f0' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral sharing */}
            <div className="glass-card p-6 mb-6 glow-violet">
              <h3 className="font-semibold text-white mb-2">Share with Friends</h3>
              <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
                Invite classmates using your unique referral link. Track your referrals on the dashboard.
              </p>

              <div className="flex items-center gap-2 mb-4">
                <input type="text" className="input-field text-sm" value={referralUrl} readOnly />
                <button onClick={handleCopy} className="btn-secondary shrink-0 px-4 py-2.5">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleWhatsApp} className="btn-primary flex-1 py-2.5"
                  style={{ background: '#25D366' }}>
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
                <button onClick={handleNativeShare} className="btn-secondary flex-1 py-2.5">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Go to dashboard */}
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full py-3.5 text-base">
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
