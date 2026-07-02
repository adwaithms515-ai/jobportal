import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Search, Clock, ShieldAlert } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (actionType) params.append('actionType', actionType);

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Review system logs and user authentication traces</p>
      </div>

      {/* Toolbar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 bg-white p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search details..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-xs outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-650 outline-none"
        >
          <option value="">All Actions</option>
          <option value="user_registered">Registration</option>
          <option value="user_logged_in">Logins</option>
          <option value="job_created">Job Creation</option>
          <option value="job_approved">Job Approvals</option>
          <option value="job_rejected">Job Rejections</option>
          <option value="user_suspended">Suspensions</option>
        </select>
        <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white">
          Search
        </button>
      </form>

      {/* Logs Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
          No audit logs recorded for selection.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-55/50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-4">Timestamp</th>
                <th scope="col" className="px-6 py-4">Actor</th>
                <th scope="col" className="px-6 py-4">Action</th>
                <th scope="col" className="px-6 py-4">IP Address</th>
                <th scope="col" className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 transition-smooth">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                    {log.actorId?.email || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    {log.ipAddress || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    {log.details}
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
