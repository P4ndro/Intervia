import { Router } from 'express';
import { Job } from '../models/Job.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function requireCompany(req, res, next) {
  const userRole = req.user.role || 'candidate';
  if (userRole !== 'company') {
    return res.status(403).json({ error: 'Only company accounts can perform this action' });
  }
  next();
}

function formatPostedAgo(date) {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  return `${Math.floor(days / 7)} weeks ago`;
}

// GET /api/jobs - List all active jobs
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { type } = req.query;
    
    const query = { status: 'active' };
    if (type === 'practice' || type === 'real') {
      query.jobType = type;
    }

    const jobs = await Job.find(query)
      .populate('companyId', 'companyProfile.companyName companyProfile.logoUrl')
      .sort({ jobType: 1, publishedAt: -1, createdAt: -1 })
      .limit(50);

    const formattedJobs = jobs.map(job => {
      const isPractice = job.jobType === 'practice';
      const companyName = isPractice 
        ? job.practiceCompany?.name 
        : job.companyId?.companyProfile?.companyName;
      const companyLogo = isPractice
        ? job.practiceCompany?.logo
        : job.companyId?.companyProfile?.logoUrl;

      return {
        id: job._id,
        title: job.title,
        company: companyName || 'Unknown Company',
        companyLogo: companyLogo || '',
        jobType: job.jobType,
        isPractice,
        location: job.location,
        locationType: job.locationType,
        type: job.employmentType,
        experienceLevel: job.parsedDetails?.experienceLevel || '',
        description: job.parsedDetails?.summary || job.rawDescription?.substring(0, 200) + '...',
        skills: job.parsedDetails?.skills || [],
        posted: formatPostedAgo(job.publishedAt || job.createdAt),
        postedAt: job.publishedAt || job.createdAt,
        questionsCount: (job.generatedQuestions?.length || 0) + (job.customQuestions?.length || 0),
      };
    });

    res.json({ jobs: formattedJobs });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    if (req.params.id === 'company') return next();

    const job = await Job.findById(req.params.id)
      .populate('companyId', 'companyProfile.companyName companyProfile.logoUrl companyProfile.website companyProfile.description');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'draft' && job.companyId && !job.companyId._id.equals(req.user._id)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isPractice = job.jobType === 'practice';

    res.json({
      id: job._id,
      title: job.title,
      jobType: job.jobType,
      company: isPractice ? {
        name: job.practiceCompany?.name,
        logo: job.practiceCompany?.logo,
        website: job.practiceCompany?.website,
      } : {
        name: job.companyId?.companyProfile?.companyName,
        logo: job.companyId?.companyProfile?.logoUrl,
        website: job.companyId?.companyProfile?.website,
      },
      location: job.location,
      locationType: job.locationType,
      employmentType: job.employmentType,
      rawDescription: job.rawDescription,
      parsedDetails: job.parsedDetails,
      generatedQuestions: job.generatedQuestions,
      customQuestions: job.customQuestions,
      status: job.status,
      stats: job.stats,
      posted: formatPostedAgo(job.publishedAt || job.createdAt),
      publishedAt: job.publishedAt,
      createdAt: job.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

