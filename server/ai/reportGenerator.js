// server/ai/reportGenerator.js
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

async function askGroq(prompt, options = {}) {
  if (!groq) {
    throw new Error("Groq not configured. Set GROQ_API_KEY in .env");
  }

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: options.temperature ?? 0.1,
    max_tokens: options.maxTokens ?? 1200,
  });

  return response.choices[0].message.content;
}

function safeJsonExtract(text) {
  if (!text) return null;

  const cleaned = String(text)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) return null;

  try {
    return JSON.parse(m[0]);
  } catch (_) {
    return null;
  }
}

function computeScores(answersWithEvaluations) {
  const perQuestion = answersWithEvaluations.map((item) => {
    const w = clamp(Number(item.weight || 1), 1, 10);
    const ev = item.evaluation;

    // strict: missing eval => 0
    if (!ev) {
      return { questionId: item.questionId, type: item.questionType, weight: w, score: 0 };
    }

    const rel = clamp(ev.relevanceScore ?? 0, 0, 100);
    const cla = clamp(ev.clarityScore ?? 0, 0, 100);
    const dep = clamp(ev.depthScore ?? 0, 0, 100);

    let score;
    if (item.questionType === "technical") {
      const tech = clamp(ev.technicalAccuracy ?? 0, 0, 100);
      // strict weighting: correctness + depth matter most
      score = 0.35 * tech + 0.25 * dep + 0.20 * rel + 0.20 * cla;
    } else {
      score = 0.40 * rel + 0.30 * cla + 0.30 * dep;
    }

    return {
      questionId: item.questionId,
      type: item.questionType,
      weight: w,
      score: Math.round(score),
    };
  });

  const weightedAvg = (rows) => {
    const denom = rows.reduce((s, r) => s + r.weight, 0);
    if (!denom) return 0;
    const num = rows.reduce((s, r) => s + r.weight * r.score, 0);
    return Math.round(num / denom);
  };

  const technical = perQuestion.filter((x) => x.type === "technical");
  const behavioral = perQuestion.filter((x) => x.type === "behavioral");

  const overallScore = weightedAvg(perQuestion);
  const technicalScore = technical.length ? weightedAvg(technical) : null;
  const behavioralScore = behavioral.length ? weightedAvg(behavioral) : null;

  const readinessBand =
    overallScore >= 80 ? "Ready" : overallScore >= 60 ? "Almost Ready" : "Needs Work";

  return { perQuestion, overallScore, technicalScore, behavioralScore, readinessBand };
}

function computeMetrics(questions, answers) {
  const answeredQuestions = answers.filter((a) => !a.skipped && String(a.transcript || "").trim());
  const totalWords = answeredQuestions.reduce((sum, a) => sum + wordCountOf(a.transcript), 0);

  const averageAnswerLength =
    answeredQuestions.length > 0 ? Math.round(totalWords / answeredQuestions.length) : 0;

  return {
    averageAnswerLength,
    questionsAnswered: answeredQuestions.length,
    questionsSkipped: answers.filter((a) => a.skipped).length,
    totalQuestions: questions.length,
  };
}

