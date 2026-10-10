import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { tokenService } from '../../services/tokenService';
import { officeService } from '../../services/officeService';
import ActiveTokenCard from '../../components/citizen/ActiveTokenCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card3D from '../../components/common/3D/Card3D';
import {
  Ticket,
  Building2,
  Clock,
  Search,
  Plus,
  History,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { socket, joinOffice } = useSocket();

  const [activeToken, setActiveToken] = useState(null);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen to real-time events for the active token
  useEffect(() => {
    if (activeToken?.officeId?._id) {
      joinOffice(activeToken.officeId._id);
    }

    if (socket) {
      const handleTokenUpdated = (data) => {
        loadDashboardData();
      };

      const handleQueueUpdated = () => {
        loadDashboardData();
      };

      socket.on('token_updated', handleTokenUpdated);
      socket.on('token_called', handleQueueUpdated);
      socket.on('token_completed', handleQueueUpdated);
      socket.on('token_cancelled', handleQueueUpdated);
      socket.on('queue_updated', handleQueueUpdated);

      return () => {
        socket.off('token_updated', handleTokenUpdated);
        socket.off('token_called', handleQueueUpdated);
        socket.off('token_completed', handleQueueUpdated);
        socket.off('token_cancelled', handleQueueUpdated);
        socket.off('queue_updated', handleQueueUpdated);
      };
    }
  }, [socket, activeToken?._id]);

  // Periodic silent refresh for live wait calibration
  useEffect(() => {
    if (!activeToken) return;
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [activeToken?._id]);

  const loadDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [tokenRes, officeRes] = await Promise.all([
        tokenService.getMyTokens(),
        officeService.getOffices(),
      ]);

      if (tokenRes.success) {
        setActiveToken(tokenRes.activeToken || null);
        setTokenHistory(
          tokenRes.tokens?.filter(
            (t) => !['WAITING', 'APPROACHING', 'CALLED', 'SERVING'].includes(t.status)
          ) || []
        );
      }

      if (officeRes.success) {
        setOffices(officeRes.offices?.slice(0, 4) || []);
      }
    } catch (err) {
      // Ignore
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1a2a5e] via-[#243470] to-[#0f1a3a] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-[#c8a227]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8a227]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#c8a227]/40 text-[#e8d080] text-xs font-mono font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Citizen Digital Portal • Live Sync</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white">
            Welcome back, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track your active government service token in real time, view approaching notices, and arrive right on schedule.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            to="/citizen/book"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#c8a227] to-[#e8be3a] hover:from-[#d4b030] hover:to-[#f0d050] text-[#1a2a5e] font-black text-xs transition shadow-lg shadow-[#c8a227]/30 flex items-center gap-2 cursor-pointer btn-3d border border-[#e8d080]/40"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Token</span>
          </Link>
          <Link
            to="/offices"
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/20 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Find Office</span>
          </Link>
        </div>
      </div>

      {/* ACTIVE TOKEN SECTION */}
      {loading ? (
        <LoadingSpinner text="Synchronizing live token state..." size="lg" />
      ) : activeToken ? (
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-lg font-black text-[#1a2a5e] font-heading flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#c8a227]" />
              <span>Your Active Token Pass</span>
            </h2>
            <span className="text-xs font-mono text-[#1a2a5e] font-semibold bg-[#1a2a5e]/10 px-2.5 py-1 rounded-full border border-[#1a2a5e]/20">
              Auto-updated via Socket.IO
            </span>
          </div>

          <ActiveTokenCard token={activeToken} onTokenUpdated={loadDashboardData} />
        </div>
      ) : (
        <Card3D maxTilt={5}>
          <div className="gov-card p-10 text-center border-dashed border-2 border-slate-300">
            <div className="w-16 h-16 rounded-3xl bg-[#1a2a5e]/10 text-[#1a2a5e] border border-[#1a2a5e]/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Ticket className="w-8 h-8 text-[#1a2a5e]" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1a2a5e] font-heading">No Active Virtual Tokens</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-6 font-medium">
              You currently do not have any pending tokens in the queue. Select a government office and generate a virtual token remotely.
            </p>
            <Link
              to="/citizen/book"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#1a2a5e] to-[#243470] hover:from-[#0f1a3a] hover:to-[#1a2a5e] text-white font-bold text-xs shadow-xl shadow-[#1a2a5e]/25 transition cursor-pointer btn-3d border border-[#c8a227]/40"
            >
              <Plus className="w-4 h-4 text-[#c8a227]" />
              <span>Get Your Virtual Token</span>
            </Link>
          </div>
        </Card3D>
      )}

      {/* QUICK OFFICES & TOKEN HISTORY 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nearby Government Offices (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#1a2a5e] font-heading flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#c8a227]" />
              <span>Government Offices &amp; Waiting Times</span>
            </h3>
            <Link to="/offices" className="text-xs font-mono font-bold text-[#1a2a5e] hover:text-[#c8a227] flex items-center gap-1 transition">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offices.map((office) => (
              <Card3D key={office._id} maxTilt={6}>
                <div className="gov-card p-5 flex flex-col justify-between h-full border border-[#1a2a5e]/15 hover:border-[#c8a227]/60 shadow-md">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#1a2a5e]/10 text-[#1a2a5e] border border-[#1a2a5e]/20 uppercase">
                        {office.code}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Open</span>
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#1a2a5e] leading-snug">{office.name}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                      {office.city}, PIN {office.pinCode}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-mono font-bold uppercase tracking-wider">Estimated Wait</span>
                      <strong className="text-blue-900 font-mono font-extrabold text-sm">~{office.estimatedWaitMinutes || 12} mins</strong>
                    </div>
                    <Link
                      to={`/citizen/book?officeId=${office._id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1a2a5e] to-[#243470] hover:from-[#0f1a3a] hover:to-[#1a2a5e] text-white border border-[#c8a227]/40 font-bold transition text-xs shadow-md shadow-[#1a2a5e]/20 flex items-center gap-1 btn-3d"
                    >
                      <span>Get Token</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>

        {/* Token History (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#1a2a5e] font-heading flex items-center gap-2">
              <History className="w-4 h-4 text-[#c8a227]" />
              <span>Recent Token History</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200/70 px-2.5 py-0.5 rounded-full border border-slate-300">
              {tokenHistory.length} Past
            </span>
          </div>

          <div className="gov-card p-4 divide-y divide-slate-200/80 max-h-[380px] overflow-y-auto border border-[#1a2a5e]/15 shadow-md">
            {tokenHistory.length > 0 ? (
              tokenHistory.slice(0, 6).map((t) => (
                <div key={t._id} className="py-3 first:pt-0 last:pb-0 text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono font-black text-sm text-[#1a2a5e]">{t.tokenNumber}</strong>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-slate-700 font-medium mt-0.5 truncate max-w-[160px]">
                      {t.serviceId?.name || 'Government Service'}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">
                      {new Date(t.generatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-[#1a2a5e] block">
                      {t.counterId?.counterNumber || 'Counter'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-600 font-mono font-semibold">
                No previous token history
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
