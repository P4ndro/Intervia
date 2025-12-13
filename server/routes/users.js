import { Router } from 'express';
import { Interview } from '../models/Interview.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/users/me/stats
router.get('/me/stats', requireAuth, async (req, res, next) => {
  try {
    const interviews = await Interview.find({ 
      userId: req.user._id,
      status: 'completed',
    });

    const completedInterviews = interviews.length;
    
    let totalScore = 0;
    let scoreCount = 0;
    let totalMinutes = 0;

    interviews.forEach(interview => {
      if (interview.report?.overallScore !== undefined) {
        totalScore += interview.report.overallScore;
        scoreCount++;
      }
      
      if (interview.completedAt && interview.createdAt) {
        const minutes = Math.round((new Date(interview.completedAt) - new Date(interview.createdAt)) / 60000);
        totalMinutes += minutes;
      }
    });

    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : null;
    const totalPracticeTime = totalMinutes > 0 ? `${totalMinutes}m` : '0m';

    res.json({
      completedInterviews,
      averageScore,
      totalPracticeTime,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role || 'candidate',
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

