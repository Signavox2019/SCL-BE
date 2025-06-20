const StudentProgress = require('../models/StudentProgress');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

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



// exports.updateProgress = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { courseId, moduleId, lessonId, subtopicId } = req.body;

//     let progress = await StudentProgress.findOne({ user: userId, course: courseId });

//     if (!progress) {
//       progress = new StudentProgress({ user: userId, course: courseId });
//     }

//     // Push only if not already added
//     if (moduleId && !progress.completedModules.includes(moduleId)) {
//       progress.completedModules.push(moduleId);
//       progress.currentModule = moduleId;
//     }

//     if (lessonId && !progress.completedLessons.includes(lessonId)) {
//       progress.completedLessons.push(lessonId);
//       progress.currentLesson = lessonId;
//     }

//     if (subtopicId && !progress.completedSubtopics.includes(subtopicId)) {
//       progress.completedSubtopics.push(subtopicId);
//       progress.currentSubtopic = subtopicId;
//     }

//     // For now assuming 100 subtopics
//     const totalSubtopics = 100;
//     const completed = progress.completedSubtopics.length;
//     progress.progressPercentage = Math.floor((completed / totalSubtopics) * 100);

//     await progress.save();

//     // Populate response with references
//     const populatedProgress = await StudentProgress.findById(progress._id)
//       .populate('user', 'name email')
//       .populate('course', 'title')
//       .populate('currentModule', 'moduleTitle')
//       .populate('currentLesson', 'lessonTitle')
//       .populate('currentSubtopic', 'title');

//     res.status(200).json({ message: 'Progress updated', progress: populatedProgress });

//   } catch (error) {
//     console.error('Progress update error →', error); // ✅ Better error log
//     res.status(500).json({
//       message: 'Progress update failed',
//       error: error?.message || error.toString() || 'Unknown error'
//     });
//   }
// };



exports.getProgressStats = async (req, res) => {
  try {
    const userId = req.user._id;

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

