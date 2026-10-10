import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Sliders, Save, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    tokenPrefix: 'A',
    maxDailyTokens: 250,
    notificationThresholdApproaching: 5,
    notificationThresholdUrgent: 2,
    queueTimeoutMinutes: 15,
    tokenExpiryHours: 12,
    announcementTicker: 'QueueLess: Wait Less. Arrive Smart. Get Served.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adminService.updateSettings(settings);
      if (res.success) {
        toast.success('System parameters saved and applied.');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner text="Loading system configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Core Engine Configuration
        </span>
        <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
          System Rules & Parameters
        </h1>
        <p className="text-xs text-slate-500">Configure global queuing policies and automated alert triggers</p>
      </div>

      <div className="gov-card p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Default Token Prefix
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={settings.tokenPrefix}
                onChange={(e) => setSettings({ ...settings, tokenPrefix: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 uppercase font-mono"
              />
              <span className="text-[10px] text-slate-400">Used for generic tokens (e.g. A-001)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Max Daily Tokens Per Service
              </label>
              <input
                type="number"
                min={10}
                value={settings.maxDailyTokens}
                onChange={(e) => setSettings({ ...settings, maxDailyTokens: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
              <span className="text-[10px] text-slate-400">Prevents counter overload</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Approaching Alert Threshold (People Ahead)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.notificationThresholdApproaching}
                onChange={(e) =>
                  setSettings({ ...settings, notificationThresholdApproaching: Number(e.target.value) })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
              <span className="text-[10px] text-slate-400">
                Triggered when citizen is within X people of their turn (default: 5)
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Urgent Alert Threshold (People Ahead)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={settings.notificationThresholdUrgent}
                onChange={(e) =>
                  setSettings({ ...settings, notificationThresholdUrgent: Number(e.target.value) })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
              <span className="text-[10px] text-slate-400">
                Proceed towards office desk trigger (default: 2)
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Public Display Announcement Ticker
            </label>
            <input
              type="text"
              value={settings.announcementTicker}
              onChange={(e) => setSettings({ ...settings, announcementTicker: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
            />
            <span className="text-[10px] text-slate-400">Broadcast on TV display screens</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
