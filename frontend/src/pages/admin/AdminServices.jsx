import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { officeService } from '../../services/officeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FileCheck2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Clock,
  X,
  CheckCircle2,
  Ticket,
  FileText,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Building2,
  FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COMMON_DOC_SUGGESTIONS = [
  'Original Aadhaar Card',
  'PAN Card',
  'Voter ID Card',
  'Proof of Address (Utility Bill)',
  'Passport Size Photographs (2 Nos)',
  'Current Driving Licence',
  'Application Form Printout',
  'Fee Payment Receipt / Challan',
  'Birth Certificate',
  'Vehicle RC Smart Card',
  'Income Certificate / Salary Slip',
  'Caste Certificate',
  'Medical Certificate Form 1-A',
  'Police FIR / Report',
  'Property Index-II Deed Copy',
];

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [offices, setOffices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewService, setViewService] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDocRows, setExpandedDocRows] = useState(new Set());
  const [copiedViewDocs, setCopiedViewDocs] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    office: '',
    department: '',
    description: '',
    averageServiceTime: 8,
    requiredDocuments: [],
    maxDailyTokens: 200,
    prefix: 'A',
    status: 'active',
  });
  const [docDraft, setDocDraft] = useState('');
  const [editingDocIdx, setEditingDocIdx] = useState(null);
  const [editingDocValue, setEditingDocValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [svcRes, offRes] = await Promise.all([
        officeService.getServices(),
        officeService.getOffices(),
      ]);
      if (svcRes.success) setServices(svcRes.services || []);
      if (offRes.success) setOffices(offRes.offices || []);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficeSelect = async (offId) => {
    setFormData((prev) => ({ ...prev, office: offId, department: '' }));
    try {
      const res = await adminService.getDepartments(offId);
      if (res.success) setDepartments(res.departments || []);
    } catch (err) {
      // Ignore
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      office: offices[0]?._id || '',
      department: '',
      description: '',
      averageServiceTime: 8,
      requiredDocuments: [],
      maxDailyTokens: 200,
      prefix: 'A',
      status: 'active',
    });
    setDocDraft('');
    setEditingDocIdx(null);
    setEditingDocValue('');
    if (offices[0]?._id) handleOfficeSelect(offices[0]._id);
    setShowModal(true);
  };

  const handleOpenEdit = async (s) => {
    setEditingId(s._id);
    const officeId = s.office?._id || s.office || offices[0]?._id || '';
    if (officeId) {
      try {
        const res = await adminService.getDepartments(officeId);
        if (res.success) setDepartments(res.departments || []);
      } catch (e) {
        // Ignore
      }
    }
    setFormData({
      name: s.name,
      code: s.code,
      office: officeId,
      department: s.department?._id || s.department || '',
      description: s.description || '',
      averageServiceTime: s.averageServiceTime || 8,
      requiredDocuments: Array.isArray(s.requiredDocuments) ? [...s.requiredDocuments] : [],
      maxDailyTokens: s.maxDailyTokens || 200,
      prefix: s.prefix || 'A',
      status: s.status || 'active',
    });
    setDocDraft('');
    setEditingDocIdx(null);
    setEditingDocValue('');
    setShowModal(true);
  };

  const addRequiredDocument = () => {
    const raw = docDraft.trim();
    if (!raw) return;

    // Support comma or newline separated bulk pasting
    const splitDocs = raw
      .split(/[\n,]+/)
      .map((d) => d.trim())
      .filter((d) => Boolean(d));

    if (splitDocs.length === 0) return;

    let addedCount = 0;
    const currentList = [...formData.requiredDocuments];

    splitDocs.forEach((docItem) => {
      const exists = currentList.some(
        (existing) => existing.toLowerCase() === docItem.toLowerCase()
      );
      if (!exists) {
        currentList.push(docItem);
        addedCount++;
      }
    });

    if (addedCount === 0) {
      toast.error('Document(s) already in the list');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      requiredDocuments: currentList,
    }));
    setDocDraft('');
    toast.success(`Added ${addedCount} document${addedCount > 1 ? 's' : ''}`);
  };

  const addQuickSuggestion = (suggestion) => {
    const exists = formData.requiredDocuments.some(
      (d) => d.toLowerCase() === suggestion.toLowerCase()
    );
    if (exists) {
      toast.error(`"${suggestion}" is already added`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, suggestion],
    }));
    toast.success(`Added "${suggestion}"`);
  };

  const removeRequiredDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index),
    }));
    if (editingDocIdx === index) {
      setEditingDocIdx(null);
      setEditingDocValue('');
    }
  };

  const moveDocument = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= formData.requiredDocuments.length) return;
    const list = [...formData.requiredDocuments];
    const [moved] = list.splice(index, 1);
    list.splice(newIdx, 0, moved);
    setFormData((prev) => ({ ...prev, requiredDocuments: list }));
  };

  const startEditDoc = (index, currentVal) => {
    setEditingDocIdx(index);
    setEditingDocValue(currentVal);
  };

  const saveEditDoc = (index) => {
    const trimmed = editingDocValue.trim();
    if (!trimmed) {
      removeRequiredDocument(index);
      return;
    }
    const list = [...formData.requiredDocuments];
    list[index] = trimmed;
    setFormData((prev) => ({ ...prev, requiredDocuments: list }));
    setEditingDocIdx(null);
    setEditingDocValue('');
  };

  const clearAllDocuments = () => {
    if (!window.confirm('Clear all required documents from this service?')) return;
    setFormData((prev) => ({ ...prev, requiredDocuments: [] }));
    setEditingDocIdx(null);
  };

  const toggleDocRow = (id) => {
    setExpandedDocRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyViewDocs = (docs, serviceName, officeName) => {
    const text = `📋 Required Documents Checklist for ${serviceName} at ${officeName || 'Government Office'}:\n` +
      docs.map((d, i) => `${i + 1}. ${d}`).join('\n') +
      '\n\n*Note: Please carry original copies along with 1 set of self-attested photocopies.';
    navigator.clipboard.writeText(text);
    setCopiedViewDocs(true);
    toast.success('Document checklist copied to clipboard!');
    setTimeout(() => setCopiedViewDocs(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requiredDocuments: formData.requiredDocuments.map((d) => d.trim()).filter(Boolean),
      };
      if (editingId) {
        await adminService.updateService(editingId, payload);
        toast.success(`Service "${formData.name}" updated successfully`);
      } else {
        await adminService.createService(payload);
        toast.success(`Service "${formData.name}" created successfully`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete service "${name}"?`)) return;
    try {
      await adminService.deleteService(id);
      toast.success('Service deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filteredServices = services.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.office?.name?.toLowerCase().includes(q) ||
      s.department?.name?.toLowerCase().includes(q) ||
      s.requiredDocuments?.some((d) => d.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span>Citizen Service Catalog & Required Documents</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Service Management
          </h1>
          <p className="text-xs text-slate-500">
            Configure public services, benchmark times per token, required documents citizens must carry, and daily quotas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Search and Filters Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, code, document, or office..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredServices.length}</strong> of <strong>{services.length}</strong> services
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading services catalog..." />
      ) : (
        <div className="gov-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Code / Prefix</th>
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Office</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Avg Token Duration</th>
                <th className="py-2.5 px-3">Documents to Carry</th>
                <th className="py-2.5 px-3">Daily Quota</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((s) => {
                const isExpanded = expandedDocRows.has(s._id);
                const docCount = s.requiredDocuments?.length || 0;

                return (
                  <React.Fragment key={s._id}>
                    <tr className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-blue-700">{s.code}</span>
                        <span className="ml-1 text-[10px] font-mono font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200">
                          [{s.prefix || 'A'}]
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-3 text-slate-700">{s.office?.name || 'Office'}</td>
                      <td className="py-3 px-3 text-slate-600">{s.department?.name || 'Dept'}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>~{s.averageServiceTime} mins</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleDocRow(s._id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            docCount > 0
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to view documents checklist"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{docCount} {docCount === 1 ? 'doc' : 'docs'}</span>
                          {docCount > 0 && (
                            isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">{s.maxDailyTokens || 200} tokens</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewService(s)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id, s.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Document Checklist Drawer in Table */}
                    {isExpanded && (
                      <tr className="bg-emerald-50/40">
                        <td colSpan={8} className="py-3 px-6 border-b border-emerald-100">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mandatory Physical Documents for {s.name}:</span>
                                </span>
                                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  Carry to {s.office?.name || 'Office'}
                                </span>
                              </div>

                              {docCount > 0 ? (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {s.requiredDocuments.map((doc, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-800 text-[11px] font-medium flex items-center gap-1.5 shadow-2xs"
                                    >
                                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-black text-[9px] flex items-center justify-center">
                                        {idx + 1}
                                      </span>
                                      <span>{doc}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-500 italic text-[11px]">
                                  No required documents configured yet.
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(s)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
                            >
                              Edit Checklist
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW SERVICE MODAL */}
      {viewService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{viewService.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {viewService.code} (Prefix: {viewService.prefix || 'A'})
                  </span>
                </div>
              </div>
              <button onClick={() => setViewService(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Office Center</span>
                  <span className="font-bold text-slate-800">{viewService.office?.name || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Department</span>
                  <span className="font-bold text-slate-800">{viewService.department?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-800 block mb-1">
                    Standard Duration
                  </span>
                  <span className="text-xl font-black font-mono text-amber-900 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{viewService.averageServiceTime} mins / token</span>
                  </span>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-800 block mb-1">
                    Daily Token Limit
                  </span>
                  <span className="text-xl font-black font-mono text-blue-900 flex items-center gap-1">
                    <Ticket className="w-4 h-4 text-blue-600" />
                    <span>{viewService.maxDailyTokens || 200} tokens</span>
                  </span>
                </div>
              </div>

              {viewService.description && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Description</span>
                  <p className="text-slate-700">{viewService.description}</p>
                </div>
              )}

              {/* Enhanced Required Documents Checklist */}
              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Documents to Carry at Office Desk</span>
                    </span>
                    <p className="text-[10px] text-emerald-800 mt-0.5">
                      Citizens are instructed to bring original physical copies of these items to{' '}
                      <strong>{viewService.office?.name || 'the office'}</strong>.
                    </p>
                  </div>

                  {viewService.requiredDocuments && viewService.requiredDocuments.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyViewDocs(
                          viewService.requiredDocuments,
                          viewService.name,
                          viewService.office?.name
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                    >
                      {copiedViewDocs ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy List</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {viewService.requiredDocuments && viewService.requiredDocuments.length > 0 ? (
                  <ol className="space-y-1.5 pt-1">
                    {viewService.requiredDocuments.map((doc, idx) => (
                      <li
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-white border border-emerald-100 text-slate-800 text-xs font-medium flex items-center gap-2.5 shadow-2xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-emerald-800/80 italic">
                    No documents currently configured for this service.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const s = viewService;
                  setViewService(null);
                  handleOpenEdit(s);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Service</span>
              </button>
              <button
                type="button"
                onClick={() => setViewService(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SERVICE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingId ? 'Edit Citizen Service' : 'Add New Citizen Service'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Define service attributes and configure mandatory documents required for citizen visit.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Driving Licence Renewal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RTO-DLR"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Token Prefix *</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. A"
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office *</label>
                  <select
                    required
                    value={formData.office}
                    onChange={(e) => handleOfficeSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {offices.map((off) => (
                      <option key={off._id} value={off._id}>
                        {off.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="">Select Dept</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Service Time (mins) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={formData.averageServiceTime}
                    onChange={(e) => setFormData({ ...formData, averageServiceTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Daily Tokens</label>
                  <input
                    type="number"
                    min={10}
                    value={formData.maxDailyTokens}
                    onChange={(e) => setFormData({ ...formData, maxDailyTokens: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Service description and scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                ></textarea>
              </div>

              {/* ==================================================== */}
              {/* SECTION: MANDATORY DOCUMENTS CITIZEN MUST CARRY     */}
              {/* ==================================================== */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-300 space-y-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-emerald-200 pb-2.5">
                  <div>
                    <label className="font-extrabold text-emerald-950 flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Documents Required to Carry at Particular Office</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900">
                        {formData.requiredDocuments.length} Added
                      </span>
                    </label>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Citizens selecting this service will be shown this checklist and asked to carry original documents when visiting this office.
                    </p>
                  </div>

                  {formData.requiredDocuments.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllDocuments}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Quick Add Suggestions Chips */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/80 flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Quick-Add Common Official Documents (Click to add):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {COMMON_DOC_SUGGESTIONS.map((sug, idx) => {
                      const isAdded = formData.requiredDocuments.some(
                        (d) => d.toLowerCase() === sug.toLowerCase()
                      );
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => !isAdded && addQuickSuggestion(sug)}
                          disabled={isAdded}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer flex items-center gap-1 border ${
                            isAdded
                              ? 'bg-emerald-100/70 text-emerald-900/50 border-emerald-200 cursor-not-allowed line-through'
                              : 'bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs hover:scale-102'
                          }`}
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>{sug}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Document Input */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-900">
                    Add Custom Document (or paste comma-separated list):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={docDraft}
                      onChange={(e) => setDocDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequiredDocument();
                        }
                      }}
                      placeholder="e.g. Original Aadhaar Card, Form 16, Electricity Bill"
                      className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={addRequiredDocument}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* List of Configured Documents */}
                {formData.requiredDocuments.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider block">
                      Current Document Checklist (drag / use arrows to reorder):
                    </span>
                    <ol className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {formData.requiredDocuments.map((doc, idx) => {
                        const isEditingThis = editingDocIdx === idx;

                        return (
                          <li
                            key={idx}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-emerald-200 shadow-2xs hover:border-emerald-400 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>

                              {isEditingThis ? (
                                <div className="flex items-center gap-1.5 flex-1 mr-2">
                                  <input
                                    type="text"
                                    value={editingDocValue}
                                    onChange={(e) => setEditingDocValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        saveEditDoc(idx);
                                      } else if (e.key === 'Escape') {
                                        setEditingDocIdx(null);
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 rounded-lg border border-emerald-400 text-xs font-medium"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => saveEditDoc(idx)}
                                    className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingDocIdx(null)}
                                    className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <span className="font-medium text-slate-800 truncate text-xs">{doc}</span>
                              )}
                            </div>

                            {!isEditingThis && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => moveDocument(idx, -1)}
                                  disabled={idx === 0}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveDocument(idx, 1)}
                                  disabled={idx === formData.requiredDocuments.length - 1}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditDoc(idx, doc)}
                                  className="p-1 rounded text-amber-600 hover:bg-amber-50"
                                  title="Edit document name"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRequiredDocument(idx)}
                                  className="p-1 rounded text-rose-500 hover:bg-rose-50"
                                  title="Remove document"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/80 border border-emerald-200/60 text-center">
                    <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p className="text-[11px] text-emerald-900 font-medium">
                      No documents added yet.
                    </p>
                    <p className="text-[10px] text-emerald-800/80 mt-0.5">
                      Citizens will see no physical document checklist when booking this service. Click suggestions above or type custom documents to add them.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  {editingId ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
