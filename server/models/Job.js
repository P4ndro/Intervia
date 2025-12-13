import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

