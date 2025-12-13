import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Interview } from '../models/Interview.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';

const router = Router();

// GET /api/users/me/profile - Get user profile (candidate or company)
router.get('/me/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role || 'candidate';

    // Get full user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userRole === 'candidate') {
      // Candidate profile
      const completedInterviews = await Interview.find({
        userId: userId,
        status: 'completed',
      })
        .populate('jobId', 'title level')
        .sort({ completedAt: -1 }) // Most recent first
        .lean();

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

      // Calculate total practice time
      const totalPracticeTime = `${Math.floor(totalInterviews * 0.5)}h ${(totalInterviews * 30) % 60}m`;

      // Format reports for frontend (full reports with all details)
      const reports = completedInterviews.map(interview => ({
        interviewId: interview._id,
        interviewType: interview.interviewType,
        jobTitle: interview.jobId ? interview.jobId.title : null,
        jobLevel: interview.jobId ? interview.jobId.level : null,
        completedAt: interview.completedAt,
        createdAt: interview.createdAt,
        report: interview.report, // Full report object
        questionsCount: interview.questions?.length || 0,
        answersCount: interview.answers?.length || 0,
      }));

      res.json({
        profile: {
          id: user._id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        stats: {
          completedInterviews: totalInterviews,
          averageScore: averageScore,
          totalPracticeTime: totalPracticeTime,
        },
        reports: reports, // Full reports array
      });
    } else {
      // Company profile
      // Get company's jobs
      const jobs = await Job.find({ companyId: userId })
        .sort({ createdAt: -1 })
        .lean();

      // Calculate stats
      const jobsPosted = jobs.length;
      const activeJobs = jobs.filter(j => j.status === 'active').length;
      const closedJobs = jobs.filter(j => j.status === 'closed').length;
      const draftJobs = jobs.filter(j => j.status === 'draft').length;

      // Get total applicants across all jobs
      const allInterviews = await Interview.find({
        companyId: userId,
        status: 'completed',
      }).lean();

      const totalApplicants = allInterviews.length;
      const interviewsCompleted = allInterviews.length;

      // Get recent jobs (last 5)
      const recentJobs = jobs.slice(0, 5).map(job => {
        const jobIdStr = job._id.toString();
        return {
          id: job._id,
          title: job.title,
          level: job.level,
          status: job.status,
          location: job.location,
          employmentType: job.employmentType,
          createdAt: job.createdAt,
          // Count applicants for each job (only application interviews, not practice)
          applicantCount: allInterviews.filter(i => 
            i.jobId && i.jobId.toString() === jobIdStr
          ).length,
        };
      });

      res.json({
        profile: {
          id: user._id,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
          createdAt: user.createdAt,
        },
        stats: {
          jobsPosted: jobsPosted,
          activeJobs: activeJobs,
          closedJobs: closedJobs,
          draftJobs: draftJobs,
          totalApplicants: totalApplicants,
          interviewsCompleted: interviewsCompleted,
        },
        recentJobs: recentJobs,
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me/stats - Get user statistics (backward compatibility)
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

      // Calculate total practice time
      const totalPracticeTime = `${Math.floor(totalInterviews * 0.5)}h ${(totalInterviews * 30) % 60}m`;

      res.json({
        completedInterviews: totalInterviews,
        averageScore: averageScore,
        totalPracticeTime: totalPracticeTime,
      });
    } else {
      // Company stats (calculated from actual data)
      const jobs = await Job.find({ companyId: userId }).lean();
      const allInterviews = await Interview.find({
        companyId: userId,
        status: 'completed',
      }).lean();

      res.json({
        jobsPosted: jobs.length,
        totalApplicants: allInterviews.length,
        interviewsCompleted: allInterviews.length,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
