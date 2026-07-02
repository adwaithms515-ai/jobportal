const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobDetails,
  searchAllJobs,
  applyToJob,
  withdrawApplication,
  getCalendarInterviews
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getJobs);
router.get('/search', searchAllJobs);
router.get('/details/:id', getJobDetails);

// Protected routes
router.get('/calendar', protect, getCalendarInterviews);
router.post('/:jobId/apply', protect, authorize('candidate'), applyToJob);
router.delete('/applications/:id/withdraw', protect, authorize('candidate'), withdrawApplication);

module.exports = router;
