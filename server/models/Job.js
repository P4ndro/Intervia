import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for system courses
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    enum: ['Junior', 'Mid', 'Senior'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'Remote',
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time',
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'active',
  },
  // AI-generated questions (stored after job creation)
  generatedQuestions: [{
    id: String,
    text: String,
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'coding'],
    },
    category: String, // e.g., 'algorithms', 'system-design', 'communication'
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    weight: {
      type: Number,
      default: 1,
    },
    generatedAt: Date,
  }],
  // Question generation config (for AI)
  questionConfig: {
    numQuestions: {
      type: Number,
      default: 5,
    },
    technicalRatio: {
      type: Number,
      default: 0.6, // 60% technical, 40% behavioral
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },
  },
  // AI generation status
  aiGeneration: {
    questionsGenerated: {
      type: Boolean,
      default: false,
    },
    generatedAt: Date,
    model: String, // Which AI model was used
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for querying company's jobs
jobSchema.index({ companyId: 1, createdAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });

export const Job = mongoose.model('Job', jobSchema);

