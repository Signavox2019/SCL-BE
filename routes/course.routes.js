const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

// Course CRUD
router.post('/', courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Enroll user
router.post('/:courseId/enroll', courseController.enrollUser);

// Stats
router.get('/stats/metrics', courseController.courseStats);

module.exports = router;
