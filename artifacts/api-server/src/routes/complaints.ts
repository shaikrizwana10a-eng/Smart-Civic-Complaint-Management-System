import { Router, type IRouter } from "express";
import { eq, desc, like, and, sql } from "drizzle-orm";
import { db, complaintsTable, complaintCounterTable } from "@workspace/db";
import {
  CreateComplaintBody,
  ListComplaintsQueryParams,
  GetComplaintParams,
  UpdateComplaintParams,
  UpdateComplaintBody,
  DeleteComplaintParams,
  DownloadComplaintPdfParams,
  TrackComplaintParams,
} from "@workspace/api-zod";
import { generateComplaintPdf } from "../lib/pdf";
import { sendStatusNotification } from "../lib/mailer";

const router: IRouter = Router();

async function generateComplaintId(): Promise<string> {
  const year = new Date().getFullYear();
  const [counter] = await db
    .insert(complaintCounterTable)
    .values({ year, lastCount: 1 })
    .onConflictDoUpdate({
      target: complaintCounterTable.year,
      set: { lastCount: sql`${complaintCounterTable.lastCount} + 1` },
    })
    .returning();
  const padded = String(counter.lastCount).padStart(3, "0");
  return `SCMS${year}${padded}`;
}

router.get("/complaints", async (req, res): Promise<void> => {
  const parsed = ListComplaintsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, category, priority, area, search } = parsed.data;

  const conditions = [];
  if (status) conditions.push(eq(complaintsTable.status, status));
  if (category) conditions.push(eq(complaintsTable.category, category));
  if (priority) conditions.push(eq(complaintsTable.priority, priority));
  if (area) conditions.push(like(complaintsTable.area, `%${area}%`));
  if (search) {
    conditions.push(
      sql`(${complaintsTable.name} ILIKE ${`%${search}%`} OR ${complaintsTable.complaintId} ILIKE ${`%${search}%`} OR ${complaintsTable.area} ILIKE ${`%${search}%`})`
    );
  }

  const complaints = await db
    .select()
    .from(complaintsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(complaintsTable.createdAt));

  res.json(complaints);
});

router.post("/complaints", async (req, res): Promise<void> => {
  const parsed = CreateComplaintBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const complaintId = await generateComplaintId();

  const [complaint] = await db
    .insert(complaintsTable)
    .values({ ...parsed.data, complaintId, status: "Pending" })
    .returning();

  res.status(201).json(complaint);
});

router.get("/complaints/track/:complaintId", async (req, res): Promise<void> => {
  const params = TrackComplaintParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [complaint] = await db
    .select()
    .from(complaintsTable)
    .where(eq(complaintsTable.complaintId, params.data.complaintId));

  if (!complaint) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  res.json(complaint);
});

router.get("/complaints/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [complaint] = await db
    .select()
    .from(complaintsTable)
    .where(eq(complaintsTable.id, id));

  if (!complaint) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  res.json(complaint);
});

router.patch("/complaints/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateComplaintBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, string> = {};
  if (parsed.data.status) updateData.status = parsed.data.status;

  const [complaint] = await db
    .update(complaintsTable)
    .set(updateData)
    .where(eq(complaintsTable.id, id))
    .returning();

  if (!complaint) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  // Send email notification if complaint has an email and status changed
  if (complaint.email && parsed.data.status) {
    await sendStatusNotification(complaint.email, complaint.complaintId, parsed.data.status);
  }

  res.json(complaint);
});

router.delete("/complaints/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [complaint] = await db
    .delete(complaintsTable)
    .where(eq(complaintsTable.id, id))
    .returning();

  if (!complaint) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/complaints/:id/pdf", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [complaint] = await db
    .select()
    .from(complaintsTable)
    .where(eq(complaintsTable.id, id));

  if (!complaint) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${complaint.complaintId}.pdf"`
  );

  const doc = generateComplaintPdf(complaint);
  doc.pipe(res);
  doc.end();
});

export default router;
