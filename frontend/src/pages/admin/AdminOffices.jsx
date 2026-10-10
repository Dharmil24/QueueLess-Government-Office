import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { officeService } from '../../services/officeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Building2, Plus, Edit2, Trash2, MapPin, Check, X, Eye, Phone, Mail, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOffices = () => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewOffice, setViewOffice] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: 'Rajkot',
    state: 'Gujarat',
    pinCode: '360001',
    contactNumber: '',
    email: '',
    openingTime: '09:00',
    closingTime: '17:00',
    status: 'open',
    announcement: 'Welcome to QueueLess Smart Citizen Service Center.',
  });

  useEffect(() => {
    loadOffices();
  }, []);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const res = await officeService.getOffices();
      if (res.success) setOffices(res.offices || []);
    } catch (err) {
      toast.error('Failed to load offices');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      city: 'Rajkot',
      state: 'Gujarat',
      pinCode: '360001',
      contactNumber: '',
      email: '',
      openingTime: '09:00',
      closingTime: '17:00',
      status: 'open',
      announcement: 'Welcome to QueueLess Smart Citizen Service Center.',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (off) => {
    setEditingId(off._id);
    setFormData({
      name: off.name,
      code: off.code,
      address: off.address,
      city: off.city,
      state: off.state,
      pinCode: off.pinCode,
      contactNumber: off.contactNumber || '',
      email: off.email || '',
      openingTime: off.openingTime || '09:00',
      closingTime: off.closingTime || '17:00',
      status: off.status || 'open',
      announcement: off.announcement || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateOffice(editingId, formData);
        toast.success('Office updated successfully');
      } else {
        await adminService.createOffice(formData);
        toast.success('New office created successfully');
      }
      setShowModal(false);
      loadOffices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await adminService.deleteOffice(id);
      toast.success('Office deleted');
      loadOffices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Center Infrastructure
          </span>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Government Office Management
          </h1>
          <p className="text-xs text-slate-500">Add, edit, and configure citizen service centers</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Office</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading offices..." />
      ) : (
        <div className="gov-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Office Name</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Timings</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offices.map((off) => (
                <tr key={off._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-extrabold text-blue-700">{off.code}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{off.name}</td>
                  <td className="py-3 px-3 text-slate-600">
                    {off.city}, {off.pinCode}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {off.openingTime} - {off.closingTime}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {off.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewOffice(off)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(off)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(off._id, off.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        title="Delete"
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingId ? 'Edit Government Office' : 'Add New Government Office'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Office Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Save Office
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW OFFICE MODAL */}
      {viewOffice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{viewOffice.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {viewOffice.code}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewOffice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                  Physical Address
                </span>
                <p className="font-semibold text-slate-800 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{viewOffice.address}, {viewOffice.city}, {viewOffice.state} - {viewOffice.pinCode}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Contact Phone</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{viewOffice.contactNumber || 'N/A'}</span>
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Official Email</span>
                  <span className="font-bold text-slate-800 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">{viewOffice.email || 'N/A'}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Operating Hours</span>
                  <span className="font-bold font-mono text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{viewOffice.openingTime} - {viewOffice.closingTime}</span>
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Operational Status</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase inline-block">
                    {viewOffice.status}
                  </span>
                </div>
              </div>

              {viewOffice.announcement && (
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                  <span className="text-[10px] uppercase font-mono text-blue-600 font-bold block mb-1">Public Announcement</span>
                  <p className="text-blue-900">{viewOffice.announcement}</p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const o = viewOffice;
                  setViewOffice(null);
                  handleOpenEdit(o);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Office</span>
              </button>
              <button
                type="button"
                onClick={() => setViewOffice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffices;
