import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { officeService } from '../../services/officeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card3D from '../../components/common/3D/Card3D';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  FileText,
  Ticket,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OfficeDetailPage = () => {
  const { id } = useParams();
  const [office, setOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedSvcId, setCopiedSvcId] = useState(null);

  useEffect(() => {
    loadOfficeDetails();
  }, [id]);

  const loadOfficeDetails = async () => {
    try {
      setLoading(true);
      const res = await officeService.getOfficeById(id);
      if (res.success) {
        setOffice(res.office);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner text="Loading office profile..." size="lg" />
      </div>
    );
  }

  if (!office) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#1a2a5e] font-heading">Government Office Not Found</h2>
        <Link to="/offices" className="text-[#1a2a5e] text-sm font-semibold mt-2 inline-block underline hover:text-[#c8a227]">
          &larr; Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Office Header Card */}
      <Card3D maxTilt={5}>
        <div className="gov-card p-6 sm:p-8 bg-gradient-to-br from-[#1a2a5e] to-[#0f1a3a] text-white border border-[#c8a227]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8a227]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-white/10 text-[#e8d080] border border-[#c8a227]/40 uppercase tracking-widest">
                  {office.code}
                </span>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Operating: {office.openingTime} - {office.closingTime}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white">
                {office.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0 text-[#c8a227]" />
                <span>
                  {office.address}, {office.city}, {office.state} - {office.pinCode}
                </span>
              </p>
            </div>

            <Link
              to={`/citizen/book?officeId=${office._id}`}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#c8a227] to-[#e8be3a] hover:from-[#d4b030] hover:to-[#f0d050] text-[#1a2a5e] font-black text-xs sm:text-sm transition shadow-xl shadow-[#c8a227]/25 flex items-center gap-2 cursor-pointer shrink-0 btn-3d border border-[#e8d080]/40"
            >
              <Ticket className="w-4 h-4" />
              <span>Generate Virtual Token</span>
            </Link>
          </div>

          {/* Contact Strip */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-6 text-xs text-slate-300 font-mono relative z-10">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#c8a227]" />
              <span>{office.contactNumber || '+91 281 2387123'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#c8a227]" />
              <span>{office.email || 'info@queueless.gov.in'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{office.activeCounters || 3} Active Service Counters</span>
            </div>
          </div>
        </div>
      </Card3D>

      {/* Available Services Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#1a2a5e] font-heading">
            Offered Citizen Services ({office.services?.length || 0})
          </h2>
          <span className="text-xs font-mono text-[#1a2a5e] font-semibold bg-[#1a2a5e]/10 px-2.5 py-0.5 rounded-full border border-[#1a2a5e]/20">
            Document checklist included
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {office.services?.map((svc) => (
            <Card3D key={svc._id} maxTilt={6}>
              <div className="gov-card p-6 flex flex-col justify-between h-full border border-[#1a2a5e]/15 hover:border-[#c8a227]/60 shadow-md">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#1a2a5e]/10 text-[#1a2a5e] border border-[#1a2a5e]/20 uppercase">
                      {svc.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-[#c8a227]" />
                      <span>~{svc.averageServiceTime} mins avg</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#1a2a5e] leading-snug">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    {svc.description}
                  </p>

                  {/* Required Documents Checklist */}
                  {svc.requiredDocuments && svc.requiredDocuments.length > 0 && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1a2a5e]">
                          Documents to Carry to {office.name} ({svc.requiredDocuments.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const text =
                              `📋 Required Documents for ${svc.name} at ${office.name}:\n` +
                              svc.requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join('\n') +
                              `\n\n* Please bring physical originals and 1 set of photocopies.`;
                            navigator.clipboard.writeText(text);
                            setCopiedSvcId(svc._id);
                            toast.success('Document checklist copied!');
                            setTimeout(() => setCopiedSvcId(null), 2000);
                          }}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-[#1a2a5e] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition border border-slate-300 shadow-xs"
                        >
                          {copiedSvcId === svc._id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#c8a227]" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <ul className="space-y-1.5">
                        {svc.requiredDocuments.map((doc, idx) => (
                          <li key={idx} className="text-xs text-slate-700 font-mono flex items-center gap-2 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Link
                    to={`/citizen/book?officeId=${office._id}&serviceId=${svc._id}`}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1a2a5e] to-[#243470] hover:from-[#0f1a3a] hover:to-[#1a2a5e] text-white font-bold text-xs font-mono transition text-center shadow-md shadow-[#1a2a5e]/20 block btn-3d border border-[#c8a227]/40"
                  >
                    Generate Token for this Service
                  </Link>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfficeDetailPage;
