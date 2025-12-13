import { Router } from 'express';
import { Interview } from '../models/Interview.js';
import { Job } from '../models/Job.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const PRACTICE_QUESTIONS = [
  { id: 'q1', text: 'Tell me about yourself and your experience.', type: 'behavioral', category: 'introduction', difficulty: 'easy', weight: 1 },
  { id: 'q2', text: 'Describe a challenging technical problem you solved recently.', type: 'technical', category: 'problem_solving', difficulty: 'medium', weight: 2 },
  { id: 'q3', text: 'How do you handle disagreements with team members?', type: 'behavioral', category: 'teamwork', difficulty: 'medium', weight: 1 },
];

function generateMockReport(interview) {
  const answers = interview.answers || [];
  const questions = interview.questions || [];
  
  const totalWeight = questions.reduce((sum, q) => sum + (q.weight || 1), 0);
  
  let weightedScore = 0;
  let technicalScore = 0;
  let behavioralScore = 0;
  let technicalWeight = 0;
  let behavioralWeight = 0;
  
  const primaryBlockers = [];
  
  questions.forEach(question => {
    const answer = answers.find(a => a.questionId === question.id);
    const weight = question.weight || 1;
    const isTechnical = question.type === 'technical';
    
    if (isTechnical) technicalWeight += weight;
    else behavioralWeight += weight;
    
    let questionScore = 0;
    let issue = null;
    let severity = null;
    
    if (!answer || answer.skipped) {
      questionScore = 0;
      issue = answer?.skipped ? 'Question was skipped' : 'Question was not answered';
      severity = isTechnical ? 'high' : 'medium';
    } else {
      const wordCount = answer.transcript.split(/\s+/).filter(w => w).length;
      if (wordCount < 10) { questionScore = 20; issue = 'Answer too brief'; severity = isTechnical ? 'high' : 'medium'; }
      else if (wordCount < 30) { questionScore = 50; issue = 'Answer could use more detail'; severity = 'low'; }
      else if (wordCount < 60) { questionScore = 75; }
      else { questionScore = 95; }
    }
    
    const weightedQuestionScore = (questionScore / 100) * weight;
    weightedScore += weightedQuestionScore;
    
    if (isTechnical) technicalScore += weightedQuestionScore;
    else behavioralScore += weightedQuestionScore;
    
    if (issue) {
      primaryBlockers.push({
        questionId: question.id, questionText: question.text, questionType: question.type,
        issue, severity, impact: isTechnical ? 'High impact' : 'Moderate impact',
      });
    }
  });
  
  const overallScore = Math.round((weightedScore / totalWeight) * 100);
  const technicalPercent = technicalWeight > 0 ? Math.round((technicalScore / technicalWeight) * 100) : null;
  const behavioralPercent = behavioralWeight > 0 ? Math.round((behavioralScore / behavioralWeight) * 100) : null;
  
  primaryBlockers.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]));
  
  const questionsAnswered = answers.filter(a => !a.skipped && a.transcript.trim()).length;
  const questionsSkipped = answers.filter(a => a.skipped).length;
  const answeredTranscripts = answers.filter(a => !a.skipped && a.transcript.trim());
  const totalWords = answeredTranscripts.reduce((sum, a) => sum + a.transcript.split(/\s+/).filter(w => w).length, 0);
  const averageAnswerLength = answeredTranscripts.length > 0 ? Math.round(totalWords / answeredTranscripts.length) : 0;

  let readinessBand = 'Not Ready';
  if (overallScore >= 85) readinessBand = 'Ready';
  else if (overallScore >= 70) readinessBand = 'Almost Ready';
  else if (overallScore >= 50) readinessBand = 'Needs Work';

  const strengths = [];
  const areasForImprovement = [];
  const recommendations = [];

  if (technicalPercent !== null && technicalPercent >= 70) strengths.push('Strong technical communication');
  if (behavioralPercent !== null && behavioralPercent >= 70) strengths.push('Good behavioral responses');
  if (questionsAnswered === questions.length) strengths.push('Completed all questions');
  if (averageAnswerLength >= 50) strengths.push('Detailed responses');

  if (technicalPercent !== null && technicalPercent < 60) {
    areasForImprovement.push('Technical responses need more depth');
    recommendations.push('Practice explaining technical concepts with examples');
  }
  if (behavioralPercent !== null && behavioralPercent < 60) {
    areasForImprovement.push('Behavioral responses could be stronger');
    recommendations.push('Use the STAR method');
  }
  if (questionsSkipped > 0) {
    areasForImprovement.push('Avoid skipping questions');
    recommendations.push('Practice responding to unexpected questions');
  }

  if (strengths.length === 0) strengths.push('Showed willingness to practice');
  if (areasForImprovement.length === 0) areasForImprovement.push('Continue practicing');
  if (recommendations.length === 0) recommendations.push('Keep practicing regularly');

  return {
    overallScore, technicalScore: technicalPercent, behavioralScore: behavioralPercent, readinessBand,
    primaryBlockers, strengths, areasForImprovement, recommendations,
    metrics: { averageAnswerLength, questionsAnswered, questionsSkipped, totalQuestions: questions.length },
    generatedAt: new Date(),
  };
}

