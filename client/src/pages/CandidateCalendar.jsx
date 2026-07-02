import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Calendar, Clock, Video, MapPin, ExternalLink } from 'lucide-react';

const CandidateCalendar = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/jobs/calendar');
        if (res.success) {
          setInterviews(res.interviews);
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Interview Calendar</h1>
        <p className="text-sm text-slate-500 mt-1">Review upcoming interviews and coordinate access</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
          No upcoming interviews scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((int) => (
            <div key={int._id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                  {int.status}
                </span>
                <h3 className="mt-2.5 text-lg font-bold text-slate-800">{int.jobId?.title}</h3>
                <p className="text-xs font-semibold text-slate-400">
                  Interviewing on {new Date(int.date).toLocaleDateString()} at {int.time}
                </p>

                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    {int.mode === 'online' ? (
                      <Video className="h-4 w-4 text-slate-400" />
                    ) : (
                      <MapPin className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="capitalize"><strong>Mode:</strong> {int.mode}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold shrink-0">Details/Link:</span>
                    {int.mode === 'online' ? (
                      <a href={int.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <span>Join Meeting</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-700">{int.meetingLink}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateCalendar;
