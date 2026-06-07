import PDFDocument from "pdfkit";
import type { Complaint } from "@workspace/db";

export function generateComplaintPdf(complaint: Complaint): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill("#0F172A");

  doc
    .fillColor("#FFFFFF")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("SCMS", 50, 30)
    .fontSize(10)
    .font("Helvetica")
    .text("Smart Civic Complaint Management System", 50, 58)
    .text("Official Complaint Receipt", 50, 72);

  // Complaint ID Badge
  const idX = doc.page.width - 220;
  doc
    .rect(idX, 20, 170, 60)
    .fillAndStroke("#2563EB", "#2563EB");
  doc
    .fillColor("#FFFFFF")
    .fontSize(9)
    .font("Helvetica")
    .text("COMPLAINT ID", idX + 10, 30)
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(complaint.complaintId, idX + 10, 46);

  doc.moveDown(4);

  // Status badge
  const statusColors: Record<string, string> = {
    Pending: "#F59E0B",
    "In Progress": "#2563EB",
    Resolved: "#22C55E",
  };
  const statusColor = statusColors[complaint.status] || "#6B7280";

  doc
    .roundedRect(50, 120, 100, 24, 5)
    .fill(statusColor);
  doc
    .fillColor("#FFFFFF")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(complaint.status, 50, 127, { width: 100, align: "center" });

  // Section: Complainant Details
  doc.moveDown(3);
  doc
    .fillColor("#1E293B")
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Complainant Details", 50, 165);
  doc
    .moveTo(50, 182)
    .lineTo(doc.page.width - 50, 182)
    .strokeColor("#E2E8F0")
    .stroke();

  const fields = [
    ["Full Name", complaint.name],
    ["Mobile Number", complaint.mobile],
    ["Area / Village", complaint.area],
    ["Category", complaint.category],
  ];

  let y = 192;
  for (const [label, value] of fields) {
    doc
      .fillColor("#64748B")
      .fontSize(9)
      .font("Helvetica")
      .text(label.toUpperCase(), 50, y);
    doc
      .fillColor("#1E293B")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(value, 200, y);
    y += 28;
  }

  // Description
  doc
    .fillColor("#1E293B")
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Description", 50, y + 10);
  doc
    .moveTo(50, y + 27)
    .lineTo(doc.page.width - 50, y + 27)
    .strokeColor("#E2E8F0")
    .stroke();
  doc
    .fillColor("#374151")
    .fontSize(10)
    .font("Helvetica")
    .text(complaint.description, 50, y + 37, {
      width: doc.page.width - 100,
      align: "left",
    });

  // Submission date
  const dateStr = new Date(complaint.createdAt).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  doc.moveDown(3);
  doc
    .fillColor("#64748B")
    .fontSize(9)
    .font("Helvetica")
    .text(`Submitted on: ${dateStr}`, 50, doc.y);

  // Footer
  const footerY = doc.page.height - 60;
  doc
    .rect(0, footerY, doc.page.width, 60)
    .fill("#F8FAFC");
  doc
    .fillColor("#94A3B8")
    .fontSize(8)
    .font("Helvetica")
    .text(
      "This is a system-generated document. For queries, contact your local civic authority.",
      50,
      footerY + 20,
      { width: doc.page.width - 100, align: "center" }
    );

  return doc;
}
