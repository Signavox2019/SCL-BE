const express = require('express');
const router = express.Router();
const controller = require('../controllers/analytics.controller');

router.get('/users', controller.getUserStats);
router.get('/course-enrollments', controller.getCourseEnrollments);
router.get('/course-completions', controller.getCourseCompletionRates);
router.get('/quiz-performance', controller.getQuizScores);
router.get('/event-participation', controller.getEventParticipation);
router.get('/registrations-daily', controller.getDailyRegistrations);

module.exports = router;
