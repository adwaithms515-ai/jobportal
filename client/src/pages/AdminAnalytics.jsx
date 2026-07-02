import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, Briefcase, FileText, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.success) {
          setStats(res.analytics);
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  const { summary, categoryDistribution, applicationsTimeline } = stats || {};

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Platform Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time indicators of users growth, applications metrics, and jobs posting activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{summary?.totalUsers}</h4>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Users</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{summary?.totalCandidates}</h4>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Candidates</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="rounded-2xl bg-purple-50 p-4 text-purple-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{summary?.totalJobs}</h4>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Jobs Posted</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="rounded-2xl bg-amber-50 p-4 text-amber-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{summary?.totalApplications}</h4>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Applications</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Applications Timeline LineChart */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider block mb-6">Applications Growth (Timeline)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={applicationsTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution BarChart */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider block mb-6">Job Postings by Category</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobsCount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie distribution */}
        {categoryDistribution?.length > 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider block mb-6 flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-slate-400" />
              <span>Jobs Mix Share</span>
            </h3>
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="jobsCount"
                    nameKey="category"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
