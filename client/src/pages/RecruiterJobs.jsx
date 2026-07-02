import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Edit3, Trash2, ShieldCheck, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/recruiters/jobs');
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
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting? This will remove related applications.')) {
      try {
        const res = await api.delete(`/recruiters/jobs/${jobId}`);
        if (res.success) {
          alert('Job posting deleted.');
          fetchJobs();
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const getStatusBadge = (status, reason) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            <ShieldCheck className="h-4.5 w-4.5" />
            <span>Approved (Live)</span>
          </span>
        );
      case 'rejected':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-rose-600 text-xs font-semibold">
              <XCircle className="h-4.5 w-4.5" />
              <span>Rejected</span>
            </span>
            {reason && <span className="text-[10px] text-rose-500 font-medium">Reason: {reason}</span>}
          </div>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
            <Clock className="h-4.5 w-4.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Job Postings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active listings and review moderation status</p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-smooth"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Post New Job</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
          You haven't posted any jobs yet. Click "Post New Job" to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex-1">
                <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {job.jobType}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-800">{job.title}</h3>
                <p className="text-xs font-semibold text-slate-400">
                  {job.category} • Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              </div>

              {/* Status */}
              <div className="min-w-40">{getStatusBadge(job.approvalStatus, job.rejectionReason)}</div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/recruiter/post-job?editId=${job._id}`}
                  className="rounded-xl border border-slate-150 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-smooth"
                  title="Edit Job"
                >
                  <Edit3 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="rounded-xl border border-rose-100 bg-rose-50/20 p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-smooth"
                  title="Delete Job"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
