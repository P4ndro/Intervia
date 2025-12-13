import 'dotenv/config';
import Groq from 'groq-sdk';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';

let groq = null;
if (!USE_MOCK_AI && process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const MODEL = 'llama-3.3-70b-versatile';

async function askGroq(prompt, options = {}) {
  if (!groq) {
    throw new Error('Groq not configured. Set GROQ_API_KEY in .env');
  }

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2048,
  });

  return response.choices[0].message.content;
}

export async function generateQuestions(job, config = {}) {
  const {
    numQuestions = 5,
    technicalRatio = 0.6,
    difficulty = 'mixed',
  } = config;

  const numTechnical = Math.ceil(numQuestions * technicalRatio);
  const numBehavioral = numQuestions - numTechnical;

  const prompt = `You are an expert technical recruiter. Generate ${numQuestions} interview questions for a ${job.level} ${job.title} position.

Job Description:
${job.description}

Requirements:
- Generate ${numTechnical} technical questions and ${numBehavioral} behavioral questions
- Difficulty level: ${difficulty}
- Questions should be specific to this role and level
- Technical questions can include code examples or system design scenarios
- Behavioral questions should assess soft skills relevant to this position

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "q1",
    "text": "Full question text here. For technical questions, you can include code snippets or scenarios.",
    "type": "technical",
    "category": "algorithms",
    "difficulty": "medium",
    "weight": 2
  },
  {
    "id": "q2",
    "text": "Another question...",
    "type": "behavioral",
    "category": "communication",
    "difficulty": "easy",
    "weight": 1
  }
]

Ensure:
- Each question has a unique id (q1, q2, q3, etc.)
- Technical questions have weight 2, behavioral have weight 1
- Categories are relevant (e.g., 'algorithms', 'system-design', 'databases', 'communication', 'leadership')
- Difficulty matches the requested level
- Questions are detailed and specific to this job`;

  if (USE_MOCK_AI) {
    console.log('[QuestionGenerator] Using mock mode - returning basic questions');
    const mockQuestions = [];
    for (let i = 0; i < numQuestions; i++) {
      const isTechnical = i < numTechnical;
      mockQuestions.push({
        id: `q${i + 1}`,
        text: isTechnical
          ? `Technical question ${i + 1} for ${job.level} ${job.title}`
          : `Behavioral question ${i + 1} for ${job.level} ${job.title}`,
        type: isTechnical ? 'technical' : 'behavioral',
        category: isTechnical ? 'algorithms' : 'communication',
        difficulty: difficulty,
        weight: isTechnical ? 2 : 1,
      });
    }
    return mockQuestions;
  }

  if (!groq) {
    throw new Error('Groq not configured. Set GROQ_API_KEY in .env or USE_MOCK_AI=true');
  }

  console.log('[QuestionGenerator] Generating questions with Groq for:', job.title);

  try {
    const response = await askGroq(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }

    const questions = JSON.parse(jsonMatch[0]);

    return questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      text: q.text,
      type: q.type || (q.category?.includes('technical') ? 'technical' : 'behavioral'),
      category: q.category || 'general',
      difficulty: q.difficulty || difficulty,
      weight: q.weight || (q.type === 'technical' ? 2 : 1),
    }));
  } catch (error) {
    console.error('[QuestionGenerator] Error generating questions:', error.message);
    const fallbackQuestions = [];
    for (let i = 0; i < numQuestions; i++) {
      const isTechnical = i < numTechnical;
      fallbackQuestions.push({
        id: `q${i + 1}`,
        text: isTechnical
          ? `Technical question ${i + 1} for ${job.level} ${job.title}`
          : `Behavioral question ${i + 1} for ${job.level} ${job.title}`,
        type: isTechnical ? 'technical' : 'behavioral',
        category: isTechnical ? 'algorithms' : 'communication',
        difficulty: difficulty,
        weight: isTechnical ? 2 : 1,
      });
    }
    return fallbackQuestions;
  }
}

export async function generatePracticeQuestions(options = {}) {
  const { level = 'Mid', numQuestions = 5 } = options;

  const prompt = `Generate ${numQuestions} general interview questions suitable for a ${level} level software engineer position.

Include a mix of technical and behavioral questions. Technical questions should be appropriate for ${level} level.

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "q1",
    "text": "Question text here",
    "type": "technical",
    "category": "algorithms",
    "difficulty": "medium",
    "weight": 2
  }
]`;

  if (USE_MOCK_AI) {
    console.log('[QuestionGenerator] Using mock mode for practice questions');
    const mockQuestions = [];
    for (let i = 0; i < numQuestions; i++) {
      const isTechnical = i % 2 === 0;
      mockQuestions.push({
        id: `q${i + 1}`,
        text: isTechnical
          ? `Practice technical question ${i + 1} for ${level} level`
          : `Practice behavioral question ${i + 1} for ${level} level`,
        type: isTechnical ? 'technical' : 'behavioral',
        category: isTechnical ? 'algorithms' : 'communication',
        difficulty: 'medium',
        weight: isTechnical ? 2 : 1,
      });
    }
    return mockQuestions;
  }

  if (!groq) {
    throw new Error('Groq not configured. Set GROQ_API_KEY in .env or USE_MOCK_AI=true');
  }

  console.log('[QuestionGenerator] Generating practice questions with Groq');

  try {
    const response = await askGroq(prompt, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }

    const questions = JSON.parse(jsonMatch[0]);

    return questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      text: q.text,
      type: q.type || 'behavioral',
      category: q.category || 'general',
      difficulty: q.difficulty || 'medium',
      weight: q.weight || (q.type === 'technical' ? 2 : 1),
    }));
  } catch (error) {
    console.error('[QuestionGenerator] Error generating practice questions:', error.message);
    const fallbackQuestions = [];
    for (let i = 0; i < numQuestions; i++) {
      const isTechnical = i % 2 === 0;
      fallbackQuestions.push({
        id: `q${i + 1}`,
        text: isTechnical
          ? `Practice technical question ${i + 1} for ${level} level`
          : `Practice behavioral question ${i + 1} for ${level} level`,
        type: isTechnical ? 'technical' : 'behavioral',
        category: isTechnical ? 'algorithms' : 'communication',
        difficulty: 'medium',
        weight: isTechnical ? 2 : 1,
      });
    }
    return fallbackQuestions;
  }
}

export default { generateQuestions, generatePracticeQuestions };
