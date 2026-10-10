import React, { useState } from 'react';
import { X, QrCode, Search, CheckCircle2, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { tokenService } from '../../services/tokenService';
import StatusBadge from '../common/StatusBadge';
import toast from 'react-hot-toast';

const QrScannerModal = ({ isOpen, onClose }) => {
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!qrInput.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      setVerifiedToken(null);
      const res = await tokenService.verifyQr(qrInput.trim());
      if (res.success && res.token) {
        setVerifiedToken(res.token);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or unrecognized QR token key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Scan & Verify Token</h3>
            <p className="text-xs text-slate-500">Fast Token Pass QR Verification</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-3 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Paste or scan QR key (e.g. QL-RTO-RJT-...)"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Verifying...' : 'Verify Token Pass'}
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {verifiedToken && (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="font-extrabold text-lg text-emerald-800">{verifiedToken.tokenNumber}</span>
              <StatusBadge status={verifiedToken.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Citizen Name:</span>
              <span className="font-bold">{verifiedToken.citizenName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact:</span>
              <span>{verifiedToken.citizenMobile || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Office:</span>
              <span className="font-medium truncate max-w-[200px]">{verifiedToken.officeId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-medium truncate max-w-[200px]">{verifiedToken.serviceId?.name}</span>
            </div>
            <div className="pt-2 border-t border-emerald-200 flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Token Authenticated & Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrScannerModal;