export async function generateReport(interview, evaluations, job = null) {
  const { questions, answers } = interview;

  if (USE_MOCK_AI) {
    console.log("[ReportGenerator] Using mock report");

    const metrics = computeMetrics(questions, answers);

    return {
      overallScore: 70,
      technicalScore: 75,
      behavioralScore: 65,
      readinessBand: "Almost Ready",
      summary: "Mock report - enable real AI for detailed analysis",
      primaryBlockers: [],
      strengths: ["Completed interview"],
      areasForImprovement: ["Enable AI for detailed feedback"],
      recommendations: ["Enable AI evaluation"],
      metrics,
      aiConfidence: 0.5,
    };
  }

  if (!groq) {
    throw new Error("Groq not configured. Set GROQ_API_KEY in .env or USE_MOCK_AI=true");
  }

  console.log("[ReportGenerator] Generating report with Groq");

  // Build context for AI
  const answersWithEvaluations = questions.map((question) => {
    const answer = answers.find((a) => a.questionId === question.id);
    const evaluation = evaluations.find((e) => e.questionId === question.id);

    return {
      questionId: question.id,
      question: question.text,
      questionType: question.type,
      weight: question.weight || 1,
      answer: answer?.transcript || (answer?.skipped ? "[SKIPPED]" : "[NOT ANSWERED]"),
      evaluation: evaluation || null,
    };
  });

  // Compute scores in code (STRICT + CONSISTENT)
  const computed = computeScores(answersWithEvaluations);

  const prompt = `You are a helpful and encouraging interview report writer. Your goal is to provide balanced, constructive feedback that helps the candidate understand their performance and how to improve.

${job ? `Job: ${job.level} ${job.title}
Job Description: ${job.description}

` : ""}

GUIDELINES:
- Use ONLY the data provided. Do NOT invent details.
- Be balanced - highlight strengths as well as areas for improvement.
- Be constructive and encouraging. Frame feedback as growth opportunities rather than just problems.
- primaryBlockers should be 3-5 items, sorted by severity (high -> medium -> low), but frame them as areas to focus on.
- Use the PRE-COMPUTED scores below. Do NOT change them.

PRE-COMPUTED SCORES (DO NOT MODIFY):
- overallScore: ${computed.overallScore}
- technicalScore: ${computed.technicalScore ?? "null"}
- behavioralScore: ${computed.behavioralScore ?? "null"}
- readinessBand: ${computed.readinessBand}

Per-question computed scores:
${computed.perQuestion
  .map((p) => `- ${p.questionId} (${p.type}, weight=${p.weight}): ${p.score}/100`)
  .join("\n")}

Evidence signals (question text + eval summaries):
${answersWithEvaluations
  .map(
    (item) => `
${item.questionId} (${item.questionType}, weight=${item.weight}):
Q: "${item.question}"
Eval: ${
      item.evaluation
        ? `relevance=${item.evaluation.relevanceScore}/100, clarity=${item.evaluation.clarityScore}/100, depth=${item.evaluation.depthScore}/100${
            item.questionType === "technical" ? `, technical=${item.evaluation.technicalAccuracy ?? 0}/100` : ""
          }`
        : "NO EVALUATION (treat as 0)"
    }
Detected issues: ${item.evaluation ? (item.evaluation.detectedIssues || []).join(", ") : ""}
Strengths: ${item.evaluation ? (item.evaluation.strengths || []).join(", ") : ""}
`
  )
  .join("\n")}

OUTPUT INSTRUCTIONS:
Return ONLY a valid JSON object in EXACTLY this format (no extra keys, no markdown):

{
  "overallScore": ${computed.overallScore},
  "technicalScore": ${computed.technicalScore ?? "null"},
  "behavioralScore": ${computed.behavioralScore ?? "null"},
  "readinessBand": "${computed.readinessBand}",
  "summary": "One paragraph. Start with what went well, then mention key areas for improvement. Be encouraging and constructive. If data is insufficient, mention it but stay positive.",
  "primaryBlockers": [
    {
      "questionId": "q2",
      "questionText": "Question text",
      "questionType": "technical",
      "issue": "Specific issue based on evidence",
      "severity": "high",
      "impact": "Explain why it affects readiness (weights matter)"
    }
  ],
  "strengths": ["..."],
  "areasForImprovement": ["..."],
  "recommendations": ["..."],
  "aiConfidence": 0.0
}

aiConfidence RULE:
- 0.3–0.5 if answers are very short/missing or evaluations are missing.
- 0.6–0.8 if decent evidence exists but still some gaps.
- 0.85–0.95 if answers are detailed and evaluations show high confidence.
`;

  try {
    const response = await askGroq(prompt, { temperature: 0.1, maxTokens: 1400 });
    const report = safeJsonExtract(response);

    if (!report) {
      throw new Error("AI response is not valid JSON");
    }

    const metrics = computeMetrics(questions, answers);

    // Enforce computed scores (AI can't override)
    const normalized = {
      overallScore: computed.overallScore,
      technicalScore: computed.technicalScore,
      behavioralScore: computed.behavioralScore,
      readinessBand: computed.readinessBand,

      summary: String(report.summary || "").trim(),

      primaryBlockers: Array.isArray(report.primaryBlockers) ? report.primaryBlockers.slice(0, 5) : [],
      strengths: Array.isArray(report.strengths) ? report.strengths.slice(0, 8) : [],
      areasForImprovement: Array.isArray(report.areasForImprovement)
        ? report.areasForImprovement.slice(0, 8)
        : [],
      recommendations: Array.isArray(report.recommendations) ? report.recommendations.slice(0, 8) : [],

      metrics,
      aiConfidence: clamp(Number(report.aiConfidence ?? 0.4), 0, 1),
    };

    // Basic safety: ensure blockers have required fields
    normalized.primaryBlockers = normalized.primaryBlockers
      .map((b) => ({
        questionId: String(b.questionId || "").trim(),
        questionText: String(b.questionText || "").trim(),
        questionType: String(b.questionType || "").trim(),
        issue: String(b.issue || "").trim(),
        severity: String(b.severity || "").trim(),
        impact: String(b.impact || "").trim(),
      }))
      .filter((b) => b.questionId && b.questionText && b.questionType && b.issue && b.severity && b.impact);

    // If AI failed to provide blockers, generate strict fallback blockers from computed scores
    if (normalized.primaryBlockers.length < 3) {
      const byImpact = [...computed.perQuestion]
        .map((p) => ({
          questionId: p.questionId,
          score: p.score,
          weight: p.weight,
          type: p.type,
          impactValue: p.weight * (100 - p.score),
        }))
        .sort((a, b) => b.impactValue - a.impactValue)
        .slice(0, 5);

      const qMap = new Map(answersWithEvaluations.map((x) => [x.questionId, x]));

      normalized.primaryBlockers = byImpact.map((x) => {
        const item = qMap.get(x.questionId);
        const sev = x.score < 30 ? "high" : x.score < 60 ? "medium" : "low";
        return {
          questionId: x.questionId,
          questionText: item?.question || "",
          questionType: x.type,
          issue: "Low performance on a high-impact question (missing depth/correctness/structure).",
          severity: sev,
          impact:
            x.type === "technical"
              ? "High impact on readiness because technical correctness and depth are critical for this role."
              : "Meaningful impact on readiness because collaboration/communication evidence was insufficient.",
        };
      });
    }

    // If summary empty, create strict fallback summary
    if (!normalized.summary) {
      normalized.summary =
        "The score reflects missing depth, incomplete reasoning, and insufficient evidence in several answers. Multiple high-impact questions were not answered to an acceptable standard.";
    }

    // Ensure confidence matches evidence (strict)
    const metricsEvidence = metrics.questionsAnswered;
    if (metricsEvidence === 0) normalized.aiConfidence = Math.min(normalized.aiConfidence, 0.3);

    return normalized;
  } catch (error) {
    console.error("[ReportGenerator] Error:", error.message);

    const metrics = computeMetrics(questions, answers);

    // Strict fallback report still uses computed numbers
    const overallScore = computed?.overallScore ?? 0;
    const readinessBand =
      overallScore >= 80 ? "Ready" : overallScore >= 60 ? "Almost Ready" : "Needs Work";

    return {
      overallScore,
      technicalScore: computed?.technicalScore ?? null,
      behavioralScore: computed?.behavioralScore ?? null,
      readinessBand,
      summary: "Report generation failed. Scores shown are computed from per-answer evaluations; narrative report unavailable.",
      primaryBlockers: [],
      strengths: [],
      areasForImprovement: ["Retry report generation", "Ensure AI returns valid JSON"],
      recommendations: ["Retry", "Improve answer depth and structure"],
      metrics,
      aiConfidence: 0.25,
    };
  }
}

export default { generateReport };
