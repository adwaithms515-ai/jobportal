const express = require('express');
const router = express.Router();
const {
  getCompanyProfile,
  updateCompanyProfile,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  getApplicants,
  updateApplicantStatus,
  scheduleInterview
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorize('recruiter'));

router.get('/company', getCompanyProfile);
router.put('/company', upload.single('logo'), updateCompanyProfile);

router.get('/jobs', getRecruiterJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

router.get('/applicants', getApplicants);
router.put('/applications/:applicationId/status', updateApplicantStatus);
router.post('/interviews', scheduleInterview);

module.exports = router;
