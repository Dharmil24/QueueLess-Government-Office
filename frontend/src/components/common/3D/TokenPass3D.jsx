import React, { useState } from 'react';
import {
  Ticket,
  Users,
  Clock,
  Building2,
  QrCode,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import StatusBadge from '../StatusBadge';
import QRModal from '../QRModal';
import Card3D from './Card3D';
import { tokenService } from '../../../services/tokenService';
import toast from 'react-hot-toast';

const TokenPass3D = ({ token, onTokenUpdated }) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!token) return null;

  const handleCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel token ${token.tokenNumber}?`)) {
      return;
    }

    try {
      setCancelling(true);
      const res = await tokenService.cancelToken(token._id);
      if (res.success) {
        toast.success(`Token ${token.tokenNumber} has been cancelled.`);
        if (onTokenUpdated) onTokenUpdated();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel token');
    } finally {
      setCancelling(false);
    }
  };

  const peopleAhead = Math.max(0, (token.queuePosition || 1) - 1);

  const progressPercent =
    token.status === 'CALLED' || token.status === 'SERVING'
      ? 100
      : Math.min(95, Math.max(15, Math.round(100 - (peopleAhead / 8) * 60)));

  const isCalledOrServing = ['CALLED', 'SERVING'].includes(token.status);

  return (
    <>
      <Card3D maxTilt={7} className="w-full">
        <div
          className={`holo-pass-3d relative overflow-hidden transition-all duration-300 ${
            isCalledOrServing
              ? 'border-cyan-400/80 shadow-[0_0_50px_rgba(6,182,212,0.35)]'
              : token.status === 'APPROACHING'
              ? 'border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.3)]'
              : 'border-indigo-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
          }`}
        >
          {/* Top Holographic Security Header */}
          <div
            className={`py-2.5 px-6 flex items-center justify-between text-xs font-bold tracking-wider uppercase border-b ${
              isCalledOrServing
                ? 'bg-gradient-to-r from-cyan-950 via-cyan-900 to-blue-950 text-cyan-200 border-cyan-500/40'
                : token.status === 'APPROACHING'
                ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950 text-amber-200 border-amber-500/40'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-[11px] tracking-widest">
                OFFICIAL DIGITAL PASS • ENCRYPTED
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{token.officeId?.name || 'Gov Service Center'}</span>
            </div>
          </div>

          {/* Main Card Body */}
          <div className="p-6 sm:p-8 relative">
            {/* Watermark 3D emblem background */}
            <div className="absolute right-4 bottom-4 pointer-events-none opacity-5 text-white">
              <Ticket className="w-64 h-64" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white text-3d-cyan">
                    {token.tokenNumber}
                  </h3>
                  <StatusBadge status={token.status} />
                </div>
                <p className="text-base font-bold text-cyan-400 mt-2">
                  {token.serviceId?.name || 'Citizen Public Service'}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{token.departmentId?.name || 'Department'}</span>
                  <span className="text-slate-600">•</span>
                  <span>{token.officeId?.city || 'Office'}</span>
                </p>
              </div>

              {/* QR Trigger Button with 3D Holographic look */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="self-start sm:self-auto group relative p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 text-white transition-all shadow-xl hover:shadow-cyan-500/20 cursor-pointer flex flex-col items-center gap-1.5"
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition">
                  <QrCode className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                  Open QR Pass
                </span>
              </button>
            </div>

            {/* Live Queue Diagnostics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-700/60">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Citizens Ahead
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black font-mono text-white">
                    {peopleAhead}
                  </span>
                  <span className="text-xs text-slate-400">waiting</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Estimated Wait
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black font-mono text-cyan-400">
                    ~{token.estimatedWaitMinutes || 12}
                  </span>
                  <span className="text-xs text-slate-400">mins</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Assigned Counter
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black font-mono text-indigo-300">
                    {token.counterId?.counterNumber || (isCalledOrServing ? 'Counter 3' : 'Pending')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Optimal Arrival
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {token.estimatedCallTime
                      ? new Date(token.estimatedCallTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Arrive Now'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400 font-mono text-[11px]">
                  Queue Progression Matrix
                </span>
                <span className="font-mono font-bold text-cyan-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-700 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Bottom Actions and Status Banner */}
            <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Socket.IO live stream synchronizing every second</span>
              </div>

              {['WAITING', 'APPROACHING'].includes(token.status) && (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancel}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{cancelling ? 'Cancelling...' : 'Cancel Token'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Card3D>

      {/* QR Code Modal */}
      {showQrModal && (
        <QRModal
          token={token}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </>
  );
};

export default TokenPass3D;
