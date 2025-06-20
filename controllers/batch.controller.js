const Batch = require('../models/Batch');

exports.createBatch = async (req, res) => {
  try {
    const { batchName, course, users, professor, startDate, endDate } = req.body;

    const batch = await Batch.create({ batchName, course, users, professor, startDate, endDate });
    res.status(201).json({ message: 'Batch created', batch });
  } catch (error) {
    res.status(500).json({ message: 'Error creating batch', error });
  }
};

exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('course')
      .populate('users', 'name email')
      .populate('professor', 'name email');
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batches', error });
  }
};

exports.assignQuizToBatch = async (req, res) => {
  try {
    const { batchId, quiz } = req.body;
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    batch.quizzes.push(quiz);
    await batch.save();

    res.status(200).json({ message: 'Quiz assigned', batch });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning quiz', error });
  }
};


// Get single batch
exports.getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course')
      .populate('users', 'name email')
      .populate('professor');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batch', error });
  }
};

// Update batch
exports.updateBatch = async (req, res) => {
  try {
    const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Batch not found' });
    res.status(200).json({ message: 'Batch updated', batch: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating batch', error });
  }
};

// Delete batch
exports.deleteBatch = async (req, res) => {
  try {
    const deleted = await Batch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Batch not found' });
    res.status(200).json({ message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting batch', error });
  }
};

// Send certificate emails to selected users
exports.sendBatchCertificates = async (req, res) => {
  try {
    const { userIds, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const users = await User.find({ _id: { $in: userIds } });

    for (const user of users) {
      // Simulate certificate generation
      const certUrl = `/certificates/CERT-${user._id}-${Date.now()}.pdf`;

      // Update user's progress
      await Progress.findOneAndUpdate(
        { user: user._id, course: courseId },
        { isCompleted: true, completedAt: new Date(), certificateUrl: certUrl },
        { new: true }
      );

      // Send fancy email
      await sendCertificateMail(user.email, user.name, course.title, certUrl);
    }

    res.status(200).json({ message: 'Certificates sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending certificates', error });
  }
};