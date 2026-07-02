const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const { searchJobs } = require('../config/elasticsearch');
const { sendRealtimeNotification } = require('../config/socket');

// Get jobs (approved only, paginated)
exports.getJobs = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: 'approved' };
  
  if (req.query.category) {
    filter.category = req.query.category;
  }

  try {
    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('recruiterProfileId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalJobs: total
      },
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// Get single job details
exports.getJobDetails = async (req, res, next) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id).populate('recruiterProfileId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Search jobs (Elasticsearch with Mongo Fallback)
exports.searchAllJobs = async (req, res, next) => {
  const { query, location, category, jobType, salaryMin, salaryMax } = req.query;

  try {
    // Try Elasticsearch search first
    let jobs = await searchJobs({ query, location, category, jobType, salaryMin, salaryMax });

    // Fallback to MongoDB text search if ES client returns null (disabled or down)
    if (jobs === null) {
      console.log('Using MongoDB Text Search Fallback...');
      const filter = { status: 'approved' };

      if (query) {
        filter.$text = { $search: query };
      }
      if (location) {
        filter.location = new RegExp(location, 'i');
      }
      if (category) {
        filter.category = category;
      }
      if (jobType) {
        filter.jobType = jobType;
      }
      if (salaryMin || salaryMax) {
        filter['salaryRange.max'] = {};
        if (salaryMin) filter['salaryRange.max'].$gte = parseInt(salaryMin, 10);
        if (salaryMax) filter['salaryRange.max'].$lte = parseInt(salaryMax, 10);
      }

      jobs = await Job.find(filter).populate('recruiterProfileId').sort({ createdAt: -1 });
    } else {
      // Since ES returns serialized search hits, populate the full Mongoose model docs for UI consistency
      const jobIds = jobs.map(j => j._id);
      jobs = await Job.find({ _id: { $in: jobIds } }).populate('recruiterProfileId');
    }

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
};

// Apply to job
exports.applyToJob = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot apply to unapproved jobs' });
    }

    const candidateProfile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!candidateProfile) {
      return res.status(400).json({ message: 'Please create a candidate profile first' });
    }

    if (!candidateProfile.resumeUrl) {
      return res.status(400).json({ message: 'Please upload a resume to apply' });
    }

    // Check duplicate applications
    const existingApplication = await Application.findOne({ jobId, candidateId: req.user.id });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      candidateProfileId: candidateProfile._id,
      resumeUrl: candidateProfile.resumeUrl,
      status: 'Applied',
      statusHistory: [{
        status: 'Applied',
        note: 'Applied successfully via portal',
        updatedBy: req.user.id
      }]
    });

    // Notify Recruiter
    const notif = await Notification.create({
      userId: job.postedBy,
      senderId: req.user.id,
      title: 'New Job Application',
      message: `${candidateProfile.name} applied for your job opening: ${job.title}`,
      type: 'new_applicant'
    });

    sendRealtimeNotification(job.postedBy, notif);

    res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// Withdraw application
exports.withdrawApplication = async (req, res, next) => {
  const { id } = req.params; // Application ID

  try {
    const application = await Application.findOne({ _id: id, candidateId: req.user.id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    if (application.status !== 'Applied') {
      return res.status(400).json({ message: 'Cannot withdraw application once reviewed' });
    }

    await Application.deleteOne({ _id: id });
    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Interview Calendar (for both candidate and recruiter)
exports.getCalendarInterviews = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'candidate') {
      filter.candidateId = req.user.id;
    } else if (req.user.role === 'recruiter') {
      filter.recruiterId = req.user.id;
    } else {
      return res.status(403).json({ message: 'Unauthorized profile view' });
    }

    const interviews = await Interview.find(filter)
      .populate('jobId')
      .populate('recruiterId', 'email')
      .populate('candidateId', 'email')
      .sort({ date: 1 });

    // Format for calendar libraries if needed
    res.json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};
