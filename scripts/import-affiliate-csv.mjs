import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uploadDir = path.resolve(root, "../upload");
const productFile = path.join(root, "data/products.json");

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

function normalized(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function includesAny(value, words) {
  return words.some((word) => value.includes(word));
}

function classify(title) {
  const value = normalized(title);
  const child = includesAny(value, ["infantil", "crianca", "menino", "menina", "bebe", "baby", "kids", "juvenil", "recem nascid"]);
  let audience = includesAny(value, ["feminino", "feminina", "mulher", "menina", "lady"]) ? "feminino"
    : includesAny(value, ["masculino", "masculina", "homem", "menino"]) ? "masculino" : "unissex";
  let department = "casa";
  let category = "casa_utilidades";

  const rules = [
    ["tecnologia", "teclados", ["teclado", "keyboard"]],
    ["tecnologia", "monitores", ["monitor gamer", "monitor led", "monitor pc"]],
    ["tecnologia", "computadores", ["notebook", "computador", "mini pc", "desktop"]],
    ["tecnologia", "componentes_pc", ["placa de video", "placa mae", "memoria ram", "ssd", "processador", "cooler cpu", "gabinete gamer"]],
    ["tecnologia", "audio", ["fone", "headset", "caixa de som", "microfone", "speaker"]],
    ["tecnologia", "celulares", ["smartphone", "celular", "carregador", "power bank", "cabo usb", "cabo tipo c"]],
    ["tecnologia", "perifericos", ["mouse", "webcam", "projetor", "camera", "controle gamer", "hub usb", "suporte celular", "ring light", "led vlog"]],
    ["ferramentas", "automotivo", ["carro", "pneu", "automotivo", "moto", "compressor", "calibrador", "lavadora de alta pressao"]],
    ["ferramentas", "ferramentas", ["furadeira", "parafusadeira", "serra", "chave", "ferramenta", "solda", "esmerilhadeira", "broca", "alicate", "martelete"]],
    ["beleza", "beleza_cabelo", ["shampoo", "condicionador", "cabelo", "barbeador", "secador", "chapinha", "escova secadora"]],
    ["beleza", "skincare", ["creme", "serum", "hidratante", "protetor solar", "clareador", "acido hialuronico", "skin care", "skincare"]],
    ["beleza", "higiene", ["sabonete", "desodorante", "higiene", "escova dental", "pasta de dente"]],
    ["beleza", "beleza_cuidados", ["maquiagem", "perfume", "batom", "rimel", "base facial", "unha", "depilador"]],
    ["academia", "suplementos", ["creatina", "whey", "suplemento", "pre treino", "proteina"]],
    ["academia", "equipamentos", ["academia", "fitness", "halter", "bicicleta ergometrica", "esteira", "colchonete", "elastico treino"]],
    ["esporte_lazer", "pesca", ["pesca", "pescaria", "vara de pescar", "molinete"]],
    ["esporte_lazer", "mobilidade", ["bicicleta", "patinete", "scooter"]],
    ["esporte_lazer", "brinquedos", ["brinquedo", "boneca", "carrinho controle", "lego", "blocos de montar"]],
    ["esporte_lazer", "esporte_lazer", ["esporte", "camping", "barraca", "bola", "mochila trilha"]],
    ["acessorios", "bolsas", ["bolsa", "carteira"]],
    ["acessorios", "mochilas", ["mochila"]],
    ["acessorios", "relogios", ["relogio", "smartwatch"]],
    ["acessorios", "oculos", ["oculos"]],
    ["acessorios", "bones", ["bone ", "chapeu", "touca"]],
    ["acessorios", "colares", ["colar", "corrente"]],
    ["acessorios", "pulseiras", ["pulseira"]],
    ["acessorios", "aneis", ["anel"]],
    ["acessorios", "brincos", ["brinco"]],
    ["acessorios", "cintos", ["cinto"]],
    ["moda", "sapatos", ["tenis", "sapato", "sandalia", "chinelo", "bota", "sapatilha"]],
    ["moda", "roupas_bebe", ["body bebe", "macacao bebe", "roupinha bebe", "saida maternidade"]],
    ["moda", "roupas_intimas", ["cueca", "calcinha", "sutia", "lingerie"]],
    ["moda", "vestidos", ["vestido"]],
    ["moda", "calcas", ["calca", "legging", "jeans"]],
    ["moda", "shorts", ["short", "bermuda"]],
    ["moda", "moletons", ["moletom"]],
    ["moda", "casacos", ["casaco", "jaqueta"]],
    ["moda", "camisas", ["camisa"]],
    ["moda", "blusas", ["blusa", "camiseta", "cropped", "regata", "top "]],
    ["moda", "conjuntos", ["conjunto"]],
    ["moda", "pijamas", ["pijama"]],
    ["casa", "pets", ["pet", "cachorro", "gato", "racao"]],
    ["casa", "cama_banho", ["cama", "lencol", "toalha", "cobertor", "manta", "travesseiro", "colchao"]],
    ["casa", "limpeza", ["limpa", "limpeza", "detergente", "vassoura", "aspirador", "lava roupa"]],
    ["casa", "cozinha", ["cozinha", "panela", "fritadeira", "air fryer", "cafeteira", "chaleira", "faca", "copo", "garrafa", "pote", "talher", "tapioqueira"]],
    ["casa", "organizacao", ["organizador", "prateleira", "sapateira", "cabide", "dispenser"]],
    ["casa", "decoracao", ["decoracao", "luminaria", "quadro", "tapete", "cortina", "vaso"]],
    ["casa", "moveis", ["cadeira", "mesa", "armario", "estante", "sofa"]],
  ];

  for (const [nextDepartment, nextCategory, words] of rules) {
    if (includesAny(value, words)) {
      department = nextDepartment;
      category = nextCategory;
      break;
    }
  }
  if (department !== "moda" && department !== "acessorios") audience = "unissex";
  const ageGroup = (department === "moda" || department === "acessorios") ? (child ? "infantil" : "adulto") : "geral";
  if (child && department === "moda" && category === "conjuntos" && value.includes("bebe")) category = "roupas_bebe";
  return { audience, ageGroup, department, category };
}

async function getImageUrl(productUrl) {
  try {
    const response = await fetch(productUrl, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    const html = await response.text();
    return html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1]
      ?? html.match(/name="twitter:image"\s+content="([^"]+)"/i)?.[1]
      ?? null;
  } catch {
    return null;
  }
}

