import React, { useState, useEffect } from 'react';
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
  Timer,
  RefreshCw,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import QRModal from '../common/QRModal';
import Card3D from '../common/3D/Card3D';
import { tokenService } from '../../services/tokenService';
import toast from 'react-hot-toast';

const ActiveTokenCard = ({ token, onTokenUpdated }) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState(new Set());
  const [copiedDocs, setCopiedDocs] = useState(false);

  // Live countdown state in seconds
  const initialMinutes = token?.estimatedWaitTime ?? token?.estimatedWaitMinutes ?? 12;
  const [secondsRemaining, setSecondsRemaining] = useState(Math.max(0, initialMinutes * 60));

  // Update secondsRemaining when token updates from parent
  useEffect(() => {
    if (token) {
      const mins = token.estimatedWaitTime ?? token.estimatedWaitMinutes ?? 0;
      setSecondsRemaining(Math.max(0, mins * 60));
    }
  }, [token?.estimatedWaitTime, token?.queuePosition, token?.status]);

  // Live second-by-second countdown timer
  useEffect(() => {
    if (!token) return;
    if (['CALLED', 'SERVING', 'COMPLETED', 'CANCELLED'].includes(token.status)) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [token?.status]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onTokenUpdated) {
      await onTokenUpdated();
    }
    toast.success('Live queue timing refreshed');
    setRefreshing(false);
  };

  const peopleAhead = Math.max(0, (token.queuePosition || 1) - 1);

  // Compute realistic progress
  const progressPercent =
    token.status === 'CALLED' || token.status === 'SERVING'
      ? 100
      : Math.min(95, Math.max(15, Math.round(100 - (peopleAhead / 8) * 60)));

  const isCalledOrServing = ['CALLED', 'SERVING'].includes(token.status);

  // Department token duration configured in admin panel
  const departmentDuration =
    token.departmentId?.tokenDurationMinutes ||
    token.serviceDurationMinutes ||
    token.serviceId?.averageServiceTime ||
    10;

  // Format MM:SS for ticking countdown
  const minutesPart = Math.floor(secondsRemaining / 60);
  const secondsPart = secondsRemaining % 60;
  const formattedCountdown = `${String(minutesPart).padStart(2, '0')}m ${String(secondsPart).padStart(2, '0')}s`;

  return (
    <>
      <Card3D maxTilt={6} className="w-full">
        <div
          className={`holo-pass-3d relative overflow-hidden transition-all duration-300 border-2 ${
            isCalledOrServing
              ? 'border-purple-500/80 shadow-[0_0_50px_rgba(168,85,247,0.35)]'
              : token.status === 'APPROACHING'
              ? 'border-cyan-500/80 shadow-[0_0_50px_rgba(6,182,212,0.35)]'
              : 'border-slate-700/80'
          }`}
        >
          {/* Header Ribbon */}
          <div
            className={`py-2.5 px-6 flex items-center justify-between text-xs font-bold tracking-wider uppercase border-b ${
              isCalledOrServing
                ? 'bg-purple-950/90 text-purple-200 border-purple-500/40 animate-pulse'
                : token.status === 'APPROACHING'
                ? 'bg-cyan-950/90 text-cyan-200 border-cyan-500/40'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono text-[11px] tracking-wider">LIVE VIRTUAL QUEUE PASS</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Department token duration badge configured from Admin Panel */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-900/60 border border-cyan-500/40 text-cyan-200">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Division Duration: {departmentDuration} mins/token</span>
              </span>
              <span className="text-[11px] text-slate-300 opacity-90 font-mono">
                {token.officeId?.name || 'Government Service Center'}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white text-3d-cyan">
                    {token.tokenNumber}
                  </h3>
                  <StatusBadge status={token.status} />
                  {(token.priority === 'SENIOR_CITIZEN' || token.isSeniorCitizen) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black bg-amber-950/80 text-amber-300 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      <span>👴</span>
                      <span>SENIOR (60+) PRIORITY PASS</span>
                    </span>
                  )}
                  {token.priority && token.priority !== 'NORMAL' && token.priority !== 'SENIOR_CITIZEN' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                      <span>{token.priority}</span>
                    </span>
                  )}
                </div>
                <p className="text-base font-bold text-cyan-400 mt-2">
                  {token.serviceId?.name || 'Citizen Public Service'}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5">
                  <p className="text-xs text-slate-200 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{token.departmentId?.name || 'Department'}</span>
                  </p>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-md">
                    Admin Set Slot: {departmentDuration}m
                  </span>
                </div>
              </div>

              {/* QR Quick Preview & Refresh Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Refresh Live Queue Status"
                  className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 transition shadow-lg cursor-pointer"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/40 hover:border-cyan-300 text-white transition-all shadow-xl hover:shadow-cyan-500/20 group cursor-pointer"
                >
                  <QrCode className="w-7 h-7 text-cyan-300 group-hover:scale-110 transition" />
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight font-mono text-cyan-200">View QR Pass</p>
                    <p className="text-[10px] text-slate-300">Scan at counter</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              {/* People Ahead */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-700 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200 font-semibold mb-1">
                  <Users className="w-4 h-4 text-cyan-300" />
                  <span>People Ahead</span>
                </div>
                <p className="text-2xl font-black font-mono text-white">
                  {isCalledOrServing ? 'Your Turn!' : peopleAhead}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
                  {isCalledOrServing ? 'At counter now' : `Queue pos #${token.queuePosition}`}
                </p>
              </div>

              {/* LIVE TICKING COUNTDOWN */}
              <div className="bg-slate-950/90 rounded-2xl p-4 border border-amber-400/60 backdrop-blur-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                    <Timer className="w-4 h-4 animate-pulse" />
                    <span>Live Wait Countdown</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                </div>
                <p className="text-2xl font-black font-mono text-amber-300 tracking-tight">
                  {isCalledOrServing ? '00m 00s' : formattedCountdown}
                </p>
                <p className="text-[11px] text-amber-200/90 mt-0.5 font-mono">
                  {isCalledOrServing ? 'Being served now' : `Ticking live • ~${initialMinutes}m total`}
                </p>
              </div>

              {/* Counter Desk */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-purple-500/40 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs text-purple-200 font-semibold mb-1">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span>Assigned Counter</span>
                </div>
                <p className="text-2xl font-black font-mono text-purple-200">
                  {token.counterId?.counterNumber || 'Counter 3'}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 font-mono">Physical desk</p>
              </div>

              {/* Recommended Arrival */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-emerald-500/40 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold mb-1">
                  <Calendar className="w-4 h-4 text-emerald-300" />
                  <span>Arrive Smart</span>
                </div>
                <p className="text-lg font-black font-mono text-emerald-300 truncate">
                  {token.recommendedArrivalTime || '11:35 AM'}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 font-mono">Recommended arrival</p>
              </div>
            </div>

            {token.serviceId?.requiredDocuments?.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-950/90 border border-amber-400/50">
                <div className="flex items-center justify-between mb-1.5 pb-2 border-b border-amber-400/30">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-300" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                      Documents to carry at {token.officeId?.name || 'the office'}
                    </span>
                    <span className="text-[10px] font-mono text-amber-200 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-400/40">
                      {checkedDocs.size}/{token.serviceId.requiredDocuments.length} checked
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const text =
                        `📋 Required Documents for ${token.serviceId?.name} at ${token.officeId?.name || 'Government Office'}:\n` +
                        token.serviceId.requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join('\n') +
                        `\n\n* Keep originals ready before proceeding to the counter.`;
                      navigator.clipboard.writeText(text);
                      setCopiedDocs(true);
                      toast.success('Document checklist copied!');
                      setTimeout(() => setCopiedDocs(false), 2000);
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-[10px] font-mono font-bold border border-amber-400/40 flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedDocs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDocs ? 'Copied' : 'Copy List'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-200 mb-3 font-mono">
                  Keep physical originals ready for {token.serviceId?.name}. Click any item to check off:
                </p>

                <ol className="space-y-1.5">
                  {token.serviceId.requiredDocuments.map((doc, i) => {
                    const isChecked = checkedDocs.has(doc);
                    return (
                      <li
                        key={i}
                        onClick={() => {
                          setCheckedDocs((prev) => {
                            const next = new Set(prev);
                            if (next.has(doc)) next.delete(doc);
                            else next.add(doc);
                            return next;
                          });
                        }}
                        className={`flex items-center justify-between gap-2 p-2 rounded-xl border text-xs font-mono transition cursor-pointer select-none ${
                          isChecked
                            ? 'bg-emerald-950/60 border-emerald-400/60 text-emerald-200'
                            : 'bg-slate-900/90 border-slate-700 text-slate-100 hover:border-amber-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isChecked ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <span className={isChecked ? 'line-through opacity-70' : ''}>{doc}</span>
                        </div>
                        <span className="text-[10px] text-slate-300 font-mono">
                          {isChecked ? 'Ready' : 'Click to tick'}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {/* Real-time Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-slate-200 font-mono text-[11px] font-bold">
                  Queue Progression (Live Ticking)
                </span>
                <span className="text-cyan-300 font-mono font-bold">{progressPercent}% closer</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCalledOrServing
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.7)]'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.7)]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Action alerts */}
            {token.status === 'CALLED' ? (
              <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-purple-100 mb-5 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0 animate-bounce" />
                <div>
                  <p className="text-sm font-bold">Your Token has been Called!</p>
                  <p className="text-xs text-purple-300">
                    Please proceed immediately to <strong>{token.counterId?.counterNumber || 'Counter 3'}</strong> with your original documents.
                  </p>
                </div>
              </div>
            ) : token.status === 'APPROACHING' ? (
              <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-100 mb-5 flex items-center gap-3 text-xs">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold">Turn Approaching!</p>
                  <p className="text-cyan-200">
                    Only {peopleAhead} citizen{peopleAhead === 1 ? '' : 's'} ahead. Approximate wait remaining: <strong>{formattedCountdown}</strong>. Start heading to the counter.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
              <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Live Socket.IO Sync Active</span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-[10px] text-cyan-300 font-bold">
                  Dept Duration: {departmentDuration}m
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-800/60 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{cancelling ? 'Cancelling...' : 'Cancel Token'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card3D>

      <QRModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} token={token} />
    </>
  );
};

export default ActiveTokenCard;
