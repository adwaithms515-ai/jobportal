import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, DollarSign, Bookmark, ArrowRight, CheckCircle } from 'lucide-react';

const CandidateJobs = () => {
  const { profile, refreshProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [salaryMin, setSalaryMin] = useState('');

  // List of standard categories
  const categories = ['IT & Software', 'Marketing', 'Design & Art', 'Finance', 'Healthcare', 'Education'];

  const fetchJobs = async () => {
    setLoading(true);
    setErr('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (location) params.append('location', location);
      if (category) params.append('category', category);
      if (jobType) params.append('jobType', jobType);
      if (salaryMin) params.append('salaryMin', salaryMin);

      const res = await api.get(`/jobs/search?${params.toString()}`);
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (error) {
      setErr(error.message || 'Error searching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category, jobType]); // Trigger search on category/jobtype quick tags

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleSaveJob = async (jobId) => {
    try {
      const isSaved = profile.savedJobs?.includes(jobId);
      const endpoint = `/candidates/saved/${jobId}`;
      const method = isSaved ? 'delete' : 'post';
      
      const res = await api[method](endpoint);
      if (res.success) {
        await refreshProfile();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApply = async (jobId) => {
    if (!profile.resumeUrl) {
      alert('Please upload your resume in the Profile tab before applying!');
      return;
    }

    if (window.confirm('Are you sure you want to apply to this job using your uploaded resume?')) {
      try {
        const res = await api.post(`/jobs/${jobId}/apply`);
        if (res.success) {
          alert('Application submitted successfully!');
          fetchJobs();
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Discover Jobs</h1>
        <p className="text-sm text-slate-500 mt-1">Search, bookmark, and apply to premium career openings</p>
      </div>

      {/* Search Filter Panel */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, skills, or companies..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
          />
        </div>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="Min Salary..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 font-semibold text-white text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-smooth"
        >
          Find Jobs
        </button>
      </form>

      {/* Category quick tabs & filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-smooth ${
              !category ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-smooth ${
                category === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-emerald-500"
        >
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Jobs Feed List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : err ? (
        <div className="text-center py-10 text-rose-500 font-semibold">{err}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
          No job openings match your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => {
            const isSaved = profile?.savedJobs?.includes(job._id);
            return (
              <div key={job._id} className="relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-smooth">
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
                      onClick={() => handleSaveJob(job._id)}
                      className={`rounded-full p-2 transition-smooth ${
                        isSaved ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className="h-4.5 w-4.5" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.requirements?.slice(0, 3).map((req, idx) => (
                      <span key={idx} className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] text-slate-500 font-medium">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="text-xs">
                    <span className="font-bold text-slate-700">
                      ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()}
                    </span>
                    <span className="text-slate-400"> / year</span>
                  </div>
                  <button
                    onClick={() => handleApply(job._id)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-smooth"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;
