const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Create Quiz
exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ message: 'Quiz created', quiz });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create quiz', error: err });
  }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    // const quizzes = await Quiz.find().populate('lesson');
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quizzes', error: err });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    // const quiz = await Quiz.findById(req.params.id).populate('lesson');
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

// Submit Quiz Attempt
exports.submitAttempt = async (req, res) => {
  try {
    const { quizId, userId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    quiz.questions.forEach((q, i) => {
      const correct = q.options.find(opt => opt.isCorrect);
      if (answers[i] && correct && correct.text === answers[i]) {
        score++;
      }
    });

    const passed = score >= Math.floor(quiz.questions.length / 2);

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      user: userId,
      score,
      passed,
    });

    res.status(200).json({
      message: 'Quiz submitted',
      score,
      passed,
      attempt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit quiz', error: err });
  }
};

// Get attempts by user
exports.getUserAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.params.userId }).populate('quiz');
    res.status(200).json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attempts', error: err });
  }
};

// Quiz stats
exports.quizStats = async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await QuizAttempt.countDocuments();
    const passed = await QuizAttempt.countDocuments({ passed: true });

    res.status(200).json({
      totalQuizzes,
      totalAttempts,
      passed,
      failed: totalAttempts - passed,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err });
  }
};
