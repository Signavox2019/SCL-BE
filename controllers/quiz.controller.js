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

// get user quiz score
exports.getMyQuizScore = async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await QuizAttempt.find({ user: userId }).populate({
      path: 'quiz',
      select: 'title totalMarks lesson',
    });

    if (!attempts.length) {
      return res.status(200).json({
        message: 'No quiz attempts found',
        totalScore: 0,
        totalPossibleMarks: 0,
        attempts: [],
      });
    }

    const formattedAttempts = attempts.map(attempt => {
      return {
        quizTitle: attempt.quiz?.title || 'Untitled',
        quizId: attempt.quiz?._id,
        lessonId: attempt.quiz?.lesson,
        score: attempt.score,
        totalMarks: attempt.quiz?.totalMarks || 0,
        passed: attempt.passed,
        attemptedAt: attempt.createdAt,
      };
    });

    const totalScore = formattedAttempts.reduce((acc, curr) => acc + curr.score, 0);
    const totalPossibleMarks = formattedAttempts.reduce((acc, curr) => acc + curr.totalMarks, 0);

    res.status(200).json({
      message: 'Quiz scores retrieved successfully',
      totalScore,
      totalPossibleMarks,
      attempts: formattedAttempts,
    });
  } catch (err) {
    console.error('Error fetching quiz scores:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
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
    let totalMarks = 0;

    quiz.questions.forEach((q, i) => {
      const correctOption = q.options.find(opt => opt.isCorrect);
      const marks = q.marks || 1; // default to 1 if marks not set
      totalMarks += marks;

      if (answers[i] && correctOption && correctOption.text === answers[i]) {
        score += marks;
      }
    });

    const passed = score >= totalMarks / 2;

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      user: userId,
      score,
      passed,
    });

    res.status(200).json({
      message: 'Quiz submitted',
      score,
      totalMarks,
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



// Edit Quiz
exports.updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json({ message: 'Quiz updated', quiz: updatedQuiz });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quiz', error: err });
  }
};

// Delete Quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Quiz not found' });

    // Optionally delete related attempts
    await QuizAttempt.deleteMany({ quiz: req.params.id });

    res.status(200).json({ message: 'Quiz and related attempts deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete quiz', error: err });
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
