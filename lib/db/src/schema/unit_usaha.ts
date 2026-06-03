import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const unitUsahaTable = pgTable("unit_usaha", {
  id: serial("id").primaryKey(),
  koperasiId: integer("koperasi_id").notNull(),
  nama: text("nama").notNull(),
  jenis: text("jenis").notNull(),
  deskripsi: text("deskripsi"),
  aktif: boolean("aktif").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUnitUsahaSchema = createInsertSchema(unitUsahaTable).omit({ id: true, createdAt: true });
export type InsertUnitUsaha = z.infer<typeof insertUnitUsahaSchema>;
export type UnitUsaha = typeof unitUsahaTable.$inferSelect;
