import React, { useState } from 'react';
import api from '../utils/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ShieldAlert } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErr('');

    if (password !== confirmPassword) {
      setErr('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      if (res.success) {
        setSuccess('Password updated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setErr(error.message || 'Reset link expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-100/50">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-500">Provide a new password for your account</p>
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
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-smooth focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-smooth focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition-smooth hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Back to{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
