const StudentProgress = require('../models/StudentProgress');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;

    const progress = await StudentProgress.find({ user: userId })
      .populate('course currentModule currentLesson currentSubtopic');

    const certificates = await Certificate.find({ user: userId }).populate('course');
    const events = await Event.find({ registeredUsers: userId });

    res.status(200).json({
      message: 'Dashboard data fetched',
      enrolledCourses: progress,
      certificates,
      registeredEvents: events
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data', error });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { userId, courseId, moduleId, lessonId, subtopicId } = req.body;

    let progress = await StudentProgress.findOne({ user: userId, course: courseId });

    if (!progress) {
      progress = new StudentProgress({ user: userId, course: courseId });
    }

    if (moduleId && !progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
      progress.currentModule = moduleId;
    }

    if (lessonId && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.currentLesson = lessonId;
    }

    if (subtopicId && !progress.completedSubtopics.includes(subtopicId)) {
      progress.completedSubtopics.push(subtopicId);
      progress.currentSubtopic = subtopicId;
    }

    const totalSubtopics = 100; // Replace with actual count logic
    const completed = progress.completedSubtopics.length;
    progress.progressPercentage = Math.floor((completed / totalSubtopics) * 100);

    await progress.save();
    res.status(200).json({ message: 'Progress updated', progress });
  } catch (error) {
    res.status(500).json({ message: 'Progress update failed', error });
  }
};

exports.getProgressStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    const progress = await StudentProgress.find({ user: userId });
    const totalCourses = progress.length;
    const completedCourses = progress.filter(p => p.progressPercentage === 100).length;
    const averageProgress = progress.reduce((acc, p) => acc + p.progressPercentage, 0) / (totalCourses || 1);

    res.status(200).json({
      totalCourses,
      completedCourses,
      averageProgress: Math.floor(averageProgress)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err });
  }
};
