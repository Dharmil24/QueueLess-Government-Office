import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Ticket,
  Clock,
  Radio,
  BellRing,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Tv,
  Users,
  ChevronRight,
  TrendingDown,
  Layers,
  Cpu,
  Zap,
} from 'lucide-react';
import { officeService } from '../services/officeService';
import QueueHero3D from '../components/common/3D/QueueHero3D';
import Card3D from '../components/common/3D/Card3D';

const LandingPage = () => {
  const navigate = useNavigate();
  const [offices, setOffices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOffices();
  }, []);

  const loadOffices = async () => {
    try {
      const res = await officeService.getOffices();
      if (res.success) {
        setOffices(res.offices?.slice(0, 3) || []);
      }
    } catch (err) {
      // Ignore
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/offices?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/offices');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f8] text-[#1a2238] overflow-hidden">
      {/* HERO SECTION WITH INTERACTIVE 3D WEBGL SCENE */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-[#1a2a5e]/10 overflow-hidden">
        {/* Background ambient lighting — navy/gold */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#1a2a5e]/10 via-[#c8a227]/8 to-[#1a2a5e]/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 text-left">
              {/* Government Tag Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a2a5e]/8 border border-[#1a2a5e]/20 text-[#1a2a5e] text-xs font-mono font-bold mb-6 tracking-wide shadow-[0_0_20px_rgba(26,42,94,0.1)]">
                <span className="w-2 h-2 rounded-full bg-[#c8a227] animate-ping"></span>
                <span>Smart Virtual Queue & Waiting-Time Prediction System</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#1a2a5e] tracking-tight font-heading leading-tight">
                Skip the Physical Queue.{' '}
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#c8a227] via-[#e8be3a] to-[#a07f1a] bg-clip-text text-transparent display-glow">
                  Save Your Valuable Time.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[#1a2238]/70 font-normal leading-relaxed max-w-2xl">
                Generate a secure virtual token remotely, track your live queue position in real time with 3D spatial precision, and arrive precisely when your turn is near.
              </p>

              <p className="mt-3 text-xs sm:text-sm font-mono font-bold text-[#1a2a5e] uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#c8a227]" />
                <span>"Wait Less. Arrive Smart. Get Served."</span>
              </p>

              {/* Quick Search Bar */}
              <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl relative">
                <div className="flex items-center bg-white rounded-2xl shadow-xl border border-[#1a2a5e]/15 p-2 focus-within:border-[#c8a227] focus-within:ring-2 focus-within:ring-[#c8a227]/20 transition-all">
                  <Search className="w-5 h-5 text-[#c8a227] ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search office by name, service, or PIN code (e.g. RTO, 360001)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm focus:outline-none text-[#1a2238] placeholder:text-slate-400 bg-transparent"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1a2a5e] to-[#243470] hover:from-[#243470] hover:to-[#2d3f8a] text-white font-bold text-xs shrink-0 transition shadow-lg shadow-[#1a2a5e]/30 cursor-pointer btn-3d border border-[#c8a227]/30"
                  >
                    Find Office
                  </button>
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/citizen/book"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#c8a227] to-[#e8be3a] hover:from-[#d4b030] hover:to-[#f0d050] text-[#1a2a5e] font-bold text-sm shadow-xl shadow-[#c8a227]/30 transition-all flex items-center gap-2 group cursor-pointer btn-3d border border-[#e8d080]/40"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Get Virtual Token</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
                </Link>
                <Link
                  to="/offices"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#f0f2f8] border border-[#1a2a5e]/20 hover:border-[#1a2a5e]/40 text-[#1a2a5e] font-bold text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#c8a227]" />
                  <span>Browse All Offices</span>
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Interactive Three.js Scene */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full aspect-square max-w-[500px] relative">
                {/* 3D Scene */}
                <QueueHero3D />
              </div>
            </div>
          </div>

          {/* Hero Illustration / 4-Step 3D Workflow */}
          <div className="mt-20 max-w-6xl mx-auto glass-panel-3d p-6 sm:p-10 border border-[#1a2a5e]/12 relative">
            <div className="text-center mb-10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#c8a227]">
                System Workflow
              </span>
              <h3 className="text-2xl font-black text-[#1a2a5e] font-heading mt-1">
                Seamless 4-Step Virtual Experience
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <Card3D maxTilt={10}>
                <div className="h-full text-center p-5 rounded-2xl bg-white border border-[#1a2a5e]/10 hover:border-[#1a2a5e]/30 transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#1a2a5e]/8 text-[#1a2a5e] font-mono font-black text-xl flex items-center justify-center mx-auto mb-4 border border-[#1a2a5e]/20 shadow-[0_0_15px_rgba(26,42,94,0.1)]">
                      01
                    </div>
                    <h4 className="font-extrabold text-sm text-[#1a2a5e]">Select Office</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Pick your local government department and desired public service.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1a2a5e]/08 text-[10px] font-mono text-[#1a2a5e]/60">
                    Step 1 / 4
                  </div>
                </div>
              </Card3D>

              {/* Step 2 */}
              <Card3D maxTilt={10}>
                <div className="h-full text-center p-5 rounded-2xl bg-[#1a2a5e]/5 border border-[#c8a227]/30 hover:border-[#c8a227]/60 transition-all shadow-[0_0_25px_rgba(200,162,39,0.1)] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a2a5e] to-[#243470] text-white font-mono font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#1a2a5e]/30 border border-[#c8a227]/30">
                      02
                    </div>
                    <h4 className="font-extrabold text-sm text-[#1a2a5e]">Virtual Token</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Receive unique token code (e.g. A-057) and encrypted 3D QR pass.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#c8a227]/20 text-[10px] font-mono text-[#c8a227]">
                    Step 2 / 4
                  </div>
                </div>
              </Card3D>

              {/* Step 3 */}
              <Card3D maxTilt={10}>
                <div className="h-full text-center p-5 rounded-2xl bg-white border border-[#1a2a5e]/10 hover:border-[#1a2a5e]/30 transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#c8a227]/10 text-[#a07f1a] font-mono font-black text-xl flex items-center justify-center mx-auto mb-4 border border-[#c8a227]/30 shadow-[0_0_15px_rgba(200,162,39,0.15)]">
                      03
                    </div>
                    <h4 className="font-extrabold text-sm text-[#1a2a5e]">Live Tracking</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Socket.IO real-time countdown & smart waiting prediction engine.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1a2a5e]/08 text-[10px] font-mono text-[#1a2a5e]/60">
                    Step 3 / 4
                  </div>
                </div>
              </Card3D>

              {/* Step 4 */}
              <Card3D maxTilt={10}>
                <div className="h-full text-center p-5 rounded-2xl bg-[#c8a227]/5 border border-[#c8a227]/30 hover:border-[#c8a227]/60 transition-all shadow-[0_0_25px_rgba(200,162,39,0.1)] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c8a227] to-[#e8be3a] text-[#1a2a5e] font-mono font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#c8a227]/30 border border-[#e8d080]/40">
                      04
                    </div>
                    <h4 className="font-extrabold text-sm text-[#1a2a5e]">Arrive & Serve</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Proceed directly to your assigned desk without standing in line.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#c8a227]/20 text-[10px] font-mono text-[#c8a227]">
                    Step 4 / 4
                  </div>
                </div>
              </Card3D>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO HIGHLIGHT SCENARIO BANNER */}
      <section className="py-6 bg-gradient-to-r from-[#1a2a5e] via-[#243470] to-[#1a2a5e] border-y border-[#c8a227]/30 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-xl bg-[#c8a227]/20 text-[#e8d080] border border-[#c8a227]/40 shadow-[0_0_15px_rgba(200,162,39,0.3)]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#e8d080]">
                Pre-Configured Demo Scenario
              </p>
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                Citizen Rahul Patel • Token A-057 • Counter 3 RTO Rajkot
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl bg-[#c8a227] text-[#1a2a5e] hover:bg-[#e8be3a] font-bold text-xs transition shadow-md btn-3d"
            >
              Test Demo Logins
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED OFFICES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#c8a227]">
              Offices Network
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1a2a5e] mt-1 font-heading">
              Active Government Centers
            </h2>
          </div>
          <Link
            to="/offices"
            className="text-xs font-mono font-bold text-[#1a2a5e] hover:text-[#c8a227] flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offices.map((office) => (
            <Card3D key={office._id} maxTilt={8}>
              <div className="gov-card p-6 flex flex-col justify-between h-full border border-[#1a2a5e]/10 hover:border-[#c8a227]/40">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-[#1a2a5e]/8 text-[#1a2a5e] border border-[#1a2a5e]/20 uppercase">
                      {office.code}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Open Today</span>
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-[#1a2a5e] leading-snug">{office.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {office.address}, {office.city}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1a2a5e]/08">
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-[#f0f2f8] p-3 rounded-xl border border-[#1a2a5e]/08">
                      <span className="text-slate-500 block text-[10px] font-mono">Active Counters</span>
                      <strong className="text-[#1a2a5e] text-sm font-mono">{office.activeCounters || 3} Active</strong>
                    </div>
                    <div className="bg-[#f0f2f8] p-3 rounded-xl border border-[#1a2a5e]/08">
                      <span className="text-slate-500 block text-[10px] font-mono">Avg Wait Time</span>
                      <strong className="text-[#c8a227] text-sm font-mono">~{office.estimatedWaitMinutes || 15} Mins</strong>
                    </div>
                  </div>

                  <Link
                    to={`/citizen/book?officeId=${office._id}`}
                    className="w-full py-3 rounded-xl bg-[#1a2a5e]/8 hover:bg-gradient-to-r hover:from-[#1a2a5e] hover:to-[#243470] text-[#1a2a5e] hover:text-white border border-[#1a2a5e]/20 hover:border-transparent font-bold text-xs transition-all flex items-center justify-center gap-2 btn-3d shadow-sm cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Get Token for this Office</span>
                  </Link>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* KEY FEATURES SECTION */}
      <section className="py-20 bg-[#eef1f8] border-t border-[#1a2a5e]/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#c8a227]">
              Smart Technology
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1a2a5e] mt-1 font-heading">
              Why Government Offices Choose QueueLess
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Transforming bureaucratic physical queues into a seamless, high-tech, citizen-centric ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card3D maxTilt={7}>
              <div className="gov-card p-6 h-full flex flex-col justify-between border border-[#1a2a5e]/10 hover:border-[#1a2a5e]/30">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#1a2a5e]/8 text-[#1a2a5e] border border-[#1a2a5e]/20 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(26,42,94,0.1)]">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#1a2a5e]">Real-Time Socket.IO Synchronization</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    When staff calls or completes a token at Counter 3, all connected citizens and public LED display screens update instantly with zero page reloads.
                  </p>
                </div>
              </div>
            </Card3D>

            <Card3D maxTilt={7}>
              <div className="gov-card p-6 h-full flex flex-col justify-between border border-[#c8a227]/20 hover:border-[#c8a227]/50">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#c8a227]/10 text-[#a07f1a] border border-[#c8a227]/30 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(200,162,39,0.15)]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#1a2a5e]">Wait-Time Prediction Engine</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    Intelligent algorithm calculating waiting minutes and recommended arrival time based on people ahead, service duration, and active counters.
                  </p>
                </div>
              </div>
            </Card3D>

            <Card3D maxTilt={7}>
              <div className="gov-card p-6 h-full flex flex-col justify-between border border-[#1a2a5e]/10 hover:border-[#1a2a5e]/30">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#1a2a5e]/8 text-[#1a2a5e] border border-[#1a2a5e]/20 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(26,42,94,0.1)]">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#1a2a5e]">Secure QR Verification Pass</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    Every token is paired with an encrypted QR token pass. Staff scan or verify at counter arrival to eliminate fraudulent queue manipulation.
                  </p>
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* CITIZEN vs OFFICE BENEFITS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card3D maxTilt={5}>
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white to-[#eef1f8] border border-[#1a2a5e]/12 h-full shadow-xl">
              <h3 className="text-xl font-bold text-[#1a2a5e] font-heading mb-5 flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#c8a227]" />
                <span>Benefits For Citizens</span>
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a227] shrink-0 mt-0.5" />
                  <span>Zero standing in long, crowded, hot government corridors.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a227] shrink-0 mt-0.5" />
                  <span>Transparent live position updates on desktop and mobile.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a227] shrink-0 mt-0.5" />
                  <span>Smart approaching alerts when 5 people or fewer are ahead.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a227] shrink-0 mt-0.5" />
                  <span>Document checklist guidance before leaving home.</span>
                </li>
              </ul>
            </div>
          </Card3D>

          <Card3D maxTilt={5}>
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1a2a5e] to-[#0f1a3a] border border-[#c8a227]/30 h-full shadow-xl">
              <h3 className="text-xl font-bold text-white font-heading mb-5 flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#c8a227]" />
                <span>Benefits For Government Offices</span>
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-[#c8d8ff]/80">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a227] shrink-0 mt-0.5" />
                  <span>Dramatically reduced lobby congestion and crowd chaos.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a227] shrink-0 mt-0.5" />
                  <span>Optimized staff productivity with one-click counter workflows.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a227] shrink-0 mt-0.5" />
                  <span>Real-time administrative analytics on peak hours & service volume.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a227] shrink-0 mt-0.5" />
                  <span>Immutable audit logs for complete administrative accountability.</span>
                </li>
              </ul>
            </div>
          </Card3D>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
