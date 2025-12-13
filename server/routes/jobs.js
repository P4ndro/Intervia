import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Mock jobs data - replace with database queries later
const MOCK_JOBS = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
    type: 'Full-time',
    posted: '2 days ago',
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'San Francisco, CA',
    type: 'Full-time',
    posted: '5 days ago',
  },
  {
    id: '3',
    title: 'Backend Engineer',
    company: 'Cloud Services Inc',
    location: 'New York, NY',
    type: 'Contract',
    posted: '1 week ago',
  },
];

// GET /api/jobs - Get all available jobs
router.get('/', requireAuth, (req, res) => {
  res.json({ jobs: MOCK_JOBS });
});

export default router;
