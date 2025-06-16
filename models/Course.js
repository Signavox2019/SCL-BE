const mongoose = require('mongoose');

const subTopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  videoUrl: String,
}, { _id: false });

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  subTopics: [subTopicSchema],
}, { _id: false });

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: String,
  topics: [topicSchema],
  quizIncluded: { type: Boolean, default: false },
  quizQuestions: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ]
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  moduleTitle: { type: String, required: true },
  moduleDescription: String,
  lessons: [lessonSchema]
}, { _id: false });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  duration: String,
  coverImage: String,
  modules: [moduleSchema],
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
