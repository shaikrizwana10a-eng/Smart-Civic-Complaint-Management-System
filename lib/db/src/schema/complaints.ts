
import { pgTable, serial, text, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complaintsTable = pgTable("complaints", {
  id: serial("id").primaryKey(),
  complaintId: text("complaint_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  mobile: text("mobile").notNull(),
  area: text("area").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("Pending"),
  priority: text("priority").notNull().default("Medium"),
  imageUrl: text("image_url"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertComplaintSchema = createInsertSchema(complaintsTable).omit({
  id: true,
  complaintId: true,
  status: true,
  createdAt: true,
});

export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaintsTable.$inferSelect;

export const complaintCounterTable = pgTable("complaint_counter", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  lastCount: integer("last_count").notNull().default(0),
});