// POST /api/interviews/start
router.post('/start', requireAuth, async (req, res, next) => {
  try {
    const userRole = req.user.role || 'candidate';
    if (userRole !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can start interviews' });
    }

    const interview = new Interview({
      userId: req.user._id,
      interviewType: 'practice',
      status: 'in_progress',
      questions: PRACTICE_QUESTIONS,
      answers: [],
      currentQuestionIndex: 0,
    });

    await interview.save();

    res.status(201).json({
      interviewId: interview._id,
      interviewType: 'practice',
      questions: interview.questions,
      currentQuestionIndex: 0,
      totalQuestions: interview.questions.length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews/apply/:jobId
router.post('/apply/:jobId', requireAuth, async (req, res, next) => {
  try {
    const userRole = req.user.role || 'candidate';
    if (userRole !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can apply to jobs' });
    }

    const job = await Job.findById(req.params.jobId);
    
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ error: 'Job not accepting applications' });

    const allJobQuestions = [...(job.generatedQuestions || []), ...(job.customQuestions || [])];
    if (allJobQuestions.length === 0) return res.status(400).json({ error: 'Job questions not ready' });

    // Only check for existing applications on real company jobs, not practice jobs
    if (job.jobType === 'real') {
      const existing = await Interview.findOne({
        userId: req.user._id, jobId: job._id, status: { $in: ['in_progress', 'completed'] },
      });

      if (existing) {
        return res.status(400).json({ error: 'Already applied', existingInterviewId: existing._id, status: existing.status });
      }
    }

    const interview = new Interview({
      userId: req.user._id,
      interviewType: 'application',
      jobId: job._id,
      companyId: job.companyId,
      status: 'in_progress',
      questions: allJobQuestions.map(q => ({ id: q.id, text: q.text, type: q.type, category: q.category, difficulty: q.difficulty, weight: q.weight })),
      answers: [],
      currentQuestionIndex: 0,
    });

    await interview.save();
    await Job.findByIdAndUpdate(job._id, { $inc: { 'stats.totalApplications': 1 } });

    res.status(201).json({
      interviewId: interview._id,
      interviewType: 'application',
      jobTitle: job.title,
      questions: interview.questions.map(q => ({ id: q.id, text: q.text, type: q.type, category: q.category, difficulty: q.difficulty })),
      currentQuestionIndex: 0,
      totalQuestions: interview.questions.length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews/:id/answer
router.post('/:id/answer', requireAuth, async (req, res, next) => {
  try {
    const { questionId, transcript, skipped = false } = req.body;

    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (interview.status === 'completed') return res.status(400).json({ error: 'Interview already completed' });

    const existingIdx = interview.answers.findIndex(a => a.questionId === questionId);
    const answerData = { questionId, transcript: transcript || '', skipped, submittedAt: new Date() };

    if (existingIdx >= 0) interview.answers[existingIdx] = answerData;
    else interview.answers.push(answerData);

    const qIdx = interview.questions.findIndex(q => q.id === questionId);
    if (qIdx >= 0 && qIdx >= interview.currentQuestionIndex) {
      interview.currentQuestionIndex = Math.min(qIdx + 1, interview.questions.length - 1);
    }

    const allAnswered = interview.questions.every(q => interview.answers.some(a => a.questionId === q.id));

    let completed = false;
    if (allAnswered && interview.status !== 'completed') {
      interview.report = generateMockReport(interview);
      interview.status = 'completed';
      interview.completedAt = new Date();
      completed = true;

      if (interview.interviewType === 'application' && interview.jobId) {
        await Job.findByIdAndUpdate(interview.jobId, { $inc: { 'stats.completedInterviews': 1 } });
      }
    }

    await interview.save();

    res.json({ success: true, answersCount: interview.answers.length, totalQuestions: interview.questions.length, allAnswered, completed, currentQuestionIndex: interview.currentQuestionIndex });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews/:id/complete
router.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (interview.status === 'completed') return res.status(400).json({ error: 'Already completed' });

    interview.report = generateMockReport(interview);
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    if (interview.interviewType === 'application' && interview.jobId) {
      await Job.findByIdAndUpdate(interview.jobId, { $inc: { 'stats.completedInterviews': 1 } });
    }

    res.json({ success: true, interviewId: interview._id, status: 'completed' });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews/:id/report
router.get('/:id/report', requireAuth, async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('jobId', 'title')
      .populate('companyId', 'companyProfile.companyName');

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const isOwner = interview.userId.equals(req.user._id);
    const isCompany = interview.companyId && interview.companyId._id.equals(req.user._id);

    if (!isOwner && !isCompany) return res.status(403).json({ error: 'Access denied' });

    let report = interview.report;
    if (!report || !report.overallScore) report = generateMockReport(interview);

    if (isCompany && !interview.companyViewed) {
      interview.companyViewed = true;
      interview.companyViewedAt = new Date();
      await interview.save();
    }

    res.json({
      interviewId: interview._id, interviewType: interview.interviewType,
      jobTitle: interview.jobId?.title || null,
      companyName: interview.companyId?.companyProfile?.companyName || null,
      status: interview.status, report, questions: interview.questions, answers: interview.answers,
      createdAt: interview.createdAt, completedAt: interview.completedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('jobId', 'title jobType practiceCompany')
      .populate('companyId', 'companyProfile.companyName');

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    // Get company name - from practiceCompany for practice jobs, from companyId for real jobs
    let companyName = null;
    if (interview.jobId) {
      if (interview.jobId.jobType === 'practice') {
        companyName = interview.jobId.practiceCompany?.name || null;
      } else {
        companyName = interview.companyId?.companyProfile?.companyName || null;
      }
    }

    res.json({
      interviewId: interview._id, interviewType: interview.interviewType,
      jobTitle: interview.jobId?.title || null,
      companyName: companyName,
      status: interview.status,
      questions: interview.questions.map(q => ({ id: q.id, text: q.text, type: q.type, category: q.category, difficulty: q.difficulty })),
      answers: interview.answers, currentQuestionIndex: interview.currentQuestionIndex,
      totalQuestions: interview.questions.length, createdAt: interview.createdAt, completedAt: interview.completedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .populate('jobId', 'title')
      .populate('companyId', 'companyProfile.companyName')
      .sort({ createdAt: -1 })
      .limit(20);

    const list = interviews.map(i => ({
      interviewId: i._id, interviewType: i.interviewType,
      jobTitle: i.jobId?.title || null, companyName: i.companyId?.companyProfile?.companyName || null,
      status: i.status, questionsCount: i.questions.length, answersCount: i.answers.length,
      overallScore: i.report?.overallScore || null, technicalScore: i.report?.technicalScore || null,
      behavioralScore: i.report?.behavioralScore || null, readinessBand: i.report?.readinessBand || null,
      createdAt: i.createdAt, completedAt: i.completedAt,
      durationMinutes: i.completedAt && i.createdAt ? Math.round((new Date(i.completedAt) - new Date(i.createdAt)) / 60000) : null,
    }));

    res.json({ interviews: list });
  } catch (error) {
    next(error);
  }
});

export default router;

