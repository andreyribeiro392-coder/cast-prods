import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

function buildCatalog() {
  const db = new DatabaseSync(":memory:");
  const migrations = readdirSync(new URL("../drizzle", import.meta.url))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const migration of migrations) {
    const sql = readFileSync(new URL(`../drizzle/${migration}`, import.meta.url), "utf8");
    for (const statement of sql.split("--> statement-breakpoint").map((item) => item.trim()).filter(Boolean)) {
      db.exec(statement);
    }
  }
  return db;
}

test("catalog keeps gendered fashion directories separated", () => {
  const db = buildCatalog();
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const maleTerms = /\b(masculino|masculina|masculinos|masculinas|menino|meninos|cueca|cuecas)\b/;
  const femaleTerms = /\b(feminino|feminina|femenino|femenina|femininos|femininas|menina|meninas|calcinha|calcinhas)\b/;
  const conflicts = db.prepare(`
    SELECT id, title, audience
    FROM products
    WHERE department = 'moda' AND audience IN ('masculino', 'feminino')
  `).all().filter((product) => {
    const title = normalize(product.title);
    return product.audience === "masculino" ? femaleTerms.test(title) : maleTerms.test(title);
  });
  assert.deepEqual(conflicts, []);
});

test("adult label is restricted to fashion and accessories", () => {
  const db = buildCatalog();
  const misplaced = db.prepare(`
    SELECT id, title, department
    FROM products
    WHERE age_group = 'adulto'
      AND department NOT IN ('moda', 'acessorios')
  `).all();
  assert.deepEqual(misplaced, []);
});

test("department categories remain coherent", () => {
  const db = buildCatalog();
  const allowed = {
    moda: ["sapatos", "calcas", "blusas", "camisas", "moletons", "casacos", "shorts", "conjuntos", "vestidos", "pijamas", "roupas_intimas", "roupas_bebe", "fantasias"],
    acessorios: ["acessorios", "bolsas", "pulseiras", "colares", "aneis", "cintos", "oculos", "bones", "brincos", "relogios", "cabelo", "gravatas", "piercings", "meias", "mochilas"],
    tecnologia: ["componentes_pc", "perifericos", "computadores", "monitores", "teclados", "audio", "celulares"],
    academia: ["equipamentos", "suplementos", "sapatos", "calcas", "blusas", "camisas", "shorts", "conjuntos"],
    casa: ["casa_utilidades", "cama_banho", "limpeza", "cozinha", "organizacao", "decoracao", "moveis", "pets"],
    beleza: ["skincare", "higiene", "beleza_cabelo", "beleza_cuidados"],
    ferramentas: ["ferramentas", "automotivo"],
    esporte_lazer: ["mobilidade", "pesca", "brinquedos", "esporte_lazer"],
  };

  for (const [department, categories] of Object.entries(allowed)) {
    const placeholders = categories.map(() => "?").join(", ");
    const misplaced = db.prepare(`
      SELECT id, title, category
      FROM products
      WHERE department = ? AND category NOT IN (${placeholders})
    `).all(department, ...categories);
    assert.deepEqual(misplaced, [], `Categoria incorreta no departamento ${department}`);
  }
});

test("affiliate products remain unique", () => {
  const db = buildCatalog();
  const duplicates = db.prepare(`
    SELECT product_url, COUNT(*) AS total
    FROM products
    GROUP BY product_url
    HAVING COUNT(*) > 1
  `).all();
  assert.deepEqual(duplicates, []);
});
