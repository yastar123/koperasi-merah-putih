import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pinjamanTable = pgTable("pinjaman", {
  id: serial("id").primaryKey(),
  anggotaId: integer("anggota_id").notNull(),
  jumlahPinjaman: numeric("jumlah_pinjaman", { precision: 15, scale: 2 }).notNull(),
  bungaPersen: numeric("bunga_persen", { precision: 5, scale: 2 }).notNull().default("1.5"),
  tenorBulan: integer("tenor_bulan").notNull(),
  angsuranPerBulan: numeric("angsuran_per_bulan", { precision: 15, scale: 2 }),
  tujuan: text("tujuan"),
  status: text("status").notNull().default("pending"),
  tanggalPengajuan: text("tanggal_pengajuan").notNull(),
  tanggalDisetujui: text("tanggal_disetujui"),
  tanggalJatuhTempo: text("tanggal_jatuh_tempo"),
  catatanPengurus: text("catatan_pengurus"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPinjamanSchema = createInsertSchema(pinjamanTable).omit({ id: true, createdAt: true });
export type InsertPinjaman = z.infer<typeof insertPinjamanSchema>;
export type Pinjaman = typeof pinjamanTable.$inferSelect;
