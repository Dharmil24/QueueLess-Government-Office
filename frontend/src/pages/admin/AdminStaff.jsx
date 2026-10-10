import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { officeService } from '../../services/officeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users2, Plus, Edit2, Trash2, Eye, KeyRound, X, Mail, Phone, Building2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [offices, setOffices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    employeeId: '',
    assignedOffice: '',
    assignedCounter: '',
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, offRes, cntRes] = await Promise.all([
        adminService.getStaff(),
        officeService.getOffices(),
        adminService.getCounters(),
      ]);
      if (staffRes.success) setStaff(staffRes.staff || []);
      if (offRes.success) setOffices(offRes.offices || []);
      if (cntRes.success) setCounters(cntRes.counters || []);
    } catch (err) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      mobile: '',
      employeeId: `EMP-${Date.now().toString().slice(-4)}`,
      assignedOffice: offices[0]?._id || '',
      assignedCounter: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (st) => {
    setEditingId(st._id);
    setFormData({
      name: st.name,
      email: st.email,
      password: '',
      mobile: st.mobile || '',
      employeeId: st.employeeId || '',
      assignedOffice: st.assignedOffice?._id || st.assignedOffice || offices[0]?._id || '',
      assignedCounter: st.assignedCounter?._id || st.assignedCounter || '',
      status: st.status || 'active',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateStaff(editingId, formData);
        toast.success(`Staff officer "${formData.name}" updated successfully`);
      } else {
        await adminService.createStaff(formData);
        toast.success(`Staff officer "${formData.name}" created successfully`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove staff member ${name}?`)) return;
    try {
      await adminService.deleteStaff(id);
      toast.success('Staff removed successfully');
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
            <Users2 className="w-4 h-4 text-blue-600" />
            <span>Personnel Directory & Operators</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Staff & Operator Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage government counter operators, login credentials, and assign workstations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading staff records..." />
      ) : (
        <div className="gov-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Emp ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Assigned Office</th>
                <th className="py-2.5 px-3">Counter</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((st) => (
                <tr key={st._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-extrabold text-blue-700 font-mono">
                    {st.employeeId || 'EMP'}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{st.name}</td>
                  <td className="py-3 px-3 text-slate-600">{st.email}</td>
                  <td className="py-3 px-3 text-slate-700">{st.assignedOffice?.name || 'Office'}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {st.assignedCounter?.counterNumber ? (
                      <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {st.assignedCounter.counterNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        st.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {st.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewStaff(st)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                        title="Edit Staff"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(st._id, st.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        title="Remove Staff"
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

      {/* VIEW STAFF MODAL */}
      {viewStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{viewStaff.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {viewStaff.employeeId || 'STAFF'}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewStaff(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Official Email</span>
                  <span className="font-bold text-slate-800 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">{viewStaff.email}</span>
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Mobile Contact</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{viewStaff.mobile || 'N/A'}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Assigned Center</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{viewStaff.assignedOffice?.name || 'Unassigned'}</span>
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Counter Terminal</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    <span>{viewStaff.assignedCounter?.counterNumber || 'Unassigned Desk'}</span>
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 font-mono">
                <span>Account Status: <strong className="text-emerald-700 uppercase">{viewStaff.status || 'Active'}</strong></span>
                <span>Role: <strong className="text-blue-700 uppercase">{viewStaff.role || 'Staff'}</strong></span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const st = viewStaff;
                  setViewStaff(null);
                  handleOpenEdit(st);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Staff</span>
              </button>
              <button
                type="button"
                onClick={() => setViewStaff(null)}
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
                {editingId ? 'Edit Staff Officer' : 'Add Staff Officer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@rto.gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-RTO-01"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editingId ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  placeholder={editingId ? '••••••••' : 'Enter login password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Contact</label>
                <input
                  type="text"
                  placeholder="+91 98980 12345"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Office *</label>
                  <select
                    required
                    value={formData.assignedOffice}
                    onChange={(e) => setFormData({ ...formData, assignedOffice: e.target.value })}
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
                  <label className="block font-bold text-slate-700 mb-1">Assigned Counter Desk</label>
                  <select
                    value={formData.assignedCounter}
                    onChange={(e) => setFormData({ ...formData, assignedCounter: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="">-- None / Roaming --</option>
                    {counters.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.counterNumber}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {editingId ? 'Update Officer' : 'Create Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
