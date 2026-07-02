const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getApplications
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorize('candidate'));

router.get('/profile', getProfile);
router.put('/profile', upload.single('photo'), updateProfile);
router.post('/resume', upload.single('resume'), uploadResume);
router.post('/saved/:jobId', saveJob);
router.delete('/saved/:jobId', unsaveJob);
router.get('/saved', getSavedJobs);
router.get('/applications', getApplications);

module.exports = router;
