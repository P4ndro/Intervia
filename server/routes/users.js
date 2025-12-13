import { Router } from 'express';
import { Interview } from '../models/Interview.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/users/me/stats - Get current user's interview statistics
router.get('/me/stats', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all user's interviews
    const interviews = await Interview.find({ userId })
      .select('status createdAt completedAt report.overallScore')
      .lean();

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    
    // Calculate average score
    const scoresWithValues = completedInterviews
      .filter(i => i.report?.overallScore !== undefined)
      .map(i => i.report.overallScore);
    
    const averageScore = scoresWithValues.length > 0
      ? Math.round(scoresWithValues.reduce((a, b) => a + b, 0) / scoresWithValues.length)
      : null;

    // Calculate total practice time (sum of interview durations)
    let totalPracticeMinutes = 0;
    completedInterviews.forEach(interview => {
      if (interview.createdAt && interview.completedAt) {
        const duration = new Date(interview.completedAt) - new Date(interview.createdAt);
        totalPracticeMinutes += Math.round(duration / 60000);
      }
    });

    // Format practice time
    let totalPracticeTime = '0m';
    if (totalPracticeMinutes >= 60) {
      const hours = Math.floor(totalPracticeMinutes / 60);
      const mins = totalPracticeMinutes % 60;
      totalPracticeTime = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else if (totalPracticeMinutes > 0) {
      totalPracticeTime = `${totalPracticeMinutes}m`;
    }

    // Calculate best score
    const bestScore = scoresWithValues.length > 0
      ? Math.max(...scoresWithValues)
      : null;

    // Calculate improvement (compare first half to second half of completed interviews)
    let improvement = null;
    if (scoresWithValues.length >= 4) {
      const midpoint = Math.floor(scoresWithValues.length / 2);
      const firstHalf = scoresWithValues.slice(0, midpoint);
      const secondHalf = scoresWithValues.slice(midpoint);
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      improvement = Math.round(secondAvg - firstAvg);
    }

    res.json({
      completedInterviews: completedInterviews.length,
      totalInterviews: interviews.length,
      averageScore,
      bestScore,
      totalPracticeTime,
      totalPracticeMinutes,
      improvement, // positive = improving, negative = declining, null = not enough data
      inProgressInterviews: interviews.filter(i => i.status === 'in_progress').length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me - Get current user profile (already exists in auth, but adding here for consistency)
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


