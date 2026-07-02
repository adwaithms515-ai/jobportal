import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Mail, FileText, Calendar, Edit2, ShieldAlert, X } from 'lucide-react';

const RecruiterApplicants = () => {
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering
  const [selectedJobId, setSelectedJobId] = useState('');
  
  // Modals/Drawers State
  const [activeApp, setActiveApp] = useState(null); // Selected app for details/pipeline update
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('Under Review');
  const [statusNote, setStatusNote] = useState('');
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewMode, setInterviewMode] = useState('online');
  const [interviewCoords, setInterviewCoords] = useState('');

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const url = selectedJobId ? `/recruiters/applicants?jobId=${selectedJobId}` : '/recruiters/applicants';
      const res = await api.get(url);
      if (res.success) {
        setApps(res.applications);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/recruiters/jobs');
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [selectedJobId]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/recruiters/applications/${activeApp._id}/status`, {
        status: newStatus,
        note: statusNote
      });
      if (res.success) {
        alert('Applicant status updated!');
        setShowStatusModal(false);
        setStatusNote('');
        fetchApplicants();
        
        // Update local reference
        if (activeApp) {
          setActiveApp(res.application);
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/recruiters/interviews', {
        applicationId: activeApp._id,
        date: interviewDate,
        time: interviewTime,
        mode: interviewMode,
        locationOrLink: interviewCoords
      });
      if (res.success) {
        alert('Interview scheduled and candidate notified!');
        setShowScheduleModal(false);
        setInterviewDate('');
        setInterviewTime('');
        setInterviewCoords('');
        fetchApplicants();
        
        // Refresh details
        setActiveApp(res.application);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Screen Applicants</h1>
        <p className="text-sm text-slate-500 mt-1">Review profiles, update statuses, and coordinate interviews</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Job:</label>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-emerald-500"
        >
          <option value="">All Job Postings</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Applicants Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
              No applicant filings found for selection.
            </div>
          ) : (
            apps.map((app) => (
              <div
                key={app._id}
                onClick={() => {
                  setActiveApp(app);
                  setNewStatus(app.status);
                }}
                className={`rounded-2xl border p-5 bg-white shadow-sm flex flex-col gap-3 transition-smooth cursor-pointer ${
                  activeApp?._id === app._id ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-md">{app.candidateProfileId?.name}</h3>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">Applied for: {app.jobId?.title}</p>
                  </div>
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                    {app.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed max-w-md">
                  <strong>Skills:</strong> {app.candidateProfileId?.skills?.slice(0, 5).join(', ') || 'None'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Applicant Details side panel */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-6">
          {activeApp ? (
            <div className="flex flex-col gap-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                  {activeApp.status}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{activeApp.candidateProfileId?.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{activeApp.applicantId?.email}</span>
                </p>
                {activeApp.candidateProfileId?.phone && (
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Phone: {activeApp.candidateProfileId.phone}</p>
                )}
              </div>

              {/* Resume download */}
              {activeApp.resumeUrl && (
                <a
                  href={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}${activeApp.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-smooth"
                >
                  <FileText className="h-4 w-4" />
                  <span>Open Candidate Resume PDF</span>
                </a>
              )}

              {/* Pipeline controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-smooth"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Update Status</span>
                </button>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-smooth"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Interview</span>
                </button>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeApp.candidateProfileId?.skills?.map(skill => (
                    <span key={skill} className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                      {skill}
                    </span>
                  )) || <span className="text-xs text-slate-400">No skills listed</span>}
                </div>
              </div>

              {/* History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Timeline Logs</h4>
                <div className="mt-2 flex flex-col gap-2">
                  {activeApp.statusHistory?.map((hist, idx) => (
                    <div key={idx} className="text-[11px] text-slate-500 leading-normal border-l-2 border-slate-200 pl-3.5 py-0.5">
                      <strong>{hist.status}</strong> • {new Date(hist.timestamp).toLocaleDateString()}
                      {hist.note && <p className="text-[10px] text-slate-400 mt-0.5">"{hist.note}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-medium flex flex-col items-center justify-center gap-2.5">
              <ShieldAlert className="h-8 w-8 text-slate-300" />
              <span>Select an applicant from the list to view profile, download resume, update statuses, or schedule interviews.</span>
            </div>
          )}
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleUpdateStatus} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Update Pipeline Status</h3>
              <button type="button" onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm"
                >
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Short Note (Optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Great resume match, moving to next stage..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md"
              >
                Save Status
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleScheduleInterview} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Schedule Interview</h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Time</label>
                  <input
                    type="time"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Interview Mode</label>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInterviewMode('online')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-smooth ${
                      interviewMode === 'online' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Online Zoom/Meet
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewMode('in-person')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-smooth ${
                      interviewMode === 'in-person' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    In-Person / Office
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                  {interviewMode === 'online' ? 'Meeting Link (Zoom, Meet)' : 'Office Location Address'}
                </label>
                <input
                  type="text"
                  required
                  value={interviewCoords}
                  onChange={(e) => setInterviewCoords(e.target.value)}
                  placeholder={interviewMode === 'online' ? 'https://zoom.us/j/...' : '123 Main St, New York, NY'}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md"
              >
                Schedule & Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicants;
