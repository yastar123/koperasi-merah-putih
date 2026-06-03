import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const anggotaTable = pgTable("anggota", {
  id: serial("id").primaryKey(),
  nomorAnggota: text("nomor_anggota").notNull().unique(),
  nama: text("nama").notNull(),
  nik: text("nik").notNull(),
  tempatLahir: text("tempat_lahir"),
  tanggalLahir: text("tanggal_lahir"),
  alamat: text("alamat"),
  telepon: text("telepon"),
  pekerjaan: text("pekerjaan"),
  koperasiId: integer("koperasi_id").notNull(),
  userId: integer("user_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnggotaSchema = createInsertSchema(anggotaTable).omit({ id: true, createdAt: true });
export type InsertAnggota = z.infer<typeof insertAnggotaSchema>;
export type Anggota = typeof anggotaTable.$inferSelect;
