import { Router } from "express";
import { db, aktivitasLogTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// GET /aktivitas
router.get("/aktivitas", async (req, res) => {
  const { userId, koperasiId } = req.query as Record<string, string>;
  const filters = [];
  if (userId) filters.push(eq(aktivitasLogTable.userId, Number(userId)));

  const list = filters.length
    ? await db.select().from(aktivitasLogTable).where(and(...filters)).orderBy(desc(aktivitasLogTable.waktu)).limit(100)
    : await db.select().from(aktivitasLogTable).orderBy(desc(aktivitasLogTable.waktu)).limit(100);

  const enriched = await Promise.all(list.map(async a => {
    const [u] = await db.select({ nama: usersTable.nama }).from(usersTable).where(eq(usersTable.id, a.userId)).limit(1);
    return {
      ...a,
      namaUser: u?.nama ?? "",
      waktu: a.waktu.toISOString(),
    };
  }));

  res.json(enriched);
});

export default router;