const csvFiles = fs.readdirSync(uploadDir).filter((file) => file.endsWith(".csv")).sort();
const affiliateRows = csvFiles.flatMap((file) => parseCsv(fs.readFileSync(path.join(uploadDir, file), "utf8")));
const rowsById = new Map(affiliateRows.map((row) => [row["Item Id"], row]));
const existing = JSON.parse(fs.readFileSync(productFile, "utf8"));
const existingBySourceId = new Map(existing.filter((product) => product.sourceItemId).map((product) => [product.sourceItemId, product]));
let nextId = Math.max(...existing.map((product) => product.id), 0) + 1;
let added = 0;
let updated = 0;
let imageFailures = 0;
const newRows = [...rowsById.values()].filter((row) => !existingBySourceId.has(row["Item Id"]));
const newlyAddedIds = new Set(newRows.map((row) => row["Item Id"]));

let cursor = 0;
async function worker() {
  while (cursor < newRows.length) {
    const row = newRows[cursor];
    cursor += 1;
    const imageUrl = await getImageUrl(row["Product Link"]);
    if (!imageUrl) imageFailures += 1;
    const classification = classify(row["Item Name"]);
    const rating = Number(row.Rating || row["Rating Star"] || 0) || null;
    const discountPercent = Number(String(row.Discount || row["Discount Percent"] || "").replace(/[^\d.]/g, "")) || null;
    const product = {
      id: nextId++,
      title: row["Item Name"].trim(),
      description: `${row["Item Name"].trim()} — vendido por ${row["Nome da loja"] || "loja parceira"}. Preço informado no envio: R$ ${row.Price}. Confira estoque, avaliações, variações e valor atualizado na Shopee.`,
      ...classification,
      sourceItemId: row["Item Id"],
      productUrl: row["Offer Link"],
      imageKey: null,
      imageUrl,
      createdAt: "2026-08-13 01:29:10",
      price: row.Price ? `R$ ${row.Price}` : null,
      sales: row.Sales || null,
      storeName: row["Nome da loja"] || null,
      marketplace: "Shopee",
      ...(rating ? { rating } : {}),
      ...(discountPercent ? { discountPercent } : {}),
    };
    existing.push(product);
    existingBySourceId.set(product.sourceItemId, product);
    added += 1;
  }
}

await Promise.all(Array.from({ length: 10 }, worker));
for (const row of rowsById.values()) {
  const product = existingBySourceId.get(row["Item Id"]);
  if (!product || newlyAddedIds.has(row["Item Id"])) continue;
  product.productUrl = row["Offer Link"];
  product.price = row.Price ? `R$ ${row.Price}` : product.price ?? null;
  product.sales = row.Sales || product.sales || null;
  product.storeName = row["Nome da loja"] || product.storeName || null;
  product.marketplace = "Shopee";
  const rating = Number(row.Rating || row["Rating Star"] || 0) || product.rating || null;
  const discountPercent = Number(String(row.Discount || row["Discount Percent"] || "").replace(/[^\d.]/g, "")) || product.discountPercent || null;
  if (rating) product.rating = rating; else delete product.rating;
  if (discountPercent) product.discountPercent = discountPercent; else delete product.discountPercent;
  updated += 1;
}

existing.sort((a, b) => b.id - a.id);
fs.writeFileSync(productFile, `${JSON.stringify(existing, null, 2)}\n`);
console.log(JSON.stringify({ files: csvFiles.length, received: affiliateRows.length, unique: rowsById.size, added, updated, imageFailures, total: existing.length }, null, 2));
