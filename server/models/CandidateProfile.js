const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  from: { type: Date },
  to: { type: Date },
  current: { type: Boolean, default: false }
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String },
  from: { type: Date },
  to: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const candidateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  skills: [String],
  education: [educationSchema],
  experience: [experienceSchema],
  profilePhoto: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  resumeFileName: {
    type: String,
    default: ''
  },
  parsedResumeText: {
    type: String,
    default: ''
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }]
}, { timestamps: true });

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
