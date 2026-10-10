import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserCheck, Search, ShieldCheck, Eye, Edit2, Trash2, X, Mail, Phone, Calendar, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCitizens = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewCitizen, setViewCitizen] = useState(null);
  const [editingCitizen, setEditingCitizen] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    status: 'active',
  });

  useEffect(() => {
    loadCitizens();
  }, []);

  const loadCitizens = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCitizens();
      if (res.success) setCitizens(res.citizens || []);
    } catch (err) {
      toast.error('Failed to load citizens');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (c) => {
    setEditingCitizen(c);
    setEditFormData({
      name: c.name || '',
      email: c.email || '',
      mobile: c.mobile || '',
      status: c.status || 'active',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCitizen) return;
    try {
      await adminService.updateCitizen(editingCitizen._id, editFormData);
      toast.success(`Citizen account "${editFormData.name}" updated`);
      setEditingCitizen(null);
      loadCitizens();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update citizen');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete citizen account "${name}"?`)) return;
    try {
      await adminService.deleteCitizen(id);
      toast.success(`Citizen "${name}" removed successfully`);
      loadCitizens();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete citizen');
    }
  };

  const filtered = citizens.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Citizen Directory & Verification</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Registered Citizens ({citizens.length})
          </h1>
          <p className="text-xs text-slate-500">
            Citizen accounts, token booking records, verification status, and profile controls.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search citizen name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading citizen directory..." />
      ) : (
        <div className="gov-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Citizen Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Mobile</th>
                <th className="py-2.5 px-3">Joined Date</th>
                <th className="py-2.5 px-3">Total Tokens</th>
                <th className="py-2.5 px-3">Completed</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-3 text-slate-600">{c.email}</td>
                  <td className="py-3 px-3 text-slate-600">{c.mobile || 'N/A'}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-blue-700 font-mono">{c.totalTokens || 0}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-600 font-mono">{c.completedTokens || 0}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {c.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewCitizen(c)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        title="View Citizen Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                        title="Edit Citizen"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Citizen"
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

      {/* VIEW CITIZEN MODAL */}
      {viewCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{viewCitizen.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">Citizen Digital Profile</span>
                </div>
              </div>
              <button onClick={() => setViewCitizen(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Email Address</span>
                  <span className="font-bold text-slate-800 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">{viewCitizen.email}</span>
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Mobile Phone</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{viewCitizen.mobile || 'N/A'}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-center">
                  <span className="text-[10px] font-mono uppercase text-blue-700 block">Total Tokens</span>
                  <span className="text-xl font-black font-mono text-blue-900">{viewCitizen.totalTokens || 0}</span>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-mono uppercase text-emerald-700 block">Completed</span>
                  <span className="text-xl font-black font-mono text-emerald-900">{viewCitizen.completedTokens || 0}</span>
                </div>
                <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-center">
                  <span className="text-[10px] font-mono uppercase text-rose-700 block">Cancelled</span>
                  <span className="text-xl font-black font-mono text-rose-900">{viewCitizen.cancelledTokens || 0}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Registration Date</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{new Date(viewCitizen.createdAt).toLocaleString()}</span>
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 font-mono">
                <span>Account: <strong className="text-emerald-700 uppercase">{viewCitizen.status || 'Active'}</strong></span>
                <span>User ID: {viewCitizen._id?.slice(-6)}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const c = viewCitizen;
                  setViewCitizen(null);
                  handleOpenEdit(c);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Account</span>
              </button>
              <button
                type="button"
                onClick={() => setViewCitizen(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CITIZEN MODAL */}
      {editingCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-base text-slate-900">Edit Citizen Account</h3>
              <button onClick={() => setEditingCitizen(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={editFormData.mobile}
                  onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended / Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCitizen(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
                >
                  Update Citizen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCitizens;
