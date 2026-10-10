import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { staffService } from '../../services/staffService';
import ActionControlPanel from '../../components/staff/ActionControlPanel';
import QrScannerModal from '../../components/staff/QrScannerModal';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card3D from '../../components/common/3D/Card3D';
import {
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  QrCode,
  Sparkles,
  PhoneCall,
  RotateCcw,
  SkipForward,
  PlayCircle,
  AlertCircle,
  FileText,
  Radio,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { socket, joinOffice } = useSocket();

  const [queueState, setQueueState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQrScanner, setShowQrScanner] = useState(false);

  useEffect(() => {
    loadStaffQueue();
  }, []);

  // Listen to socket queue updates
  useEffect(() => {
    if (queueState?.counter?.office?._id) {
      joinOffice(queueState.counter.office._id);
    }

    if (socket) {
      const handleQueueRefresh = () => {
        loadStaffQueue();
      };

      socket.on('queue_updated', handleQueueRefresh);
      socket.on('token_called', handleQueueRefresh);
      socket.on('token_serving', handleQueueRefresh);
      socket.on('token_completed', handleQueueRefresh);
      socket.on('token_cancelled', handleQueueRefresh);

      return () => {
        socket.off('queue_updated', handleQueueRefresh);
        socket.off('token_called', handleQueueRefresh);
        socket.off('token_serving', handleQueueRefresh);
        socket.off('token_completed', handleQueueRefresh);
        socket.off('token_cancelled', handleQueueRefresh);
      };
    }
  }, [socket, queueState?.counter?.office?._id]);

  const loadStaffQueue = async () => {
    try {
      const res = await staffService.getStaffQueue();
      if (res.success) {
        setQueueState(res);
      }
    } catch (err) {
      toast.error('Failed to load counter queue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner text="Connecting to counter terminal..." size="lg" />
      </div>
    );
  }

  const counter = queueState?.counter || { counterNumber: 'Counter 3' };
  const currentToken = queueState?.currentToken || null;
  const nextToken = queueState?.nextToken || null;
  const waitingTokens = queueState?.waitingTokens || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Staff Operator Header Banner */}
      <div className="bg-gradient-to-r from-[#1a2a5e] via-[#243470] to-[#0f1a3a] rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#c8a227]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8a227]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded bg-white/10 text-[#e8d080] border border-[#c8a227]/40 uppercase tracking-widest shadow-[0_0_15px_rgba(200,162,39,0.2)]">
              {counter.counterNumber}
            </span>
            <span className="text-xs font-mono text-slate-300 font-medium">
              Operator: <strong className="text-white">{user?.name}</strong> (ID: {user?.employeeId || 'EMP-RTO-03'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white">
            {counter.office?.name || 'Regional Transport Office (RTO Rajkot)'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Assigned Services:{' '}
            <span className="text-[#e8d080]">
              {counter.services?.map((s) => s.name).join(', ') || 'Driving Licence Renewal'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setShowQrScanner(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#c8a227] to-[#e8be3a] hover:from-[#d4b030] hover:to-[#f0d050] text-[#1a2a5e] font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xl shadow-[#c8a227]/25 btn-3d border border-[#e8d080]/40"
          >
            <QrCode className="w-4 h-4" />
            <span>Verify Citizen QR</span>
          </button>
        </div>
      </div>

      {/* Counter Statistics Strip with 3D Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card3D maxTilt={6}>
          <div className="gov-card p-5 border border-slate-200">
            <span className="text-xs font-mono text-slate-600 font-bold uppercase">Waiting in Queue</span>
            <p className="text-3xl font-black font-mono text-[#1a2a5e] mt-1">{queueState?.waitingCount ?? 12}</p>
            <span className="text-[11px] text-slate-500 font-mono">Citizens waiting</span>
          </div>
        </Card3D>

        <Card3D maxTilt={6}>
          <div className="gov-card p-5 border border-slate-200">
            <span className="text-xs font-mono text-slate-600 font-bold uppercase">Completed Today</span>
            <p className="text-3xl font-black font-mono text-emerald-600 mt-1">{queueState?.completedToday ?? 46}</p>
            <span className="text-[11px] text-slate-500 font-mono">Served by this counter</span>
          </div>
        </Card3D>

        <Card3D maxTilt={6}>
          <div className="gov-card p-5 border border-slate-200">
            <span className="text-xs font-mono text-slate-600 font-bold uppercase">Skipped / Absent</span>
            <p className="text-3xl font-black font-mono text-rose-600 mt-1">{queueState?.skippedToday ?? 2}</p>
            <span className="text-[11px] text-slate-500 font-mono">Citizens skipped</span>
          </div>
        </Card3D>

        <Card3D maxTilt={6}>
          <div className="gov-card p-5 border border-slate-200">
            <span className="text-xs font-mono text-slate-600 font-bold uppercase">Average Duration</span>
            <p className="text-3xl font-black font-mono text-[#c8a227] mt-1">~6 Mins</p>
            <span className="text-[11px] text-slate-500 font-mono">Service benchmark</span>
          </div>
        </Card3D>
      </div>

      {/* CORE ACTION CONTROL PANEL */}
      <ActionControlPanel
        counter={counter}
        currentToken={currentToken}
        nextToken={nextToken}
        onActionCompleted={loadStaffQueue}
      />

      {/* WAITING QUEUE TABLE */}
      <div className="gov-card p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div>
            <h3 className="text-base font-black text-[#1a2a5e] font-heading">
              Waiting Citizens Queue ({waitingTokens.length})
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Live order according to queue priority &amp; generation timestamp
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#1a2a5e] bg-[#1a2a5e]/5 border border-[#1a2a5e]/20 px-3 py-1 rounded-full">
            Real-Time Sync
          </span>
        </div>

        {waitingTokens.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase font-mono tracking-wider text-[11px]">
                  <th className="py-3 px-3">Position</th>
                  <th className="py-3 px-3">Token #</th>
                  <th className="py-3 px-3">Citizen Name</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Est. Wait</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {waitingTokens.map((t, idx) => (
                  <tr
                    key={t._id}
                    className={`hover:bg-slate-50/80 transition ${
                      idx === 0 ? 'bg-[#1a2a5e]/5 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                      #{t.queuePosition || idx + 1}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-black text-[#1a2a5e] text-sm">
                      {t.tokenNumber}
                    </td>
                    <td className="py-3.5 px-3 text-slate-800 font-medium">{t.citizenName || 'Citizen'}</td>
                    <td className="py-3.5 px-3 text-slate-600">{t.serviceId?.name}</td>
                    <td className="py-3.5 px-3">
                      {t.priority === 'SENIOR_CITIZEN' || t.isSeniorCitizen ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                          <span>👴</span>
                          <span>SENIOR (60+) PRIORITY</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            t.priority !== 'NORMAL'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {t.priority}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-mono font-medium">
                      ~{t.estimatedWaitTime || 0} mins
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-600 font-mono">
            No citizens currently waiting for this counter.
          </div>
        )}
      </div>

      <QrScannerModal isOpen={showQrScanner} onClose={() => setShowQrScanner(false)} />
    </div>
  );
};

export default StaffDashboard;
