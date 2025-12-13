import { Router } from 'express';
import { Interview } from '../models/Interview.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Mock questions for MVP - replace with AI-generated questions later
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    text: 'Tell me about yourself and your experience.',
    type: 'behavioral',
    weight: 1,
  },
  {
    id: 'q2',
    text: 'Describe a challenging technical problem you solved recently.',
    type: 'technical',
    weight: 2,
  },
  {
    id: 'q3',
    text: 'How do you handle disagreements with team members?',
    type: 'behavioral',
    weight: 1,
  },
];

// Generate report with WEIGHTED scoring based on question types
function generateMockReport(interview) {
  const answers = interview.answers || [];
  const questions = interview.questions || [];
  
  // Calculate total possible weight
  const totalWeight = questions.reduce((sum, q) => sum + (q.weight || 1), 0);
  
  // Score each question based on answer quality and weight
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
    
    // Track weights by type
    if (isTechnical) {
      technicalWeight += weight;
    } else {
      behavioralWeight += weight;
    }
    
    // Calculate question score (0-100)
    let questionScore = 0;
    let issue = null;
    let severity = null;
    
    if (!answer) {
      // Not answered at all
      questionScore = 0;
      issue = 'Question was not answered';
      severity = isTechnical ? 'high' : 'medium';
    } else if (answer.skipped) {
      // Skipped
      questionScore = 0;
      issue = 'Question was skipped';
      severity = isTechnical ? 'high' : 'medium';
    } else {
      const wordCount = answer.transcript.split(/\s+/).filter(w => w).length;
      
      if (wordCount < 10) {
        questionScore = 20;
        issue = 'Answer too brief - lacks substance';
        severity = isTechnical ? 'high' : 'medium';
      } else if (wordCount < 30) {
        questionScore = 50;
        issue = 'Answer could use more detail';
        severity = 'low';
      } else if (wordCount < 60) {
        questionScore = 75;
      } else {
        questionScore = 95; // Good detailed answer
      }
    }
    
    // Add weighted score
    const weightedQuestionScore = (questionScore / 100) * weight;
    weightedScore += weightedQuestionScore;
    
    // Track by type
    if (isTechnical) {
      technicalScore += weightedQuestionScore;
    } else {
      behavioralScore += weightedQuestionScore;
    }
    
    // Add blocker if there's an issue
    if (issue) {
      primaryBlockers.push({
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        issue,
        severity,
        impact: isTechnical ? 'High impact on readiness' : 'Moderate impact on readiness',
      });
    }
  });
  
  // Calculate percentages
  const overallScore = Math.round((weightedScore / totalWeight) * 100);
  const technicalPercent = technicalWeight > 0 
    ? Math.round((technicalScore / technicalWeight) * 100) 
    : null;
  const behavioralPercent = behavioralWeight > 0 
    ? Math.round((behavioralScore / behavioralWeight) * 100) 
    : null;
  
  // Sort blockers by severity (high first)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  primaryBlockers.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  // Calculate metrics
  const questionsAnswered = answers.filter(a => !a.skipped && a.transcript.trim()).length;
  const questionsSkipped = answers.filter(a => a.skipped).length;
  const answeredTranscripts = answers.filter(a => !a.skipped && a.transcript.trim());
  const totalWords = answeredTranscripts.reduce((sum, a) => {
    return sum + a.transcript.split(/\s+/).filter(w => w).length;
  }, 0);
  const averageAnswerLength = answeredTranscripts.length > 0 
    ? Math.round(totalWords / answeredTranscripts.length) 
    : 0;

  // Generate contextual strengths and recommendations
  const strengths = [];
  const areasForImprovement = [];
  const recommendations = [];

  // Strengths
  if (technicalPercent !== null && technicalPercent >= 70) {
    strengths.push('Strong technical communication');
  }
  if (behavioralPercent !== null && behavioralPercent >= 70) {
    strengths.push('Good behavioral responses');
  }
  if (questionsAnswered === questions.length) {
    strengths.push('Completed all interview questions');
  }
  if (averageAnswerLength >= 50) {
    strengths.push('Provided detailed, thorough responses');
  }

  // Areas for improvement based on type scores
  if (technicalPercent !== null && technicalPercent < 60) {
    areasForImprovement.push('Technical question responses need more depth');
    recommendations.push('Practice explaining technical concepts with specific examples');
  }
  if (behavioralPercent !== null && behavioralPercent < 60) {
    areasForImprovement.push('Behavioral responses could be stronger');
    recommendations.push('Use the STAR method: Situation, Task, Action, Result');
  }
  if (questionsSkipped > 0) {
    areasForImprovement.push('Avoid skipping questions - attempt all of them');
    recommendations.push('Practice responding to unexpected or difficult questions');
  }
  if (averageAnswerLength < 30) {
    areasForImprovement.push('Answers are too brief');
    recommendations.push('Aim for 50+ words per answer with concrete examples');
  }

  // Contextual insight
  if (technicalPercent !== null && behavioralPercent !== null) {
    if (behavioralPercent > technicalPercent + 20) {
      recommendations.push('You did well behaviorally, but technical depth is holding back your readiness');
    } else if (technicalPercent > behavioralPercent + 20) {
      recommendations.push('Strong technical skills - focus on storytelling for behavioral questions');
    }
  }

  // Ensure at least one item in each array
  if (strengths.length === 0) {
    strengths.push('Showed willingness to practice and improve');
  }
  if (areasForImprovement.length === 0) {
    areasForImprovement.push('Continue practicing to maintain your skills');
  }
  if (recommendations.length === 0) {
    recommendations.push('Keep practicing regularly to stay interview-ready');
  }

  return {
    overallScore,
    technicalScore: technicalPercent,
    behavioralScore: behavioralPercent,
    primaryBlockers,
    strengths,
    areasForImprovement,
    recommendations,
    metrics: {
      averageAnswerLength,
      questionsAnswered,
      questionsSkipped,
      totalQuestions: questions.length,
    },
  };
}

