import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireCompany } from '../middleware/company.js';
import { Job } from '../models/Job.js';
import { Interview } from '../models/Interview.js';
import { User } from '../models/User.js';

const router = Router();

// GET /api/jobs - Get all active jobs (for candidates to browse)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .populate('companyId', 'companyName email')
      .sort({ createdAt: -1 })
      .lean();

    const formattedJobs = jobs.map(job => ({
      id: job._id.toString(),
      title: job.title,
      company: job.companyId?.companyName || 'Unknown Company',
      level: job.level,
      location: job.location,
      type: job.employmentType,
      description: job.description,
      posted: getTimeAgo(job.createdAt),
    }));

    res.json({ jobs: formattedJobs });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/company/my-jobs - Get company's own jobs
router.get('/company/my-jobs', requireCompany, async (req, res, next) => {
  try {
    const jobs = await Job.find({ companyId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs - Create a new job (company only)
router.post('/', requireCompany, async (req, res, next) => {
  try {
    const { title, level, description, location, employmentType } = req.body;

    if (!title || !level || !description) {
      return res.status(400).json({ error: 'Title, level, and description are required' });
    }

    if (!['Junior', 'Mid', 'Senior'].includes(level)) {
      return res.status(400).json({ error: 'Level must be Junior, Mid, or Senior' });
    }

    const job = new Job({
      companyId: req.user._id,
      title,
      level,
      description,
      location: location || 'Remote',
      employmentType: employmentType || 'Full-time',
      status: 'active',
    });

    await job.save();

    res.status(201).json({
      job: {
        id: job._id,
        title: job.title,
        level: job.level,
        description: job.description,
        location: job.location,
        employmentType: job.employmentType,
        status: job.status,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id - Get a specific job
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'companyName email');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/jobs/:id - Update a job (company only, own jobs)
router.patch('/:id', requireCompany, async (req, res, next) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      companyId: req.user._id 
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or you do not have permission' });
    }

    const { title, level, description, location, employmentType, status } = req.body;

    if (title) job.title = title;
    if (level) {
      if (!['Junior', 'Mid', 'Senior'].includes(level)) {
        return res.status(400).json({ error: 'Invalid level' });
      }
      job.level = level;
    }
    if (description) job.description = description;
    if (location) job.location = location;
    if (employmentType) {
      if (!['Full-time', 'Part-time', 'Contract', 'Internship'].includes(employmentType)) {
        return res.status(400).json({ error: 'Invalid employment type' });
      }
      job.employmentType = employmentType;
    }
    if (status) {
      if (!['draft', 'active', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      job.status = status;
    }

    await job.save();

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/jobs/:id - Delete a job (company only, own jobs)
router.delete('/:id', requireCompany, async (req, res, next) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      companyId: req.user._id 
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or you do not have permission' });
    }

    await Job.deleteOne({ _id: job._id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id/applicants - Get all applicants/reports for a job (company only)
router.get('/:id/applicants', requireCompany, async (req, res, next) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      companyId: req.user._id 
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or you do not have permission' });
    }

    // Find all completed interviews for this job
    const interviews = await Interview.find({
      jobId: job._id,
      status: 'completed',
    })
      .populate('userId', 'email')
      .sort({ completedAt: -1 })
      .lean();

    const applicants = interviews.map(interview => ({
      interviewId: interview._id,
      candidateEmail: interview.userId?.email || 'Unknown',
      overallScore: interview.report?.overallScore || 0,
      technicalScore: interview.report?.technicalScore || null,
      behavioralScore: interview.report?.behavioralScore || null,
      primaryBlockers: interview.report?.primaryBlockers || [],
      strengths: interview.report?.strengths || [],
      areasForImprovement: interview.report?.areasForImprovement || [],
      completedAt: interview.completedAt,
      createdAt: interview.createdAt,
    }));

    res.json({ 
      job: {
        id: job._id,
        title: job.title,
        level: job.level,
      },
      applicants,
      totalApplicants: applicants.length,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to get time ago string
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'week' : 'weeks'} ago`;
}

export default router;
