import React, { useState } from 'react';
import {
  PhoneCall,
  RotateCcw,
  SkipForward,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  FileText,
  Check,
} from 'lucide-react';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';

const ActionControlPanel = ({
  counter,
  currentToken,
  nextToken,
  onActionCompleted,
}) => {
  const [loadingAction, setLoadingAction] = useState(null);
  const [verifiedDocs, setVerifiedDocs] = useState(new Set());

  const handleCallNext = async () => {
    try {
      setLoadingAction('call');
      const res = await staffService.callNext(counter?.id);
      if (res.success) {
        toast.success(`Token ${res.token?.tokenNumber} called to ${counter?.counterNumber}!`);
        if (onActionCompleted) onActionCompleted();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to call next token');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRecall = async () => {
    if (!currentToken?._id) return;
    try {
      setLoadingAction('recall');
      const res = await staffService.recall(currentToken._id);
      if (res.success) {
        toast.success(`Re-announced token ${currentToken.tokenNumber} on display & audio!`);
        if (onActionCompleted) onActionCompleted();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to recall token');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStartService = async () => {
    if (!currentToken?._id) return;
    try {
      setLoadingAction('start');
      const res = await staffService.startService(currentToken._id);
      if (res.success) {
        toast.success(`Service started for token ${currentToken.tokenNumber}`);
        if (onActionCompleted) onActionCompleted();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start service');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCompleteService = async () => {
    if (!currentToken?._id) return;
    try {
      setLoadingAction('complete');
      const res = await staffService.completeService(currentToken._id);
      if (res.success) {
        toast.success(`Token ${currentToken.tokenNumber} service marked COMPLETED.`);
        if (onActionCompleted) onActionCompleted();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete service');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSkip = async () => {
    if (!currentToken?._id) return;
    if (!window.confirm(`Mark token ${currentToken.tokenNumber} as absent/skipped?`)) return;

    try {
      setLoadingAction('skip');
      const res = await staffService.skip(currentToken._id);
      if (res.success) {
        toast.error(`Token ${currentToken.tokenNumber} skipped.`);
        if (onActionCompleted) onActionCompleted();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to skip token');
    } finally {
      setLoadingAction(null);
    }
  };

  const isServing = currentToken?.status === 'SERVING';
  const isCalled = currentToken?.status === 'CALLED';

  return (
    <div className="gov-card p-6 sm:p-7 border border-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1a2a5e] bg-[#1a2a5e]/5 border border-[#1a2a5e]/20 px-2.5 py-1 rounded">
            Live Counter Control Desk
          </span>
          <h3 className="text-xl font-black text-[#1a2a5e] mt-1 font-heading">
            {counter?.counterNumber || 'Counter 3'} Terminal
          </h3>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            Operational
          </span>
        </div>
      </div>

      {/* Counter Focus Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* CURRENT SERVING */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1a2a5e] to-[#243470] text-white border border-[#c8a227]/40 shadow-md">
          <span className="text-xs font-mono font-bold text-[#c8a227] uppercase tracking-wider">
            Current Token at Counter
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-4xl font-black font-mono text-white tracking-tight">
              {currentToken ? currentToken.tokenNumber : 'NONE'}
            </p>
            {currentToken && (
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#c8a227] text-[#1a2a5e] shadow-xs">
                {currentToken.status}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-200 mt-2 truncate font-medium">
            {currentToken ? currentToken.citizenName || 'Citizen' : 'Counter currently idle'}
          </p>
        </div>

        {/* NEXT IN LINE */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
            Next In Line
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-4xl font-black font-mono text-[#1a2a5e] tracking-tight">
              {nextToken ? nextToken.tokenNumber : 'None waiting'}
            </p>
            {nextToken && (
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                Next Eligible
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-2 truncate font-medium">
            {nextToken ? `${nextToken.citizenName} (${nextToken.serviceId?.name})` : 'Queue empty'}
          </p>
        </div>
      </div>

      {/* Citizen Physical Document Verification Checklist (for staff) */}
      {currentToken && currentToken.serviceId?.requiredDocuments?.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-300">
            <span className="font-mono font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Counter Verification: Mandatory Documents Checklist</span>
            </span>
            <span className="text-[11px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 font-bold">
              {verifiedDocs.size} / {currentToken.serviceId.requiredDocuments.length} Verified
            </span>
          </div>

          <p className="text-[11px] text-slate-700 mb-2 font-mono">
            Verify that citizen presented originals for {currentToken.serviceId.name}:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentToken.serviceId.requiredDocuments.map((doc, idx) => {
              const isVerified = verifiedDocs.has(doc);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setVerifiedDocs((prev) => {
                      const next = new Set(prev);
                      if (next.has(doc)) next.delete(doc);
                      else next.add(doc);
                      return next;
                    });
                  }}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer font-mono text-[11px] ${
                    isVerified
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-amber-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isVerified ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{doc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Action Buttons with 3D tactile feel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* CALL NEXT */}
        <button
          type="button"
          onClick={handleCallNext}
          disabled={loadingAction !== null || (currentToken && ['CALLED', 'SERVING'].includes(currentToken.status))}
          className="lg:col-span-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs font-mono flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed btn-3d border border-cyan-400/40"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{loadingAction === 'call' ? 'Calling...' : 'CALL NEXT'}</span>
        </button>

        {/* RECALL */}
        <button
          type="button"
          onClick={handleRecall}
          disabled={loadingAction !== null || !currentToken}
          className="py-3.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-400 font-black text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed btn-3d shadow-md"
        >
          <RotateCcw className="w-4 h-4 text-amber-700" />
          <span>{loadingAction === 'recall' ? 'Recalling...' : 'RECALL'}</span>
        </button>

        {/* START SERVICE */}
        <button
          type="button"
          onClick={handleStartService}
          disabled={loadingAction !== null || !currentToken || isServing}
          className="py-3.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-400 font-black text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed btn-3d shadow-md"
        >
          <PlayCircle className="w-4 h-4 text-indigo-700" />
          <span>{loadingAction === 'start' ? 'Starting...' : 'START SERVICE'}</span>
        </button>

        {/* COMPLETE SERVICE */}
        <button
          type="button"
          onClick={handleCompleteService}
          disabled={loadingAction !== null || !currentToken}
          className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs font-mono flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed btn-3d border border-emerald-400/40"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{loadingAction === 'complete' ? 'Completing...' : 'COMPLETE'}</span>
        </button>

        {/* SKIP */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={loadingAction !== null || !currentToken}
          className="py-3.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-400 font-black text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed btn-3d shadow-md"
        >
          <SkipForward className="w-4 h-4 text-rose-700" />
          <span>{loadingAction === 'skip' ? 'Skipping...' : 'SKIP'}</span>
        </button>
      </div>
    </div>
  );
};

export default ActionControlPanel;
