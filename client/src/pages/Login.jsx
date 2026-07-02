import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!email || !password) {
      setErr('Please fill in all fields');
      return;
    }

    try {
      const user = await login(email, password);
      if (user.role === 'candidate') navigate('/candidate');
      else if (user.role === 'recruiter') navigate('/recruiter');
      else if (user.role === 'admin') navigate('/admin');
    } catch (error) {
      setErr(error.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-100/50">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500">Log in to manage your recruitment journey</p>
        </div>

        {err && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{err}</span>
          </div>
        )}

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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                Forgot password?
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition-smooth hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
