const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const { indexJob, deleteJobFromIndex } = require('../config/elasticsearch');

// Get all users
exports.getUsers = async (req, res, next) => {
  const { role, query } = req.query;

  try {
    const filter = { role: { $ne: 'admin' } };
    if (role) {
      filter.role = role;
    }

    if (query) {
      filter.email = new RegExp(query, 'i');
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    // Populate profile details
    const populatedUsers = await Promise.all(users.map(async (u) => {
      let profile = null;
      if (u.role === 'candidate') {
        profile = await CandidateProfile.findOne({ userId: u._id });
      } else if (u.role === 'recruiter') {
        profile = await RecruiterProfile.findOne({ userId: u._id });
      }
      return {
        _id: u._id,
        email: u.email,
        role: u.role,
        isSuspended: u.isSuspended,
        createdAt: u.createdAt,
        profile
      };
    }));

    res.json({ success: true, users: populatedUsers });
  } catch (error) {
    next(error);
  }
};

// Toggle user suspension
exports.toggleSuspendUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend admin account' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    await AuditLog.create({
      actorId: req.user.id,
      action: user.isSuspended ? 'user_suspended' : 'user_activated',
      details: `${user.isSuspended ? 'Suspended' : 'Activated'} user account: ${user.email}`,
      ipAddress: req.ip
    });

    res.json({ success: true, isSuspended: user.isSuspended, message: `User account has been ${user.isSuspended ? 'suspended' : 'activated'}` });
  } catch (error) {
    next(error);
  }
};

// Delete user account
exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin account' });
    }

    // Delete profile and related data
    if (user.role === 'candidate') {
      await CandidateProfile.deleteOne({ userId: id });
      await Application.deleteMany({ candidateId: id });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.deleteOne({ userId: id });
      const recruiterJobs = await Job.find({ postedBy: id });
      const jobIds = recruiterJobs.map(j => j._id);
      await Job.deleteMany({ postedBy: id });
      await Application.deleteMany({ jobId: { $in: jobIds } });
      for (const jId of jobIds) {
        await deleteJobFromIndex(jId);
      }
    }

    await User.deleteOne({ _id: id });

    await AuditLog.create({
      actorId: req.user.id,
      action: 'user_deleted',
      details: `Deleted user account: ${user.email} (Role: ${user.role})`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'User account and associated data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get pending moderation jobs
exports.getPendingJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'pending' })
      .populate('recruiterProfileId')
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};

// Moderate Job Posting
exports.moderateJob = async (req, res, next) => {
  const { id } = req.params;
  const { status, reason } = req.body; // status: approved, rejected

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.status = status;
    job.rejectionReason = status === 'rejected' ? (reason || 'Inappropriate posting') : '';
    await job.save();

    const recruiterProfile = await RecruiterProfile.findById(job.recruiterProfileId);

    // Index if approved, delete from index if rejected
    if (status === 'approved') {
      await indexJob(job, recruiterProfile?.companyName);
    } else {
      await deleteJobFromIndex(id);
    }

    await AuditLog.create({
      actorId: req.user.id,
      action: `job_${status}`,
      details: `Job "${job.title}" has been ${status}. Reason: ${reason || 'N/A'}`,
      ipAddress: req.ip
    });

    res.json({ success: true, job, message: `Job has been ${status}` });
  } catch (error) {
    next(error);
  }
};

// Get Analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Category distribution
    const categoryStats = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Group applications over time (last 6 months)
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      analytics: {
        summary: {
          totalUsers,
          totalCandidates,
          totalRecruiters,
          totalJobs,
          totalApplications
        },
        categoryDistribution: categoryStats.map(stat => ({
          category: stat._id,
          jobsCount: stat.count
        })),
        applicationsTimeline: applicationStats.map(stat => ({
          month: `${stat._id.month}/${stat._id.year}`,
          applications: stat.count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Audit Logs
exports.getAuditLogs = async (req, res, next) => {
  const { action, query } = req.query;

  try {
    const filter = {};
    if (action) {
      filter.action = action;
    }
    if (query) {
      filter.details = new RegExp(query, 'i');
    }

    const logs = await AuditLog.find(filter)
      .populate('actorId', 'email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

// Maintenance Configuration
let maintenanceMode = false;
let systemAnnouncement = 'Welcome to the MERN Job Portal!';

exports.getMaintenanceSettings = async (req, res, next) => {
  try {
    // Check DB status
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({
      success: true,
      settings: {
        maintenanceMode,
        systemAnnouncement,
        dbStatus,
        serverUptime: process.uptime()
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMaintenanceSettings = async (req, res, next) => {
  const { toggleMaintenance, announcement } = req.body;

  try {
    if (toggleMaintenance !== undefined) {
      maintenanceMode = toggleMaintenance;
    }
    if (announcement !== undefined) {
      systemAnnouncement = announcement;
    }

    await AuditLog.create({
      actorId: req.user.id,
      action: 'maintenance_update',
      details: `Updated maintenance system settings. Maintenance Mode: ${maintenanceMode}`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings: {
        maintenanceMode,
        systemAnnouncement
      }
    });
  } catch (error) {
    next(error);
  }
};

// Expose checks globally
exports.isMaintenanceMode = () => maintenanceMode;
exports.getAnnouncement = () => systemAnnouncement;
