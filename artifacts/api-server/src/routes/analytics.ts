import { Router, type IRouter } from "express";
import { desc, sql, eq } from "drizzle-orm";
import { db, complaintsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/analytics/stats", async (_req, res): Promise<void> => {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${complaintsTable.status} = 'Pending')::int`,
      inProgress: sql<number>`count(*) filter (where ${complaintsTable.status} = 'In Progress')::int`,
      resolved: sql<number>`count(*) filter (where ${complaintsTable.status} = 'Resolved')::int`,
    })
    .from(complaintsTable);

  res.json(row);
});

router.get("/analytics/by-category", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: complaintsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(complaintsTable)
    .groupBy(complaintsTable.category)
    .orderBy(desc(sql`count(*)`));

  res.json(rows);
});

router.get("/analytics/by-status", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      status: complaintsTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(complaintsTable)
    .groupBy(complaintsTable.status);

  res.json(rows);
});

router.get("/analytics/monthly-trend", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${complaintsTable.createdAt}), 'Mon YYYY')`,
      count: sql<number>`count(*)::int`,
    })
    .from(complaintsTable)
    .where(
      sql`${complaintsTable.createdAt} >= now() - interval '12 months'`
    )
    .groupBy(sql`date_trunc('month', ${complaintsTable.createdAt})`)
    .orderBy(sql`date_trunc('month', ${complaintsTable.createdAt})`);

  res.json(rows);
});

router.get("/analytics/recent", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(complaintsTable)
    .orderBy(desc(complaintsTable.createdAt))
    .limit(5);

  res.json(rows);
});

export default router;
