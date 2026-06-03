import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const angsuranTable = pgTable("angsuran", {
  id: serial("id").primaryKey(),
  pinjamanId: integer("pinjaman_id").notNull(),
  periodeKe: integer("periode_ke").notNull(),
  jumlahAngsuran: numeric("jumlah_angsuran", { precision: 15, scale: 2 }).notNull(),
  jumlahDibayar: numeric("jumlah_dibayar", { precision: 15, scale: 2 }),
  tanggalJatuhTempo: text("tanggal_jatuh_tempo").notNull(),
  tanggalBayar: text("tanggal_bayar"),
  status: text("status").notNull().default("belum_bayar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAngsuranSchema = createInsertSchema(angsuranTable).omit({ id: true, createdAt: true });
export type InsertAngsuran = z.infer<typeof insertAngsuranSchema>;
export type Angsuran = typeof angsuranTable.$inferSelect;
