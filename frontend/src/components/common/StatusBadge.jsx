import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'WAITING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-400 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Waiting in Queue
        </span>
      );

    case 'APPROACHING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-400 animate-pulse ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
          Approaching Turn
        </span>
      );

    case 'CALLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black bg-purple-100 text-purple-900 border border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.25)] ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
          CALLED TO COUNTER
        </span>
      );

    case 'SERVING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-500 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Currently Serving
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Completed
        </span>
      );

    case 'SKIPPED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-orange-100 text-orange-900 border border-orange-400 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          Skipped / Absent
        </span>
      );

    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-100 text-rose-900 border border-rose-400 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Cancelled
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-300 ${className}`}
        >
          {status}
        </span>
      );
  }
};

export default StatusBadge;
