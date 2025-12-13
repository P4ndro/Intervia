import Groq from 'groq-sdk';
import { getMockQuestions, getMockEvaluation, getMockReport } from './mockResponses.js';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';

let groq = null;
if (!USE_MOCK_AI && process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const MODEL = 'llama-3.3-70b-versatile'; // Fast and smart

async function askGroq(prompt) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });
  return response.choices[0].message.content;
}

export async function generateQuestions(jobTitle, jobDescription = '', count = 5) {
  if (USE_MOCK_AI) {
    console.log('[AI] Using mock questions for:', jobTitle);
    return getMockQuestions(jobTitle).slice(0, count);
  }

  if (!groq) {
    throw new Error('Groq not configured. Set GROQ_API_KEY in .env');
  }

  console.log('[AI] Generating questions with Groq for:', jobTitle);

  const prompt = `You are an expert job interviewer. Generate exactly ${count} interview questions for a "${jobTitle}" position.

${jobDescription ? `Job Description: ${jobDescription}` : ''}

Requirements:
- Mix: about 60% technical questions, 40% behavioral questions
- Technical questions test practical job-related skills
- Behavioral questions explore past experiences ("Tell me about a time...")
- Assign weight from 1-10 based on importance

Return ONLY a valid JSON array, no other text:
[
  {"id": "q1", "text": "Your question?", "type": "technical", "weight": 8},
  {"id": "q2", "text": "Your question?", "type": "behavioral", "weight": 6}
]`;

  try {
    const response = await askGroq(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]).slice(0, count);
  } catch (error) {
    console.error('[AI] Error:', error.message);
    return getMockQuestions(jobTitle).slice(0, count);
  }
}

export async function evaluateAnswer(question, answer, jobContext = '') {
  if (USE_MOCK_AI) {
    console.log('[AI] Mock evaluating answer for:', question.id);
    return getMockEvaluation(question, answer);
  }

  if (!groq) {
    throw new Error('Groq not configured. Set GROQ_API_KEY in .env');
  }

  console.log('[AI] Evaluating answer with Groq for:', question.id);

  const prompt = `You are an interview coach evaluating a candidate's answer.

Question: "${question.text}"
Question Type: ${question.type}
Job Context: ${jobContext}

Candidate's Answer: "${answer}"

Evaluate on: relevance, depth, examples, clarity.
Be constructive like a coach, not judgmental.

Return ONLY valid JSON:
{"score": 7, "feedback": "Your constructive feedback here"}`;

  try {
    const response = await askGroq(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('[AI] Error:', error.message);
    return getMockEvaluation(question, answer);
  }
}

export async function generateReport(interview) {
  if (USE_MOCK_AI) {
    console.log('[AI] Mock generating report');
    return getMockReport(interview);
  }

  if (!groq) {
    throw new Error('Groq not configured. Set GROQ_API_KEY in .env');
  }

  console.log('[AI] Generating report with Groq');

  const qaData = interview.questions.map(q => {
    const answer = interview.answers.find(a => a.questionId === q.id);
    const score = interview.evaluation.scores.find(s => s.questionId === q.id);
    return {
      question: q.text,
      type: q.type,
      weight: q.weight,
      answer: answer?.transcript || 'No answer',
      score: score?.score || 0,
      feedback: score?.feedback || '',
    };
  });

  const prompt = `You are an interview coach creating a performance report.

Job Title: ${interview.jobTitle}
Overall Score: ${interview.evaluation.overallScore}/100

Questions and Answers:
${JSON.stringify(qaData, null, 2)}

Create a supportive report. Act as a COACH, not a judge.
Use "What held your readiness back..." NOT "You failed..."

Return ONLY valid JSON:
{
  "summary": "2-3 paragraph assessment",
  "readinessLevel": "ready" or "almost_ready" or "needs_work",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "primaryBlockers": [{"questionId": "q1", "issue": "...", "suggestion": "..."}]
}`;

  try {
    const response = await askGroq(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const report = JSON.parse(jsonMatch[0]);
    report.generatedAt = new Date();
    report.overallScore = interview.evaluation.overallScore;
    return report;
  } catch (error) {
    console.error('[AI] Error:', error.message);
    return getMockReport(interview);
  }
}

export function getAIStatus() {
  return {
    mode: USE_MOCK_AI ? 'mock' : 'groq',
    configured: USE_MOCK_AI || !!groq,
    provider: USE_MOCK_AI ? 'mock' : `groq/${MODEL}`,
  };
}

export default { generateQuestions, evaluateAnswer, generateReport, getAIStatus };