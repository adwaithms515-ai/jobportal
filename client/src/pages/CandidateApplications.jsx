import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { X, Calendar, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

const CandidateApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      const res = await api.get('/candidates/applications');
      if (res.success) {
        setApps(res.applications);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleWithdraw = async (appId) => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      try {
        const res = await api.delete(`/jobs/applications/${appId}/withdraw`);
        if (res.success) {
          alert('Application withdrawn.');
          fetchApps();
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Hired':
      case 'Shortlisted':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Under Review':
      case 'Interview Scheduled':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Track status history updates and manage submissions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
          You haven't submitted any job applications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {apps.map((app) => (
            <div key={app._id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                  {app.status}
                </span>
                <h3 className="mt-2.5 text-lg font-bold text-slate-800">{app.jobId?.title}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {app.jobId?.recruiterProfileId?.companyName || 'Company'} • {app.jobId?.location}
                </p>

                {/* History Pipeline */}
                <div className="mt-4 flex flex-col gap-1 border-t border-slate-50 pt-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeline</h4>
                  {app.statusHistory?.map((hist, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Changed to <strong className="text-slate-600">{hist.status}</strong> on {new Date(hist.timestamp).toLocaleDateString()}
                        {hist.note && ` — "${hist.note}"`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {app.status === 'Applied' && (
                  <button
                    onClick={() => handleWithdraw(app._id)}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-smooth"
                  >
                    <X className="h-4 w-4" />
                    <span>Withdraw</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateApplications;
