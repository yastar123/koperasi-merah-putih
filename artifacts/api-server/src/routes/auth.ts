import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "koperasi_salt").digest("hex");
}

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username dan password wajib diisi" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Username atau password salah" });
    return;
  }

  const hashed = hashPassword(password);
  if (user.passwordHash !== hashed) {
    res.status(401).json({ error: "Username atau password salah" });
    return;
  }

  if (!user.aktif) {
    res.status(401).json({ error: "Akun tidak aktif" });
    return;
  }

  // Store user in session cookie (simple base64 encoding for demo)
  const sessionData = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");
  res.cookie("session", sessionData, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    user: {
      ...safeUser,
      createdAt: safeUser.createdAt.toISOString(),
    },
    token: sessionData,
  });
});

// POST /auth/logout
router.post("/auth/logout", (_req, res) => {
  res.clearCookie("session");
  res.json({ message: "Logout berhasil" });
});

// GET /auth/me
router.get("/auth/me", async (req, res) => {
  const session = req.cookies?.session || req.headers.authorization?.replace("Bearer ", "");
  if (!session) {
    res.status(401).json({ error: "Tidak terautentikasi" });
    return;
  }

  try {
    const { userId } = JSON.parse(Buffer.from(session, "base64").toString("utf-8"));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || !user.aktif) {
      res.status(401).json({ error: "Sesi tidak valid" });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ ...safeUser, createdAt: safeUser.createdAt.toISOString() });
  } catch {
    res.status(401).json({ error: "Sesi tidak valid" });
  }
});

export default router;
