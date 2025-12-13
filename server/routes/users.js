import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Interview } from '../models/Interview.js';

const router = Router();

// GET /api/users/me/stats - Get user statistics
router.get('/me/stats', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role || 'candidate';

    if (userRole === 'candidate') {
      // Calculate candidate stats from completed interviews
      const completedInterviews = await Interview.find({
        userId: userId,
        status: 'completed',
      });

      const totalInterviews = completedInterviews.length;
      
      // Calculate average score
      let totalScore = 0;
      let scoredInterviews = 0;
      completedInterviews.forEach(interview => {
        if (interview.report && interview.report.overallScore !== undefined) {
          totalScore += interview.report.overallScore;
          scoredInterviews++;
        }
      });
      const averageScore = scoredInterviews > 0 ? Math.round(totalScore / scoredInterviews) : 0;

      // Calculate total practice time (mock for now - could calculate from interview durations)
      const totalPracticeTime = `${Math.floor(totalInterviews * 0.5)}h ${(totalInterviews * 30) % 60}m`;

      res.json({
        completedInterviews: totalInterviews,
        averageScore: averageScore,
        totalPracticeTime: totalPracticeTime,
      });
    } else {
      // Organization stats (mock for now)
      res.json({
        jobsPosted: 12,
        totalApplicants: 45,
        interviewsCompleted: 38,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
