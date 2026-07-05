import nodemailer from "nodemailer";
import { logger } from "./logger";

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? "587", 10),
    secure: SMTP_PORT === "465",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const transporter = createTransporter();

export async function sendComplaintConfirmation(
  email: string,
  name: string,
  complaintId: string
): Promise<void> {
  if (!transporter) {
    logger.info({ complaintId, email }, "Email skipped: SMTP not configured");
    return;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const trackUrl = "https://smart-civic-complaint-management-system-1.onrender.com/track";

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Complaint Registered Successfully – SCMS",
      text: `Hello ${name},

Your complaint has been registered successfully with the Smart Civic Complaint Management System (SCMS).

Complaint ID:
${complaintId}

Please keep this Complaint ID safe. You can use it anytime to track the status of your complaint through the SCMS portal.

Track your complaint:
${trackUrl}

Thank you for helping improve your community.

Smart Civic Complaint Management System (SCMS)`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Complaint Registered Successfully</h2>
          <p>Hello ${name},</p>
          <p>Your complaint has been registered successfully with the Smart Civic Complaint Management System (SCMS).</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">Complaint ID</p>
            <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #2563eb;">${complaintId}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Please keep this Complaint ID safe. You can use it anytime to track the status of your complaint through the SCMS portal.</p>
          <p style="margin: 24px 0;">
            <a href="${trackUrl}" style="background: #2563eb; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 14px; font-weight: 600;">Track Your Complaint</a>
          </p>
          <p style="color: #64748b; font-size: 14px;">Thank you for helping improve your community.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">SCMS — Smart Civic Complaint Management System</p>
        </div>
      `,
    });
    logger.info({ complaintId, email }, "Complaint confirmation email sent");
  } catch (err) {
    logger.error({ err, complaintId }, "Failed to send complaint confirmation email");
  }
}

export async function sendStatusNotification(
  email: string,
  complaintId: string,
  newStatus: string
): Promise<void> {
  if (!transporter) {
    logger.info({ complaintId, newStatus }, "Email skipped: SMTP not configured");
    return;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const statusMessages: Record<string, string> = {
    Pending: "Your complaint has been received and is queued for review.",
    "In Progress": "Our team is actively working to resolve your complaint.",
    Resolved: "Your complaint has been resolved. Thank you for your patience.",
  };

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `Update on Complaint ${complaintId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Complaint Status Update</h2>
          <p>Your complaint <strong>${complaintId}</strong> has been updated.</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">New Status</p>
            <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #2563eb;">${newStatus}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">${statusMessages[newStatus] ?? ""}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">SCMS — Smart Civic Complaint Management System</p>
        </div>
      `,
    });
    logger.info({ complaintId, email, newStatus }, "Status notification sent");
  } catch (err) {
    logger.error({ err, complaintId }, "Failed to send email notification");
  }
}
