import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  Users, Target, TrendingUp, DollarSign, Calendar, ArrowUpRight,
  BarChart3, PieChart as PieIcon, Sparkles, Clock, ChevronRight
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#ec4899', '#64748b'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [channelData, setChannelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, dailyRes, channelRes] = await Promise.allSettled([
          adminAPI.getStats(),
          adminAPI.getDailyAnalytics(7),
          adminAPI.getChannelAnalytics(),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (dailyRes.status === 'fulfilled') setDailyData(dailyRes.value.data.daily || []);
        if (channelRes.status === 'fulfilled') setChannelData(channelRes.value.data.channels || []);
      } catch { /* handled */ }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const campaignTimeline = [
    { day: 'Day 1', activity: 'Setup and outreach preparation', status: 'planned' },
    { day: 'Day 2', activity: 'Launch with student ambassadors', status: 'planned' },
    { day: 'Day 3', activity: 'Activate college communities', status: 'planned' },
    { day: 'Day 4', activity: 'Expand peer referrals', status: 'planned' },
    { day: 'Day 5', activity: 'Review channel performance', status: 'planned' },
    { day: 'Day 6', activity: 'Focus on best-performing channels', status: 'planned' },
    { day: 'Day 7', activity: 'Final reminder and campaign report', status: 'planned' },
  ];

  const summaryCards = stats ? [
    { label: 'Total Registrations', value: stats.totalRegistrations, icon: Users, color: '#8b5cf6', sub: `${stats.registrationsToday} today` },
    { label: 'Target Progress', value: `${stats.progressPercent}%`, icon: Target, color: '#22d3ee', sub: `${stats.remaining} remaining of ${stats.target}` },
    { label: 'Budget Spent', value: `₹${stats.actualSpend}`, icon: DollarSign, color: '#f59e0b', sub: `₹${stats.remainingBudget} remaining` },
    { label: 'Cost per Registration', value: stats.costPerRegistration === 'N/A' ? 'N/A' : `₹${stats.costPerRegistration}`, icon: TrendingUp, color: '#10b981', sub: `Total budget ₹${stats.budget}` },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
        <div className="page-wrapper">
          <div className="skeleton h-10 w-72" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="skeleton h-80 rounded-xl" />
            <div className="skeleton h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
      <div className="page-wrapper">
        {/* Header */}
        <div className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Growth <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Campaign overview and analytics</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/registrations" className="btn-secondary text-sm py-2 px-4">
              <Users className="w-4 h-4" /> Registrations
            </Link>
            <Link to="/admin/campaigns" className="btn-primary text-sm py-2 px-4">
              <span>Campaigns</span> <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.color}15` }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <ArrowUpRight className="w-4 h-4" style={{ color: '#475569' }} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{card.value}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{card.label}</div>
              <div className="text-xs mt-1" style={{ color: '#475569' }}>{card.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        {stats && (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Registration Progress</h3>
              <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>
                {stats.totalRegistrations} / {stats.target}
              </span>
            </div>
            <div className="progress-bar h-3">
              <div className="progress-fill" style={{ width: `${Math.min(100, stats.progressPercent)}%` }} />
            </div>
            <p className="text-xs mt-2" style={{ color: '#64748b' }}>
              {stats.remaining > 0 ? `${stats.remaining} more registrations needed to reach goal` : 'Target reached! 🎉'}
            </p>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Registrations */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white">Daily Registrations</h3>
            </div>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, color: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorReg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-sm" style={{ color: '#475569' }}>No registration data yet</p>
              </div>
            )}
          </div>

          {/* Channel Distribution */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white">Registrations by Channel</h3>
            </div>
            {channelData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={channelData} dataKey="actual" nameKey="channel" cx="50%" cy="50%"
                      outerRadius={80} innerRadius={40} strokeWidth={0}>
                      {channelData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {channelData.map((ch, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span style={{ color: '#cbd5e1' }}>{ch.channel}</span>
                      </div>
                      <span className="font-medium text-white">{ch.actual}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm" style={{ color: '#475569' }}>No channel data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Channel Performance Table */}
        {channelData.length > 0 && (
          <div className="glass-card p-6 mb-8 overflow-x-auto">
            <h3 className="font-semibold text-white mb-4">Channel Performance</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Target</th>
                  <th>Actual</th>
                  <th>Spend</th>
                  <th>Cost/Reg</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map((ch, i) => (
                  <tr key={i}>
                    <td className="font-medium text-white">{ch.channel}</td>
                    <td>{ch.target}</td>
                    <td className="font-semibold" style={{ color: '#a78bfa' }}>{ch.actual}</td>
                    <td>₹{ch.actualSpend}</td>
                    <td>{ch.costPerReg === 'N/A' ? 'N/A' : `₹${ch.costPerReg}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Campaign Timeline */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">7-Day Campaign Plan</h3>
            <span className="badge badge-amber ml-2">Editable Plan</span>
          </div>
          <div className="space-y-3">
            {campaignTimeline.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl"
                style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(139,92,246,0.1)' }}>
                <div className="w-16 text-center">
                  <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>{item.day}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{item.activity}</p>
                </div>
                <span className="badge badge-violet text-xs">Planned</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: '#475569' }}>
            These are proposed campaign activities, not confirmed completed actions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
