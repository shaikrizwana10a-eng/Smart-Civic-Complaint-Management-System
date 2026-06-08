import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { AdminLoginBody } from "@workspace/api-zod";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
// Default: bcrypt hash of "admin123". Override with ADMIN_PASSWORD_HASH env var.
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ??
  "$2b$10$h7Uu.fPsFo9L9XGug8Hf/.X7gckDZDCcFuVsfYH9BAo8LJItnOo7C";

const SESSION_COOKIE = "scms_admin";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { username, password } = parsed.data;

  if (username !== ADMIN_USERNAME) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });
  res.json({ authenticated: true, username: ADMIN_USERNAME });
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ success: true });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const cookie = req.cookies?.[SESSION_COOKIE];
  if (cookie !== "authenticated") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ authenticated: true, username: ADMIN_USERNAME });
});

export default router;
