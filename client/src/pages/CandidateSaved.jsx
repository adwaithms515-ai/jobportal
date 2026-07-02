import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Bookmark, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateSaved = () => {
  const { refreshProfile } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/candidates/saved');
      if (res.success) {
        setSavedJobs(res.savedJobs);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      const res = await api.delete(`/candidates/saved/${jobId}`);
      if (res.success) {
        await refreshProfile();
        fetchSavedJobs();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Saved Jobs</h1>
        <p className="text-sm text-slate-500 mt-1">Review bookmarked jobs and apply when ready</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
          No saved jobs. Bookmarks will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((job) => (
            <div key={job._id} className="relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {job.jobType}
                    </span>
                    <h3 className="mt-2.5 text-lg font-bold text-slate-800">{job.title}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {job.recruiterProfileId?.companyName || 'Company'} • {job.location}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnsave(job._id)}
                    className="rounded-full bg-emerald-50 p-2 text-emerald-600 transition-smooth"
                  >
                    <Bookmark className="h-4.5 w-4.5" fill="currentColor" />
                  </button>
                </div>
                <p className="mt-4 text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {job.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="text-xs font-bold text-slate-700">
                  ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()} / year
                </div>
                <Link
                  to="/candidate"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-smooth"
                >
                  <span>View & Apply</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateSaved;
