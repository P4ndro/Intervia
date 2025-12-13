import mongoose from 'mongoose';

const generatedQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['technical', 'behavioral'], required: true },
  category: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  weight: { type: Number, default: 1 },
}, { _id: false });

const jobSchema = new mongoose.Schema({
  jobType: {
    type: String,
    enum: ['practice', 'real'],
    default: 'real',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.jobType === 'real'; },
  },
  practiceCompany: {
    name: String,
    logo: String,
    website: String,
  },
  title: {
    type: String,
    required: true,
  },
  rawDescription: {
    type: String,
    required: true,
  },
  parsedDetails: {
    summary: String,
    requirements: [String],
    skills: [String],
    experienceLevel: { type: String, enum: ['junior', 'mid', 'senior'] },
  },
  location: String,
  locationType: { type: String, enum: ['remote', 'hybrid', 'onsite'] },
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
  generatedQuestions: [generatedQuestionSchema],
  questionConfig: {
    technicalCount: { type: Number, default: 3 },
    behavioralCount: { type: Number, default: 2 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  },
  customQuestions: [generatedQuestionSchema],
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'draft',
  },
  stats: {
    totalApplications: { type: Number, default: 0 },
    completedInterviews: { type: Number, default: 0 },
  },
  aiGeneration: {
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
    completedAt: Date,
    error: String,
  },
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

jobSchema.index({ jobType: 1, status: 1 });
jobSchema.index({ companyId: 1 });

export const Job = mongoose.model('Job', jobSchema);

