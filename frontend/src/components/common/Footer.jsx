import React from 'react';
import { Building2, ShieldCheck, Heart, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-[#0f1a3a] text-[#c8d8ff]/70 pt-14 pb-10 border-t border-[#c8a227]/20 overflow-hidden">
      {/* Top amber highlight line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#c8a227]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="md:col-span-1 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c8a227] to-[#e8be3a] flex items-center justify-center text-[#1a2a5e] shadow-[0_0_15px_rgba(200,162,39,0.4)] border border-[#e8d080]/30">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white font-heading tracking-tight">QueueLess</span>
            </div>
            <p className="text-xs text-[#c8d8ff]/60 leading-relaxed font-normal">
              Smart Virtual Queue & Waiting-Time Prediction System. Eliminating long physical queues and modernizing citizen services with real-time 3D spatial transparency.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#c8a227] font-mono pt-1">
              <ShieldCheck className="w-4 h-4 text-[#c8a227]" />
              <span>Certified Citizen Portal</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-[#e8d080] uppercase font-mono tracking-wider mb-3.5">
              Citizens
            </h4>
            <ul className="space-y-2.5 text-xs text-[#c8d8ff]/60">
              <li><Link to="/offices" className="hover:text-[#c8a227] transition">Find Government Offices</Link></li>
              <li><Link to="/citizen/book" className="hover:text-[#c8a227] transition">Get Virtual Token</Link></li>
              <li><Link to="/citizen" className="hover:text-[#c8a227] transition">Live Queue Tracking</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-[#e8d080] uppercase font-mono tracking-wider mb-3.5">
              Staff & Admin
            </h4>
            <ul className="space-y-2.5 text-xs text-[#c8d8ff]/60">
              <li><Link to="/staff" className="hover:text-[#c8a227] transition">Staff Counter Terminal</Link></li>
              <li><Link to="/admin" className="hover:text-[#c8a227] transition">Admin Management Console</Link></li>
              <li><Link to="/admin/live-queue" className="hover:text-[#c8a227] transition">Live Multi-Office Queue Monitor</Link></li>
              <li><Link to="/admin/reports" className="hover:text-[#c8a227] transition">Queue Analytics & Export</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold text-[#e8d080] uppercase font-mono tracking-wider mb-3.5">
              Helpline & Hours
            </h4>
            <div className="text-xs text-[#c8d8ff]/60 space-y-2">
              <p><strong className="text-[#c8d8ff]/90">National Citizen Toll-Free:</strong> 1800-112-233</p>
              <p><strong className="text-[#c8d8ff]/90">Email:</strong> support@queueless.gov.in</p>
              <p><strong className="text-[#c8d8ff]/90">Operating Hours:</strong> Mon - Sat, 09:00 AM - 05:30 PM</p>
              <p className="text-[11px] text-[#c8a227]/80 pt-1 font-mono">Emergency public services operate 24x7.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#c8a227]/15 flex flex-col sm:flex-row justify-between items-center text-xs text-[#c8d8ff]/40 gap-4">
          <p>© {new Date().getFullYear()} QueueLess Government Office Initiative. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-mono text-[#c8a227]/80">
            <Sparkles className="w-3.5 h-3.5 text-[#c8a227]" />
            <span>Wait Less. Arrive Smart. Get Served.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
