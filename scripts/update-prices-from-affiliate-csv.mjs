import fs from "node:fs";
import path from "node:path";

const csvDirectory = process.argv[2];
const productFile = path.resolve(process.cwd(), "data/products.json");

if (!csvDirectory) {
  throw new Error("Uso: node scripts/update-prices-from-affiliate-csv.mjs <diretorio-dos-csvs>");
}

function parseCsv(source) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  const input = source.replace(/^\uFEFF/, "");

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else value += character;
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const headers = rows.shift() ?? [];
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

function normalizeTitle(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function priceToCents(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  const usesThousandsSuffix = raw.includes("mil");
  const normalized = raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * (usesThousandsSuffix ? 100_000 : 100)) : null;
}

function formatPrice(priceCents) {
  return (priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const csvFiles = fs.readdirSync(csvDirectory).filter((file) => file.toLowerCase().endsWith(".csv")).sort();
const rows = csvFiles.flatMap((file) => parseCsv(fs.readFileSync(path.join(csvDirectory, file), "utf8")));
const rowsById = new Map();
const rowsByOfferLink = new Map();
const titleCandidates = new Map();

for (const row of rows) {
  if (row["Item Id"]) rowsById.set(String(row["Item Id"]), row);
  if (row["Offer Link"]) rowsByOfferLink.set(row["Offer Link"].trim(), row);
  const title = normalizeTitle(row["Item Name"]);
  if (!titleCandidates.has(title)) titleCandidates.set(title, []);
  titleCandidates.get(title).push(row);
}

const products = JSON.parse(fs.readFileSync(productFile, "utf8"));
let matchedById = 0;
let matchedByOfferLink = 0;
let matchedByExactTitle = 0;
let updated = 0;

for (const product of products) {
  let row = product.sourceItemId ? rowsById.get(String(product.sourceItemId)) : undefined;
  if (row) matchedById += 1;

  if (!row && product.productUrl) {
    row = rowsByOfferLink.get(product.productUrl);
    if (row) matchedByOfferLink += 1;
  }

  if (!row && !product.sourceItemId) {
    const candidates = titleCandidates.get(normalizeTitle(product.title)) ?? [];
    if (candidates.length === 1) {
      [row] = candidates;
      matchedByExactTitle += 1;
    }
  }

  if (!row) continue;
  const priceCents = priceToCents(row.Price);
  if (!priceCents) continue;

  product.priceCents = priceCents;
  product.price = formatPrice(priceCents);
  product.sales = row.Sales || product.sales || null;
  product.storeName = row["Nome da loja"] || product.storeName || null;
  product.marketplace = "Shopee";
  if (!product.sourceItemId && row["Item Id"]) product.sourceItemId = String(row["Item Id"]);
  updated += 1;
}

// Um anúncio antigo pode apontar para o mesmo Item Id por meio de um link curto
// diferente. Mantemos apenas o registro que usa o Offer Link atual do arquivo e
// devolvemos os registros antigos duplicados ao estado sem preço (oculto).
const productsBySourceId = new Map();
for (const product of products.filter((item) => item.sourceItemId)) {
  const sourceItemId = String(product.sourceItemId);
  if (!productsBySourceId.has(sourceItemId)) productsBySourceId.set(sourceItemId, []);
  productsBySourceId.get(sourceItemId).push(product);
}

let hiddenDuplicates = 0;
for (const [sourceItemId, duplicates] of productsBySourceId) {
  if (duplicates.length < 2) continue;
  // O maior ID é o anúncio completo importado mais recentemente; os registros
  // menores são versões antigas e resumidas criadas antes da importação oficial.
  const canonical = duplicates.sort((left, right) => right.id - left.id)[0];

  for (const duplicate of duplicates) {
    if (duplicate === canonical) continue;
    duplicate.sourceItemId = null;
    delete duplicate.priceCents;
    delete duplicate.price;
    delete duplicate.sales;
    delete duplicate.storeName;
    delete duplicate.marketplace;
    hiddenDuplicates += 1;
  }
}

fs.writeFileSync(productFile, `${JSON.stringify(products, null, 2)}\n`);

console.log(JSON.stringify({
  csvFiles: csvFiles.length,
  csvRows: rows.length,
  uniqueCsvItems: rowsById.size,
  matchedById,
  matchedByOfferLink,
  matchedByExactTitle,
  updated,
  hiddenDuplicates,
  totalProducts: products.length,
  productsWithPrice: products.filter((product) => Number.isInteger(product.priceCents)).length,
  productsWithoutPrice: products.filter((product) => !Number.isInteger(product.priceCents)).length,
}, null, 2));
