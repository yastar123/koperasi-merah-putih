import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aktivitasLogTable = pgTable("aktivitas_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  aksi: text("aksi").notNull(),
  tabel: text("tabel").notNull(),
  referensiId: integer("referensi_id"),
  detail: text("detail"),
  waktu: timestamp("waktu").notNull().defaultNow(),
});

export const insertAktivitasLogSchema = createInsertSchema(aktivitasLogTable).omit({ id: true, waktu: true });
export type InsertAktivitasLog = z.infer<typeof insertAktivitasLogSchema>;
export type AktivitasLog = typeof aktivitasLogTable.$inferSelect;
