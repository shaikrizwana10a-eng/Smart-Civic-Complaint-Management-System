import { sql } from "drizzle-orm";
import { db, complaintsTable } from "@workspace/db";

export interface ComplaintRow {
  complaintId: string;
  area: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
}

const DEPARTMENT_BY_CATEGORY: Record<string, string> = {
  "Water Supply": "Water Department",
  Electricity: "Electrical Department",
  "Road Damage": "Roads & Infrastructure Department",
  Drainage: "Water & Drainage Department",
  "Street Light": "Electrical Department",
  Sanitation: "Sanitation Department",
  "Garbage Collection": "Sanitation Department",
  "Public Property Damage": "Public Works Department",
  Other: "General Administration (Manual Review)",
};

export function getDepartmentForCategory(category: string): string {
  return DEPARTMENT_BY_CATEGORY[category] ?? "General Administration (Manual Review)";
}

const SEVERITY_KEYWORDS: Array<{ keywords: string[]; boost: number }> = [
  {
    keywords: ["fire", "gas leak", "explosion", "electrocut", "collapse", "sewage overflow", "flood"],
    boost: 3,
  },
  {
    keywords: ["leak", "burst", "sparking", "live wire", "open manhole", "accident", "contamina"],
    boost: 2,
  },
  {
    keywords: ["smell", "overflow", "blockage", "pothole", "broken", "damage"],
    boost: 1,
  },
];

export function heuristicSeverityScore(description: string, ageDays: number, priority: string): number {
  const text = description.toLowerCase();
  let score = 0;
  for (const group of SEVERITY_KEYWORDS) {
    if (group.keywords.some((k) => text.includes(k))) {
      score += group.boost;
    }
  }
  if (priority === "Urgent") score += 3;
  else if (priority === "High") score += 2;
  else if (priority === "Medium") score += 1;

  if (ageDays > 14) score += 2;
  else if (ageDays > 7) score += 1;

  return score;
}

