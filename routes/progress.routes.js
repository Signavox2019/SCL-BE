const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const verifyToken = require('../middleware/verifyToken')
// const authenticate = require('../middleware/auth.middleware'); // ✅ ADD THIS LINE
// const isAdmin = require('../middleware/isAdmin'); // ✅ Admin check middleware
const { protect, allowRoles } = require('../middleware/auth.middleware');

// Track progress
router.post('/update', progressController.updateProgress);

// Mark completion
router.post('/complete', progressController.completeCourse);

// Bulk completion
router.post('/complete/bulk', protect, allowRoles('admin'), progressController.completeCoursesBulk);


// Admin-only route to get all user progress
router.get('/admin/all', protect, allowRoles('admin'), progressController.getAllUserProgress);


// GET /api/progress/:courseId
router.get('/:courseId', verifyToken, progressController.getUserProgress);

// Stats
router.get('/stats/metrics', progressController.progressStats);

module.exports = router;
