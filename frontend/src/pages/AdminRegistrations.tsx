import React, { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { formatDateTime } from '../lib/utils';
import { Search, Download, ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';

const AdminRegistrations: React.FC = () => {
  const { addToast } = useToast();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getRegistrations({ page, limit: 20, search: search || undefined, channel: channel !== 'all' ? channel : undefined });
      setRegistrations(data.registrations || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      addToast('Failed to fetch registrations', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchRegistrations(); }, [channel]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchRegistrations(1); };

  const handleExport = async () => {
    try {
      const { data } = await adminAPI.exportCSV({ channel: channel !== 'all' ? channel : undefined });
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      addToast('CSV exported successfully', 'success');
    } catch {
      addToast('Export failed', 'error');
    }
  };

  const channels = ['all', 'direct', 'referral', 'whatsapp', 'linkedin', 'instagram', 'ambassador', 'paid'];

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: '#0a0e1a' }}>
      <div className="page-wrapper">
        <div className="pt-8 pb-6">
          <h1 className="text-2xl font-bold text-white">Registration <span className="gradient-text">Management</span></h1>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{pagination.total} total registrations</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                <input type="text" className="input-field pl-10" placeholder="Search name, email, college..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary px-4 py-2"><span>Search</span></button>
            </form>
            <div className="flex gap-2">
              <select className="input-field w-auto" value={channel} onChange={(e) => setChannel(e.target.value)}>
                {channels.map(ch => <option key={ch} value={ch}>{ch === 'all' ? 'All Channels' : ch.charAt(0).toUpperCase() + ch.slice(1)}</option>)}
              </select>
              <button onClick={handleExport} className="btn-secondary px-4 py-2">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
          ) : registrations.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>College</th>
                      <th>Year</th>
                      <th>Channel</th>
                      <th>Status</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => {
                      const u = reg.userId as any;
                      return (
                        <tr key={reg._id}>
                          <td>
                            <div>
                              <p className="font-medium text-white text-sm">{u?.name || 'N/A'}</p>
                              <p className="text-xs" style={{ color: '#64748b' }}>{u?.email || ''}</p>
                            </div>
                          </td>
                          <td className="text-sm">{u?.college || 'N/A'}</td>
                          <td className="text-sm">{u?.graduationYear || 'N/A'}</td>
                          <td><span className="badge badge-violet">{reg.channel}</span></td>
                          <td>
                            <span className={`badge ${reg.status === 'confirmed' ? 'badge-emerald' : 'badge-amber'}`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="text-xs" style={{ color: '#94a3b8' }}>{formatDateTime(reg.registeredAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(139,92,246,0.1)' }}>
                <span className="text-xs" style={{ color: '#64748b' }}>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button onClick={() => fetchRegistrations(pagination.page - 1)} disabled={pagination.page <= 1}
                    className="btn-ghost px-3 py-1.5 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => fetchRegistrations(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                    className="btn-ghost px-3 py-1.5 disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Filter className="w-12 h-12 mx-auto mb-3" style={{ color: '#334155' }} />
              <p className="text-white font-medium mb-1">No registrations found</p>
              <p className="text-sm" style={{ color: '#64748b' }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrations;
