import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import * as crypto from "crypto";

const router = Router();

function hashPassword(p: string) {
  return crypto.createHash("sha256").update(p + "koperasi_salt").digest("hex");
}

function safeUser(u: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = u;
  return { ...rest, createdAt: rest.createdAt.toISOString() };
}

// GET /users
router.get("/users", async (req, res) => {
  const { role, koperasiId } = req.query as Record<string, string>;
  let query = db.select().from(usersTable);

  const filters = [];
  if (role) filters.push(eq(usersTable.role, role));
  if (koperasiId) filters.push(eq(usersTable.koperasiId, Number(koperasiId)));

  const users = filters.length
    ? await db.select().from(usersTable).where(and(...filters))
    : await db.select().from(usersTable);

  res.json(users.map(safeUser));
});

// POST /users
router.post("/users", async (req, res) => {
  const { username, password, nama, email, telepon, role, koperasiId } = req.body;
  if (!username || !password || !nama || !role) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existing) {
    res.status(400).json({ error: "Username sudah digunakan" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    username,
    passwordHash: hashPassword(password),
    nama,
    email: email || null,
    telepon: telepon || null,
    role,
    koperasiId: koperasiId || null,
    aktif: true,
  }).returning();

  res.status(201).json(safeUser(user));
});

// GET /users/:id
router.get("/users/:id", async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(req.params.id))).limit(1);
  if (!user) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  res.json(safeUser(user));
});

// PATCH /users/:id
router.patch("/users/:id", async (req, res) => {
  const { nama, email, telepon, role, aktif, koperasiId } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (nama !== undefined) updates.nama = nama;
  if (email !== undefined) updates.email = email;
  if (telepon !== undefined) updates.telepon = telepon;
  if (role !== undefined) updates.role = role;
  if (aktif !== undefined) updates.aktif = aktif;
  if (koperasiId !== undefined) updates.koperasiId = koperasiId;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, Number(req.params.id))).returning();
  if (!user) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  res.json(safeUser(user));
});

// DELETE /users/:id
router.delete("/users/:id", async (req, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
  res.json({ message: "User dihapus" });
});

export default router;
