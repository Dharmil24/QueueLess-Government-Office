import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import {
  LayoutDashboard,
  Radio,
  Building2,
  Layers,
  FileCheck2,
  CreditCard,
  Users2,
  UserCheck,
  BarChart3,
  ScrollText,
  Sliders,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview Analytics', path: '/admin', icon: LayoutDashboard },
    { label: 'Live Queue Monitor', path: '/admin/live-queue', icon: Radio },
    { label: 'Offices', path: '/admin/offices', icon: Building2 },
    { label: 'Departments', path: '/admin/departments', icon: Layers },
    { label: 'Services', path: '/admin/services', icon: FileCheck2 },
    { label: 'Counters', path: '/admin/counters', icon: CreditCard },
    { label: 'Staff Management', path: '/admin/staff', icon: Users2 },
    { label: 'Citizens', path: '/admin/citizens', icon: UserCheck },
    { label: 'Reports & Export', path: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: ScrollText },
    { label: 'System Settings', path: '/admin/settings', icon: Sliders },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[#c8a227] selection:text-white"
      style={{ background: 'linear-gradient(135deg, #f0f2f8 0%, #eef1f8 100%)' }}>
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'rgba(26,42,94,0.06)' }} />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'rgba(200,162,39,0.05)' }} />
        <div className="absolute inset-0 cyber-grid opacity-30" />
      </div>

      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile Admin toggle */}
          <div className="md:hidden flex justify-between items-center p-4 rounded-2xl shadow-md"
            style={{ background: '#1a2a5e', border: '1px solid rgba(200,162,39,0.25)' }}>
            <span className="font-bold text-sm text-white font-mono">Admin Control Center</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl transition"
              style={{ background: 'rgba(200,162,39,0.2)', color: '#e8d080' }}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Sidebar */}
          <aside
            className={`w-full md:w-64 backdrop-blur-xl rounded-2xl shadow-xl p-3 shrink-0 h-fit transition ${
              sidebarOpen ? 'block' : 'hidden md:block'
            }`}
            style={{ background: '#1a2a5e', border: '1px solid rgba(200,162,39,0.2)' }}
          >
            {/* Sidebar Header */}
            <div className="px-3.5 py-3 mb-2" style={{ borderBottom: '1px solid rgba(200,162,39,0.2)' }}>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#c8a227' }}>
                Administration
              </p>
              <h3 className="font-extrabold text-white text-sm font-heading mt-0.5">
                Central Gov Portal
              </h3>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition"
                    style={active ? {
                      background: 'linear-gradient(135deg, #c8a227 0%, #e8be3a 100%)',
                      color: '#1a2a5e',
                      border: '1px solid rgba(232,190,58,0.5)',
                      boxShadow: '0 4px 12px rgba(200,162,39,0.3)',
                      fontWeight: 700,
                    } : {
                      color: 'rgba(200,216,255,0.75)',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(200,216,255,0.75)'; } }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" style={{ color: active ? '#1a2a5e' : '#c8a227' }} />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5" style={{ color: '#1a2a5e' }} />}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Admin Content Area */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
