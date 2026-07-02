import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { ShieldCheck, XCircle, ArrowRight, ShieldAlert, X } from 'lucide-react';

const AdminModeration = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchPendingJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/jobs/pending');
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const handleModerate = async (jobId, status, reason = '') => {
    if (status === 'rejected' && !reason) {
      alert('Please specify a rejection reason.');
      return;
    }

    try {
      const res = await api.put(`/admin/jobs/${jobId}/moderate`, {
        status,
        reason
      });
      if (res.success) {
        alert(`Job posting has been ${status}!`);
        setShowRejectModal(false);
        setRejectReason('');
        fetchPendingJobs();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Job Moderation</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve job listings before they go live on the platform</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
          No job listings pending moderation.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase">
                  {job.approvalStatus}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{job.title}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Recruiter: {job.recruiterProfileId?.companyName || 'Company'} • {job.location}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mt-3 line-clamp-3">
                  {job.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleModerate(job._id, 'approved')}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition-smooth"
                >
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => {
                    setActiveJob(job);
                    setShowRejectModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-smooth"
                >
                  <XCircle className="h-4.5 w-4.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Reject Job Listing</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600">
                <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
                <span>Specify the rejection details. The recruiter will see this notification reason.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Reason for Rejection</label>
                <textarea
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Compensation format is incomplete or details are inappropriate."
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(activeJob._id, 'rejected', rejectReason)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-md"
              >
                Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
