import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building, ShieldAlert } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [err, setErr] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (password !== confirmPassword) {
      setErr('Passwords do not match');
      return;
    }

    if (role === 'candidate' && !name) {
      setErr('Please fill in your name');
      return;
    }

    if (role === 'recruiter' && !companyName) {
      setErr('Please fill in your company name');
      return;
    }

    try {
      const extraFields = role === 'candidate' ? { name } : { companyName };
      const user = await register(email, password, role, extraFields);
      if (user.role === 'candidate') navigate('/candidate');
      else if (user.role === 'recruiter') navigate('/recruiter');
      else if (user.role === 'admin') navigate('/admin');
    } catch (error) {
      setErr(error.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-100/50">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500">Recruit or apply on the leading portal</p>
        </div>

        {err && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition-smooth ${
                role === 'candidate'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition-smooth ${
                role === 'recruiter'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recruiter
            </button>
          </div>

          {role === 'candidate' ? (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-smooth focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="TechCorp Solutions"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-smooth focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>
          )}

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
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Password</label>
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
