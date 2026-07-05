import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { AskAiBody } from "@workspace/api-zod";
import { ai as geminiClient, geminiEnabled, generateJson, AI_MODEL } from "../lib/gemini";
import { logger } from "../lib/logger";
import {
  getAllComplaintsForAnalysis,
  computeAreaStats,
  computeHotspots,
  getMonthlyTrendRaw,
  computeTrendForecast,
  computeDepartmentMapping,
  computePriorityRecommendations,
  type ComplaintRow,
} from "../lib/ai-analytics";

const router: IRouter = Router();

const CACHE_TTL_MS = 5 * 60 * 1000;

interface InsightsPayload {
  summary: string;
  recommendations: string[];
  predictions: string;
  hotspots: ReturnType<typeof computeHotspots>;
  priorityRecommendations: ReturnType<typeof computePriorityRecommendations>;
  trend: {
    monthly: Awaited<ReturnType<typeof getMonthlyTrendRaw>>;
    direction: "up" | "down" | "stable";
    forecastNextMonth: number;
  };
  areaAnalytics: ReturnType<typeof computeAreaStats>;
  departmentMapping: ReturnType<typeof computeDepartmentMapping>;
  severityAnalysis: Array<{ complaintId: string; severity: "Low" | "Medium" | "High" | "Critical"; reason: string }>;
  patterns: Array<{ title: string; description: string; complaintIds: string[] }>;
  similarGroups: Array<{ complaintIds: string[]; reason: string }>;
  generatedAt: string;
}

let cache: { data: InsightsPayload; expiresAt: number } | null = null;

const NarrativeSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.string()),
  predictions: z.string(),
});

const AnalysisSchema = z.object({
  severities: z.array(
    z.object({
      complaintId: z.string(),
      severity: z.enum(["Low", "Medium", "High", "Critical"]),
      reason: z.string(),
    }),
  ),
  patterns: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      complaintIds: z.array(z.string()),
    }),
  ),
  similarGroups: z.array(
    z.object({
      complaintIds: z.array(z.string()),
      reason: z.string(),
    }),
  ),
});

function buildNarrativePrompt(digest: {
  totalComplaints: number;
  statusCounts: Record<string, number>;
  hotspots: ReturnType<typeof computeHotspots>;
  trend: { monthly: Awaited<ReturnType<typeof getMonthlyTrendRaw>>; direction: string; forecastNextMonth: number };
  departmentMapping: ReturnType<typeof computeDepartmentMapping>;
}): string {
  return `You are a civic administration analyst assistant. You are given ONLY the following real, aggregated statistics about complaints filed with a municipal complaint system. Do NOT invent any facts, numbers, areas, or categories that are not present in this data.

DATA:
${JSON.stringify(digest, null, 2)}

Based STRICTLY on this data, respond with a JSON object matching this exact shape:
{
  "summary": "a concise 2-4 sentence executive summary of the current complaint situation",
  "recommendations": ["3 to 5 short, specific, actionable recommendations for administrators, each referencing real areas/categories from the data"],
  "predictions": "a 1-3 sentence forward-looking prediction about complaint volume/trends, referencing the forecastNextMonth number and direction given"
}

Respond with ONLY the JSON object, no markdown formatting.`;
}

function buildAnalysisPrompt(rows: ComplaintRow[]): string {
  const sample = rows.slice(0, 40).map((r) => ({
    complaintId: r.complaintId,
    area: r.area,
    category: r.category,
    description: r.description,
    status: r.status,
    priority: r.priority,
    createdAt: r.createdAt.toISOString(),
  }));

  return `You are a civic administration analyst assistant. You are given a list of REAL open/recent complaints. You must ONLY reference complaintId values that literally appear in this list. Never invent a complaintId.

COMPLAINTS:
${JSON.stringify(sample, null, 2)}

Analyze this data and respond with a JSON object matching this exact shape:
{
  "severities": [{"complaintId": "<must exist in the list above>", "severity": "Low|Medium|High|Critical", "reason": "short reason grounded in the description/category"}],
  "patterns": [{"title": "short pattern name", "description": "1-2 sentence description of a recurring issue pattern you notice across multiple complaints", "complaintIds": ["<ids from the list that exhibit this pattern>"]}],
  "similarGroups": [{"complaintIds": ["<2 or more ids from the list that describe a very similar issue>"], "reason": "why they are similar"}]
}

Only include a "severities" entry for complaints where description content clearly indicates elevated risk (skip routine/low-risk ones or include with Low severity). Limit patterns to at most 5 and similarGroups to at most 5. Respond with ONLY the JSON object, no markdown formatting.`;
}

