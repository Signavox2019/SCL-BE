const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');

// Track progress
router.post('/update', progressController.updateProgress);

// Mark completion
router.post('/complete', progressController.completeCourse);

// Get user progress
router.get('/:userId/:courseId', progressController.getUserProgress);

// Stats
router.get('/stats/metrics', progressController.progressStats);

module.exports = router;
