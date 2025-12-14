import 'dotenv/config';
import Groq from 'groq-sdk';

/**
 * AI Question Generator Service
 * 
 * Generates interview questions based on job description and requirements.
 * 
 * Usage:
 *   import { generateQuestions } from './ai/questionGenerator.js';
 *   const questions = await generateQuestions(job, config);
 */

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

  const prompt = `You are an expert technical recruiter and interviewer.

  Generate EXACTLY ${numQuestions} interview questions for a ${job.level} ${job.title} position.
  
  Job Description:
  ${job.description}
  
  CRITICAL REQUIREMENTS (must follow exactly):
  1) Output MUST be ONLY a valid JSON array. No markdown. No extra text.
  2) Generate exactly:
     - 1 behavioral question (type = "behavioral")
     - 2 theoretical computer science questions (type = "theoretical")
     - 2 coding questions (type = "coding")
  3) IDs must be: q1, q2, q3, q4, q5 (in the same order as the categories below).
  4) Order MUST be:
     q1 = behavioral
     q2 = theoretical
     q3 = theoretical
     q4 = coding
     q5 = coding
  5) Weight rules:
     - behavioral weight = 1
     - theoretical weight = 2
     - coding weight = 3
  6) Difficulty must match: ${difficulty}
  7) Questions must be specific to this role/level and not generic.
  
  DEFINITIONS:
  - behavioral: must assess collaboration/communication/leadership; should be answerable via STAR.
  - theoretical: must test core CS knowledge WITHOUT asking to write code. Examples: time/space complexity, data structures trade-offs, concurrency concepts, networking, OS fundamentals, databases theory.
  - coding: must require writing code. Include:
    - a clear problem statement
    - input/output description
    - constraints
    - at least 2 example test cases with expected output
    - specify the expected time complexity target (e.g., O(n log n))
  
  CATEGORY FIELD RULES:
  - behavioral categories: "communication" or "leadership" or "teamwork"
  - theoretical categories: "data-structures" or "algorithms" or "operating-systems" or "networks" or "databases" or "concurrency"
  - coding categories: "coding"
  
  Return ONLY this JSON array format:
  [
    {
      "id": "q1",
      "text": "Full question text here",
      "type": "behavioral",
      "category": "communication",
      "difficulty": "${difficulty}",
      "weight": 1
    },
    {
      "id": "q2",
      "text": "Full question text here",
      "type": "theoretical",
      "category": "algorithms",
      "difficulty": "${difficulty}",
      "weight": 2
    },
    {
      "id": "q3",
      "text": "Full question text here",
      "type": "theoretical",
      "category": "databases",
      "difficulty": "${difficulty}",
      "weight": 2
    },
    {
      "id": "q4",
      "text": "Coding question with constraints + examples",
      "type": "coding",
      "category": "coding",
      "difficulty": "${difficulty}",
      "weight": 3
    },
    {
      "id": "q5",
      "text": "Coding question with constraints + examples",
      "type": "coding",
      "category": "coding",
      "difficulty": "${difficulty}",
      "weight": 3
    }
  ]
  
  IMPORTANT:
  - Do not duplicate topics between q2 and q3.
  - Coding questions must be solvable in an interview setting (not huge projects).
  - Avoid trivia; focus on fundamentals and practical reasoning.
  `;
  

  if (USE_MOCK_AI) {
    console.log('[QuestionGenerator] Using mock mode - returning basic questions');
    // Return basic mock questions structure matching the new format
    const mockQuestions = [
      {
        id: 'q1',
        text: `Tell me about a time when you had to work with a difficult team member. How did you handle the situation?`,
        type: 'behavioral',
        category: 'communication',
        difficulty: difficulty,
        weight: 1,
      },
      {
        id: 'q2',
        text: `Explain the time complexity of a binary search tree operation and compare it to a hash table lookup.`,
        type: 'theoretical',
        category: 'algorithms',
        difficulty: difficulty,
        weight: 2,
      },
      {
        id: 'q3',
        text: `What are the ACID properties in database transactions? Explain each one briefly.`,
        type: 'theoretical',
        category: 'databases',
        difficulty: difficulty,
        weight: 2,
      },
      {
        id: 'q4',
        text: `Write a function to find the maximum element in an array. Include input/output description and test cases.`,
        type: 'coding',
        category: 'coding',
        difficulty: difficulty,
        weight: 3,
      },
      {
        id: 'q5',
        text: `Implement a function to reverse a linked list. Provide constraints and example test cases.`,
        type: 'coding',
        category: 'coding',
        difficulty: difficulty,
        weight: 3,
      },
    ];
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
    // Fallback to basic mock questions on error
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
    // Return basic mock practice questions
    const mockQuestions = [];
    for (let i = 0; i < numQuestions; i++) {
      const isTechnical = i % 2 === 0; // Alternate between technical and behavioral
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
    // Fallback to basic mock questions on error
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
