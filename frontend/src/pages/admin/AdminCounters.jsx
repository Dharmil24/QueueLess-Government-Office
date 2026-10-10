import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { officeService } from '../../services/officeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CreditCard, Plus, Edit2, Trash2, Eye, X, Check, Users, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCounters = () => {
  const [counters, setCounters] = useState([]);
  const [offices, setOffices] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewCounter, setViewCounter] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    counterNumber: '',
    office: '',
    services: [],
    assignedStaff: '',
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cntRes, offRes, svcRes, staffRes] = await Promise.all([
        adminService.getCounters(),
        officeService.getOffices(),
        officeService.getServices(),
        adminService.getStaff(),
      ]);
      if (cntRes.success) setCounters(cntRes.counters || []);
      if (offRes.success) setOffices(offRes.offices || []);
      if (svcRes.success) setServices(svcRes.services || []);
      if (staffRes.success) setStaffList(staffRes.staff || []);
    } catch (err) {
      toast.error('Failed to load counters');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      counterNumber: `Counter ${counters.length + 1}`,
      office: offices[0]?._id || '',
      services: services.slice(0, 2).map((s) => s._id),
      assignedStaff: staffList[0]?._id || '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      counterNumber: c.counterNumber,
      office: c.office?._id || c.office || offices[0]?._id || '',
      services: c.services?.map((s) => s._id || s) || [],
      assignedStaff: c.assignedStaff?._id || c.assignedStaff || '',
      status: c.status || 'active',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateCounter(editingId, formData);
        toast.success(`Counter "${formData.counterNumber}" updated`);
      } else {
        await adminService.createCounter(formData);
        toast.success(`Counter "${formData.counterNumber}" created`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete counter ${name || ''}?`)) return;
    try {
      await adminService.deleteCounter(id);
      toast.success('Counter deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Physical Service Desks</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Counter Terminal Management
          </h1>
          <p className="text-xs text-slate-500">
            Assign staff officers and citizen services to active counter stations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Counter</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading counter terminals..." />
      ) : (
        <div className="gov-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Counter</th>
                <th className="py-2.5 px-3">Office</th>
                <th className="py-2.5 px-3">Assigned Officer</th>
                <th className="py-2.5 px-3">Handled Services</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {counters.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-extrabold text-blue-700 font-mono text-sm">
                    {c.counterNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{c.office?.name || 'Office'}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {c.assignedStaff ? (
                      <span>{c.assignedStaff.name} ({c.assignedStaff.employeeId || 'Staff'})</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned Desk</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {c.services && c.services.length > 0 ? (
                        c.services.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                          >
                            {s.name || s}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">All Services</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {c.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewCounter(c)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                        title="Edit Counter"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.counterNumber)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Counter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW COUNTER MODAL */}
      {viewCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{viewCounter.counterNumber}</h3>
                  <span className="text-[10px] font-mono text-slate-400">Station Terminal ID</span>
                </div>
              </div>
              <button onClick={() => setViewCounter(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Office Location</span>
                <span className="font-bold text-slate-800 text-sm">{viewCounter.office?.name || 'N/A'}</span>
              </div>

              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100">
                <span className="text-[10px] uppercase font-mono text-blue-700 font-bold block mb-1">
                  Assigned Duty Officer
                </span>
                <span className="text-sm font-black text-blue-950 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{viewCounter.assignedStaff?.name || 'Unassigned / Open Desk'}</span>
                </span>
                {viewCounter.assignedStaff?.employeeId && (
                  <span className="text-[11px] font-mono text-blue-600 block mt-0.5">
                    ID: {viewCounter.assignedStaff.employeeId}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-2">
                  Handled Public Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewCounter.services && viewCounter.services.length > 0 ? (
                    viewCounter.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-[11px]"
                      >
                        {s.name || s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">Universal Counter (Serves All Services)</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 font-mono">
                <span>Terminal Status: <strong className="text-emerald-700 uppercase">{viewCounter.status || 'active'}</strong></span>
                <span>DB ID: {viewCounter._id?.slice(-6)}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const c = viewCounter;
                  setViewCounter(null);
                  handleOpenEdit(c);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Counter</span>
              </button>
              <button
                type="button"
                onClick={() => setViewCounter(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingId ? 'Edit Counter Terminal' : 'Add New Counter Terminal'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Counter Name / Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter 3"
                  value={formData.counterNumber}
                  onChange={(e) => setFormData({ ...formData, counterNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Office *</label>
                <select
                  required
                  value={formData.office}
                  onChange={(e) => setFormData({ ...formData, office: e.target.value })}
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
                <label className="block font-bold text-slate-700 mb-1">Assigned Staff Officer</label>
                <select
                  value={formData.assignedStaff}
                  onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="">-- Unassigned / Open Desk --</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.employeeId || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Desk Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="active">Active (Operational)</option>
                  <option value="paused">Paused (On Break)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
                >
                  {editingId ? 'Update Counter' : 'Save Counter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCounters;
