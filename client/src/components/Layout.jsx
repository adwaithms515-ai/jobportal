import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useNotifications } from '../context/NotificationContext';
import { X, CheckCircle, Calendar, Clock, AlertTriangle } from 'lucide-react';

const Layout = ({ children }) => {
  const { toastMessage, dismissToast } = useNotifications();

  const getToastIcon = (type) => {
    switch (type) {
      case 'application_status':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'interview_scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'new_applicant':
        return <Clock className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 w-[calc(100vw-256px)] p-8">
          {children}
        </main>
      </div>

      {/* Floating Real-time Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="mt-0.5">{getToastIcon(toastMessage.type)}</div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-slate-800">{toastMessage.title}</h5>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{toastMessage.message}</p>
          </div>
          <button
            onClick={dismissToast}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-smooth"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;
