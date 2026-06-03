import { pgTable, serial, text, timestamp, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transaksiTable = pgTable("transaksi", {
  id: serial("id").primaryKey(),
  unitUsahaId: integer("unit_usaha_id").notNull(),
  anggotaId: integer("anggota_id"),
  operatorId: integer("operator_id").notNull(),
  totalHarga: numeric("total_harga", { precision: 15, scale: 2 }).notNull(),
  tanggal: text("tanggal").notNull(),
  keterangan: text("keterangan"),
  items: jsonb("items").notNull().default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransaksiSchema = createInsertSchema(transaksiTable).omit({ id: true, createdAt: true });
export type InsertTransaksi = z.infer<typeof insertTransaksiSchema>;
export type Transaksi = typeof transaksiTable.$inferSelect;
