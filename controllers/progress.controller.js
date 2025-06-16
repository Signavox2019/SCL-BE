const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');

// Create or update progress
exports.updateProgress = async (req, res) => {
  try {
    const { user, course, enrollment, moduleId, lessonId, topic, quizScore, feedback } = req.body;

    let progress = await Progress.findOne({ user, course });

    if (!progress) {
      progress = await Progress.create({
        user, course, enrollment,
        completedModules: [{
          moduleId,
          completedLessons: [{
            lessonId,
            completedTopics: [topic],
            quizScore,
            feedback
          }]
        }]
      });
    } else {
      // Add or update topic
      const module = progress.completedModules.find(mod => mod.moduleId.toString() === moduleId);
      if (module) {
        const lesson = module.completedLessons.find(les => les.lessonId === lessonId);
        if (lesson) {
          if (!lesson.completedTopics.includes(topic)) lesson.completedTopics.push(topic);
          lesson.quizScore = quizScore || lesson.quizScore;
          lesson.feedback = feedback || lesson.feedback;
        } else {
          module.completedLessons.push({ lessonId, completedTopics: [topic], quizScore, feedback });
        }
      } else {
        progress.completedModules.push({
          moduleId,
          completedLessons: [{ lessonId, completedTopics: [topic], quizScore, feedback }]
        });
      }

      await progress.save();
    }

    res.status(200).json({ message: 'Progress updated', progress });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update progress', error: err });
  }
};

// Mark course as completed & generate certificate
exports.completeCourse = async (req, res) => {
  try {
    const { userId, courseId, certificateUrl } = req.body;

    const progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    progress.isCompleted = true;
    progress.completedAt = new Date();
    progress.certificateUrl = certificateUrl;
    await progress.save();

    res.status(200).json({ message: "Course marked as completed", progress });
  } catch (error) {
    res.status(500).json({ message: "Error completing course", error });
  }
};

// Get progress
exports.getUserProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const progress = await Progress.findOne({ user: userId, course: courseId })
      .populate('course', 'title')
      .populate('completedModules.moduleId')
      .populate('user', 'name email');
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Error getting progress", error });
  }
};

// Progress stats
exports.progressStats = async (req, res) => {
  try {
    const totalCompletions = await Progress.countDocuments({ isCompleted: true });
    const totalInProgress = await Progress.countDocuments({ isCompleted: false });
    res.status(200).json({
      completed: totalCompletions,
      inProgress: totalInProgress
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};
