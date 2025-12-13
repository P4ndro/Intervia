import "dotenv/config";
import Groq from "groq-sdk";

const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

let groq = null;
if (!USE_MOCK_AI && process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function wordCountOf(text) {
  if (!text) return 0;
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function isNonAnswer(answer) {
  const a = String(answer || "").trim().toLowerCase();
  if (!a) return true;
  const bad = [
    "idk",
    "i dont know",
    "don't know",
    "dont know",
    "no idea",
    "idc",
    "whatever",
    "skip",
    "n/a",
    "na",
    "null",
  ];
  if (bad.includes(a)) return true;

  // Very short + not meaningful
  if (a.length <= 3) return true;

  return false;
}

function looksHostileOrUnprofessional(answer) {
  const a = String(answer || "").toLowerCase();
  // keep it simple; you can expand later
  return a.includes("idc") || a.includes("was hell") || a.includes("hate") || a.includes("stupid");
}

async function askGroq(prompt, options = {}) {
  if (!groq) {
    throw new Error("Groq not configured. Set GROQ_API_KEY in .env");
  }

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: options.temperature ?? 0.1,
    max_tokens: options.maxTokens ?? 700,
  });

  return response.choices[0].message.content;
}

function safeJsonExtract(text) {
  if (!text) return null;

  // Remove code fences if any
  const cleaned = String(text)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Try to extract first {...} block
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) return null;

  try {
    return JSON.parse(m[0]);
  } catch (_) {
    return null;
  }
}

function strictFallbackEvaluation(questionType, answer, isTechnical) {
  const wc = wordCountOf(answer);
  const nonAns = isNonAnswer(answer);
  const hostile = looksHostileOrUnprofessional(answer);

  if (nonAns || hostile) {
    return {
      relevanceScore: 0,
      clarityScore: hostile ? 0 : 10,
      depthScore: 0,
      technicalAccuracy: isTechnical ? 0 : null,
      feedback: "No valid answer was provided. This does not meet interview standards.",
      detectedIssues: ["Non-answer or unprofessional response"],
      strengths: [],
      keywords: [],
      confidence: 0.9,
    };
  }

  // Keyword-only / too short -> be fair but note it's brief
  if (wc < 8) {
    return {
      relevanceScore: 40,
      clarityScore: 35,
      depthScore: 30,
      technicalAccuracy: isTechnical ? 35 : null,
      feedback:
        "Your answer is brief but shows you're thinking about the question. To improve, try adding more detail: explain your approach, provide a concrete example, and discuss any trade-offs or considerations.",
      detectedIssues: ["Answer could be more detailed"],
      strengths: [],
      keywords: [],
      confidence: 0.6,
    };
  }

  // Default mid-low fallback
  return {
    relevanceScore: 50,
    clarityScore: 45,
    depthScore: 40,
    technicalAccuracy: isTechnical ? 45 : null,
    feedback:
      "Your answer addresses the question. To make it stronger, consider adding more structure, specific examples, and discussing trade-offs or edge cases where relevant.",
    detectedIssues: ["Could add more depth"],
    strengths: [],
    keywords: [],
    confidence: 0.5,
  };
}

