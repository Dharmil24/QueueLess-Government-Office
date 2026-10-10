import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CreditCard,
  Briefcase,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card3D from '../components/common/3D/Card3D';

const DEMO_ACCOUNTS = [
  {
    label: 'Citizen: Rahul Patel (Token A-057)',
    email: 'rahul@example.com',
    password: 'password123',
    icon: User,
    iconColor: '#1a2a5e',
    accent: '#1a2a5e',
    bg: 'rgba(26,42,94,0.06)',
    border: 'rgba(26,42,94,0.2)',
    hoverBorder: '#1a2a5e',
  },
  {
    label: 'Staff: Counter 3 Operator (RTO)',
    email: 'staff3@rto.gov.in',
    password: 'password123',
    icon: CreditCard,
    iconColor: '#059669',
    accent: '#059669',
    bg: 'rgba(5,150,105,0.06)',
    border: 'rgba(5,150,105,0.2)',
    hoverBorder: '#059669',
  },
  {
    label: 'Chief Admin: Smt. Ananya Sharma',
    email: 'admin@queueless.gov.in',
    password: 'admin123',
    icon: Briefcase,
    iconColor: '#c8a227',
    accent: '#c8a227',
    bg: 'rgba(200,162,39,0.06)',
    border: 'rgba(200,162,39,0.25)',
    hoverBorder: '#c8a227',
  },
];

const LoginPage = () => {
  const { login, demoRegister, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoadingIdx, setDemoLoadingIdx] = useState(null);

  const from = location.state?.from?.pathname;

  const redirectByRole = (role) => {
    if (from) { navigate(from, { replace: true }); return; }
    if (role === 'citizen') navigate('/citizen');
    else if (role === 'staff') navigate('/staff');
    else if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      const res = await login({ email, password });
      toast.success(`Welcome back, ${res.user.name}!`);
      redirectByRole(res.user.role);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword, idx) => {
    setDemoLoadingIdx(idx);
    setEmail(demoEmail);
    setPassword(demoPassword);
    const role = idx === 0 ? 'citizen' : idx === 1 ? 'staff' : 'admin';
    try {
      let res;
      if (demoLogin) {
        res = await demoLogin({ role, email: demoEmail, password: demoPassword });
      } else {
        res = await login({ email: demoEmail, password: demoPassword });
      }
      // Use actual role from response for correct redirect
      const userRole = res?.user?.role || role;
      toast.success(`✅ Welcome ${res.user.name} (${res.user.role.toUpperCase()})!`);
      redirectByRole(userRole);
    } catch (err) {
      console.error('[Demo Login] Failed:', err);
      toast.error(`Demo login failed: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setDemoLoadingIdx(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f2f8 0%, #e8ecf5 50%, #eef1f8 100%)' }}>
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(26,42,94,0.08) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-lg border group-hover:scale-105 transition"
            style={{ background: 'linear-gradient(135deg, #1a2a5e, #c8a227)', borderColor: 'rgba(200,162,39,0.4)' }}>
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-tight font-heading" style={{ color: '#1a2a5e' }}>
            QueueLess
          </span>
        </Link>
        <h2 className="text-xl font-black font-heading mt-2" style={{ color: '#1a2a5e' }}>
          Official Citizen &amp; Staff Portal
        </h2>
        <p className="text-xs font-mono mt-1 font-bold" style={{ color: '#c8a227' }}>
          Wait Less. Arrive Smart. Get Served.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <Card3D maxTilt={6}>
          <div className="py-8 px-6 sm:px-8 rounded-3xl shadow-2xl relative"
            style={{
              background: 'white',
              border: '1px solid rgba(26,42,94,0.12)',
            }}>

            {/* ── Demo Logins Block ── */}
            <div className="mb-6 p-4 rounded-2xl" style={{
              background: 'linear-gradient(135deg, rgba(26,42,94,0.04) 0%, rgba(200,162,39,0.04) 100%)',
              border: '1px solid rgba(26,42,94,0.15)',
            }}>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold mb-3" style={{ color: '#1a2a5e' }}>
                <Sparkles className="w-4 h-4 animate-pulse" style={{ color: '#c8a227' }} />
                <span>One-Click Evaluator Demo Logins</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {DEMO_ACCOUNTS.map((demo, idx) => {
                  const Icon = demo.icon;
                  const isLoading = demoLoadingIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={demoLoadingIdx !== null}
                      onClick={() => handleQuickDemoLogin(demo.email, demo.password, idx)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer group disabled:opacity-60"
                      style={{
                        background: demo.bg,
                        border: `1px solid ${demo.border}`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = demo.hoverBorder}
                      onMouseLeave={e => e.currentTarget.style.borderColor = demo.border}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 transition group-hover:scale-110" style={{ color: demo.iconColor }} />
                        <div>
                          <span className="font-bold block" style={{ color: '#1a2238' }}>{demo.label}</span>
                          <span className="text-[10px] font-mono" style={{ color: '#64748b' }}>{demo.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold shrink-0 ml-2" style={{ color: demo.accent }}>
                        {isLoading ? '...' : '1-Click →'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'rgba(26,42,94,0.12)' }}></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 font-mono font-semibold"
                  style={{ background: 'white', color: '#64748b' }}>
                  Or enter credentials manually
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 font-mono" style={{ color: '#1a2a5e' }}>
                  Official Email or Employee ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1a2a5e' }} />
                  <input
                    type="text"
                    required
                    placeholder="name@example.com or EMP-RTO-01"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
                    style={{
                      background: '#f8f9fc',
                      border: '1.5px solid rgba(26,42,94,0.2)',
                      color: '#1a2238',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#1a2a5e'; e.target.style.boxShadow = '0 0 0 3px rgba(26,42,94,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(26,42,94,0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 font-mono" style={{ color: '#1a2a5e' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1a2a5e' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
                    style={{
                      background: '#f8f9fc',
                      border: '1.5px solid rgba(26,42,94,0.2)',
                      color: '#1a2238',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#1a2a5e'; e.target.style.boxShadow = '0 0 0 3px rgba(26,42,94,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(26,42,94,0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 btn-3d"
                style={{
                  background: 'linear-gradient(135deg, #1a2a5e 0%, #243470 100%)',
                  color: 'white',
                  border: '1px solid rgba(200,162,39,0.4)',
                  boxShadow: '0 4px 15px rgba(26,42,94,0.35)',
                }}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs" style={{ color: '#64748b' }}>
              <span>New citizen? </span>
              <Link to="/register" className="font-bold hover:underline" style={{ color: '#1a2a5e' }}>
                Create a citizen account
              </Link>
            </div>
          </div>
        </Card3D>

        {/* Seed hint */}
        <div className="mt-4 mx-2 p-3 rounded-xl flex items-start gap-2 text-xs"
          style={{ background: 'rgba(200,162,39,0.1)', border: '1px solid rgba(200,162,39,0.3)' }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#c8a227' }} />
          <span style={{ color: '#7a6010' }}>
            Demo accounts require seed data. If 1-Click login fails, run:{' '}
            <code className="font-mono font-bold">node seeds/seedData.js</code> in the backend directory.
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
