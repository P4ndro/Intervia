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
  console.log('[QuestionGenerator] ✅ AI Mode: Groq API configured and ready');
} else if (USE_MOCK_AI) {
  console.log('[QuestionGenerator] ⚠️ MOCK Mode: Using mock questions (USE_MOCK_AI=true)');
} else {
  console.log('[QuestionGenerator] ❌ ERROR: No GROQ_API_KEY found and USE_MOCK_AI is not set to true');
  console.log('[QuestionGenerator]    Set GROQ_API_KEY in .env or USE_MOCK_AI=true');
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
     - 2 technical questions (type = "technical")
     - 2 coding questions (type = "coding")
  3) IDs must be: q1, q2, q3, q4, q5 (in the same order as the categories below).
  4) Order MUST be:
     q1 = behavioral
     q2 = technical
     q3 = technical
     q4 = coding
     q5 = coding
  5) Weight rules:
     - behavioral weight = 1
     - technical weight = 2
     - coding weight = 3
  6) Difficulty must match: ${difficulty}
  7) Questions must be specific to this role/level and not generic.
  8) ALL questions must be ANSWERABLE IN 5 MINUTES OR LESS. Keep them concise and focused.
  
  DEFINITIONS:
  - behavioral: Simple, clear question about collaboration/communication/leadership. Should be answerable in 2-3 minutes. Example: "Tell me about a time when you had to work with a difficult team member. What was the situation and how did you handle it?"
  - technical: Simple technical question that can be answered in 3-5 minutes. Focus on practical knowledge relevant to ${job.title}. Examples: "What is the difference between SQL and NoSQL databases? When would you use each?", "Explain REST API principles in simple terms.", "What is the difference between authentication and authorization?" Keep it concise - 1-2 sentences for the question, no long scenarios.
  - coding: SIMPLE coding problem that can be solved in 5 minutes. MUST be beginner to intermediate level. Examples: "Write a function to reverse a string", "Find the maximum number in an array", "Check if a string is a palindrome". MUST include:
    - Clear, simple problem statement (1-2 sentences)
    - Input/output example with one test case
    - Simple constraints (if any)
    - NO complex algorithms, NO system design, NO advanced data structures
  
  CATEGORY FIELD RULES:
  - behavioral categories: "communication" or "leadership" or "teamwork"
  - technical categories: "algorithms" or "databases" or "networks" or "security" or "api-design" or "programming-concepts"
  - coding categories: "coding"
  
  Return ONLY this JSON array format:
  [
    {
      "id": "q1",
      "text": "Simple behavioral question answerable in 2-3 minutes",
      "type": "behavioral",
      "category": "communication",
      "difficulty": "${difficulty}",
      "weight": 1
    },
    {
      "id": "q2",
      "text": "Simple technical question answerable in 3-5 minutes",
      "type": "technical",
      "category": "algorithms",
      "difficulty": "${difficulty}",
      "weight": 2
    },
    {
      "id": "q3",
      "text": "Simple technical question answerable in 3-5 minutes",
      "type": "technical",
      "category": "databases",
      "difficulty": "${difficulty}",
      "weight": 2
    },
    {
      "id": "q4",
      "text": "Simple coding problem with example. Must be solvable in 5 minutes. Example: Write a function that takes an array of numbers and returns the sum. Input: [1, 2, 3], Output: 6",
      "type": "coding",
      "category": "coding",
      "difficulty": "${difficulty}",
      "weight": 3
    },
    {
      "id": "q5",
      "text": "Simple coding problem with example. Must be solvable in 5 minutes. Example: Write a function that checks if a number is even. Input: 4, Output: true",
      "type": "coding",
      "category": "coding",
      "difficulty": "${difficulty}",
      "weight": 3
    }
  ]
  
  CRITICAL REMINDERS:
  - ALL questions must be answerable in 5 minutes or less
  - Coding questions MUST be simple - like "reverse a string", "find max in array", "check palindrome" - NOT complex algorithms
  - Technical questions should be straightforward explanations, not complex scenarios
  - Keep questions concise and focused - no long paragraphs
  - Make sure q4 and q5 are ACTUALLY coding questions (type = "coding")
  - Questions should be appropriate for ${job.level} level ${job.title} position
  `;
  

  if (USE_MOCK_AI) {
    console.log('[QuestionGenerator] Using mock mode - returning basic questions');
    // Return basic mock questions structure matching the new format - simple 5-minute questions
    const mockQuestions = [
      {
        id: 'q1',
        text: `Tell me about a time when you had to work with a difficult team member. What was the situation and how did you handle it?`,
        type: 'behavioral',
        category: 'communication',
        difficulty: difficulty,
        weight: 1,
      },
      {
        id: 'q2',
        text: `What is the difference between SQL and NoSQL databases? When would you use each?`,
        type: 'technical',
        category: 'databases',
        difficulty: difficulty,
        weight: 2,
      },
      {
        id: 'q3',
        text: `Explain REST API principles in simple terms. What makes an API RESTful?`,
        type: 'technical',
        category: 'api-design',
        difficulty: difficulty,
        weight: 2,
      },
      {
        id: 'q4',
        text: `Write a function that takes an array of numbers and returns the sum of all numbers. Example: Input: [1, 2, 3, 4], Output: 10`,
        type: 'coding',
        category: 'coding',
        difficulty: difficulty,
        weight: 3,
      },
      {
        id: 'q5',
        text: `Write a function that checks if a string is a palindrome (reads the same forwards and backwards). Example: Input: "racecar", Output: true. Input: "hello", Output: false`,
        type: 'coding',
        category: 'coding',
        difficulty: difficulty,
        weight: 3,
      },
    ];
    return mockQuestions;
  }

  if (!groq) {
    console.error('[QuestionGenerator] ❌ Groq not configured. Set GROQ_API_KEY in .env or USE_MOCK_AI=true');
    throw new Error('Groq not configured. Set GROQ_API_KEY in .env or USE_MOCK_AI=true');
  }

  console.log('[QuestionGenerator] 🤖 Using AI (Groq) to generate questions for:', job.title);
  console.log('[QuestionGenerator] 📋 Expected format: 1 behavioral, 2 technical, 2 coding');

  try {
    const response = await askGroq(prompt, {
      temperature: 0.7,
      maxTokens: 2500, // Increased for better responses
    });

    console.log('[QuestionGenerator] ✅ Received AI response, parsing...');

    // Try to extract JSON from response (handle markdown code blocks)
    let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = response.match(/```\s*([\s\S]*?)\s*```/);
    }
    if (!jsonMatch) {
      jsonMatch = response.match(/\[[\s\S]*\]/);
    }
    
    if (!jsonMatch) {
      console.error('[QuestionGenerator] ❌ No JSON found in AI response');
      console.error('[QuestionGenerator] Response preview:', response.substring(0, 200));
      throw new Error('AI response is not valid JSON. Response: ' + response.substring(0, 100));
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const questions = JSON.parse(jsonText);

    console.log(`[QuestionGenerator] ✅ Parsed ${questions.length} questions from AI`);

    // Validate questions format
    if (!Array.isArray(questions) || questions.length !== 5) {
      console.warn(`[QuestionGenerator] ⚠️ Expected 5 questions, got ${questions.length}`);
    }

    // Validate question types
    const types = questions.map(q => q.type);
    const hasBehavioral = types.includes('behavioral');
    const hasTechnical = types.filter(t => t === 'technical').length >= 2;
    const hasCoding = types.filter(t => t === 'coding').length >= 2;

    if (!hasBehavioral || !hasTechnical || !hasCoding) {
      console.warn('[QuestionGenerator] ⚠️ Question types validation:');
      console.warn(`  - Behavioral: ${hasBehavioral}`);
      console.warn(`  - Technical (2+): ${hasTechnical}`);
      console.warn(`  - Coding (2+): ${hasCoding}`);
      console.warn(`  - Actual types: ${types.join(', ')}`);
    }

    const mappedQuestions = questions.map((q, index) => {
      // Ensure proper type mapping
      let questionType = q.type;
      if (!questionType) {
        // Infer from category or default
        if (q.category === 'coding') questionType = 'coding';
        else if (q.category?.includes('technical') || q.category?.includes('algorithm')) questionType = 'technical';
        else questionType = 'behavioral';
      }

      return {
        id: q.id || `q${index + 1}`,
        text: q.text || '',
        type: questionType,
        category: q.category || 'general',
        difficulty: q.difficulty || difficulty,
        weight: q.weight || (questionType === 'coding' ? 3 : questionType === 'technical' ? 2 : 1),
      };
    });

    console.log('[QuestionGenerator] ✅ Successfully generated questions with AI:');
    mappedQuestions.forEach((q, idx) => {
      console.log(`  ${idx + 1}. [${q.type}] ${q.text.substring(0, 60)}...`);
    });

    return mappedQuestions;
  } catch (error) {
    console.error('[QuestionGenerator] ❌ Error generating questions with AI:', error.message);
    console.error('[QuestionGenerator] Stack:', error.stack);
    console.error('[QuestionGenerator] Falling back to mock questions...');
    // Fallback to basic mock questions on error - matching exact format: 1 behavioral, 2 technical, 2 coding (simple 5-minute questions)
    const fallbackQuestions = [
      {
        id: 'q1',
        text: `Tell me about a time when you had to work with a difficult team member. What was the situation and how did you handle it?`,
        type: 'behavioral',
        category: 'communication',
        difficulty: difficulty,
        weight: 1,
      },
      {
        id: 'q2',
        text: `What is the difference between SQL and NoSQL databases? When would you use each?`,
        type: 'technical',
        category: 'databases',
        difficulty: difficulty,
        weight: 2,
      },
      {
        id: 'q3',
        text: `Explain REST API principles in simple terms. What makes an API RESTful?`,
        type: 'technical',
        category: 'api-design',
        difficulty: difficulty,
        weight: 2,
      },
      {
        id: 'q4',
        text: `Write a function that takes an array of numbers and returns the sum of all numbers. Example: Input: [1, 2, 3, 4], Output: 10`,
        type: 'coding',
        category: 'coding',
        difficulty: difficulty,
        weight: 3,
      },
      {
        id: 'q5',
        text: `Write a function that checks if a string is a palindrome (reads the same forwards and backwards). Example: Input: "racecar", Output: true. Input: "hello", Output: false`,
        type: 'coding',
        category: 'coding',
        difficulty: difficulty,
        weight: 3,
      },
    ];
    return fallbackQuestions;
  }
}

export async function generatePracticeQuestions(options = {}) {
  const { level = 'Mid', numQuestions = 5 } = options;

  const prompt = `You are an expert technical recruiter and interviewer.

  Generate EXACTLY ${numQuestions} interview questions for a ${level} level software engineer position (practice interview).
  
  CRITICAL REQUIREMENTS (must follow exactly):
  1) Output MUST be ONLY a valid JSON array. No markdown. No extra text.
  2) Generate exactly:
     - 1 behavioral question (type = "behavioral")
     - 2 technical questions (type = "technical")
     - 2 coding questions (type = "coding")
  3) IDs must be: q1, q2, q3, q4, q5 (in the same order as the categories below).
  4) Order MUST be:
     q1 = behavioral
     q2 = technical
     q3 = technical
     q4 = coding
     q5 = coding
  5) Weight rules:
     - behavioral weight = 1
     - technical weight = 2
     - coding weight = 3
  6) ALL questions must be ANSWERABLE IN 5 MINUTES OR LESS. Keep them concise and focused.
  
  DEFINITIONS:
  - behavioral: Simple, clear question about collaboration/communication/leadership. Should be answerable in 2-3 minutes.
  - technical: Simple technical question that can be answered in 3-5 minutes. Focus on practical knowledge.
  - coding: SIMPLE coding problem that can be solved in 5 minutes. MUST be beginner to intermediate level. Examples: "Write a function to reverse a string", "Find the maximum number in an array", "Check if a string is a palindrome". MUST include input/output example.
  
  Return ONLY this JSON array format:
  [
    {
      "id": "q1",
      "text": "Simple behavioral question answerable in 2-3 minutes",
      "type": "behavioral",
      "category": "communication",
      "difficulty": "medium",
      "weight": 1
    },
    {
      "id": "q2",
      "text": "Simple technical question answerable in 3-5 minutes",
      "type": "technical",
      "category": "algorithms",
      "difficulty": "medium",
      "weight": 2
    },
    {
      "id": "q3",
      "text": "Simple technical question answerable in 3-5 minutes",
      "type": "technical",
      "category": "databases",
      "difficulty": "medium",
      "weight": 2
    },
    {
      "id": "q4",
      "text": "Simple coding problem with example. Must be solvable in 5 minutes.",
      "type": "coding",
      "category": "coding",
      "difficulty": "medium",
      "weight": 3
    },
    {
      "id": "q5",
      "text": "Simple coding problem with example. Must be solvable in 5 minutes.",
      "type": "coding",
      "category": "coding",
      "difficulty": "medium",
      "weight": 3
    }
  ]`;

  if (USE_MOCK_AI) {
    console.log('[QuestionGenerator] Using mock mode for practice questions');
    // Return basic mock practice questions matching the new format
    const mockQuestions = [
      {
        id: 'q1',
        text: `Tell me about a time when you had to work with a difficult team member. What was the situation and how did you handle it?`,
        type: 'behavioral',
        category: 'communication',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'q2',
        text: `What is the difference between SQL and NoSQL databases? When would you use each?`,
        type: 'technical',
        category: 'databases',
        difficulty: 'medium',
        weight: 2,
      },
      {
        id: 'q3',
        text: `Explain REST API principles in simple terms. What makes an API RESTful?`,
        type: 'technical',
        category: 'api-design',
        difficulty: 'medium',
        weight: 2,
      },
      {
        id: 'q4',
        text: `Write a function that takes an array of numbers and returns the sum of all numbers. Example: Input: [1, 2, 3, 4], Output: 10`,
        type: 'coding',
        category: 'coding',
        difficulty: 'medium',
        weight: 3,
      },
      {
        id: 'q5',
        text: `Write a function that checks if a string is a palindrome (reads the same forwards and backwards). Example: Input: "racecar", Output: true. Input: "hello", Output: false`,
        type: 'coding',
        category: 'coding',
        difficulty: 'medium',
        weight: 3,
      },
    ];
    return mockQuestions;
  }

  if (!groq) {
    console.error('[QuestionGenerator] ❌ Groq not configured. Set GROQ_API_KEY in .env or USE_MOCK_AI=true');
    throw new Error('Groq not configured. Set GROQ_API_KEY in .env or USE_MOCK_AI=true');
  }

  console.log('[QuestionGenerator] 🤖 Using AI (Groq) to generate practice questions');
  console.log('[QuestionGenerator] 📋 Expected format: 1 behavioral, 2 technical, 2 coding');

  try {
    const response = await askGroq(prompt, {
      temperature: 0.7,
      maxTokens: 2500, // Increased for better responses
    });

    console.log('[QuestionGenerator] ✅ Received AI response, parsing...');

    // Try to extract JSON from response (handle markdown code blocks)
    let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = response.match(/```\s*([\s\S]*?)\s*```/);
    }
    if (!jsonMatch) {
      jsonMatch = response.match(/\[[\s\S]*\]/);
    }
    
    if (!jsonMatch) {
      console.error('[QuestionGenerator] ❌ No JSON found in AI response');
      console.error('[QuestionGenerator] Response preview:', response.substring(0, 200));
      throw new Error('AI response is not valid JSON. Response: ' + response.substring(0, 100));
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const questions = JSON.parse(jsonText);

    console.log(`[QuestionGenerator] ✅ Parsed ${questions.length} questions from AI`);

    // Validate questions format
    if (!Array.isArray(questions) || questions.length !== 5) {
      console.warn(`[QuestionGenerator] ⚠️ Expected 5 questions, got ${questions.length}`);
    }

    // Validate question types
    const types = questions.map(q => q.type);
    const hasBehavioral = types.includes('behavioral');
    const hasTechnical = types.filter(t => t === 'technical').length >= 2;
    const hasCoding = types.filter(t => t === 'coding').length >= 2;

    if (!hasBehavioral || !hasTechnical || !hasCoding) {
      console.warn('[QuestionGenerator] ⚠️ Question types validation:');
      console.warn(`  - Behavioral: ${hasBehavioral}`);
      console.warn(`  - Technical (2+): ${hasTechnical}`);
      console.warn(`  - Coding (2+): ${hasCoding}`);
      console.warn(`  - Actual types: ${types.join(', ')}`);
    }

    const mappedQuestions = questions.map((q, index) => {
      // Ensure proper type mapping
      let questionType = q.type;
      if (!questionType) {
        // Infer from category or default
        if (q.category === 'coding') questionType = 'coding';
        else if (q.category?.includes('technical') || q.category?.includes('algorithm')) questionType = 'technical';
        else questionType = 'behavioral';
      }

      return {
        id: q.id || `q${index + 1}`,
        text: q.text || '',
        type: questionType,
        category: q.category || 'general',
        difficulty: q.difficulty || 'medium',
        weight: q.weight || (questionType === 'coding' ? 3 : questionType === 'technical' ? 2 : 1),
      };
    });

    console.log('[QuestionGenerator] ✅ Successfully generated practice questions with AI:');
    mappedQuestions.forEach((q, idx) => {
      console.log(`  ${idx + 1}. [${q.type}] ${q.text.substring(0, 60)}...`);
    });

    return mappedQuestions;
  } catch (error) {
    console.error('[QuestionGenerator] ❌ Error generating practice questions with AI:', error.message);
    console.error('[QuestionGenerator] Stack:', error.stack);
    console.error('[QuestionGenerator] Falling back to mock questions...');
    // Fallback to basic mock questions on error - matching exact format: 1 behavioral, 2 technical, 2 coding
    const fallbackQuestions = [
      {
        id: 'q1',
        text: `Tell me about a time when you had to work with a difficult team member. What was the situation and how did you handle it?`,
        type: 'behavioral',
        category: 'communication',
        difficulty: 'medium',
        weight: 1,
      },
      {
        id: 'q2',
        text: `What is the difference between SQL and NoSQL databases? When would you use each?`,
        type: 'technical',
        category: 'databases',
        difficulty: 'medium',
        weight: 2,
      },
      {
        id: 'q3',
        text: `Explain REST API principles in simple terms. What makes an API RESTful?`,
        type: 'technical',
        category: 'api-design',
        difficulty: 'medium',
        weight: 2,
      },
      {
        id: 'q4',
        text: `Write a function that takes an array of numbers and returns the sum of all numbers. Example: Input: [1, 2, 3, 4], Output: 10`,
        type: 'coding',
        category: 'coding',
        difficulty: 'medium',
        weight: 3,
      },
      {
        id: 'q5',
        text: `Write a function that checks if a string is a palindrome (reads the same forwards and backwards). Example: Input: "racecar", Output: true. Input: "hello", Output: false`,
        type: 'coding',
        category: 'coding',
        difficulty: 'medium',
        weight: 3,
      },
    ];
    return fallbackQuestions;
  }
}

export default { generateQuestions, generatePracticeQuestions };
