const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

router.post('/create', quizController.createQuiz);
router.get('/', quizController.getAllQuizzes);
router.get('/stats', quizController.quizStats);
router.get('/:id', quizController.getQuizById);
router.post('/submit', quizController.submitAttempt);
router.get('/attempts/:userId', quizController.getUserAttempts);

module.exports = router;
