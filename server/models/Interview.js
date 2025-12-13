import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['technical', 'behavioral'], required: true },
  category: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  weight: { type: Number, default: 1 },
}, { _id: false });

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  transcript: { type: String, default: '' },
  skipped: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  aiEvaluation: {
    relevanceScore: Number,
    clarityScore: Number,
    depthScore: Number,
    technicalAccuracy: Number,
    feedback: String,
    detectedIssues: [String],
    strengths: [String],
    keywords: [String],
    confidence: Number,
  },
}, { _id: false });

const reportSchema = new mongoose.Schema({
  overallScore: { type: Number, required: true },
  technicalScore: Number,
  behavioralScore: Number,
  readinessBand: { type: String, enum: ['Not Ready', 'Needs Work', 'Almost Ready', 'Ready'] },
  primaryBlockers: [{
    questionId: String,
    questionText: String,
    questionType: String,
    issue: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    impact: String,
  }],
  strengths: [String],
  areasForImprovement: [String],
  recommendations: [String],
  metrics: {
    averageAnswerLength: Number,
    questionsAnswered: Number,
    questionsSkipped: Number,
    totalQuestions: Number,
  },
  summary: String,
  aiConfidence: Number,
  generatedAt: { type: Date, default: Date.now },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interviewType: {
    type: String,
    enum: ['practice', 'application'],
    default: 'practice',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  },
  questions: [questionSchema],
  answers: [answerSchema],
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  report: reportSchema,
  violations: [{
    type: { type: String, enum: ['fullscreen_exit', 'tab_switch', 'window_blur'] },
    timestamp: Date,
  }],
  companyViewed: { type: Boolean, default: false },
  companyViewedAt: Date,
  companyNotes: String,
  companyStatus: { type: String, enum: ['pending', 'accepted', 'rejected'] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ jobId: 1 });
interviewSchema.index({ companyId: 1 });

export const Interview = mongoose.model('Interview', interviewSchema);

