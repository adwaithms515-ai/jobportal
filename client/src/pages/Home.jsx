import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Users, Building, ArrowRight, ShieldCheck, Sparkles, MapPin, Search, Star, Layers, Calendar, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('candidates');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/login?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/login');
    }
  };

  // Mock jobs to display on the landing page for a realistic look
  const mockJobs = [
    { id: 1, title: 'Senior Frontend Engineer', company: 'TechCorp Solutions', location: 'San Francisco, CA', salary: '$120k - $140k', type: 'Full-time', category: 'IT & Software' },
    { id: 2, title: 'Lead Product Designer', company: 'Apex Creative', location: 'New York, NY', salary: '$110k - $130k', type: 'Remote', category: 'Design & Art' },
    { id: 3, title: 'Growth Marketing Manager', company: 'Creative Agency', location: 'Remote', salary: '$85k - $100k', type: 'Part-time', category: 'Marketing' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-Outfit text-slate-800">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="absolute inset-0 bg-grid-slate-50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="mx-auto max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100/50 px-4 py-2 text-sm font-semibold text-emerald-700 mb-8 shadow-sm">
              <Sparkles className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
              <span>Explore 2,500+ Active Tech Positions</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              The premium way to <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                hire and get hired.
              </span>
            </h1>

            <p className="text-lg text-slate-500 max-w-xl leading-relaxed mb-10">
              An ecosystem connecting developers, designers, and marketers with top tech firms. Complete with automated resume parsers, socket message updates, and interview planners.
            </p>

            {/* Premium Search Box */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xl flex flex-col sm:flex-row gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-100">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Skills, job title, or company..."
                  className="w-full bg-transparent border-none py-3 text-sm text-slate-800 outline-none focus:ring-0 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-emerald-700 transition-smooth shadow-md shadow-emerald-100"
              >
                Search
              </button>
            </form>
          </div>

          {/* Hero Right: Live Interactive Card Widget */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-blue-50 rounded-3xl rotate-3 scale-102 blur-sm opacity-50" />
            <div className="relative bg-white rounded-3xl border border-slate-100 p-8 shadow-xl">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Featured Board</span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="flex flex-col gap-4">
                {mockJobs.map(job => (
                  <div key={job.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-smooth border border-slate-100/50 cursor-pointer" onClick={() => navigate('/login')}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-base">
                      {job.company.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-850 text-base">{job.title}</h4>
                      <p className="text-sm font-medium text-slate-500">{job.company} • {job.location}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border text-slate-500 uppercase">{job.type}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded">{job.salary}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-350 self-center" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Portals Section */}
      <section className="py-20 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Choose Your Board Mode
          </h2>
          <p className="mt-2 text-md text-slate-500 max-w-md mx-auto">
            Switch between modules to preview the specialized capabilities for each user role.
          </p>

          {/* Selector Toggles */}
          <div className="mt-8 flex justify-center gap-2 bg-white border p-1.5 rounded-2xl max-w-md mx-auto shadow-sm">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-smooth ${
                activeTab === 'candidates' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-50/50' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Candidates</span>
            </button>
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-smooth ${
                activeTab === 'recruiters' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-50/50' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="h-4.5 w-4.5" />
              <span>Recruiters</span>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-smooth ${
                activeTab === 'admins' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-50/50' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>Admins</span>
            </button>
          </div>

          {/* Dynamic Board Visual Panel */}
          <div className="mt-12 max-w-5xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-8 lg:p-12 shadow-xl flex flex-col md:flex-row gap-10 text-left items-center animate-in fade-in duration-300">
            {activeTab === 'candidates' && (
              <>
                <div className="flex-1">
                  <span className="text-sm font-extrabold text-emerald-600 uppercase tracking-widest">Candidate Experience</span>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-800 mt-2">Resume parsing at your fingertips.</h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    Upload your resume as a PDF and let our AI parser extract and structure your experiences, school entries, and core skills automatically. Match with live openings and track pipeline statuses inside a clear, visual history log.
                  </p>
                  <Link to="/register" className="mt-6 inline-flex items-center gap-1.5 text-base font-bold text-emerald-600 hover:text-emerald-700">
                    <span>Create Candidate Profile</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </div>
                <div className="flex-1 bg-slate-50 p-6 rounded-2xl w-full border border-slate-100">
                  <div className="flex items-center gap-3 border-b pb-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Users className="h-5 w-5" /></div>
                    <div>
                      <h4 className="text-base font-bold">John Doe</h4>
                      <p className="text-xs text-slate-500">Full Stack Developer</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['React', 'NodeJS', 'MongoDB', 'Express', 'JavaScript'].map(skill => (
                      <span key={skill} className="text-xs font-bold px-2.5 py-1.5 bg-white border rounded text-slate-600">{skill}</span>
                    ))}
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100/50 p-3.5 text-sm text-emerald-800 font-bold flex items-center justify-between">
                    <span>Application Status: Shortlisted</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'recruiters' && (
              <>
                <div className="flex-1">
                  <span className="text-sm font-extrabold text-blue-600 uppercase tracking-widest">Recruiter Tools</span>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-800 mt-2">Manage candidates & schedule interviews.</h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    Host structured CRUD listings for jobs, screen applicant pools with built-in status updates, and coordinate interviews through a visual planner. Sends automatic Nodemailer updates and Socket.IO indicators instantly to candidates.
                  </p>
                  <Link to="/register" className="mt-6 inline-flex items-center gap-1.5 text-base font-bold text-emerald-600 hover:text-emerald-700">
                    <span>Register as Recruiter</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </div>
                <div className="flex-1 bg-slate-50 p-6 rounded-2xl w-full border border-slate-100 flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Jane Smith</h4>
                      <p className="text-xs text-slate-500">Applied for Product Designer</p>
                    </div>
                    <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200/50">Under Review</span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-900 flex flex-col gap-2">
                    <p className="font-bold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Interview Scheduled</span>
                    </p>
                    <p className="text-xs text-blue-700 font-semibold">Date: July 15, 2026 at 14:00 (Zoom)</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'admins' && (
              <>
                <div className="flex-1">
                  <span className="text-sm font-extrabold text-purple-600 uppercase tracking-widest">Admin Console</span>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-800 mt-2">Maintain full platform moderation.</h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    Admin dashboards provide total control. Moderate job postings, suspend accounts violating terms of service, track audit logs with actor and timestamp coordinates, and monitor server-wide settings.
                  </p>
                  <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-base font-bold text-emerald-600 hover:text-emerald-700">
                    <span>Open Admin Console</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </div>
                <div className="flex-1 bg-slate-50 p-6 rounded-2xl w-full border border-slate-100 flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-450">Audit Logs</h4>
                  <div className="flex flex-col gap-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                      <span>Job Approved: "Senior React Dev"</span>
                      <span className="text-slate-450">10:54 AM</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                      <span>User Suspended: spammer@email.com</span>
                      <span className="text-slate-450">09:12 AM</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Premium Statistics Banner */}
      <section className="bg-slate-900 py-20 px-6 lg:px-8 text-white w-full border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-12">
          <div className="max-w-sm text-left">
            <h3 className="text-3xl font-extrabold">Join the recruitment network of tomorrow.</h3>
            <p className="text-sm text-slate-450 mt-4 leading-relaxed">
              Thousands of designers, developers, and administrators are already coordinating pipelines live. Create your account and get started.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-8 text-center max-w-xl">
            <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-3xl font-extrabold text-emerald-400">10k+</h4>
              <p className="text-xs text-slate-400 mt-1.5 uppercase tracking-wider font-semibold">Active Jobs</p>
            </div>
            <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-3xl font-extrabold text-emerald-400">500+</h4>
              <p className="text-xs text-slate-400 mt-1.5 uppercase tracking-wider font-semibold">Tech Companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-10 px-6 text-center text-sm text-slate-500 border-t border-slate-900 w-full">
        <p>© 2026 HirePulse Recruitment Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
