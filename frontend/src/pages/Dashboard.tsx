import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registrationAPI, referralAPI, workshopAPI } from '../lib/api';
import { getReferralUrl, copyToClipboard, getWhatsAppShareUrl, formatDate } from '../lib/utils';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Copy, Share2, MessageCircle, Users, Trophy, Link2,
  Calendar, Clock, Sparkles, TrendingUp, User, GraduationCap, Mail,
  Edit3, ExternalLink
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [registration, setRegistration] = useState<any>(null);
  const [workshop, setWorkshop] = useState<any>(null);
  const [referralData, setReferralData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'profile'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, refRes, wsRes, lbRes] = await Promise.allSettled([
          registrationAPI.getMyStatus(),
          referralAPI.getMyReferrals(),
          workshopAPI.getAll(),
          referralAPI.getLeaderboard(),
        ]);
        if (regRes.status === 'fulfilled') setRegistration(regRes.value.data.registration);
        if (refRes.status === 'fulfilled') setReferralData(refRes.value.data);
        if (wsRes.status === 'fulfilled' && wsRes.value.data.workshops?.length)
          setWorkshop(wsRes.value.data.workshops[0]);
        if (lbRes.status === 'fulfilled') setLeaderboard(lbRes.value.data.leaderboard);
      } catch { /* handled by settled */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const referralUrl = user?.referralCode ? getReferralUrl(user.referralCode) : '';

  const handleCopy = async () => {
    await copyToClipboard(referralUrl);
    setCopied(true);
    addToast('Referral link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `Hey! 🚀 Check out this free AI Workshop — "Build Your First AI Project in 60 Minutes." Register here: ${referralUrl}`;
    window.open(getWhatsAppShareUrl(text), '_blank');
  };

  const stats = [
    {
      label: 'Registration',
      value: registration ? 'Confirmed' : 'Pending',
      icon: CheckCircle2,
      color: registration ? '#10b981' : '#f59e0b',
    },
    {
      label: 'Referrals Made',
      value: referralData?.completedReferrals ?? 0,
      icon: Users,
      color: '#8b5cf6',
    },
    {
      label: 'Conversion Rate',
      value: referralData?.conversionRate ? `${referralData.conversionRate}%` : '—',
      icon: TrendingUp,
      color: '#22d3ee',
    },
    {
      label: 'Total Referred',
      value: referralData?.totalReferrals ?? 0,
      icon: Link2,
      color: '#6366f1',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="space-y-6 pt-8">
            <div className="skeleton h-12 w-64" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
            </div>
            <div className="skeleton h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="pt-8 pb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Here's your workshop dashboard
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(15,23,42,0.5)' }}>
          {(['overview', 'referrals', 'profile'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background: activeTab === tab ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: activeTab === tab ? '#a78bfa' : '#64748b',
                border: activeTab === tab ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Workshop Card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">
                    {workshop?.title || 'Build Your First AI Project in 60 Minutes'}
                  </h3>
                  <span className={`badge ${registration ? 'badge-emerald' : 'badge-amber'}`}>
                    {registration ? 'Registered' : 'Not Registered'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <Sparkles className="w-6 h-6 text-violet-400" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm" style={{ color: '#e2e8f0' }}>
                    {workshop?.scheduledDate
                      ? formatDate(workshop.scheduledDate)
                      : 'Schedule to be announced'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm" style={{ color: '#e2e8f0' }}>
                    {workshop?.duration || 60} minutes — Online
                  </span>
                </div>
              </div>

              {workshop?.joinLink && (
                <a href={workshop.joinLink} target="_blank" rel="noopener noreferrer"
                  className="btn-primary w-full py-3">
                  <span>Join Workshop</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>

            {/* Referral Sharing */}
            <div className="glass-card p-6 glow-violet">
              <h3 className="font-semibold text-white mb-2">Your Referral Link</h3>
              <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
                Share this link with classmates. You'll get credit when they register.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <input type="text" className="input-field text-sm font-mono" value={referralUrl} readOnly />
                <button onClick={handleCopy} className="btn-secondary shrink-0 px-4 py-2.5">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={handleWhatsApp} className="btn-primary flex-1 py-2.5"
                  style={{ background: '#25D366' }}>
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'AI Workshop', text: 'Free AI Workshop!', url: referralUrl });
                  } else { handleCopy(); }
                }} className="btn-secondary flex-1 py-2.5">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Referral Activity */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Your Referral Activity</h3>
              {referralData?.referrals?.length > 0 ? (
                <div className="space-y-3">
                  {referralData.referrals.map((ref: any) => (
                    <div key={ref.id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(139,92,246,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white' }}>
                          {ref.referredUser?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{ref.referredUser?.name || 'Unknown'}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>
                            {ref.referredUser?.college} • {formatDate(ref.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`badge ${ref.status === 'completed' ? 'badge-emerald' : 'badge-amber'}`}>
                        {ref.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#334155' }} />
                  <p className="text-sm font-medium text-white mb-1">No referrals yet</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Share your referral link to start getting credits
                  </p>
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">Referral Leaderboard</h3>
              </div>
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((entry: any) => (
                    <div key={entry.rank} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(139,92,246,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: entry.rank <= 3
                              ? 'linear-gradient(135deg, #f59e0b, #eab308)'
                              : 'rgba(100,116,139,0.2)',
                            color: entry.rank <= 3 ? '#1a1a2e' : '#94a3b8',
                          }}>
                          #{entry.rank}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{entry.displayName}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{entry.college}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>
                        {entry.referralCount} referral{entry.referralCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Leaderboard will appear once referrals start coming in
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-lg">Your Profile</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: User, label: 'Name', value: user?.name },
                { icon: Mail, label: 'Email', value: user?.email, extra: user?.emailVerified ? '(Verified)' : '(Unverified)' },
                { icon: GraduationCap, label: 'College', value: user?.college },
                { icon: GraduationCap, label: 'Branch', value: user?.branch },
                { icon: Calendar, label: 'Graduation Year', value: user?.graduationYear },
                { icon: Link2, label: 'Referral Code', value: user?.referralCode },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: 'rgba(15,23,42,0.5)' }}>
                  <item.icon className="w-4 h-4 text-violet-400 shrink-0" />
                  <div>
                    <p className="text-xs" style={{ color: '#64748b' }}>{item.label}</p>
                    <p className="text-sm text-white">
                      {item.value}{' '}
                      {item.extra && (
                        <span className={`text-xs ${user?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {item.extra}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
