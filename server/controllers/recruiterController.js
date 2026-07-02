const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { indexJob, deleteJobFromIndex } = require('../config/elasticsearch');
const { sendRealtimeNotification } = require('../config/socket');
const { sendStatusUpdateEmail, sendInterviewEmail } = require('../utils/email');

// Get company profile
exports.getCompanyProfile = async (req, res, next) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Update company profile
exports.updateCompanyProfile = async (req, res, next) => {
  const { companyName, description, industry, website, location } = req.body;

  try {
    let profile = await RecruiterProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    profile.companyName = companyName || profile.companyName;
    profile.description = description !== undefined ? description : profile.description;
    profile.industry = industry !== undefined ? industry : profile.industry;
    profile.website = website !== undefined ? website : profile.website;
    profile.location = location !== undefined ? location : profile.location;

    // Handle logo file upload if present
    if (req.file) {
      profile.logo = `/uploads/logos/${req.file.filename}`;
    }

    await profile.save();
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Create a Job
exports.createJob = async (req, res, next) => {
  const { title, description, requirements, salaryRange, jobType, location, category, deadline } = req.body;

  try {
    const recruiterProfile = await RecruiterProfile.findOne({ userId: req.user.id });
    if (!recruiterProfile) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    const job = await Job.create({
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split(',').map(r => r.trim()) : []),
      salaryRange,
      jobType,
      location,
      category,
      deadline,
      postedBy: req.user.id,
      recruiterProfileId: recruiterProfile._id,
      status: 'pending' // Admin must moderate and approve before indexing/listing
    });

    await AuditLog.create({
      actorId: req.user.id,
      action: 'job_created',
      details: `Recruiter created job "${title}". Pending admin approval.`,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Update a Job
exports.updateJob = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, requirements, salaryRange, jobType, location, category, deadline } = req.body;

  try {
    let job = await Job.findOne({ _id: id, postedBy: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.requirements = Array.isArray(requirements) ? requirements : (requirements ? requirements.split(',').map(r => r.trim()) : job.requirements);
    job.salaryRange = salaryRange || job.salaryRange;
    job.jobType = jobType || job.jobType;
    job.location = location || job.location;
    job.category = category || job.category;
    job.deadline = deadline || job.deadline;

    await job.save();

    // If job was already approved, re-index to Elasticsearch
    if (job.status === 'approved') {
      const recruiterProfile = await RecruiterProfile.findOne({ userId: req.user.id });
      await indexJob(job, recruiterProfile?.companyName);
    }

    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Delete a Job
exports.deleteJob = async (req, res, next) => {
  const { id } = req.params;

  try {
    const job = await Job.findOneAndDelete({ _id: id, postedBy: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    // Delete applications related to job
    await Application.deleteMany({ jobId: id });
    // Remove from index
    await deleteJobFromIndex(id);

    await AuditLog.create({
      actorId: req.user.id,
      action: 'job_deleted',
      details: `Recruiter deleted job "${job.title}" (ID: ${id})`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Job Postings for Recruiter
exports.getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};

// View Applicants
exports.getApplicants = async (req, res, next) => {
  const { jobId } = req.query;

  try {
    const filter = {};
    if (jobId) {
      // Direct validation
      const job = await Job.findOne({ _id: jobId, postedBy: req.user.id });
      if (!job) {
        return res.status(403).json({ message: 'Unauthorized job lookup' });
      }
      filter.jobId = jobId;
    } else {
      // Find all jobs created by this recruiter
      const recruiterJobs = await Job.find({ postedBy: req.user.id });
      const jobIds = recruiterJobs.map(job => job._id);
      filter.jobId = { $in: jobIds };
    }

    const applications = await Application.find(filter)
      .populate('jobId')
      .populate('candidateProfileId')
      .populate('candidateId', 'email')
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

// Update Applicant Status
exports.updateApplicantStatus = async (req, res, next) => {
  const { applicationId } = req.params;
  const { status, note } = req.body;

  try {
    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('candidateProfileId')
      .populate('candidateId', 'email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify recruiter owns the job
    if (application.jobId.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized operation' });
    }

    const oldStatus = application.status;
    application.status = status;
    application.statusHistory.push({
      status,
      note: note || '',
      updatedBy: req.user.id
    });

    await application.save();

    // Trigger Notification
    const recruiterProfile = await RecruiterProfile.findOne({ userId: req.user.id });
    const companyName = recruiterProfile?.companyName || 'Company';

    const notif = await Notification.create({
      userId: application.candidateId._id,
      senderId: req.user.id,
      title: 'Application Status Update',
      message: `Your application for ${application.jobId.title} at ${companyName} has been updated to: ${status}`,
      type: 'application_status'
    });

    // Real-time socket event
    sendRealtimeNotification(application.candidateId._id, notif);

    // Email alert
    await sendStatusUpdateEmail(
      application.candidateId.email,
      application.candidateProfileId.name,
      application.jobId.title,
      companyName,
      status
    );

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// Schedule Interview
exports.scheduleInterview = async (req, res, next) => {
  const { applicationId, date, time, mode, locationOrLink } = req.body;

  try {
    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('candidateProfileId')
      .populate('candidateId', 'email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.jobId.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized operation' });
    }

    // Create Interview record
    const interview = await Interview.create({
      jobId: application.jobId._id,
      recruiterId: req.user.id,
      candidateId: application.candidateId._id,
      applicationId: application._id,
      date,
      time,
      mode,
      meetingLink: locationOrLink
    });

    // Update status to 'Interview Scheduled'
    application.status = 'Interview Scheduled';
    application.statusHistory.push({
      status: 'Interview Scheduled',
      note: `Interview scheduled on ${new Date(date).toLocaleDateString()} at ${time} (${mode})`,
      updatedBy: req.user.id
    });
    await application.save();

    // Trigger notification
    const recruiterProfile = await RecruiterProfile.findOne({ userId: req.user.id });
    const companyName = recruiterProfile?.companyName || 'Company';

    const notif = await Notification.create({
      userId: application.candidateId._id,
      senderId: req.user.id,
      title: 'Interview Scheduled',
      message: `An interview has been scheduled for ${application.jobId.title} at ${companyName} on ${new Date(date).toLocaleDateString()} at ${time}`,
      type: 'interview_scheduled'
    });

    sendRealtimeNotification(application.candidateId._id, notif);

    // Email notification
    await sendInterviewEmail(
      application.candidateId.email,
      application.candidateProfileId.name,
      application.jobId.title,
      companyName,
      { date, time, mode, locationOrLink }
    );

    res.status(201).json({ success: true, interview, application });
  } catch (error) {
    next(error);
  }
};
