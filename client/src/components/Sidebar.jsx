import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  ListChecks,
  User,
  Bookmark,
  Calendar,
  PlusCircle,
  Building,
  Users,
  Settings,
  ShieldCheck,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const candidateLinks = [
    { name: 'Job Board', path: '/candidate', icon: Briefcase },
    { name: 'My Applications', path: '/candidate/applications', icon: ListChecks },
    { name: 'Saved Jobs', path: '/candidate/saved', icon: Bookmark },
    { name: 'My Profile', path: '/candidate/profile', icon: User },
    { name: 'Calendar', path: '/candidate/calendar', icon: Calendar }
  ];

  const recruiterLinks = [
    { name: 'Posted Jobs', path: '/recruiter', icon: Briefcase },
    { name: 'Post New Job', path: '/recruiter/post-job', icon: PlusCircle },
    { name: 'Screen Applicants', path: '/recruiter/applicants', icon: Users },
    { name: 'Company Profile', path: '/recruiter/profile', icon: Building },
    { name: 'Interview Calendar', path: '/recruiter/calendar', icon: Calendar }
  ];

  const adminLinks = [
    { name: 'Moderation Grid', path: '/admin', icon: ShieldCheck },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: Activity },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ListChecks },
    { name: 'System Settings', path: '/admin/settings', icon: Settings }
  ];

  const links = user.role === 'candidate' ? candidateLinks
              : user.role === 'recruiter' ? recruiterLinks
              : adminLinks;

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white px-4 py-6 shadow-sm">
      <div className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-smooth ${
                isActive(link.path)
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-50/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive(link.path) ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
