import React from 'react';
import { X, QrCode, Download, Printer, ShieldCheck } from 'lucide-react';
import Card3D from './3D/Card3D';

const QRModal = ({ isOpen, onClose, token }) => {
  if (!isOpen || !token) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-sm w-full">
        <Card3D maxTilt={6}>
          <div className="glass-panel-3d p-6 sm:p-7 rounded-3xl border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative text-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-white font-heading">Virtual Token Pass</h3>
            <p className="text-xs font-mono text-cyan-400 mb-4">Official Verification QR Identifier</p>

            {/* QR Code Container */}
            <div className="p-4 bg-white border-2 border-cyan-400/50 rounded-2xl inline-block mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {token.qrDataUrl ? (
                <img
                  src={token.qrDataUrl}
                  alt={`QR for ${token.tokenNumber}`}
                  className="w-48 h-48 mx-auto object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 bg-slate-100 rounded-lg font-mono text-xs">
                  QR unavailable
                </div>
              )}
            </div>

            {/* Token Highlights */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 mb-4 text-left space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Token Number:</span>
                <span className="text-base font-black text-cyan-400">{token.tokenNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Citizen:</span>
                <span className="font-semibold text-white">{token.citizenName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Service:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                  {token.serviceId?.name || 'General Service'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Office:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                  {token.officeId?.name || 'Government Office'}
                </span>
              </div>
            </div>

            {/* Required Documents on pass */}
            {token.serviceId?.requiredDocuments && token.serviceId.requiredDocuments.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 mb-4 text-left font-mono text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1.5">
                  Mandatory Documents to Carry & Present:
                </span>
                <ul className="space-y-1 text-slate-200 text-[11px]">
                  {token.serviceId.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-mono font-medium mb-5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Encrypted Secure Verification Token</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              {token.qrDataUrl && (
                <a
                  href={token.qrDataUrl}
                  download={`Token_${token.tokenNumber}.png`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold transition text-xs font-mono"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download</span>
                </a>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition text-xs font-mono shadow-lg shadow-cyan-500/25 btn-3d border border-cyan-400/40"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        </Card3D>
      </div>
    </div>
  );
};

export default QRModal;
