import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FileText, FileUp, Sparkles, Plus, Trash2, Save, User } from 'lucide-react';

const CandidateProfile = () => {
  const { profile, updateCandidateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setSkills(profile.skills || []);
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
    }
  }, [profile]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setParsing(true);
    try {
      const res = await api.post('/candidates/resume', formData);
      if (res.success) {
        alert('Resume uploaded and fields auto-filled successfully! Check below.');
        // Refresh local inputs
        setName(res.profile.name || '');
        setPhone(res.profile.phone || '');
        setSkills(res.profile.skills || []);
        setEducation(res.profile.education || []);
        setExperience(res.profile.experience || []);
      }
    } catch (err) {
      alert(err.message || 'Error uploading resume');
    } finally {
      setParsing(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCandidateProfile({
        name,
        phone,
        skills,
        education,
        experience
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Education rows helpers
  const handleAddEducation = () => {
    setEducation([...education, { school: '', degree: '', fieldOfStudy: '', current: false }]);
  };

  const handleEditEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  // Experience rows helpers
  const handleAddExperience = () => {
    setExperience([...experience, { company: '', position: '', description: '', current: false }]);
  };

  const handleEditExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage resume and personal credentials</p>
      </div>

      {/* Resume Parsing Card */}
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                <span>Resume Upload & Auto-fill</span>
                <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                Upload your PDF resume. Our AI utility parses key details, skills, education, and experiences to auto-complete your profile card below!
              </p>
              {profile?.resumeFileName && (
                <div className="mt-2 text-xs font-semibold text-slate-700">
                  Current resume: <a href={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="text-emerald-600 underline">{profile.resumeFileName}</a>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={parsing}
            />
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-smooth"
            >
              <FileUp className="h-4 w-4" />
              <span>{parsing ? 'Parsing PDF text...' : 'Upload PDF Resume'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Editor Form */}
      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
        {/* Personal Details */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-400" />
            <span>Personal Details</span>
          </h3>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
              />
            </div>
          </div>
        </div>

        {/* Skills Tag Area */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 border-b border-slate-50 pb-3">Professional Skills</h3>
          
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill tag (e.g. React)..."
              className="flex-1 rounded-xl border border-slate-200 py-2 px-4 text-sm outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddSkill}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Add Tag
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="rounded-full bg-emerald-100 p-0.5 hover:bg-emerald-200 text-emerald-800"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-md font-bold text-slate-800">Work Experience</h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Work</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 relative flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(idx)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                    <input
                      type="text"
                      required
                      value={exp.company}
                      onChange={(e) => handleEditExperience(idx, 'company', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs outline-none bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Position</label>
                    <input
                      type="text"
                      required
                      value={exp.position}
                      onChange={(e) => handleEditExperience(idx, 'position', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs outline-none bg-white focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Details</label>
                  <textarea
                    rows={2}
                    value={exp.description || ''}
                    onChange={(e) => handleEditExperience(idx, 'description', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs outline-none bg-white focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education History */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-md font-bold text-slate-800">Education Details</h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Degree</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {education.map((edu, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 relative flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">School/University</label>
                    <input
                      type="text"
                      required
                      value={edu.school}
                      onChange={(e) => handleEditEducation(idx, 'school', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs outline-none bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Degree</label>
                    <input
                      type="text"
                      required
                      value={edu.degree}
                      onChange={(e) => handleEditEducation(idx, 'degree', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs outline-none bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy || ''}
                      onChange={(e) => handleEditEducation(idx, 'fieldOfStudy', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs outline-none bg-white focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-smooth"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving changes...' : 'Save Profile Card'}</span>
        </button>
      </form>
    </div>
  );
};

export default CandidateProfile;
