import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const produkTable = pgTable("produk", {
  id: serial("id").primaryKey(),
  unitUsahaId: integer("unit_usaha_id").notNull(),
  nama: text("nama").notNull(),
  kategori: text("kategori").notNull(),
  hargaBeli: numeric("harga_beli", { precision: 15, scale: 2 }).notNull(),
  hargaJual: numeric("harga_jual", { precision: 15, scale: 2 }).notNull(),
  stok: numeric("stok", { precision: 10, scale: 2 }).notNull().default("0"),
  satuan: text("satuan").notNull(),
  gambarUrl: text("gambar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProdukSchema = createInsertSchema(produkTable).omit({ id: true, createdAt: true });
export type InsertProduk = z.infer<typeof insertProdukSchema>;
export type Produk = typeof produkTable.$inferSelect;
