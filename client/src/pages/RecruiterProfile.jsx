import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, Save, FileUp } from 'lucide-react';

const RecruiterProfile = () => {
  const { profile, updateRecruiterProfile } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName || '');
      setDescription(profile.description || '');
      setIndustry(profile.industry || '');
      setWebsite(profile.website || '');
      setLocation(profile.location || '');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('description', description);
    formData.append('industry', industry);
    formData.append('website', website);
    formData.append('location', location);
    if (logo) {
      formData.append('logo', logo);
    }

    try {
      await updateRecruiterProfile(formData);
      alert('Company profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Company Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage public recruitment details and branding</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 overflow-hidden">
            {profile?.logo ? (
              <img src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}${profile.logo}`} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Building className="h-10 w-10" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Company Logo</h4>
            <p className="text-xs text-slate-400 mt-0.5">Upload a PNG or JPG file (max 10MB)</p>
            <div className="relative mt-2 block">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files[0])}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-smooth"
              >
                <FileUp className="h-3.5 w-3.5" />
                <span>{logo ? logo.name : 'Upload File'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Company Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Industry Sector</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. IT & Software"
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Website URL</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Office Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Company Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-smooth disabled:opacity-50"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{saving ? 'Saving changes...' : 'Save Company Details'}</span>
        </button>
      </form>
    </div>
  );
};

export default RecruiterProfile;