async function buildInsights(): Promise<InsightsPayload> {
  const rows = await getAllComplaintsForAnalysis();
  const areaAnalytics = computeAreaStats(rows);
  const hotspots = computeHotspots(areaAnalytics);
  const monthly = await getMonthlyTrendRaw();
  const { direction, forecastNextMonth } = computeTrendForecast(monthly);
  const departmentMapping = computeDepartmentMapping(rows);
  const priorityRecommendations = computePriorityRecommendations(rows);

  const statusCounts: Record<string, number> = {};
  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  const openRows = rows
    .filter((r) => r.status !== "Resolved")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  let narrative: { summary: string; recommendations: string[]; predictions: string };
  let analysis: {
    severities: Array<{ complaintId: string; severity: "Low" | "Medium" | "High" | "Critical"; reason: string }>;
    patterns: Array<{ title: string; description: string; complaintIds: string[] }>;
    similarGroups: Array<{ complaintIds: string[]; reason: string }>;
  };

  try {
    const [narrativeRaw, analysisRaw] = await Promise.all([
      generateJson<unknown>(
        buildNarrativePrompt({
          totalComplaints: rows.length,
          statusCounts,
          hotspots,
          trend: { monthly, direction, forecastNextMonth },
          departmentMapping,
        }),
      ),
      openRows.length > 0
        ? generateJson<unknown>(buildAnalysisPrompt(openRows))
        : Promise.resolve({ severities: [], patterns: [], similarGroups: [] }),
    ]);

    narrative = NarrativeSchema.parse(narrativeRaw);
    analysis = AnalysisSchema.parse(analysisRaw);
  } catch (err) {
    logger.error({ err }, "Gemini insights generation failed");
    throw err;
  }

  const validIds = new Set(rows.map((r) => r.complaintId));
  const severityAnalysis = analysis.severities.filter((s) => validIds.has(s.complaintId));
  const patterns = analysis.patterns.map((p) => ({
    ...p,
    complaintIds: p.complaintIds.filter((id) => validIds.has(id)),
  }));
  const similarGroups = analysis.similarGroups.map((g) => ({
    ...g,
    complaintIds: g.complaintIds.filter((id) => validIds.has(id)),
  }));

  return {
    summary: narrative.summary,
    recommendations: narrative.recommendations,
    predictions: narrative.predictions,
    hotspots,
    priorityRecommendations,
    trend: { monthly, direction, forecastNextMonth },
    areaAnalytics,
    departmentMapping,
    severityAnalysis,
    patterns,
    similarGroups,
    generatedAt: new Date().toISOString(),
  };
}

router.get("/ai/insights", async (req, res): Promise<void> => {
  if (!geminiEnabled || !geminiClient) {
    res.status(503).json({ error: "AI Decision Dashboard is not configured (missing GEMINI_API_KEY)." });
    return;
  }

  const forceRefresh = req.query["refresh"] === "true";

  if (!forceRefresh && cache && cache.expiresAt > Date.now()) {
    res.json({ ...cache.data, cached: true });
    return;
  }

  try {
    const data = await buildInsights();
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json({ ...data, cached: false });
  } catch (err) {
    req.log.error({ err }, "Failed to generate AI insights");
    if (cache) {
      res.json({ ...cache.data, cached: true });
      return;
    }
    res.status(503).json({ error: "AI insights are temporarily unavailable. Please try again shortly." });
  }
});

router.post("/ai/ask", async (req, res): Promise<void> => {
  if (!geminiEnabled || !geminiClient) {
    res.status(503).json({ error: "AI Decision Dashboard is not configured (missing GEMINI_API_KEY)." });
    return;
  }

  const parseResult = AskAiBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "A question of at least 3 characters is required." });
    return;
  }

  try {
    const rows = await getAllComplaintsForAnalysis();
    const areaAnalytics = computeAreaStats(rows);
    const hotspots = computeHotspots(areaAnalytics);
    const monthly = await getMonthlyTrendRaw();
    const { direction, forecastNextMonth } = computeTrendForecast(monthly);
    const departmentMapping = computeDepartmentMapping(rows);

    const statusCounts: Record<string, number> = {};
    for (const row of rows) {
      statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    }

    const recentSample = rows
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 30)
      .map((r) => ({
        complaintId: r.complaintId,
        area: r.area,
        category: r.category,
        status: r.status,
        priority: r.priority,
        createdAt: r.createdAt.toISOString(),
      }));

    const prompt = `You are an AI assistant embedded in a municipal civic complaint management admin dashboard. You must answer the administrator's question using ONLY the real data provided below. If the data does not contain enough information to answer confidently, say so honestly instead of guessing. Never invent complaint IDs, areas, or numbers not present in the data.

DATA:
${JSON.stringify(
  { totalComplaints: rows.length, statusCounts, hotspots, areaAnalytics, trend: { monthly, direction, forecastNextMonth }, departmentMapping, recentComplaints: recentSample },
  null,
  2,
)}

ADMINISTRATOR QUESTION: ${parseResult.data.question}

Respond with a concise, helpful, plain-text answer (no markdown headers, 2-6 sentences unless a list is clearly needed).`;

    const response = await geminiClient.models.generateContent({
      model: AI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const answer = response.text?.trim();
    if (!answer) {
      res.status(503).json({ error: "AI assistant did not return an answer. Please try again." });
      return;
    }

    res.json({ answer });
  } catch (err) {
    req.log.error({ err }, "Ask AI failed");
    res.status(503).json({ error: "AI assistant is temporarily unavailable. Please try again shortly." });
  }
});

export default router;