// POST /api/interviews/start - Start a new interview
router.post('/start', requireAuth, async (req, res, next) => {
  try {
    const interview = new Interview({
      userId: req.user._id,
      status: 'in_progress',
      questions: MOCK_QUESTIONS,
      answers: [],
      currentQuestionIndex: 0,
    });

    await interview.save();

    res.status(201).json({
      interviewId: interview._id,
      questions: interview.questions,
      currentQuestionIndex: 0,
      totalQuestions: interview.questions.length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews/:id/answer - Submit an answer
router.post('/:id/answer', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, transcript, skipped = false } = req.body;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    // Check if answer already exists for this question
    const existingAnswerIndex = interview.answers.findIndex(
      a => a.questionId === questionId
    );

    const answerData = {
      questionId,
      transcript: transcript || '',
      skipped,
      submittedAt: new Date(),
    };

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      interview.answers[existingAnswerIndex] = answerData;
    } else {
      // Add new answer
      interview.answers.push(answerData);
    }

    // Update current question index
    const questionIndex = interview.questions.findIndex(q => q.id === questionId);
    if (questionIndex >= 0 && questionIndex >= interview.currentQuestionIndex) {
      interview.currentQuestionIndex = Math.min(
        questionIndex + 1,
        interview.questions.length - 1
      );
    }

    // Check if all questions answered
    const allAnswered = interview.questions.every(q =>
      interview.answers.some(a => a.questionId === q.id)
    );

    // Auto-complete if all questions answered
    let completed = false;
    if (allAnswered && interview.status !== 'completed') {
      interview.report = generateMockReport(interview);
      interview.status = 'completed';
      interview.completedAt = new Date();
      completed = true;
    }

    await interview.save();

    res.json({
      success: true,
      answersCount: interview.answers.length,
      totalQuestions: interview.questions.length,
      allAnswered,
      completed, // Frontend can use this to navigate to report
      currentQuestionIndex: interview.currentQuestionIndex,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews/:id/complete - Complete interview and generate report
router.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    // Generate mock report
    interview.report = generateMockReport(interview);
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    res.json({
      success: true,
      interviewId: interview._id,
      status: 'completed',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews/:id/report - Get interview report
router.get('/:id/report', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // If not completed, generate report on-the-fly but don't save
    let report = interview.report;
    if (!report || !report.overallScore) {
      report = generateMockReport(interview);
    }

    res.json({
      interviewId: interview._id,
      status: interview.status,
      report,
      questions: interview.questions,
      answers: interview.answers,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews/:id - Get interview details
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({
      interviewId: interview._id,
      status: interview.status,
      questions: interview.questions,
      answers: interview.answers,
      currentQuestionIndex: interview.currentQuestionIndex,
      totalQuestions: interview.questions.length,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews - List user's interviews (ready-to-render for Home UI)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('status questions answers createdAt completedAt report')
      .limit(20);

    const interviewList = interviews.map(interview => {
      const report = interview.report || {};
      
      // Calculate readiness band based on score
      let readinessBand = null;
      if (report.overallScore !== undefined) {
        if (report.overallScore >= 85) readinessBand = 'Ready';
        else if (report.overallScore >= 70) readinessBand = 'Almost Ready';
        else if (report.overallScore >= 50) readinessBand = 'Needs Work';
        else readinessBand = 'Not Ready';
      }

      return {
        interviewId: interview._id,
        status: interview.status,
        questionsCount: interview.questions.length,
        answersCount: interview.answers.length,
        // Scores
        overallScore: report.overallScore || null,
        technicalScore: report.technicalScore || null,
        behavioralScore: report.behavioralScore || null,
        readinessBand,
        // Dates (ready for display)
        createdAt: interview.createdAt,
        completedAt: interview.completedAt,
        // Duration in minutes (if completed)
        durationMinutes: interview.completedAt && interview.createdAt
          ? Math.round((new Date(interview.completedAt) - new Date(interview.createdAt)) / 60000)
          : null,
      };
    });

    res.json({ interviews: interviewList });
  } catch (error) {
    next(error);
  }
});

export default router;

