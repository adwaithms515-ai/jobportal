import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Settings, Save, Server, ShieldCheck, AlertTriangle } from 'lucide-react';

const AdminSettings = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [serverHealth, setServerHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.success) {
        setMaintenance(res.settings.maintenanceMode);
        setAnnouncement(res.settings.systemAnnouncement);
        setServerHealth({
          dbStatus: res.settings.dbStatus,
          uptime: res.settings.serverUptime
        });
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', {
        toggleMaintenance: maintenance,
        announcement
      });
      if (res.success) {
        alert('System settings updated successfully!');
        fetchSettings();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">System Maintenance</h1>
        <p className="text-sm text-slate-500 mt-1">Configure maintenance status blockades and server alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4 md:col-span-2">
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-md font-bold text-slate-800">Database Status: {serverHealth?.dbStatus}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Uptime: {formatUptime(serverHealth?.uptime)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col gap-6">
        <h3 className="text-md font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
          <Settings className="h-5 w-5 text-slate-400" />
          <span>System Configurations</span>
        </h3>

        {/* Maintenance Toggle */}
        <div className="flex items-start justify-between gap-6 p-4 rounded-2xl bg-slate-55/30 border border-slate-100">
          <div className="max-w-md">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span>Maintenance Lock Mode</span>
              {maintenance && <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Activating maintenance lock blocks candidate and recruiter accounts from making API requests. Admins are exempt.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMaintenance(!maintenance)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              maintenance ? 'bg-amber-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                maintenance ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Announcement banner */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Global System Announcement</label>
          <input
            type="text"
            required
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-smooth"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{saving ? 'Updating settings...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
