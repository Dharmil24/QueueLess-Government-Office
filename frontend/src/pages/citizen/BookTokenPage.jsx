import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { officeService } from '../../services/officeService';
import { tokenService } from '../../services/tokenService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card3D from '../../components/common/3D/Card3D';
import {
  Building2,
  Layers,
  FileCheck2,
  Ticket,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  MapPin,
  QrCode,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  Calendar,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const calculateAge = (dobString) => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const BookTokenPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();

  const preselectedOfficeId = searchParams.get('officeId') || '';
  const preselectedServiceId = searchParams.get('serviceId') || '';

  const [offices, setOffices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedOffice, setSelectedOffice] = useState(preselectedOfficeId);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedService, setSelectedService] = useState(preselectedServiceId);

  // Date of Birth & Senior Citizen State
  const initialDob = user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '';
  const [dateOfBirth, setDateOfBirth] = useState(initialDob);
  const initialAge = initialDob ? calculateAge(initialDob) : null;
  const isInitialSenior = initialAge !== null && initialAge >= 60;

  const [priority, setPriority] = useState(isInitialSenior ? 'SENIOR_CITIZEN' : 'NORMAL');
  const [notes, setNotes] = useState('');

  // Keep DOB in sync if user profile loads asynchronously
  useEffect(() => {
    if (user?.dateOfBirth && !dateOfBirth) {
      const userDob = new Date(user.dateOfBirth).toISOString().split('T')[0];
      setDateOfBirth(userDob);
      const age = calculateAge(userDob);
      if (age !== null && age >= 60) {
        setPriority('SENIOR_CITIZEN');
      }
    }
  }, [user?.dateOfBirth]);

  const calculatedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const isSeniorEligible = calculatedAge !== null && calculatedAge >= 60;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedServiceObj, setSelectedServiceObj] = useState(null);

  // Document checklist state
  const [checkedDocs, setCheckedDocs] = useState(new Set());
  const [copiedDocs, setCopiedDocs] = useState(false);
  const [ackDocuments, setAckDocuments] = useState(false);

  // Success Token Modal state
  const [createdToken, setCreatedToken] = useState(null);

  // Load offices on mount
  useEffect(() => {
    loadOffices();
  }, []);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const res = await officeService.getOffices();
      if (res.success) {
        setOffices(res.offices || []);
        if (preselectedOfficeId) {
          handleOfficeChange(preselectedOfficeId);
        }
      }
    } catch (err) {
      toast.error('Failed to load offices');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficeChange = async (officeId) => {
    setSelectedOffice(officeId);
    setSelectedDept('');
    setSelectedService('');
    setSelectedServiceObj(null);
    setCheckedDocs(new Set());

    if (!officeId) return;

    try {
      const res = await officeService.getOfficeById(officeId);
      if (res.success) {
        setDepartments(res.office.departments || []);
        setServices(res.office.services || []);

        if (preselectedServiceId) {
          const matchSvc = res.office.services?.find((s) => s._id === preselectedServiceId);
          if (matchSvc) {
            setSelectedService(matchSvc._id);
            const deptId = matchSvc.department?._id || matchSvc.department;
            setSelectedDept(deptId || '');
            setSelectedServiceObj(matchSvc);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to load office services');
    }
  };

  const handleDeptChange = (deptId) => {
    setSelectedDept(deptId);
    setSelectedService('');
    setSelectedServiceObj(null);
    setCheckedDocs(new Set());
  };

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    const found = services.find((s) => s._id === serviceId);
    setSelectedServiceObj(found || null);
    setCheckedDocs(new Set());
  };

  const toggleDocCheck = (docName) => {
    setCheckedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docName)) next.delete(docName);
      else next.add(docName);
      return next;
    });
  };

  const currentOfficeObj = offices.find((o) => o._id === selectedOffice);

  const handleCopyChecklist = () => {
    if (!selectedServiceObj?.requiredDocuments?.length) return;
    const officeName = currentOfficeObj?.name || 'Government Office';
    const officeAddress = currentOfficeObj ? `${currentOfficeObj.address}, ${currentOfficeObj.city}` : '';

    const text =
      `📋 MANDATORY DOCUMENTS CHECKLIST\n` +
      `Service: ${selectedServiceObj.name}\n` +
      `Office: ${officeName} (${officeAddress})\n` +
      `-----------------------------------------\n` +
      selectedServiceObj.requiredDocuments.map((d, i) => `[ ] ${i + 1}. ${d}`).join('\n') +
      `\n-----------------------------------------\n` +
      `* Please carry physical originals plus 1 set of self-attested photocopies.\n` +
      `* Generated via QueueLess Digital Portal`;

    navigator.clipboard.writeText(text);
    setCopiedDocs(true);
    toast.success('Document checklist copied to clipboard!');
    setTimeout(() => setCopiedDocs(false), 2500);
  };

  const filteredServices = selectedDept
    ? services.filter((s) => s.department === selectedDept || s.department?._id === selectedDept)
    : services;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffice || !selectedService) {
      toast.error('Please select both office and service');
      return;
    }

    if (priority === 'SENIOR_CITIZEN') {
      if (!dateOfBirth) {
        toast.error('Please verify your Date of Birth to claim a Senior Citizen Priority Token');
        return;
      }
      if (calculatedAge === null || calculatedAge < 60) {
        toast.error(
          `Birth date verification failed: Verified age is ${calculatedAge ?? 0} years. Senior Citizen priority token requires age 60 or above.`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      const svc = selectedServiceObj || services.find((s) => s._id === selectedService);
      const deptId = selectedDept || svc?.department?._id || svc?.department;

      const res = await tokenService.generateToken({
        officeId: selectedOffice,
        departmentId: deptId,
        serviceId: selectedService,
        priority,
        dateOfBirth: dateOfBirth || undefined,
        notes,
      });

      if (res.success) {
        if (refreshUser) refreshUser();
        const isSenior = res.token?.priority === 'SENIOR_CITIZEN' || res.token?.isSeniorCitizen;
        toast.success(
          isSenior
            ? `Senior Citizen Priority Token ${res.token.tokenNumber} Verified & Generated! (Called First)`
            : `Virtual Token ${res.token.tokenNumber} Generated Successfully!`,
          {
            duration: 6000,
            icon: isSenior ? '👴' : '🎟️',
          }
        );
        setCreatedToken(res.token);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate token');
    } finally {
      setSubmitting(false);
    }
  };

  const reqDocs = selectedServiceObj?.requiredDocuments || [];
  const reqDocsCount = reqDocs.length;
  const checkedDocsCount = checkedDocs.size;
  const allDocsChecked = reqDocsCount > 0 && checkedDocsCount === reqDocsCount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#c8a227] bg-[#1a2a5e]/5 px-2.5 py-1 rounded-full border border-[#c8a227]/30">
          Citizen Fast Booking &amp; Document Verification
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-[#1a2a5e] font-heading mt-2">
          Generate Virtual Token Remotely
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Reserve your spot in the official queue, know exact required documents to carry, and arrive right on schedule.
        </p>
      </div>

      <Card3D maxTilt={4}>
        <div className="gov-card p-6 sm:p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Select Office */}
            <div>
              <label className="block text-xs font-mono font-extrabold text-[#1a2a5e] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1a2a5e]" />
                <span>1. Select Government Office Center *</span>
              </label>
              <select
                required
                value={selectedOffice}
                onChange={(e) => handleOfficeChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#1a2a5e] focus:ring-2 focus:ring-[#1a2a5e]/20 focus:outline-none bg-white font-medium text-[#1a2a5e] shadow-xs transition"
              >
                <option value="">-- Choose Government Office --</option>
                {offices.map((off) => (
                  <option key={off._id} value={off._id}>
                    {off.name} - {off.city} ({off.activeCounters || 1} Counters Active)
                  </option>
                ))}
              </select>

              {currentOfficeObj && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-[#1a2a5e] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1a2a5e]">{currentOfficeObj.name}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {currentOfficeObj.address}, {currentOfficeObj.city}, {currentOfficeObj.state} - {currentOfficeObj.pinCode}
                      {' • '}Hours: {currentOfficeObj.openingTime} - {currentOfficeObj.closingTime}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Select Department (Optional filter) */}
            {departments.length > 0 && (
              <div>
                <label className="block text-xs font-mono font-extrabold text-[#1a2a5e] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1a2a5e]" />
                  <span>2. Filter by Department (Optional)</span>
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#1a2a5e] focus:ring-2 focus:ring-[#1a2a5e]/20 focus:outline-none bg-white font-medium text-[#1a2a5e] shadow-xs transition"
                >
                  <option value="">All Departments in this Center</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.tokenDurationMinutes || 10} mins/token slot)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* STEP 3: Select Service */}
            {selectedOffice && (
              <div>
                <label className="block text-xs font-mono font-extrabold text-[#1a2a5e] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#1a2a5e]" />
                    <span>3. Select Public Service *</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    {filteredServices.length} available service{filteredServices.length === 1 ? '' : 's'}
                  </span>
                </label>

                <select
                  required
                  value={selectedService}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#1a2a5e] focus:ring-2 focus:ring-[#1a2a5e]/20 focus:outline-none bg-white font-medium text-[#1a2a5e] shadow-xs transition"
                >
                  <option value="">-- Choose Required Service --</option>
                  {filteredServices.map((svc) => (
                    <option key={svc._id} value={svc._id}>
                      {svc.name} (~{svc.averageServiceTime || 10}m avg • {svc.requiredDocuments?.length || 0} docs to carry)
                    </option>
                  ))}
                </select>

                {/* Quick Service Cards Selector */}
                {filteredServices.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-mono uppercase text-slate-600 font-bold block mb-1.5">
                      Or select from quick service cards:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {filteredServices.map((svc) => {
                        const isSelected = selectedService === svc._id;
                        const docCount = svc.requiredDocuments?.length || 0;

                        return (
                          <button
                            key={svc._id}
                            type="button"
                            onClick={() => handleServiceChange(svc._id)}
                            className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#1a2a5e]/10 border-[#1a2a5e] text-[#1a2a5e] font-bold shadow-sm ring-1 ring-[#1a2a5e]'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate text-[#1a2a5e]">{svc.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                ~{svc.averageServiceTime || 10} mins
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 border ${
                                docCount > 0
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {docCount} {docCount === 1 ? 'doc' : 'docs'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* ENHANCED SECTION: REQUIRED DOCUMENTS TO CARRY AT OFFICE   */}
            {/* ========================================================= */}
            {selectedServiceObj && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 space-y-4 shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                      <h3 className="text-sm sm:text-base font-black text-amber-950 font-heading tracking-wide flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        <span>Documents You MUST Carry to the Office</span>
                      </h3>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">
                      When visiting{' '}
                      <strong className="text-[#1a2a5e]">
                        {currentOfficeObj?.name || 'the government office'}
                      </strong>{' '}
                      for <strong className="text-amber-900">{selectedServiceObj.name}</strong>, keep physical originals ready.
                    </p>
                  </div>

                  {reqDocsCount > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyChecklist}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Copy document checklist to clipboard"
                      >
                        {copiedDocs ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-700" />
                            <span>Copy List</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Service Benchmark Info Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-300 shadow-2xs">
                    Service Code: <strong className="text-[#1a2a5e]">{selectedServiceObj.code}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs">
                    Est. Duration: ~{selectedServiceObj.averageServiceTime || 8} mins / token
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1a2a5e] border border-blue-200 shadow-2xs">
                    Office: {currentOfficeObj?.city || 'Civic Center'}
                  </span>
                </div>

                {/* Checklist Content */}
                {reqDocsCount > 0 ? (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-amber-950 font-bold uppercase tracking-wider text-[11px]">
                        Interactive Verification Checklist ({checkedDocsCount} of {reqDocsCount} packed):
                      </span>
                      {allDocsChecked && (
                        <span className="text-emerald-700 font-mono font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>All documents ready!</span>
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${(checkedDocsCount / reqDocsCount) * 100}%` }}
                      ></div>
                    </div>

                    {/* Document List with Interactive Checkbox */}
                    <ol className="space-y-2">
                      {reqDocs.map((doc, idx) => {
                        const isChecked = checkedDocs.has(doc);

                        return (
                          <li
                            key={idx}
                            onClick={() => toggleDocCheck(doc)}
                            className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/40'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 border ${
                                  isChecked
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                {isChecked ? '✓' : idx + 1}
                              </span>
                              <span
                                className={`text-xs sm:text-sm font-medium ${
                                  isChecked ? 'line-through opacity-75' : ''
                                }`}
                              >
                                {doc}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                                isChecked
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {isChecked ? 'Ready' : 'Click to tick'}
                            </span>
                          </li>
                        );
                      })}
                    </ol>

                    {/* Verification Advisory Note */}
                    <div className="p-3.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#1a2a5e] block font-sans">
                          Important Office Verification Guidelines:
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Please bring <strong>original documents</strong> along with at least{' '}
                          <strong>1 set of self-attested photocopies</strong> and 2 recent passport-size photographs to the designated counter. Counter officers verify original documents before service issuance.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-800 font-medium">
                      No specialized documents are mandated for this service.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Carrying a valid Government Photo ID (Aadhaar Card, Voter ID, or Driving Licence) is recommended.
                    </p>
                  </div>
                )}

                {/* Citizen Acknowledgment Checkbox */}
                {reqDocsCount > 0 && (
                  <label className="flex items-center gap-2.5 pt-2 border-t border-amber-300 text-xs text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ackDocuments}
                      onChange={(e) => setAckDocuments(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1a2a5e] focus:ring-[#1a2a5e] border-slate-300 bg-white cursor-pointer"
                    />
                    <span className="font-medium">
                      I have checked the required documents list and will carry originals to{' '}
                      <strong className="text-[#1a2a5e]">{currentOfficeObj?.name || 'the office'}</strong>.
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* STEP 4: Priority Category */}
            <div>
              <label className="block text-xs font-mono font-extrabold text-[#1a2a5e] uppercase tracking-wider mb-2">
                4. Category Preference &amp; Priority Queue
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'NORMAL', label: 'Standard Citizen', desc: 'First-Come First-Served' },
                  { id: 'SENIOR_CITIZEN', label: 'Senior Citizen (60+)', desc: 'Priority Token • Called First' },
                  { id: 'SPECIALLY_ABLED', label: 'Specially Abled / Divyang', desc: 'Expedited priority queue' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPriority(cat.id)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer relative ${
                      priority === cat.id
                        ? cat.id === 'SENIOR_CITIZEN'
                          ? 'border-amber-500 bg-amber-50/90 shadow-sm ring-2 ring-amber-400'
                          : 'border-[#1a2a5e] bg-slate-100 shadow-sm ring-2 ring-[#1a2a5e]/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-[#1a2a5e] block">{cat.label}</strong>
                      {cat.id === 'SENIOR_CITIZEN' && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          Priority 1st
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-600 font-mono mt-0.5 block">{cat.desc}</span>
                  </button>
                ))}
              </div>

              {/* Dedicated Birth Date Verification Panel for Senior Citizen */}
              {priority === 'SENIOR_CITIZEN' && (
                <div className="mt-4 p-5 rounded-2xl border-2 border-amber-400 bg-amber-50/80 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black font-heading text-amber-950 tracking-wide flex items-center gap-2">
                          <span>Senior Citizen Birth Date Verification (Age 60+)</span>
                        </h4>
                        <p className="text-[11px] text-slate-700">
                          Under priority service rules, citizens aged 60+ receive <strong>S-Series tokens</strong> and are called to counters <strong>BEFORE</strong> non-senior citizens.
                        </p>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#1a2a5e] text-[#c8a227] uppercase tracking-wider border border-[#c8a227]/40">
                      Priority Queue
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-amber-950 mb-1.5">
                      Enter or Confirm Date of Birth for Age Verification *
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="relative flex-1">
                        <Calendar className="w-4 h-4 text-amber-700 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="date"
                          required
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-400 bg-white text-[#1a2a5e] text-xs sm:text-sm font-mono font-bold focus:border-[#1a2a5e] focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Verification Status Card */}
                  {dateOfBirth && (
                    <div>
                      {isSeniorEligible ? (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-400 flex items-start gap-3 text-emerald-950">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-xs font-bold text-emerald-950 font-sans">
                                ✅ Verification Successful: Age {calculatedAge} Years
                              </strong>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Verified Senior Citizen
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                              You will be issued an <strong>S-Series Senior Citizen Token</strong> with elevated priority. Staff counters will automatically call your token <strong>ahead of standard waiting persons</strong>!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-400 flex items-start gap-3 text-rose-950">
                          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-xs font-bold text-rose-950 font-sans">
                                ⚠️ Verification Failed: Age is {calculatedAge ?? 0} Years
                              </strong>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                                Under 60 Years
                              </span>
                            </div>
                            <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                              Senior citizen priority tokens are strictly reserved for individuals <strong>60 years or older</strong>. Please switch back to <strong>Standard Citizen</strong> to book a regular token.
                            </p>
                            <button
                              type="button"
                              onClick={() => setPriority('NORMAL')}
                              className="mt-2 text-xs font-bold font-mono text-rose-900 hover:text-rose-950 underline cursor-pointer"
                            >
                              Switch to Standard Citizen (FCFS Queue)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!dateOfBirth && (
                    <div className="p-3 rounded-xl bg-white border border-amber-300 text-[11px] text-amber-900 font-mono flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Please choose your date of birth above to verify age 60+ eligibility.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#1a2a5e] font-mono font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#c8a227]" />
                <span>Official Government Token Pass</span>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedOffice || !selectedService}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#1a2a5e] via-[#243470] to-[#1a2a5e] hover:brightness-110 text-white font-black text-xs sm:text-sm font-mono transition shadow-xl shadow-[#1a2a5e]/20 flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed btn-3d border border-[#c8a227]/40"
              >
                <Ticket className="w-4 h-4 text-[#c8a227]" />
                <span>{submitting ? 'Generating...' : 'Confirm & Generate Token'}</span>
              </button>
            </div>
          </form>
        </div>
      </Card3D>

      {/* ========================================================= */}
      {/* SUCCESS CONFIRMATION MODAL WITH DOCUMENTS CHECKLIST PASS  */}
      {/* ========================================================= */}
      {createdToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-lg w-full">
            <Card3D maxTilt={6}>
              <div className="glass-panel-3d p-6 sm:p-7 rounded-3xl border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.35)] relative text-white space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-black flex items-center justify-center mx-auto mb-2 shadow-lg shadow-cyan-500/30">
                    <Ticket className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black font-heading text-white">
                    Virtual Token Pass Generated!
                  </h3>
                  <p className="text-xs font-mono text-cyan-300">
                    Official booking confirmed • Live queue position calibrated
                  </p>
                </div>

                {/* Senior Citizen Priority Banner */}
                {(createdToken.priority === 'SENIOR_CITIZEN' || createdToken.isSeniorCitizen) && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/80 border-2 border-amber-400 text-amber-200 text-xs flex items-center gap-3 shadow-lg shadow-amber-500/20">
                    <span className="text-2xl">👴</span>
                    <div>
                      <span className="font-mono font-black text-amber-300 block uppercase tracking-wider text-[11px]">
                        Senior Citizen Priority Token (S-Series)
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Verified Age 60+. Your token has priority standing and will be called to the counter before standard non-senior citizens.
                      </p>
                    </div>
                  </div>
                )}

                {/* Token Details Card */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Token Number:</span>
                    <span className="text-2xl font-black text-cyan-400">
                      {createdToken.tokenNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Service:</span>
                    <span className="font-bold text-white truncate max-w-[240px]">
                      {createdToken.serviceId?.name || selectedServiceObj?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Office Center:</span>
                    <span className="font-bold text-white truncate max-w-[240px]">
                      {createdToken.officeId?.name || currentOfficeObj?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Estimated Wait:</span>
                    <span className="font-bold text-amber-300">
                      ~{createdToken.estimatedWaitTime || 10} minutes
                    </span>
                  </div>
                </div>

                {/* Documents Checklist on Success Modal */}
                {selectedServiceObj?.requiredDocuments && selectedServiceObj.requiredDocuments.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Documents to carry at the office</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyChecklist}
                        className="px-2 py-0.5 rounded bg-amber-900/80 hover:bg-amber-800 border border-amber-500/30 text-amber-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>

                    <ol className="space-y-1 text-slate-200 text-[11px] font-mono">
                      {selectedServiceObj.requiredDocuments.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ol>

                    <p className="text-[10px] text-slate-400 pt-1 border-t border-amber-500/20">
                      Please carry physical originals when you visit {currentOfficeObj?.name || 'the office'}.
                    </p>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/citizen')}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs font-mono transition shadow-xl shadow-cyan-500/25 btn-3d cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Go to Citizen Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTokenPage;
