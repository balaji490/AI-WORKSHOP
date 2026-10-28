import React, { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { UserPlus, Trash2, Edit3, Users, Loader2, X } from 'lucide-react';

const AdminAmbassadors: React.FC = () => {
  const { addToast } = useToast();
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', college: '', referralCode: '', notes: '' });

  const fetchAmbassadors = async () => {
    try {
      const { data } = await adminAPI.getAmbassadors();
      setAmbassadors(data.ambassadors || []);
    } catch { addToast('Failed to fetch ambassadors', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchAmbassadors(); }, []);

  const resetForm = () => { setForm({ name: '', email: '', college: '', referralCode: '', notes: '' }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await adminAPI.updateAmbassador(editId, form);
        addToast('Ambassador updated', 'success');
      } else {
        await adminAPI.createAmbassador(form);
        addToast('Ambassador created', 'success');
      }
      resetForm();
      fetchAmbassadors();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleEdit = (amb: any) => {
    setForm({ name: amb.name, email: amb.email, college: amb.college, referralCode: amb.referralCode, notes: amb.notes || '' });
    setEditId(amb._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this ambassador?')) return;
    try {
      await adminAPI.deleteAmbassador(id);
      addToast('Ambassador removed', 'success');
      fetchAmbassadors();
    } catch { addToast('Failed to remove', 'error'); }
  };

  const handleToggleStatus = async (amb: any) => {
    try {
      await adminAPI.updateAmbassador(amb._id, { status: amb.status === 'active' ? 'inactive' : 'active' });
      addToast('Status updated', 'success');
      fetchAmbassadors();
    } catch { addToast('Update failed', 'error'); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
      <div className="page-wrapper">
        <div className="pt-8 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ambassador <span className="gradient-text">Management</span></h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{ambassadors.length} ambassadors</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
            <UserPlus className="w-4 h-4" /> <span>Add Ambassador</span>
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="glass-card p-6 w-full max-w-md" style={{ background: '#111827' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{editId ? 'Edit' : 'Add'} Ambassador</h3>
                <button onClick={resetForm} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Name</label>
                  <input className="input-field" placeholder="Ambassador name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input type="email" className="input-field" placeholder="ambassador@college.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="input-label">College</label>
                  <input className="input-field" placeholder="College name" value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} required />
                </div>
                <div>
                  <label className="input-label">Referral Code (auto-generated if empty)</label>
                  <input className="input-field" placeholder="AMB-XXXXXX" value={form.referralCode} onChange={e => setForm(f => ({ ...f, referralCode: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Notes</label>
                  <textarea className="input-field h-20 resize-none" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1"><span>{editId ? 'Update' : 'Create'}</span></button>
                  <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ambassador List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>
        ) : ambassadors.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambassadors.map((amb) => (
              <div key={amb._id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{amb.name}</h4>
                    <p className="text-xs" style={{ color: '#64748b' }}>{amb.college}</p>
                  </div>
                  <span className={`badge ${amb.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>
                    {amb.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-xs" style={{ color: '#94a3b8' }}>Code: <span className="font-mono text-white">{amb.referralCode}</span></div>
                  <div className="text-xs" style={{ color: '#94a3b8' }}>Registrations: <span className="font-bold text-white">{amb.registrationCount || 0}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(amb)} className="btn-ghost flex-1 text-xs py-1.5">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleToggleStatus(amb)} className="btn-ghost flex-1 text-xs py-1.5"
                    style={{ color: amb.status === 'active' ? '#f43f5e' : '#10b981' }}>
                    {amb.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleDelete(amb._id)} className="btn-ghost text-xs py-1.5 text-rose-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#334155' }} />
            <p className="text-white font-medium mb-1">No ambassadors yet</p>
            <p className="text-sm" style={{ color: '#64748b' }}>Add your first campus ambassador to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAmbassadors;
