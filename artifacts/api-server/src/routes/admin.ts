import { Router, type IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const SESSION_COOKIE = "scms_admin";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { username, password } = parsed.data;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.cookie(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
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
