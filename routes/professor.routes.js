const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professor.controller');

// CRUD
router.post('/', professorController.createProfessor);
router.get('/', professorController.getAllProfessors);
router.get('/:id', professorController.getProfessor);
router.put('/:id', professorController.updateProfessor);
router.delete('/:id', professorController.deleteProfessor);

// Assign course
router.post('/assign-course', professorController.assignCourseToProfessor);

// Add this to your professorRoutes.js or courseRoutes.js
router.post('/unassign-course', professorController.unassignCourseFromProfessor);


// Stats
router.get('/stats/metrics', professorController.professorStats);

module.exports = router;