export async function evaluateAnswer(question, answer, job = null) {
  const isTechnical = question.type === "technical";

  // Strict: don't call AI for empty/skipped/not-answered
  const normalized = String(answer || "").trim();
  if (!normalized || normalized === "[SKIPPED]" || normalized === "[NOT ANSWERED]") {
    return {
      relevanceScore: 0,
      clarityScore: 0,
      depthScore: 0,
      technicalAccuracy: isTechnical ? 0 : null,
      feedback: "No answer provided.",
      detectedIssues: ["No answer"],
      strengths: [],
      keywords: [],
      confidence: 1.0,
    };
  }

  if (USE_MOCK_AI) {
    console.log("[AnswerEvaluator] Using mock evaluation");
    const wc = wordCountOf(normalized);
    const score = clamp(Math.floor(wc / 6) + 30, 0, 100);
    return {
      relevanceScore: score,
      clarityScore: score,
      depthScore: score,
      technicalAccuracy: isTechnical ? score : null,
      feedback: "Mock evaluation - enable real AI for detailed feedback",
      detectedIssues: wc < 30 ? ["Answer too brief"] : [],
      strengths: wc >= 50 ? ["Good detail"] : [],
      keywords: [],
      confidence: 0.5,
    };
  }

  if (!groq) {
    throw new Error("Groq not configured. Set GROQ_API_KEY in .env or USE_MOCK_AI=true");
  }

  console.log("[AnswerEvaluator] Evaluating answer with Groq for:", question.id);

  const prompt = `You are a helpful and encouraging interview evaluator. Your goal is to provide constructive feedback that helps the candidate improve.

Question (${question.type}): "${question.text}"
Candidate Answer: "${normalized}"
${job ? `Job Context: ${job.level} ${job.title}` : ""}

EVALUATION GUIDELINES:
- Base your evaluation ONLY on what's in the answer text. Don't assume information that isn't there.
- Be fair and balanced - recognize effort and what the candidate did well, while also providing helpful improvement suggestions.
- For very short answers, acknowledge they're brief but don't penalize too harshly - focus on what they can add.
- For technical questions: if the answer shows understanding even if incomplete, give credit for what's correct.
- Be encouraging and constructive in your feedback.

SCORING RUBRIC (0-100) - Be fair and balanced:
- relevanceScore:
  0-20 = doesn't address the question
  30-50 = somewhat related, partially addresses it
  60-75 = addresses the question well
  80-90 = fully addresses with good relevance
  95+ = excellent, fully addresses with strong connection
- clarityScore:
  0-30 = unclear or hard to follow
  40-60 = somewhat clear but could be better structured
  70-85 = clear and well-structured
  90+ = very clear, easy to follow
- depthScore:
  0-30 = minimal detail or keywords only
  40-60 = some detail, covers basics
  70-85 = good detail, covers the approach
  90+ = excellent depth, thorough explanation
- technicalAccuracy (TECHNICAL only):
  0-30 = incorrect or problematic
  40-60 = partially correct or uncertain
  70-85 = mostly correct with minor gaps
  90+ = correct and well-justified
(Behavioral: output technicalAccuracy as 0 in JSON; server will convert to null.)

OUTPUT REQUIREMENTS:
Return ONLY valid JSON. No markdown, no commentary.
Feedback must be a single JSON string; use \\n for line breaks.

Return this exact JSON structure:
{
  "relevanceScore": 0,
  "clarityScore": 0,
  "depthScore": 0,
  "technicalAccuracy": ${isTechnical ? "0" : "0"},
  "feedback": "Start with what the candidate did well. Then provide constructive suggestions for improvement. Be encouraging. Use \\n for formatting.",
  "detectedIssues": ["..."],
  "strengths": ["..."],
  "keywords": ["..."],
  "confidence": 0.0
}

IMPORTANT:
- For very short answers (< 8 words), be fair but note they could be more detailed. depthScore should reflect this but don't be too harsh.
- If answer is hostile/unprofessional (e.g., insults, 'idc'), set relevanceScore = 0, clarityScore <= 10, depthScore = 0.
- For clearly incorrect technical answers, adjust technicalAccuracy accordingly, but still be constructive in feedback.
`;

  try {
    const response = await askGroq(prompt, { temperature: 0.1, maxTokens: 900 });
    const parsed = safeJsonExtract(response);

    if (!parsed) {
      console.error("[AnswerEvaluator] AI response not valid JSON, using strict fallback.");
      return strictFallbackEvaluation(question.type, normalized, isTechnical);
    }

    const relevanceScore = clamp(Number(parsed.relevanceScore ?? 0), 0, 100);
    const clarityScore = clamp(Number(parsed.clarityScore ?? 0), 0, 100);
    const depthScore = clamp(Number(parsed.depthScore ?? 0), 0, 100);

    let technicalAccuracy = null;
    if (isTechnical) technicalAccuracy = clamp(Number(parsed.technicalAccuracy ?? 0), 0, 100);

    // Enforce strictness in code too:
    const wc = wordCountOf(normalized);
    if (isNonAnswer(normalized) || looksHostileOrUnprofessional(normalized)) {
      return {
        relevanceScore: 0,
        clarityScore: Math.min(10, clarityScore),
        depthScore: 0,
        technicalAccuracy: isTechnical ? 0 : null,
        feedback: "No valid answer was provided. This does not meet interview standards.",
        detectedIssues: ["Non-answer or unprofessional response"],
        strengths: [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        confidence: 0.9,
      };
    }
    if (wc < 8) {
      // force low depth for too-short answers
      return {
        relevanceScore: Math.min(40, relevanceScore),
        clarityScore,
        depthScore: Math.min(35, depthScore),
        technicalAccuracy: isTechnical ? Math.min(50, technicalAccuracy ?? 0) : null,
        feedback: String(parsed.feedback || "").trim() || "Your answer is brief. Consider adding more detail and examples to strengthen your response.",
        detectedIssues: Array.isArray(parsed.detectedIssues) ? parsed.detectedIssues : ["Answer too brief"],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        confidence: clamp(Number(parsed.confidence ?? 0.5), 0, 1),
      };
    }

    return {
      relevanceScore,
      clarityScore,
      depthScore,
      technicalAccuracy,
      feedback: String(parsed.feedback || "").trim(),
      detectedIssues: Array.isArray(parsed.detectedIssues) ? parsed.detectedIssues : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      confidence: clamp(Number(parsed.confidence ?? 0.5), 0, 1),
    };
  } catch (error) {
    console.error("[AnswerEvaluator] Error:", error.message);
    return strictFallbackEvaluation(question.type, normalized, isTechnical);
  }
}

export async function evaluateAnswers(questionAnswerPairs, job = null) {
  const evaluations = [];

  for (const pair of questionAnswerPairs) {
    try {
      const evaluation = await evaluateAnswer(pair.question, pair.answer, job);
      evaluations.push({
        questionId: pair.question.id,
        ...evaluation,
      });
    } catch (error) {
      console.error(`Error evaluating answer for question ${pair.question.id}:`, error);
      evaluations.push({
        questionId: pair.question.id,
        relevanceScore: 0,
        clarityScore: 0,
        depthScore: 0,
        technicalAccuracy: pair.question.type === "technical" ? 0 : null,
        feedback: "Evaluation failed - treated as 0 due to strict mode.",
        detectedIssues: ["Evaluation failed"],
        strengths: [],
        keywords: [],
        confidence: 0.2,
        error: error.message,
      });
    }
  }

  return evaluations;
}

export default { evaluateAnswer, evaluateAnswers };
