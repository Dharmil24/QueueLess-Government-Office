import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ScrollText, ShieldCheck, Clock } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs();
      if (res.success) setLogs(res.logs || []);
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Accountability & Compliance
        </span>
        <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
          Administrative Audit Trail
        </h1>
        <p className="text-xs text-slate-500">
          Immutable log of operational and administrative actions for transparency.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Reading audit logs..." />
      ) : (
        <div className="gov-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{l.performedByName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {l.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-blue-700">{l.action}</td>
                  <td className="py-3 px-3 text-slate-700">{l.entity}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                    {JSON.stringify(l.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
