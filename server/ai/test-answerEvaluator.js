import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateAnswer } from './answerEvaluator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

console.log('🧪 Testing Answer Evaluator...\n');

// Test 1: Technical question
console.log('Test 1: Evaluating technical answer');
console.log('─'.repeat(50));

const technicalQuestion = {
  id: 'q1',
  text: 'How would you optimize a slow database query?',
  type: 'technical',
  category: 'databases',
  difficulty: 'medium',
  weight: 2,
};

const technicalAnswer = `I would first analyze the query execution plan to identify bottlenecks. Then I'd add appropriate indexes on columns used in WHERE clauses and JOINs. I'd also consider query rewriting to avoid full table scans. For example, if we're filtering by date, I'd use a date index. If the query involves multiple tables, I'd ensure foreign key indexes are in place.`;

try {
  const evaluation = await evaluateAnswer(technicalQuestion, technicalAnswer);
  
  console.log('✅ Evaluation Result:\n');
  console.log(`Relevance Score: ${evaluation.relevanceScore}/100`);
  console.log(`Clarity Score: ${evaluation.clarityScore}/100`);
  console.log(`Depth Score: ${evaluation.depthScore}/100`);
  console.log(`Technical Accuracy: ${evaluation.technicalAccuracy}/100`);
  console.log(`Confidence: ${evaluation.confidence}`);
  console.log(`\nFeedback:\n${evaluation.feedback}`);
  console.log(`\nStrengths: ${evaluation.strengths.join(', ')}`);
  console.log(`Issues: ${evaluation.detectedIssues.join(', ')}`);
  console.log(`Keywords: ${evaluation.keywords.join(', ')}`);
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n' + '─'.repeat(50) + '\n');

// Test 2: Behavioral question
console.log('Test 2: Evaluating behavioral answer');
console.log('─'.repeat(50));

const behavioralQuestion = {
  id: 'q2',
  text: 'Tell me about a time you had to debug a difficult production issue.',
  type: 'behavioral',
  category: 'communication',
  difficulty: 'medium',
  weight: 1,
};

const behavioralAnswer = `At my previous job, we had a production issue where users couldn't log in. I started by checking the error logs and found it was a database connection timeout. I worked with the team to identify that a recent deployment had changed connection pool settings. We rolled back the change and implemented better monitoring.`;

try {
  const evaluation = await evaluateAnswer(behavioralQuestion, behavioralAnswer);
  
  console.log('✅ Evaluation Result:\n');
  console.log(`Relevance Score: ${evaluation.relevanceScore}/100`);
  console.log(`Clarity Score: ${evaluation.clarityScore}/100`);
  console.log(`Depth Score: ${evaluation.depthScore}/100`);
  console.log(`Technical Accuracy: ${evaluation.technicalAccuracy} (null for behavioral)`);
  console.log(`Confidence: ${evaluation.confidence}`);
  console.log(`\nFeedback:\n${evaluation.feedback}`);
  console.log(`\nStrengths: ${evaluation.strengths.join(', ')}`);
  console.log(`Issues: ${evaluation.detectedIssues.join(', ')}`);
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n' + '─'.repeat(50));
console.log('\n✅ Test complete!');

