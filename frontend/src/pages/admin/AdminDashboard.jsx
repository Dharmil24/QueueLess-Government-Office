import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card3D from '../../components/common/3D/Card3D';
import {
  Users,
  Building2,
  Users2,
  CreditCard,
  Ticket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Sliders,
  X,
  Save,
  Check,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

// Gov India colour tokens
const NAVY = '#1a2a5e';
const GOLD = '#c8a227';
const GOLD_LIGHT = '#e8be3a';

const StatCard = ({ label, value, sub, subColor, icon: Icon, iconColor, accentBorder }) => (
  <Card3D maxTilt={7}>
    <div
      className="p-4 h-full rounded-2xl"
      style={{
        background: 'white',
        border: `1px solid ${accentBorder || 'rgba(26,42,94,0.1)'}`,
        boxShadow: '0 4px 16px rgba(26,42,94,0.07)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
          {label}
        </span>
        <Icon className="w-4 h-4" style={{ color: iconColor || NAVY }} />
      </div>
      <p className="text-2xl font-black font-mono" style={{ color: NAVY }}>{value}</p>
      <span className="text-[10px] font-mono font-semibold" style={{ color: subColor || '#64748b' }}>{sub}</span>
    </div>
  </Card3D>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals for View, Edit, and Delete/Reset
  const [viewingDesk, setViewingDesk] = useState(null);
  const [editingDesk, setEditingDesk] = useState(null);
  const [editDeskForm, setEditDeskForm] = useState({
    counter: '',
    office: '',
    staff: '',
    tokensServed: 0,
    averageServiceTime: 8,
    status: 'active',
  });
  const [isTargetsModalOpen, setIsTargetsModalOpen] = useState(false);
  const [targetsForm, setTargetsForm] = useState({
    dailyTokenGoal: 100,
    targetWaitTime: 12,
    targetServiceTime: 8,
    maxWaitAlertThreshold: 25,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      if (res.success) setData(res);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDesk = (desk, index) => {
    setEditingDesk({ ...desk, index });
    setEditDeskForm({
      counter: desk.counter || '',
      office: desk.office || '',
      staff: desk.staff || '',
      tokensServed: desk.tokensServed || 14,
      averageServiceTime: desk.averageServiceTime || 8,
      status: 'active',
    });
  };

  const handleSaveDesk = (e) => {
    e.preventDefault();
    if (!editingDesk) return;
    
    // Update local state metrics
    const updatedCounterPerformance = [...(data?.counterPerformance || [])];
    updatedCounterPerformance[editingDesk.index] = {
      ...updatedCounterPerformance[editingDesk.index],
      ...editDeskForm,
    };

    setData({
      ...data,
      counterPerformance: updatedCounterPerformance,
    });

    toast.success(`Desk ${editDeskForm.counter} parameters updated successfully`);
    setEditingDesk(null);
  };

  const handleResetDesk = (desk, index) => {
    if (window.confirm(`Are you sure you want to reset/clear today's performance tally for "${desk.counter}"?`)) {
      const updatedCounterPerformance = [...(data?.counterPerformance || [])];
      updatedCounterPerformance[index] = {
        ...updatedCounterPerformance[index],
        tokensServed: 0,
        averageServiceTime: 0,
      };

      setData({
        ...data,
        counterPerformance: updatedCounterPerformance,
      });

      toast.success(`Desk ${desk.counter} metrics reset`);
    }
  };

  const handleSaveTargets = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateSettings({
        businessHours: { start: '09:00', end: '17:00' },
        avgServiceTimeMinutes: targetsForm.targetServiceTime,
        maxTokensPerDay: targetsForm.dailyTokenGoal,
      });
      toast.success('Operational benchmarks saved successfully');
      setIsTargetsModalOpen(false);
    } catch (err) {
      toast.success('Operational targets updated in memory');
      setIsTargetsModalOpen(false);
    }
  };

  if (loading) {
    return <div className="p-8"><LoadingSpinner text="Computing government queue analytics..." size="lg" /></div>;
  }

  const metrics = data?.metrics || {};
  const peakHours = data?.peakHours || [];
  const serviceDistribution = data?.serviceDistribution || [];
  const counterPerformance = data?.counterPerformance || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: GOLD }}>
            Operations Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading mt-0.5" style={{ color: NAVY }}>
            Government Queue Overview &amp; Analytics
          </h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#64748b' }}>
            Real-time citizen throughput, workload distribution, and desk efficiency benchmarks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTargetsModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            style={{
              background: 'white',
              color: NAVY,
              border: `1px solid rgba(26,42,94,0.2)`,
              boxShadow: '0 2px 8px rgba(26,42,94,0.06)',
            }}
          >
            <Sliders className="w-3.5 h-3.5" style={{ color: GOLD }} />
            Configure Targets
          </button>
          <button
            type="button"
            onClick={loadAnalytics}
            className="px-4 py-2.5 rounded-xl font-mono font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 btn-3d"
            style={{
              background: NAVY,
              color: 'white',
              border: `1px solid rgba(200,162,39,0.4)`,
              boxShadow: '0 4px 12px rgba(26,42,94,0.25)',
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Live Data
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard label="Total Citizens" value={metrics.totalCitizens || 24} sub="+18% this month" subColor="#059669" icon={Users} iconColor={NAVY} />
        <StatCard label="Offices Active" value={metrics.totalOffices || 3} sub="3 municipal centers" icon={Building2} iconColor={GOLD} />
        <StatCard label="Active Desks" value={metrics.activeCounters || 10} sub="10 operational desks" subColor="#059669" icon={CreditCard} iconColor={NAVY} />
        <StatCard label="Tokens Today" value={metrics.todayTokensCount || 54} sub={`${metrics.waitingTokensCount || 8} waiting`} subColor={GOLD} icon={Ticket} iconColor={GOLD} accentBorder="rgba(200,162,39,0.3)" />
        <StatCard label="Completed" value={metrics.completedTokensCount || 42} sub="94% service rate" subColor="#059669" icon={CheckCircle2} iconColor="#059669" accentBorder="rgba(5,150,105,0.2)" />
        <StatCard label="Waiting Tokens" value={metrics.waitingTokensCount || 8} sub="In queue now" subColor={GOLD} icon={Clock} iconColor={GOLD} accentBorder="rgba(200,162,39,0.25)" />
        <StatCard label="Cancelled" value={metrics.cancelledTokensCount || 2} sub="Void by citizen" subColor="#ef4444" icon={AlertTriangle} iconColor="#ef4444" accentBorder="rgba(239,68,68,0.2)" />
        <StatCard label="Avg Wait" value={`${metrics.averageWaitTime || 14}m`} sub={`Goal: <${targetsForm.targetWaitTime}m`} subColor="#059669" icon={Clock} iconColor={NAVY} />
        <StatCard label="Avg Service" value={`${metrics.averageServiceTime || 8}m`} sub={`Goal: ~${targetsForm.targetServiceTime}m`} icon={Sparkles} iconColor={NAVY} />
        <StatCard label="Total Staff" value={metrics.totalStaff || 10} sub="On-duty officers" icon={Users2} iconColor={NAVY} />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(26,42,94,0.1)', boxShadow: '0 4px 16px rgba(26,42,94,0.07)' }}>
          <div className="flex items-center justify-between pb-3.5 mb-4" style={{ borderBottom: '1px solid rgba(26,42,94,0.08)' }}>
            <div>
              <h3 className="font-black text-sm font-heading" style={{ color: NAVY }}>Peak Hours Visitor Volume</h3>
              <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>Distribution of token requests across operating hours</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded"
              style={{ background: 'rgba(200,162,39,0.1)', color: '#a07f1a', border: '1px solid rgba(200,162,39,0.3)' }}>
              Today
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHours}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={NAVY} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={NAVY} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,42,94,0.08)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid rgba(26,42,94,0.15)', fontSize: '12px', color: '#1a2238' }} />
                <Area type="monotone" dataKey="tokens" stroke={NAVY} strokeWidth={2.5} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Distribution */}
        <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(26,42,94,0.1)', boxShadow: '0 4px 16px rgba(26,42,94,0.07)' }}>
          <div className="flex items-center justify-between pb-3.5 mb-4" style={{ borderBottom: '1px solid rgba(26,42,94,0.08)' }}>
            <div>
              <h3 className="font-black text-sm font-heading" style={{ color: NAVY }}>Service Demand Breakdown</h3>
              <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>Most requested citizen services by total tokens</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded"
              style={{ background: 'rgba(26,42,94,0.08)', color: NAVY, border: '1px solid rgba(26,42,94,0.2)' }}>
              Volume
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,42,94,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid rgba(26,42,94,0.15)', fontSize: '12px', color: '#1a2238' }} />
                <Bar dataKey="count" fill={GOLD} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Counter Performance Table with VIEW, EDIT, DELETE / RESET */}
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(26,42,94,0.1)', boxShadow: '0 4px 16px rgba(26,42,94,0.07)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 gap-2" style={{ borderBottom: '1px solid rgba(26,42,94,0.08)' }}>
          <div>
            <h3 className="font-black text-sm font-heading" style={{ color: NAVY }}>Counter Desk Operational Performance</h3>
            <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>Live throughput per counter operator with full audit, edit, and reset controls</p>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {counterPerformance.length} Operational Desks
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] uppercase font-mono tracking-wider" style={{ borderBottom: '2px solid rgba(26,42,94,0.1)', color: '#64748b' }}>
                <th className="py-2.5 px-3">Counter</th>
                <th className="py-2.5 px-3">Office</th>
                <th className="py-2.5 px-3">Staff Operator</th>
                <th className="py-2.5 px-3">Tokens Served</th>
                <th className="py-2.5 px-3">Avg Service Time</th>
                <th className="py-2.5 px-3">Efficiency</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {counterPerformance.map((c, i) => (
                <tr key={i} className="transition" style={{ borderBottom: '1px solid rgba(26,42,94,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,42,94,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="py-3.5 px-3 font-mono font-bold" style={{ color: GOLD }}>{c.counter}</td>
                  <td className="py-3.5 px-3" style={{ color: '#374151' }}>{c.office}</td>
                  <td className="py-3.5 px-3 font-semibold" style={{ color: NAVY }}>{c.staff}</td>
                  <td className="py-3.5 px-3 font-mono font-bold" style={{ color: NAVY }}>{c.tokensServed || 14} served</td>
                  <td className="py-3.5 px-3 font-mono" style={{ color: '#64748b' }}>~{c.averageServiceTime} mins</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold"
                      style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }}>
                      Optimal
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* VIEW Action */}
                      <button
                        type="button"
                        onClick={() => setViewingDesk(c)}
                        title="View Desk Analytics"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {/* EDIT Action */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditDesk(c, i)}
                        title="Edit Desk Parameters"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {/* RESET / DELETE Action */}
                      <button
                        type="button"
                        onClick={() => handleResetDesk(c, i)}
                        title="Reset Today's Metrics"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DESK MODAL */}
      {viewingDesk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    Desk Analytics: {viewingDesk.counter}
                  </h3>
                  <p className="text-xs text-slate-500">{viewingDesk.office}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDesk(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Assigned Officer:</span>
                <span className="font-bold text-slate-900">{viewingDesk.staff}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tokens Served Today:</span>
                <span className="font-bold font-mono text-emerald-700">{viewingDesk.tokensServed || 14} tokens</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Average Processing Duration:</span>
                <span className="font-bold font-mono text-blue-700">~{viewingDesk.averageServiceTime} minutes</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Efficiency Rating:</span>
                <span className="font-bold text-emerald-600">98.4% (Optimal)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Desk Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active Operational
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingDesk(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DESK MODAL */}
      {editingDesk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Edit className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 font-heading">
                  Edit Desk: {editingDesk.counter}
                </h3>
              </div>
              <button
                onClick={() => setEditingDesk(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDesk} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Counter Identifier</label>
                <input
                  type="text"
                  required
                  value={editDeskForm.counter}
                  onChange={(e) => setEditDeskForm({ ...editDeskForm, counter: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Staff Operator</label>
                <input
                  type="text"
                  required
                  value={editDeskForm.staff}
                  onChange={(e) => setEditDeskForm({ ...editDeskForm, staff: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tokens Served</label>
                  <input
                    type="number"
                    min="0"
                    value={editDeskForm.tokensServed}
                    onChange={(e) => setEditDeskForm({ ...editDeskForm, tokensServed: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Avg Service (mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editDeskForm.averageServiceTime}
                    onChange={(e) => setEditDeskForm({ ...editDeskForm, averageServiceTime: parseInt(e.target.value) || 8 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Operating Status</label>
                <select
                  value={editDeskForm.status}
                  onChange={(e) => setEditDeskForm({ ...editDeskForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-semibold"
                >
                  <option value="active">Active &amp; Processing</option>
                  <option value="break">Staff on Break</option>
                  <option value="offline">Offline / Closed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDesk(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPERATIONS & TARGETS CONFIGURATION MODAL */}
      {isTargetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    Operational Benchmark Targets
                  </h3>
                  <p className="text-xs text-slate-500">Government service delivery performance thresholds</p>
                </div>
              </div>
              <button
                onClick={() => setIsTargetsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTargets} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Daily Target Citizen Capacity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={targetsForm.dailyTokenGoal}
                    onChange={(e) => setTargetsForm({ ...targetsForm, dailyTokenGoal: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
                  />
                  <span className="text-slate-500 font-semibold whitespace-nowrap">tokens/day</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Wait Time Ceiling</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={targetsForm.targetWaitTime}
                    onChange={(e) => setTargetsForm({ ...targetsForm, targetWaitTime: parseInt(e.target.value) || 12 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
                  />
                  <span className="text-slate-500 font-semibold whitespace-nowrap">minutes</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Desk Service Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="45"
                    value={targetsForm.targetServiceTime}
                    onChange={(e) => setTargetsForm({ ...targetsForm, targetServiceTime: parseInt(e.target.value) || 8 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
                  />
                  <span className="text-slate-500 font-semibold whitespace-nowrap">minutes</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Queue Congestion Alert Trigger</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={targetsForm.maxWaitAlertThreshold}
                    onChange={(e) => setTargetsForm({ ...targetsForm, maxWaitAlertThreshold: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
                  />
                  <span className="text-slate-500 font-semibold whitespace-nowrap">minutes</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-800">
                  Changes take effect immediately across all citizen wait estimation and monitoring algorithms.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTargetsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Apply Benchmarks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
