const Course = require('../models/Course');

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ message: "Course created", course });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('professor', 'name email');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('professor', 'name email');
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course", error });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course updated", course: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
};

exports.enrollUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.enrolledUsers.includes(userId)) {
      course.enrolledUsers.push(userId);
      await course.save();
    }

    res.status(200).json({ message: "User enrolled", course });
  } catch (error) {
    res.status(500).json({ message: "Error enrolling user", error });
  }
};

exports.courseStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const topCourses = await Course.find().sort({ 'enrolledUsers.length': -1 }).limit(5);
    res.status(200).json({
      totalCourses,
      topCourses
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};
