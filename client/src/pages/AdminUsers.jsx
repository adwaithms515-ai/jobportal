import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Search, ShieldAlert, Trash2, Ban, ShieldCheck } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (roleFilter) params.append('role', roleFilter);
      
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      if (res.success) {
        alert(res.message);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('WARNING: Deleting this user account will purge all their profile information and applications. Are you sure?')) {
      try {
        const res = await api.delete(`/admin/users/${userId}`);
        if (res.success) {
          alert('User account purged.');
          fetchUsers();
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">User Moderation</h1>
        <p className="text-sm text-slate-500 mt-1">Suspend, reactivate, or delete Candidate and Recruiter profiles</p>
      </div>

      {/* Toolbar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 bg-white p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email addresses..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-xs outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-650 outline-none"
        >
          <option value="">All Roles</option>
          <option value="candidate">Candidates</option>
          <option value="recruiter">Recruiters</option>
        </select>
        <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white">
          Search
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
          No registered user files match filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((u) => (
            <div key={u._id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {u.role === 'candidate' ? u.profile?.name : u.profile?.companyName}
                    </h3>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                    {u.role}
                  </span>
                </div>

                <div className="mt-3 flex gap-2 text-[10px] text-slate-400">
                  <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className={u.isSuspended ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {u.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-50 pt-4">
                <button
                  onClick={() => handleToggleSuspend(u._id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-smooth ${
                    u.isSuspended
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-rose-100 bg-rose-50/50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  {u.isSuspended ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  <span>{u.isSuspended ? 'Activate' : 'Suspend'}</span>
                </button>

                <button
                  onClick={() => handleDeleteUser(u._id)}
                  className="rounded-xl border border-rose-150 p-2 text-rose-500 hover:bg-rose-50 transition-smooth"
                  title="Purge User Account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
