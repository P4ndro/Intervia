import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Mock jobs data - will be replaced with MongoDB Job model later
const MOCK_JOBS = [
  {
    id: 'job1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
    type: 'Full-time',
    description: 'Full-stack developer needed for exciting projects',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'job2',
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'React/TypeScript expert for growing team',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 'job3',
    title: 'Backend Engineer',
    company: 'Cloud Services Inc',
    location: 'New York, NY',
    type: 'Contract',
    description: 'Node.js/Python developer for cloud infrastructure',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
];

// Helper to format "posted ago" text
function formatPostedAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  return `${Math.floor(days / 7)} weeks ago`;
}

// GET /api/jobs - List all jobs (public for candidates)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const jobs = MOCK_JOBS.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      description: job.description,
      posted: formatPostedAgo(job.postedAt),
      postedAt: job.postedAt,
    }));

    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id - Get single job details
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const job = MOCK_JOBS.find(j => j.id === req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      ...job,
      posted: formatPostedAgo(job.postedAt),
    });
  } catch (error) {
    next(error);
  }
});

export default router;


