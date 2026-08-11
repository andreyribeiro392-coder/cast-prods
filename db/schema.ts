import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  audience: text("audience", { enum: ["masculino", "feminino", "unissex"] }).notNull(),
  ageGroup: text("age_group", { enum: ["adulto", "infantil", "geral"] }).notNull().default("geral"),
  department: text("department", { enum: ["moda", "acessorios", "academia", "tecnologia", "casa", "beleza", "ferramentas", "esporte_lazer"] }).notNull().default("moda"),
  category: text("category", { enum: ["sapatos", "calcas", "blusas", "camisas", "moletons", "casacos", "shorts", "conjuntos", "vestidos", "pijamas", "roupas_intimas", "roupas_bebe", "fantasias", "meias", "mochilas", "acessorios", "bolsas", "pulseiras", "colares", "aneis", "cintos", "oculos", "bones", "brincos", "relogios", "cabelo", "gravatas", "piercings", "componentes_pc", "perifericos", "computadores", "monitores", "teclados", "audio", "celulares", "equipamentos", "suplementos", "casa_utilidades", "cama_banho", "limpeza", "cozinha", "organizacao", "decoracao", "moveis", "pets", "skincare", "higiene", "beleza_cabelo", "beleza_cuidados", "ferramentas", "automotivo", "mobilidade", "pesca", "brinquedos", "esporte_lazer"] }).notNull(),
  sourceItemId: text("source_item_id"),
  productUrl: text("product_url").notNull(),
  imageKey: text("image_key"),
  imageUrl: text("image_url"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("products_source_item_id_unique").on(table.sourceItemId),
]);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const userProductActions = sqliteTable("user_product_actions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  action: text("action", { enum: ["liked", "cart"] }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("user_product_actions_unique").on(table.userEmail, table.productId, table.action),
  index("user_product_actions_user_idx").on(table.userEmail, table.action),
]);
