const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const fs = require('fs');
const { parseResumePDF } = require('../utils/pdfParser');

// Get candidate profile
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id }).populate('savedJobs');
    if (!profile) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Update candidate profile
exports.updateProfile = async (req, res, next) => {
  const { name, phone, skills, education, experience } = req.body;

  try {
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    profile.name = name || profile.name;
    profile.phone = phone !== undefined ? phone : profile.phone;
    profile.skills = skills !== undefined ? skills : profile.skills;
    profile.education = education !== undefined ? education : profile.education;
    profile.experience = experience !== undefined ? experience : profile.experience;

    // Handle photo upload if present
    if (req.file && (req.file.fieldname === 'photo' || req.file.fieldname === 'logo')) {
      profile.profilePhoto = `/uploads/logos/${req.file.filename}`;
    }

    await profile.save();
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Upload and Parse Resume
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume file' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Parse the PDF
    const parsedData = await parseResumePDF(fileBuffer);

    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    // Auto fill fields
    profile.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    profile.resumeFileName = req.file.originalname;
    profile.parsedResumeText = parsedData.rawText;
    
    if (parsedData.name) profile.name = parsedData.name;
    if (parsedData.phone) profile.phone = parsedData.phone;
    if (parsedData.skills && parsedData.skills.length > 0) {
      // Merge unique skills
      const mergedSkills = new Set([...profile.skills, ...parsedData.skills]);
      profile.skills = Array.from(mergedSkills);
    }
    
    if (parsedData.education && parsedData.education.length > 0) {
      profile.education = parsedData.education;
    }
    
    if (parsedData.experience && parsedData.experience.length > 0) {
      profile.experience = parsedData.experience;
    }

    await profile.save();
    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Save a Job
exports.saveJob = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    if (profile.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: 'Job is already saved' });
    }

    profile.savedJobs.push(jobId);
    await profile.save();

    res.json({ success: true, message: 'Job saved successfully', savedJobs: profile.savedJobs });
  } catch (error) {
    next(error);
  }
};

// Unsave a Job
exports.unsaveJob = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    profile.savedJobs = profile.savedJobs.filter(id => id.toString() !== jobId);
    await profile.save();

    res.json({ success: true, message: 'Job unsaved successfully', savedJobs: profile.savedJobs });
  } catch (error) {
    next(error);
  }
};

// Get Saved Jobs
exports.getSavedJobs = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id }).populate({
      path: 'savedJobs',
      populate: { path: 'recruiterProfileId' }
    });
    
    if (!profile) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    res.json({ success: true, savedJobs: profile.savedJobs });
  } catch (error) {
    next(error);
  }
};

// Track Applications
exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user.id })
      .populate({
        path: 'jobId',
        populate: { path: 'recruiterProfileId' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};
