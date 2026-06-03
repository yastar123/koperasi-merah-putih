import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const simpananTable = pgTable("simpanan", {
  id: serial("id").primaryKey(),
  anggotaId: integer("anggota_id").notNull(),
  jenis: text("jenis").notNull(),
  jumlah: numeric("jumlah", { precision: 15, scale: 2 }).notNull(),
  tanggal: text("tanggal").notNull(),
  keterangan: text("keterangan"),
  operatorId: integer("operator_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSimpananSchema = createInsertSchema(simpananTable).omit({ id: true, createdAt: true });
export type InsertSimpanan = z.infer<typeof insertSimpananSchema>;
export type Simpanan = typeof simpananTable.$inferSelect;
