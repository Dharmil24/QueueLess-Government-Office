import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../services/notificationService';
import {
  Building2,
  Ticket,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShieldAlert,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = () => {
        loadNotifications();
      };
      socket.on('new_notification', handleNewNotification);
      socket.on('token_called_direct', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
        socket.off('token_called_direct', handleNewNotification);
      };
    }
  }, [socket]);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success) {
        setUnreadNotifsCount(res.unreadCount || 0);
        setRecentNotifs(res.notifications?.slice(0, 5) || []);
      }
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadNotifsCount(0);
      loadNotifications();
    } catch (err) {
      // Ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 shadow-[0_4px_20px_rgba(26,42,94,0.35)]">
      {/* Top Government Notice Bar — deep navy */}
      <div className="bg-[#0f1a3a] text-[#c8a227] text-[11px] py-1 px-4 flex justify-between items-center tracking-wide border-b border-[#c8a227]/20">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c8a227] shadow-[0_0_8px_#c8a227] animate-pulse"></span>
          <span className="font-mono text-[#e8d080]">Official Digital Public Queue Service Platform</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 font-mono text-[11px]">
          <span className="text-[#b89a25]">Helpline: <strong className="text-[#e8d080]">1800-112-233</strong></span>
        </div>
      </div>

      {/* Main Navbar — navy blue */}
      <div className="bg-[#1a2a5e] backdrop-blur-xl border-b border-[#c8a227]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#c8a227] via-[#e8be3a] to-[#a07f1a] flex items-center justify-center text-[#1a2a5e] shadow-[0_0_20px_rgba(200,162,39,0.5)] group-hover:scale-105 transition border border-[#e8d080]/40">
                <Building2 className="w-5 h-5 relative z-10" />
                <div className="absolute inset-0 rounded-xl bg-[#c8a227]/20 blur-xs" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white font-heading">
                    QueueLess
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#c8a227]/20 text-[#e8d080] border border-[#c8a227]/40 uppercase tracking-widest">
                    Gov
                  </span>
                </div>
                <p className="text-[10px] text-[#c8a227]/70 hidden sm:block font-mono tracking-tight">
                  Wait Less. Arrive Smart. Get Served.
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#c8d8ff]">
              {isAuthenticated && role === 'citizen' && (
                <>
                  <Link
                    to="/citizen"
                    className={`px-3.5 py-2 rounded-xl transition ${
                      isActive('/citizen')
                        ? 'text-[#e8d080] bg-[#c8a227]/20 border border-[#c8a227]/40 shadow-[0_0_15px_rgba(200,162,39,0.2)] font-bold'
                        : 'hover:text-white hover:bg-white/10'
                    }`}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/citizen/book"
                    className={`px-3.5 py-2 rounded-xl transition ${
                      isActive('/citizen/book')
                        ? 'text-[#e8d080] bg-[#c8a227]/20 border border-[#c8a227]/40 shadow-[0_0_15px_rgba(200,162,39,0.2)] font-bold'
                        : 'hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Get Token
                  </Link>
                </>
              )}

              {isAuthenticated && (role === 'staff' || role === 'admin') && (
                <Link
                  to="/staff"
                  className={`px-3.5 py-2 rounded-xl transition ${
                    isActive('/staff')
                      ? 'text-[#e8d080] bg-[#c8a227]/20 border border-[#c8a227]/40 shadow-[0_0_15px_rgba(200,162,39,0.2)] font-bold'
                      : 'hover:text-white hover:bg-white/10'
                  }`}
                >
                  Staff Counter
                </Link>
              )}

              {isAuthenticated && role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'text-[#e8d080] bg-[#c8a227]/20 border border-[#c8a227]/40 shadow-[0_0_15px_rgba(200,162,39,0.2)] font-bold'
                      : 'hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#e8d080]" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* Right Actions & Profile */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Notification Bell Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                      className="relative p-2.5 rounded-xl text-[#c8d8ff] hover:text-white hover:bg-white/10 border border-white/10 transition focus:outline-none cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotifsCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-[0_0_10px_#f43f5e]">
                          {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                        </span>
                      )}
                    </button>

                    {/* Dropdown Panel */}
                    {showNotifDropdown && (
                      <div className="absolute right-0 mt-2 w-80 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#1a2a5e]/15 p-4 z-50 text-[#1a2238]">
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a2a5e]/10">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#1a2a5e] font-heading">Notifications</h4>
                            {unreadNotifsCount > 0 && (
                              <span className="text-[10px] bg-[#c8a227]/15 text-[#a07f1a] border border-[#c8a227]/30 px-1.5 py-0.5 rounded-full font-mono font-bold">
                                {unreadNotifsCount} new
                              </span>
                            )}
                          </div>
                          {unreadNotifsCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              className="text-xs text-[#1a2a5e] hover:text-[#c8a227] font-semibold cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="divide-y divide-[#1a2a5e]/08 max-h-64 overflow-y-auto mt-2">
                          {recentNotifs.length > 0 ? (
                            recentNotifs.map((n) => (
                              <div key={n._id} className="py-2.5 text-xs">
                                <p className="font-semibold text-[#1a2238]">{n.title}</p>
                                <p className="text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 inline-block font-mono">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                          )}
                        </div>

                        {role === 'citizen' && (
                          <div className="pt-2 border-t border-[#1a2a5e]/10 text-center">
                            <Link
                              to="/citizen"
                              onClick={() => setShowNotifDropdown(false)}
                              className="text-xs font-semibold text-[#1a2a5e] hover:underline"
                            >
                              Go to Citizen Dashboard
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Profile Pill */}
                  <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-white/15">
                    <div className="text-right">
                      <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#e8d080] bg-[#c8a227]/20 border border-[#c8a227]/30 px-1.5 py-0.5 rounded">
                        {role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-2 rounded-xl text-[#c8d8ff]/70 hover:text-rose-300 hover:bg-rose-900/30 border border-transparent hover:border-rose-800/40 transition cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition border border-white/20 hover:border-white/40"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#c8a227] to-[#e8be3a] hover:from-[#d4b030] hover:to-[#f0d050] text-[#1a2a5e] shadow-lg shadow-[#c8a227]/30 border border-[#e8d080]/40 transition btn-3d"
                  >
                    Citizen Register
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl md:hidden text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#c8a227]/20 bg-[#1a2a5e]/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated && role === 'citizen' && (
            <>
              <Link
                to="/citizen"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-xs font-semibold text-white hover:bg-white/10"
              >
                Citizen Dashboard & Active Token
              </Link>
              <Link
                to="/citizen/book"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-xs font-bold text-[#e8d080] hover:bg-[#c8a227]/10"
              >
                + Get Virtual Token
              </Link>
            </>
          )}

          {isAuthenticated && (role === 'staff' || role === 'admin') && (
            <Link
              to="/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-xs font-semibold text-white hover:bg-white/10"
            >
              Staff Counter Panel
            </Link>
          )}

          {isAuthenticated && role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-xs font-semibold text-[#e8d080] hover:bg-[#c8a227]/10"
            >
              Admin Central Command
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-900/30 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Log Out ({user.name})
            </button>
          ) : (
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-white"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold bg-[#c8a227] text-[#1a2a5e]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
