import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { officeService } from '../../services/officeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Layers, Plus, Edit2, Trash2, Eye, X, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewDept, setViewDept] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    office: '',
    description: '',
    tokenDurationMinutes: 10,
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptRes, offRes] = await Promise.all([
        adminService.getDepartments(),
        officeService.getOffices(),
      ]);
      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (offRes.success) setOffices(offRes.offices || []);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      office: offices[0]?._id || '',
      description: '',
      tokenDurationMinutes: 10,
      status: 'active',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingId(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      office: dept.office?._id || dept.office || offices[0]?._id || '',
      description: dept.description || '',
      tokenDurationMinutes: dept.tokenDurationMinutes || 10,
      status: dept.status || 'active',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateDepartment(editingId, formData);
        toast.success(`Department updated: Token duration set to ${formData.tokenDurationMinutes} mins`);
      } else {
        await adminService.createDepartment(formData);
        toast.success(`Department created with ${formData.tokenDurationMinutes} mins duration`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try {
      await adminService.deleteDepartment(id);
      toast.success('Department deleted successfully');
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
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Organizational Structure & Service Timing</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Department & Division Management
          </h1>
          <p className="text-xs text-slate-500">
            Set token service duration per division/department to dynamically drive citizen queue scheduling.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : (
        <div className="gov-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Department / Division Name</th>
                <th className="py-2.5 px-3">Assigned Office</th>
                <th className="py-2.5 px-3">Token Time Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-extrabold text-blue-700">{d.code}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    <div>{d.name}</div>
                    {d.description && (
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{d.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {d.office?.name || 'Assigned Office'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{d.tokenDurationMinutes || 10} Mins / Token</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {d.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewDept(d)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                        title="Edit Department"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d._id, d.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{viewDept.name}</h3>
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">{viewDept.code}</span>
                </div>
              </div>
              <button onClick={() => setViewDept(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Assigned Office</span>
                <span className="font-bold text-slate-800 text-sm">{viewDept.office?.name || 'N/A'}</span>
              </div>

              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                <span className="text-amber-800 font-mono text-[10px] uppercase font-bold flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Configured Token Time Duration</span>
                </span>
                <div className="text-2xl font-black font-mono text-amber-900">
                  {viewDept.tokenDurationMinutes || 10} Minutes
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  Citizens booking tokens under this department are allocated slots with this expected service speed.
                </p>
              </div>

              {viewDept.description && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Description</span>
                  <p className="text-slate-700">{viewDept.description}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 font-mono">
                <span>Status: <strong className="text-emerald-700 uppercase">{viewDept.status || 'Active'}</strong></span>
                <span>ID: {viewDept._id?.slice(-6)}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const d = viewDept;
                  setViewDept(null);
                  handleOpenEdit(d);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Department</span>
              </button>
              <button
                type="button"
                onClick={() => setViewDept(null)}
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
                {editingId ? 'Edit Department & Time Duration' : 'Add Department & Time Duration'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Driving Licencing & Permits"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLP"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold"
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

              {/* TOKEN TIME DURATION SETTING */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Token Time Duration (Minutes) *</span>
                  </label>
                  <span className="font-mono font-black text-sm text-amber-800">
                    {formData.tokenDurationMinutes} Mins
                  </span>
                </div>
                <p className="text-[10px] text-amber-700 mb-2">
                  Duration set here applies to all citizen tokens in this division/department for accurate live wait times.
                </p>
                <input
                  type="range"
                  min="2"
                  max="60"
                  step="1"
                  value={formData.tokenDurationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenDurationMinutes: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between items-center mt-2 gap-1">
                  {[5, 8, 10, 15, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormData({ ...formData, tokenDurationMinutes: mins })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                        formData.tokenDurationMinutes === mins
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Optional description of services handled..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                ></textarea>
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
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
                >
                  {editingId ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
