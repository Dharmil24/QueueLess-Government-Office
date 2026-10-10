import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Search,
  Clock,
  Ticket,
  User,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [period, setPeriod] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [viewingToken, setViewingToken] = useState(null);
  const [editingToken, setEditingToken] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'waiting',
    priority: 'normal',
    notes: '',
  });

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports(period);
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const url = adminService.getReportExportUrl(period);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenEdit = (token) => {
    setEditingToken(token);
    setEditForm({
      status: token.status || 'waiting',
      priority: token.priority || 'normal',
      notes: token.notes || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingToken) return;
    try {
      await adminService.updateLiveToken(editingToken._id, editForm);
      toast.success(`Token ${editingToken.tokenNumber} updated successfully`);
      setEditingToken(null);
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update token record');
    }
  };

  const handleDeleteToken = async (token) => {
    if (window.confirm(`Permanently delete audit record for Token "${token.tokenNumber}"?`)) {
      try {
        await adminService.deleteReportToken(token._id);
        toast.success(`Token record ${token.tokenNumber} deleted`);
        loadReports();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete token record');
      }
    }
  };

  const filteredTokens = (reportData?.tokens || []).filter((t) => {
    const matchesSearch =
      t.tokenNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.citizenName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Official Audit & Reports
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Queue Intelligence & Service Reports
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive audit logs with full view, status revision, deletion, and CSV export capabilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 w-fit">
          {[
            { id: 'daily', label: 'Today (Daily)' },
            { id: 'weekly', label: 'Past 7 Days (Weekly)' },
            { id: 'monthly', label: 'Past 30 Days (Monthly)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                period === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search token or citizen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-blue-500 w-52"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="waiting">Waiting</option>
            <option value="serving">Serving</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Compiling administrative report data..." />
      ) : (
        <div className="gov-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                Queue Token Records ({filteredTokens.length} of {reportData?.count || 0})
              </h3>
              <p className="text-[11px] text-slate-500">Period: {period.toUpperCase()}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Token #</th>
                  <th className="py-2.5 px-3">Citizen</th>
                  <th className="py-2.5 px-3">Office</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Counter</th>
                  <th className="py-2.5 px-3">Wait (min)</th>
                  <th className="py-2.5 px-3">Service Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Generated At</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-extrabold text-blue-700 font-mono">{t.tokenNumber}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{t.citizenName}</td>
                    <td className="py-3 px-3 text-slate-700">{t.officeId?.name}</td>
                    <td className="py-3 px-3 text-slate-600">{t.serviceId?.name}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 font-mono">
                      {t.counterId?.counterNumber || 'Counter 3'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">~{t.estimatedWaitTime || 12}m</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{t.serviceDurationMinutes || 8}m</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {new Date(t.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingToken(t)}
                          title="View Audit Record"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          title="Edit Token Status"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteToken(t)}
                          title="Delete Audit Record"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTokens.length === 0 && (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-400">
                      No matching token records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW TOKEN AUDIT MODAL */}
      {viewingToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    Token #{viewingToken.tokenNumber}
                  </h3>
                  <p className="text-xs text-slate-500">Official Municipal Record</p>
                </div>
              </div>
              <button
                onClick={() => setViewingToken(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Citizen Name:</span>
                <span className="font-bold text-slate-900">{viewingToken.citizenName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Service Department:</span>
                <span className="font-bold text-slate-900">
                  {viewingToken.departmentId?.name || viewingToken.serviceId?.departmentId?.name || 'Administrative Desk'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Service Requested:</span>
                <span className="font-semibold text-blue-800">{viewingToken.serviceId?.name || 'Public Service'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Municipal Office:</span>
                <span className="font-semibold text-slate-800">{viewingToken.officeId?.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Assigned Counter:</span>
                <span className="font-bold font-mono text-slate-900">
                  {viewingToken.counterId?.counterNumber || 'Counter 3'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Est. Wait</span>
                  <span className="font-bold text-amber-700 text-sm">~{viewingToken.estimatedWaitTime || 12} mins</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Service Duration</span>
                  <span className="font-bold text-blue-700 text-sm">{viewingToken.serviceDurationMinutes || 8} mins</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Current Status:</span>
                <StatusBadge status={viewingToken.status} />
              </div>
              {viewingToken.notes && (
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[10px] uppercase tracking-wide text-amber-700 mb-1">
                    Officer Notes
                  </span>
                  {viewingToken.notes}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingToken(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TOKEN STATUS MODAL */}
      {editingToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Edit className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 font-heading">
                  Edit Token #{editingToken.tokenNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingToken(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Queue Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-semibold"
                >
                  <option value="waiting">Waiting (In Queue)</option>
                  <option value="serving">Serving (At Counter)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Priority Classification</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 font-semibold"
                >
                  <option value="normal">Normal Public</option>
                  <option value="senior">Senior Citizen</option>
                  <option value="vip">VIP / Official</option>
                  <option value="emergency">Emergency / Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Audit Notes / Reason</label>
                <textarea
                  rows="3"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Reason for status revision or admin override..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingToken(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
