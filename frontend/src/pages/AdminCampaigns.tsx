import React, { useState, useEffect } from 'react';
import { adminAPI, workshopAPI } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../lib/utils';
import {
  DollarSign, Target, Calendar, AlertTriangle, Plus, Edit3, Save,
  Loader2, Copy, MessageSquare, Sparkles, Settings
} from 'lucide-react';

const AdminCampaigns: React.FC = () => {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'budget' | 'templates' | 'workshop'>('budget');
  const [editingWorkshop, setEditingWorkshop] = useState(false);
  const [workshopForm, setWorkshopForm] = useState({ scheduledDate: '', joinLink: '', status: 'published' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, wsRes] = await Promise.allSettled([
          adminAPI.getCampaigns(),
          adminAPI.getWorkshops(),
        ]);
        if (campRes.status === 'fulfilled' && campRes.value.data.campaigns?.length) {
          const camp = campRes.value.data.campaigns[0];
          setCampaigns(campRes.value.data.campaigns);
          const chRes = await adminAPI.getChannels(camp._id);
          setChannels(chRes.data.channels || []);
        }
        if (wsRes.status === 'fulfilled' && wsRes.value.data.workshops?.length) {
          const ws = wsRes.value.data.workshops[0];
          setWorkshop(ws);
          setWorkshopForm({
            scheduledDate: ws.scheduledDate ? new Date(ws.scheduledDate).toISOString().slice(0, 16) : '',
            joinLink: ws.joinLink || '',
            status: ws.status || 'published',
          });
        }
      } catch { /* handled */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const campaign = campaigns[0];

  const totalPlannedBudget = channels.reduce((s, c) => s + c.plannedBudget, 0);
  const totalActualSpend = channels.reduce((s, c) => s + c.actualSpend, 0);
  const totalTargetRegs = channels.reduce((s, c) => s + c.targetRegistrations, 0);

  const handleUpdateChannel = async (id: string, field: string, value: number) => {
    try {
      await adminAPI.updateChannel(id, { [field]: value });
      setChannels(chs => chs.map(c => c._id === id ? { ...c, [field]: value } : c));
    } catch { addToast('Update failed', 'error'); }
  };

  const handleSaveWorkshop = async () => {
    if (!workshop) return;
    try {
      await workshopAPI.update(workshop._id, {
        scheduledDate: workshopForm.scheduledDate ? new Date(workshopForm.scheduledDate).toISOString() : undefined,
        joinLink: workshopForm.joinLink || undefined,
        status: workshopForm.status,
      });
      addToast('Workshop updated', 'success');
      setEditingWorkshop(false);
    } catch { addToast('Update failed', 'error'); }
  };

  const messageTemplates = [
    {
      name: 'WhatsApp — College Group',
      message: `🚀 Free AI Workshop Alert!\n\n"Build Your First AI Project in 60 Minutes"\n\nPerfect for final-year engineering students. No experience needed.\n\n✅ Free | ⏱️ 60 mins | 💻 Online\n\nRegister now 👉 {{LINK}}\n\nLimited seats!`,
    },
    {
      name: 'WhatsApp — Coding Club',
      message: `Hey coders! 👋\n\nWant to add an AI project to your portfolio?\n\nJoin this free 60-min workshop: "Build Your First AI Project in 60 Minutes"\n\nYou'll build a real AI app from scratch. No ML background needed.\n\nRegister free 👉 {{LINK}}`,
    },
    {
      name: 'LinkedIn Post',
      message: `Excited to share a free opportunity for aspiring engineers! 🎓\n\nNxtWave is hosting a hands-on workshop: "Build Your First AI Project in 60 Minutes"\n\n🔹 Free & Online\n🔹 Beginner-friendly\n🔹 Walk away with a working AI project\n\nPerfect for final-year students exploring AI careers.\n\nRegister here: {{LINK}}\n\n#AI #Workshop #Engineering #FreeWorkshop`,
    },
    {
      name: 'Instagram Caption',
      message: `Build your FIRST AI project in just 60 minutes! 🤖✨\n\nFree online workshop for engineering students.\nNo experience? No problem.\n\nLink in bio 👆 or DM me for the registration link!\n\n#AIWorkshop #LearnAI #Engineering #NxtWave #FreeWorkshop`,
    },
    {
      name: 'Direct Peer Invite',
      message: `Hey! I signed up for this free AI workshop and thought you'd be interested.\n\nIt's called "Build Your First AI Project in 60 Minutes" — you actually build a working AI app during the session.\n\nIt's completely free and perfect for us final-year students.\n\nHere's my referral link: {{LINK}}`,
    },
    {
      name: 'Ambassador Outreach',
      message: `Hi {{NAME}},\n\nWe'd love you to be a campus ambassador for our free AI workshop!\n\nWhat's in it for you:\n- Exclusive referral code\n- Track your registrations on a leaderboard\n- Help your peers build their first AI project\n\nThe workshop: "Build Your First AI Project in 60 Minutes"\n\nInterested? Reply and we'll set you up with your ambassador code.`,
    },
  ];

  const handleCopyTemplate = (text: string) => {
    const link = `${window.location.origin}/signup`;
    navigator.clipboard.writeText(text.replace(/\{\{LINK\}\}/g, link).replace(/\{\{NAME\}\}/g, '[Name]'));
    addToast('Template copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          <div className="skeleton h-10 w-64" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-8 pb-6">
          <h1 className="text-2xl font-bold text-white">Campaign <span className="gradient-text">Management</span></h1>
          {campaign && (
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              {campaign.name} — {formatDate(campaign.startDate)} to {formatDate(campaign.endDate)}
            </p>
          )}
        </div>

        {/* Campaign Summary */}
        {campaign && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <Target className="w-5 h-5 text-violet-400 mb-2" />
              <div className="text-xl font-bold text-white">{campaign.targetRegistrations}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>Target Registrations</div>
            </div>
            <div className="stat-card">
              <DollarSign className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-xl font-bold text-white">₹{campaign.totalBudget}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>Total Budget</div>
            </div>
            <div className="stat-card">
              <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-xl font-bold text-white">₹{totalActualSpend}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>Actual Spend</div>
            </div>
            <div className="stat-card">
              <Calendar className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="text-xl font-bold text-white">7 Days</div>
              <div className="text-xs" style={{ color: '#64748b' }}>Campaign Duration</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(15,23,42,0.5)' }}>
          {(['budget', 'templates', 'workshop'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background: activeTab === tab ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: activeTab === tab ? '#a78bfa' : '#64748b',
                border: activeTab === tab ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
              }}>
              {tab === 'budget' ? 'Budget & Channels' : tab === 'templates' ? 'Message Templates' : 'Workshop Settings'}
            </button>
          ))}
        </div>

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Warnings */}
            {totalTargetRegs !== (campaign?.targetRegistrations || 500) && (
              <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">
                  Channel targets add up to {totalTargetRegs}, but campaign target is {campaign?.targetRegistrations || 500}.
                </p>
              </div>
            )}
            {totalPlannedBudget > (campaign?.totalBudget || 2000) && (
              <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">
                  Planned budget (₹{totalPlannedBudget}) exceeds total budget (₹{campaign?.totalBudget || 2000}).
                </p>
              </div>
            )}

            {/* Channels Table */}
            <div className="glass-card overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Target Regs</th>
                    <th>Planned Budget</th>
                    <th>Actual Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map(ch => (
                    <tr key={ch._id}>
                      <td className="font-medium text-white">{ch.channelName}</td>
                      <td>
                        <input type="number" className="input-field w-20 py-1 px-2 text-sm text-center"
                          value={ch.targetRegistrations}
                          onChange={e => handleUpdateChannel(ch._id, 'targetRegistrations', parseInt(e.target.value) || 0)}
                          min={0} />
                      </td>
                      <td>
                        <input type="number" className="input-field w-24 py-1 px-2 text-sm text-center"
                          value={ch.plannedBudget}
                          onChange={e => handleUpdateChannel(ch._id, 'plannedBudget', parseInt(e.target.value) || 0)}
                          min={0} />
                      </td>
                      <td>
                        <input type="number" className="input-field w-24 py-1 px-2 text-sm text-center"
                          value={ch.actualSpend}
                          onChange={e => handleUpdateChannel(ch._id, 'actualSpend', parseInt(e.target.value) || 0)}
                          min={0} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="font-bold text-white">Total</td>
                    <td className="font-bold text-white">{totalTargetRegs}</td>
                    <td className="font-bold text-white">₹{totalPlannedBudget}</td>
                    <td className="font-bold text-white">₹{totalActualSpend}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Illustrative Budget */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-1">Proposed Budget Allocation</h3>
              <p className="text-xs mb-4" style={{ color: '#64748b' }}>These are proposed allocations, not actual expenditures.</p>
              <div className="space-y-3">
                {[
                  { name: 'Paid promotion experiment', amount: 1000 },
                  { name: 'Creative materials', amount: 300 },
                  { name: 'Optional incentives', amount: 500 },
                  { name: 'Contingency', amount: 200 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'rgba(15,23,42,0.5)' }}>
                    <span className="text-sm" style={{ color: '#cbd5e1' }}>{item.name}</span>
                    <span className="text-sm font-semibold text-white">₹{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {messageTemplates.map((tmpl, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white text-sm">{tmpl.name}</h4>
                  <button onClick={() => handleCopyTemplate(tmpl.message)} className="btn-ghost text-xs py-1 px-3">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <pre className="text-xs whitespace-pre-wrap p-3 rounded-lg font-sans leading-relaxed"
                  style={{ background: 'rgba(15,23,42,0.8)', color: '#94a3b8' }}>
                  {tmpl.message}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Workshop Tab */}
        {activeTab === 'workshop' && workshop && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-lg">Workshop Settings</h3>
              {!editingWorkshop ? (
                <button onClick={() => setEditingWorkshop(true)} className="btn-secondary text-sm py-2 px-4">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <button onClick={handleSaveWorkshop} className="btn-primary text-sm py-2 px-4">
                  <Save className="w-4 h-4" /> <span>Save</span>
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="input-label">Workshop Title</label>
                <input className="input-field" value={workshop.title} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div>
                <label className="input-label">Scheduled Date & Time</label>
                <input type="datetime-local" className="input-field"
                  value={workshopForm.scheduledDate}
                  onChange={e => setWorkshopForm(f => ({ ...f, scheduledDate: e.target.value }))}
                  disabled={!editingWorkshop} />
              </div>
              <div>
                <label className="input-label">Join Link (meeting URL)</label>
                <input className="input-field" placeholder="https://meet.google.com/..."
                  value={workshopForm.joinLink}
                  onChange={e => setWorkshopForm(f => ({ ...f, joinLink: e.target.value }))}
                  disabled={!editingWorkshop} />
              </div>
              <div>
                <label className="input-label">Status</label>
                <select className="input-field" value={workshopForm.status}
                  onChange={e => setWorkshopForm(f => ({ ...f, status: e.target.value }))}
                  disabled={!editingWorkshop}>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCampaigns;
