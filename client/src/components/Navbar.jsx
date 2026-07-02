import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, LogOut, CheckCircle, Clock, Calendar, AlertTriangle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getNotifIcon = (type) => {
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
    <nav className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-emerald-800 bg-gradient-to-r from-emerald-950 to-slate-900 px-6 shadow-md text-white">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-white text-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-500 text-slate-950 shadow-md shadow-emerald-400/20 font-extrabold">
            HP
          </div>
          <span className="tracking-wide">HirePulse</span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-100 transition-smooth hover:bg-emerald-800 border border-emerald-800/40"
            >
              <Bell className="h-5.5 w-5.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-emerald-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3 duration-200 text-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-3 pt-1">
                  <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => markAsRead(notif._id)}
                        className={`group flex items-start gap-3 rounded-lg p-2.5 transition-smooth hover:bg-slate-50 cursor-pointer ${
                          !notif.read ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                        <div className="flex-1">
                          <p className={`text-xs text-slate-700 leading-relaxed ${!notif.read ? 'font-medium' : ''}`}>
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif._id);
                          }}
                          className="hidden text-slate-400 hover:text-rose-500 group-hover:block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-100">{user.email}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mt-0.5">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-100 transition-smooth hover:bg-rose-900/60 hover:text-rose-200 border border-emerald-800/40"
              title="Logout"
            >
              <LogOut className="h-5.5 w-5.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2.5 text-base font-semibold text-emerald-250 hover:text-white transition-smooth"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-base font-bold text-slate-950 shadow-md shadow-emerald-400/20 hover:bg-emerald-400 transition-smooth"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