export function scoreToPriority(score: number): string {
  if (score >= 6) return "Urgent";
  if (score >= 4) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

export async function getAllComplaintsForAnalysis(): Promise<ComplaintRow[]> {
  const rows = await db
    .select({
      complaintId: complaintsTable.complaintId,
      area: complaintsTable.area,
      category: complaintsTable.category,
      description: complaintsTable.description,
      status: complaintsTable.status,
      priority: complaintsTable.priority,
      createdAt: complaintsTable.createdAt,
    })
    .from(complaintsTable);

  return rows;
}

export interface AreaStat {
  area: string;
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  avgPendingAgeDays: number;
  topCategory: string;
}

export function computeAreaStats(rows: ComplaintRow[]): AreaStat[] {
  const byArea = new Map<string, ComplaintRow[]>();
  for (const row of rows) {
    const list = byArea.get(row.area) ?? [];
    list.push(row);
    byArea.set(row.area, list);
  }

  const now = Date.now();
  const stats: AreaStat[] = [];

  for (const [area, areaRows] of byArea) {
    const pendingRows = areaRows.filter((r) => r.status === "Pending");
    const inProgress = areaRows.filter((r) => r.status === "In Progress").length;
    const resolved = areaRows.filter((r) => r.status === "Resolved").length;

    const avgPendingAgeDays =
      pendingRows.length > 0
        ? pendingRows.reduce((sum, r) => sum + (now - r.createdAt.getTime()) / 86_400_000, 0) /
          pendingRows.length
        : 0;

    const categoryCounts = new Map<string, number>();
    for (const r of areaRows) {
      categoryCounts.set(r.category, (categoryCounts.get(r.category) ?? 0) + 1);
    }
    const topCategory =
      [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Other";

    stats.push({
      area,
      total: areaRows.length,
      pending: pendingRows.length,
      inProgress,
      resolved,
      avgPendingAgeDays: Math.round(avgPendingAgeDays * 10) / 10,
      topCategory,
    });
  }

  return stats.sort((a, b) => b.total - a.total);
}

export interface Hotspot {
  area: string;
  total: number;
  pending: number;
  topCategory: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

export function computeHotspots(areaStats: AreaStat[]): Hotspot[] {
  return areaStats
    .map((a) => {
      const pendingRatio = a.total > 0 ? a.pending / a.total : 0;
      let riskLevel: Hotspot["riskLevel"] = "Low";
      if (a.total >= 8 && pendingRatio > 0.5) riskLevel = "Critical";
      else if (a.total >= 5 && pendingRatio > 0.4) riskLevel = "High";
      else if (a.total >= 3) riskLevel = "Medium";

      return {
        area: a.area,
        total: a.total,
        pending: a.pending,
        topCategory: a.topCategory,
        riskLevel,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export async function getMonthlyTrendRaw(): Promise<MonthlyCount[]> {
  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${complaintsTable.createdAt}), 'Mon YYYY')`,
      count: sql<number>`count(*)::int`,
    })
    .from(complaintsTable)
    .where(sql`${complaintsTable.createdAt} >= now() - interval '12 months'`)
    .groupBy(sql`date_trunc('month', ${complaintsTable.createdAt})`)
    .orderBy(sql`date_trunc('month', ${complaintsTable.createdAt})`);

  return rows;
}

export function computeTrendForecast(monthly: MonthlyCount[]): {
  direction: "up" | "down" | "stable";
  forecastNextMonth: number;
} {
  if (monthly.length === 0) {
    return { direction: "stable", forecastNextMonth: 0 };
  }
  const recent = monthly.slice(-3);
  if (recent.length < 2) {
    return { direction: "stable", forecastNextMonth: recent[0]?.count ?? 0 };
  }
  const deltas: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    deltas.push(recent[i]!.count - recent[i - 1]!.count);
  }
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const lastCount = recent[recent.length - 1]!.count;
  const forecastNextMonth = Math.max(0, Math.round(lastCount + avgDelta));
  const direction: "up" | "down" | "stable" =
    avgDelta > 0.5 ? "up" : avgDelta < -0.5 ? "down" : "stable";

  return { direction, forecastNextMonth };
}

export interface DepartmentStat {
  department: string;
  category: string;
  count: number;
}

export function computeDepartmentMapping(rows: ComplaintRow[]): DepartmentStat[] {
  const byCategory = new Map<string, number>();
  for (const row of rows) {
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1);
  }
  return [...byCategory.entries()]
    .map(([category, count]) => ({
      category,
      count,
      department: getDepartmentForCategory(category),
    }))
    .sort((a, b) => b.count - a.count);
}

export interface PriorityRecommendation {
  complaintId: string;
  area: string;
  category: string;
  currentPriority: string;
  recommendedPriority: string;
  reason: string;
}

export function computePriorityRecommendations(rows: ComplaintRow[]): PriorityRecommendation[] {
  const now = Date.now();
  const openRows = rows.filter((r) => r.status !== "Resolved");
  const recommendations: PriorityRecommendation[] = [];

  for (const row of openRows) {
    const ageDays = (now - row.createdAt.getTime()) / 86_400_000;
    const score = heuristicSeverityScore(row.description, ageDays, row.priority);
    const recommended = scoreToPriority(score);

    if (recommended !== row.priority) {
      const reasonParts: string[] = [];
      if (ageDays > 7) reasonParts.push(`open for ${Math.round(ageDays)} days`);
      if (score >= 4) reasonParts.push("description indicates urgent risk keywords");
      recommendations.push({
        complaintId: row.complaintId,
        area: row.area,
        category: row.category,
        currentPriority: row.priority,
        recommendedPriority: recommended,
        reason: reasonParts.length > 0 ? reasonParts.join("; ") : "reassessed based on category and age",
      });
    }
  }

  return recommendations
    .sort((a, b) => {
      const order = ["Urgent", "High", "Medium", "Low"];
      return order.indexOf(a.recommendedPriority) - order.indexOf(b.recommendedPriority);
    })
    .slice(0, 20);
}
