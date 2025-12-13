import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral'],
    default: 'behavioral',
  },
  weight: {
    type: Number,
    default: 1,
  },
}, { _id: false });

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  transcript: {
    type: String,
    default: '',
  },
  skipped: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: null,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  interviewType: {
    type: String,
    enum: ['practice', 'application'],
    default: 'practice',
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  },
  questions: [questionSchema],
  answers: [answerSchema],
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  report: {
    overallScore: Number,
    primaryBlockers: [{
      questionId: String,
      questionText: String,
      issue: String,
      severity: String,
    }],
    strengths: [String],
    areasForImprovement: [String],
    recommendations: [String],
    metrics: {
      averageAnswerLength: Number,
      questionsAnswered: Number,
      questionsSkipped: Number,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Index for querying user's interviews
interviewSchema.index({ userId: 1, createdAt: -1 });

export const Interview = mongoose.model('Interview', interviewSchema);

