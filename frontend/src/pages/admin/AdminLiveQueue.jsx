import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Radio,
  Building2,
  CreditCard,
  Clock,
  RefreshCw,
  Sparkles,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  QrCode,
  Users,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLiveQueue = () => {
  const { socket } = useSocket();
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewToken, setViewToken] = useState(null);
  const [editToken, setEditToken] = useState(null);
  const [tokenFormData, setTokenFormData] = useState({
    priority: 'NORMAL',
    status: 'WAITING',
    notes: '',
  });

  useEffect(() => {
    loadLiveMonitor();
  }, []);

  // Real-time socket events
  useEffect(() => {
    if (socket) {
      const handleGlobalQueueUpdate = () => {
        loadLiveMonitor();
      };

      socket.on('queue_updated', handleGlobalQueueUpdate);
      socket.on('token_called', handleGlobalQueueUpdate);
      socket.on('token_serving', handleGlobalQueueUpdate);
      socket.on('token_completed', handleGlobalQueueUpdate);
      socket.on('token_cancelled', handleGlobalQueueUpdate);

      return () => {
        socket.off('queue_updated', handleGlobalQueueUpdate);
        socket.off('token_called', handleGlobalQueueUpdate);
        socket.off('token_serving', handleGlobalQueueUpdate);
        socket.off('token_completed', handleGlobalQueueUpdate);
        socket.off('token_cancelled', handleGlobalQueueUpdate);
      };
    }
  }, [socket]);

  const loadLiveMonitor = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLiveQueue();
      if (res.success) {
        setLiveData(res.liveData || []);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditToken = (token) => {
    setEditToken(token);
    setTokenFormData({
      priority: token.priority || 'NORMAL',
      status: token.status || 'WAITING',
      notes: token.notes || '',
    });
  };

  const handleSaveTokenEdit = async (e) => {
    e.preventDefault();
    if (!editToken) return;
    try {
      await adminService.updateLiveToken(editToken._id, tokenFormData);
      toast.success(`Token ${editToken.tokenNumber} updated`);
      setEditToken(null);
      loadLiveMonitor();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update token');
    }
  };

  const handleDeleteToken = async (tokenId, tokenNum) => {
    if (!window.confirm(`Cancel/remove token ${tokenNum} from live queue?`)) return;
    try {
      await adminService.deleteLiveToken(tokenId);
      toast.success(`Token ${tokenNum} cancelled`);
      loadLiveMonitor();
    } catch (err) {
      toast.error('Failed to cancel token');
    }
  };

  const handleClearOfficeQueue = async (officeId, officeName) => {
    if (!window.confirm(`Clear all waiting tokens for ${officeName}? This will void active queue.`)) return;
    try {
      await adminService.clearLiveQueue(officeId);
      toast.success(`Waiting queue cleared for ${officeName}`);
      loadLiveMonitor();
    } catch (err) {
      toast.error('Failed to clear queue');
    }
  };

  if (loading && liveData.length === 0) {
    return (
      <div className="p-8">
        <LoadingSpinner text="Establishing live queue multi-office radar..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Multi-Office Real-Time Radar</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Live Central Queue Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live monitoring, desk allocations, token inspection, prioritization, and queue controls.
          </p>
        </div>

        <button
          onClick={loadLiveMonitor}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Now</span>
        </button>
      </div>

      <div className="space-y-6">
        {liveData.map((item) => (
          <div key={item.office.id} className="gov-card p-6 border-slate-200">
            {/* Office Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 font-heading">
                      {item.office.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                      {item.office.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{item.office.city} • Open Status</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                  {item.totalWaiting} Citizens Waiting
                </span>
                <button
                  type="button"
                  onClick={() => handleClearOfficeQueue(item.office.id, item.office.name)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                  title="Clear waiting queue"
                >
                  Clear Queue
                </button>
              </div>
            </div>

            {/* Counters Grid */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Active Counter Terminals ({item.counters?.length || 0})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {item.counters?.map((c) => {
                  const token = c.currentToken;

                  return (
                    <div
                      key={c._id}
                      className={`p-4 rounded-2xl border transition relative group ${
                        token
                          ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-xs font-extrabold text-slate-900">
                          {c.counterNumber}
                        </strong>
                        {token ? (
                          <StatusBadge status={token.status} />
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                            IDLE
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-slate-900 font-heading">
                          {token ? token.tokenNumber : '---'}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[130px]">
                          {token?.serviceId?.name || 'No service active'}
                        </span>
                      </div>

                      {token && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Citizen: <strong>{token.citizenName || 'Citizen'}</strong>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewToken(token)}
                              className="p-1 rounded text-blue-600 hover:bg-blue-100"
                              title="View Token"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditToken(token)}
                              className="p-1 rounded text-amber-600 hover:bg-amber-100"
                              title="Edit Token"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteToken(token._id, token.tokenNumber)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-100"
                              title="Cancel Token"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-500">
                        <span>Staff: {c.assignedStaff?.name || 'Duty Officer'}</span>
                        <span className="font-semibold text-slate-700 font-mono">
                          {c.assignedStaff?.employeeId || ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next in Line Preview */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-2">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Next in queue line ({item.nextTokens?.length || 0} previewed):</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {item.nextTokens && item.nextTokens.length > 0 ? (
                  item.nextTokens.map((t) => (
                    <div
                      key={t._id}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs flex items-center gap-2 group hover:border-blue-400 transition"
                    >
                      <span className="font-black font-mono text-blue-700">
                        #{t.queuePosition} {t.tokenNumber}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        ({t.serviceId?.name || 'Service'})
                      </span>
                      <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        ~{t.estimatedWaitTime || 10}m
                      </span>
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-1">
                        <button
                          onClick={() => setViewToken(t)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                          title="View Token"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleOpenEditToken(t)}
                          className="p-1 text-slate-400 hover:text-amber-600"
                          title="Edit Token"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteToken(t._id, t.tokenNumber)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Cancel Token"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No citizens currently waiting in line</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW TOKEN MODAL */}
      {viewToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-mono">
                  #
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-mono">{viewToken.tokenNumber}</h3>
                  <span className="text-[10px] font-mono text-slate-400">Queue Token Inspection</span>
                </div>
              </div>
              <button onClick={() => setViewToken(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
                <div>
                  <span className="text-[10px] uppercase font-mono text-blue-700 block">Queue Position</span>
                  <span className="text-2xl font-black font-mono text-blue-900">#{viewToken.queuePosition || 1}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Status</span>
                  <StatusBadge status={viewToken.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Citizen Name</span>
                  <span className="font-bold text-slate-800">{viewToken.citizenName || 'Registered Citizen'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Priority Level</span>
                  <span className="font-bold font-mono text-blue-700 uppercase">{viewToken.priority || 'NORMAL'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-mono text-amber-800 font-bold block mb-1">
                    Est. Wait Time
                  </span>
                  <span className="font-bold font-mono text-amber-900 text-sm">
                    ~{viewToken.estimatedWaitTime || 10} Mins
                  </span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold block mb-1">
                    Arrival Time
                  </span>
                  <span className="font-bold font-mono text-emerald-900 text-sm">
                    {viewToken.recommendedArrivalTime || 'Active'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Service Requested</span>
                <span className="font-bold text-slate-800">{viewToken.serviceId?.name || 'Citizen Public Service'}</span>
              </div>

              {viewToken.qrToken && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-400">QR Pass Token:</span>
                  <span className="font-bold text-slate-800">{viewToken.qrToken}</span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const t = viewToken;
                  setViewToken(null);
                  handleOpenEditToken(t);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Token</span>
              </button>
              <button
                type="button"
                onClick={() => setViewToken(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TOKEN MODAL */}
      {editToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Edit Token #{editToken.tokenNumber}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Manage queue priority and state</span>
              </div>
              <button onClick={() => setEditToken(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTokenEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Queue Priority</label>
                <select
                  value={tokenFormData.priority}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="NORMAL">NORMAL (Default FCFS)</option>
                  <option value="PRIORITY">PRIORITY (Expedited Queue)</option>
                  <option value="SENIOR_CITIZEN">SENIOR CITIZEN</option>
                  <option value="SPECIALLY_ABLED">SPECIALLY ABLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Queue Status</label>
                <select
                  value={tokenFormData.status}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="WAITING">WAITING</option>
                  <option value="APPROACHING">APPROACHING</option>
                  <option value="SERVING">SERVING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="SKIPPED">SKIPPED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Notes</label>
                <textarea
                  rows="2"
                  placeholder="Optional notes or instructions for operator..."
                  value={tokenFormData.notes}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditToken(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveQueue;
