const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleSuspendUser,
  deleteUser,
  getPendingJobs,
  moderateJob,
  getAnalytics,
  getAuditLogs,
  getMaintenanceSettings,
  updateMaintenanceSettings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/suspend', toggleSuspendUser);
router.delete('/users/:id', deleteUser);

router.get('/jobs/pending', getPendingJobs);
router.put('/jobs/:id/moderate', moderateJob);

router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

router.get('/settings', getMaintenanceSettings);
router.put('/settings', updateMaintenanceSettings);

module.exports = router;
