import 'dotenv/config';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('❌ GROQ_API_KEY not found in .env');
  process.exit(1);
}

console.log('✓ API Key found:', apiKey.substring(0, 10) + '...');

const groq = new Groq({ apiKey });

console.log('\n📤 Sending test to Groq...\n');

const response = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: 'Say hello in one word' }],
});

console.log('✅ Response:', response.choices[0].message.content);