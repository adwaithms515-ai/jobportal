import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Candidate Pages
import CandidateJobs from './pages/CandidateJobs';
import CandidateApplications from './pages/CandidateApplications';
import CandidateSaved from './pages/CandidateSaved';
import CandidateProfile from './pages/CandidateProfile';
import CandidateCalendar from './pages/CandidateCalendar';

// Recruiter Pages
import RecruiterJobs from './pages/RecruiterJobs';
import RecruiterPostJob from './pages/RecruiterPostJob';
import RecruiterApplicants from './pages/RecruiterApplicants';
import RecruiterProfile from './pages/RecruiterProfile';
import RecruiterCalendar from './pages/RecruiterCalendar';

// Admin Pages
import AdminModeration from './pages/AdminModeration';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminSettings from './pages/AdminSettings';

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'candidate' ? '/candidate' : user.role === 'recruiter' ? '/recruiter' : '/admin'} replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'candidate' ? '/candidate' : user.role === 'recruiter' ? '/recruiter' : '/admin'} replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Candidate Protected Routes */}
        <Route path="/candidate" element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <Layout><CandidateJobs /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/candidate/applications" element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <Layout><CandidateApplications /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/candidate/saved" element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <Layout><CandidateSaved /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/candidate/profile" element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <Layout><CandidateProfile /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/candidate/calendar" element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <Layout><CandidateCalendar /></Layout>
          </ProtectedRoute>
        } />

        {/* Recruiter Protected Routes */}
        <Route path="/recruiter" element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <Layout><RecruiterJobs /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/recruiter/post-job" element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <Layout><RecruiterPostJob /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/recruiter/applicants" element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <Layout><RecruiterApplicants /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/recruiter/profile" element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <Layout><RecruiterProfile /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/recruiter/calendar" element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <Layout><RecruiterCalendar /></Layout>
          </ProtectedRoute>
        } />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminModeration /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminUsers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminAnalytics /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminAuditLogs /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminSettings /></Layout>
          </ProtectedRoute>
        } />

        {/* Catch all / fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
