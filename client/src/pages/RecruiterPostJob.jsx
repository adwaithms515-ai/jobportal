import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Save, ArrowLeft } from 'lucide-react';

const RecruiterPostJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('IT & Software');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      const fetchJobDetails = async () => {
        try {
          const res = await api.get(`/jobs/details/${editId}`);
          if (res.success) {
            const { job } = res;
            setTitle(job.title || '');
            setDescription(job.description || '');
            setRequirements(job.requirements?.join(', ') || '');
            setSalaryMin(job.salaryRange?.min || '');
            setSalaryMax(job.salaryRange?.max || '');
            setJobType(job.jobType || 'Full-time');
            setLocation(job.location || '');
            setCategory(job.category || 'IT & Software');
            if (job.deadline) {
              setDeadline(new Date(job.deadline).toISOString().split('T')[0]);
            }
          }
        } catch (err) {
          alert('Failed to load job details');
        }
      };
      fetchJobDetails();
    }
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      requirements,
      salaryRange: {
        min: Number(salaryMin),
        max: Number(salaryMax)
      },
      jobType,
      location,
      category,
      deadline
    };

    try {
      let res;
      if (editId) {
        res = await api.put(`/recruiters/jobs/${editId}`, payload);
      } else {
        res = await api.post('/recruiters/jobs', payload);
      }

      if (res.success) {
        alert(editId ? 'Job posting updated successfully!' : 'Job created! Pending admin review.');
        navigate('/recruiter');
      }
    } catch (err) {
      alert(err.message || 'Error submitting job form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/recruiter')}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 transition-smooth"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{editId ? 'Edit Job Posting' : 'Post New Job'}</h1>
          <p className="text-sm text-slate-500 mt-1">Specify detailed job profiles to attract leading talent</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col gap-6">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Job Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer"
            className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Job Description</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe job role duties, technical configurations, work cultures..."
            className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Requirements (comma-separated)</label>
          <input
            type="text"
            required
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="e.g. 3+ years experience, React knowledge, Node expertise"
            className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="IT & Software">IT & Software</option>
              <option value="Marketing">Marketing</option>
              <option value="Design & Art">Design & Art</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Application Deadline</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Min Salary ($ / year)</label>
            <input
              type="number"
              required
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="60000"
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Max Salary ($ / year)</label>
            <input
              type="number"
              required
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="120000"
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-smooth disabled:opacity-50"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{loading ? 'Submitting form...' : (editId ? 'Update Posting' : 'Post Listing')}</span>
        </button>
      </form>
    </div>
  );
};

export default RecruiterPostJob;
