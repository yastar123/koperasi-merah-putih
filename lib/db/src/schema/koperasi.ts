import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const koperasiTable = pgTable("koperasi", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  noBadanHukum: text("no_badan_hukum"),
  desa: text("desa").notNull(),
  kecamatan: text("kecamatan").notNull(),
  kabupaten: text("kabupaten").notNull(),
  provinsi: text("provinsi").notNull(),
  alamat: text("alamat"),
  telepon: text("telepon"),
  email: text("email"),
  status: text("status").notNull().default("pending"),
  tanggalBerdiri: text("tanggal_berdiri"),
  catatan: text("catatan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKoperasiSchema = createInsertSchema(koperasiTable).omit({ id: true, createdAt: true });
export type InsertKoperasi = z.infer<typeof insertKoperasiSchema>;
export type Koperasi = typeof koperasiTable.$inferSelect;
