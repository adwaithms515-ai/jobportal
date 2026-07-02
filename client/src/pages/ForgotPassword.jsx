import React, { useState } from 'react';
import api from '../utils/api';
import { Mail, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setErr('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        setSuccess('Reset link emailed! Check your spam folder if not received.');
      }
    } catch (error) {
      setErr(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-100/50">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Forgot Password</h2>
          <p className="mt-2 text-sm text-slate-500">We'll email a recovery link to restore access</p>
        </div>

        {success && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-600">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {err && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{err}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-smooth focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition-smooth hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Sending request...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Remember credentials?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
