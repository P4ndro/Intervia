import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateQuestions, generatePracticeQuestions } from './questionGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force-load server/.env even when running from server/ai
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

console.log('🧪 Testing Question Generator...\n');

// Test 1: Generate job-specific questions
console.log('Test 1: Generating job-specific questions');
console.log('─'.repeat(50));

const testJob = {
  title: 'Software Engineer',
  level: 'Mid',
  description: 'We are looking for a mid-level software engineer with experience in React, Node.js, and MongoDB. The candidate should have strong problem-solving skills and be able to work in a fast-paced environment.'
};

try {
  const questions = await generateQuestions(testJob, {
    numQuestions: 3,
    technicalRatio: 0.6,
    difficulty: 'medium'
  });

  console.log(`✅ Generated ${questions.length} questions:\n`);
  questions.forEach((q, i) => {
    console.log(`${i + 1}. [${q.type.toUpperCase()}] ${q.text}`);
    console.log(`   Category: ${q.category}, Difficulty: ${q.difficulty}, Weight: ${q.weight}\n`);
  });
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n' + '─'.repeat(50) + '\n');

// Test 2: Generate practice questions
console.log('Test 2: Generating practice questions');
console.log('─'.repeat(50));

try {
  const practiceQuestions = await generatePracticeQuestions({
    level: 'Mid',
    numQuestions: 3
  });

  console.log(`✅ Generated ${practiceQuestions.length} practice questions:\n`);
  practiceQuestions.forEach((q, i) => {
    console.log(`${i + 1}. [${q.type.toUpperCase()}] ${q.text}`);
    console.log(`   Category: ${q.category}, Difficulty: ${q.difficulty}, Weight: ${q.weight}\n`);
  });
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('─'.repeat(50));
console.log('\n✅ Test complete!');

