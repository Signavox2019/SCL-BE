const Professor = require('../models/Professor');
const Course = require('../models/Course');

// Create professor
exports.createProfessor = async (req, res) => {
  try {
    const professor = await Professor.create(req.body);
    res.status(201).json({ message: "Professor added", professor });
  } catch (error) {
    res.status(500).json({ message: "Error creating professor", error });
  }
};

// Get all professors
exports.getAllProfessors = async (req, res) => {
  try {
    const professors = await Professor.find().populate('courses', 'title');
    res.status(200).json(professors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching professors", error });
  }
};

// Get single professor
exports.getProfessor = async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id).populate('courses', 'title');
    if (!professor) return res.status(404).json({ message: "Professor not found" });
    res.status(200).json(professor);
  } catch (error) {
    res.status(500).json({ message: "Error getting professor", error });
  }
};

// Update professor
exports.updateProfessor = async (req, res) => {
  try {
    const updated = await Professor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Professor not found" });
    res.status(200).json({ message: "Professor updated", professor: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating professor", error });
  }
};

// Delete professor
exports.deleteProfessor = async (req, res) => {
  try {
    const deleted = await Professor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Professor not found" });
    res.status(200).json({ message: "Professor deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting professor", error });
  }
};

// Link course to professor
exports.assignCourseToProfessor = async (req, res) => {
  try {
    const { professorId, courseId } = req.body;

    const professor = await Professor.findById(professorId);
    const course = await Course.findById(courseId);

    if (!professor || !course) {
      return res.status(404).json({ message: "Professor or Course not found" });
    }

    if (!professor.courses.includes(courseId)) {
      professor.courses.push(courseId);
      await professor.save();
    }

    course.professor = professorId;
    await course.save();

    res.status(200).json({ message: "Course assigned to professor", professor, course });
  } catch (error) {
    res.status(500).json({ message: "Error assigning course", error });
  }
};

// Professor stats
exports.professorStats = async (req, res) => {
  try {
    const totalProfessors = await Professor.countDocuments();
    const withCourses = await Professor.find({ courses: { $exists: true, $not: { $size: 0 } } });
    res.status(200).json({
      totalProfessors,
      activeProfessors: withCourses.length
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};
