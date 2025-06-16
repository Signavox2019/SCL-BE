const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');

// Enroll in a course
router.post('/', enrollmentController.enrollInCourse);

// Get enrollments
router.get('/', enrollmentController.getAllEnrollments);
router.get('/user/:userId', enrollmentController.getEnrollmentsByUser);

// Stats
router.get('/stats/metrics', enrollmentController.enrollmentStats);

module.exports = router;
