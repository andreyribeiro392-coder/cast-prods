import { and, desc, eq, isNotNull, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { products, settings } from "@/db/schema";
import seededProducts from "@/data/products.json";

export type Audience = "masculino" | "feminino" | "unissex";
export type ProductAudience = Audience;
export type AgeGroup = "adulto" | "infantil" | "geral";
export type Department = "moda" | "acessorios" | "academia" | "tecnologia" | "casa" | "beleza" | "ferramentas" | "esporte_lazer";
export type ProductStyle = "sportlife_street" | "sportlife_futebol";
export type Category =
  | "sapatos"
  | "calcas"
  | "blusas"
  | "camisas"
  | "moletons"
  | "casacos"
  | "shorts"
  | "conjuntos"
  | "vestidos"
  | "pijamas"
  | "roupas_intimas"
  | "roupas_bebe"
  | "fantasias"
  | "meias"
  | "mochilas"
  | "acessorios"
  | "bolsas"
  | "pulseiras"
  | "colares"
  | "aneis"
  | "cintos"
  | "oculos"
  | "bones"
  | "brincos"
  | "relogios"
  | "cabelo"
  | "gravatas"
  | "piercings"
  | "componentes_pc"
  | "perifericos"
  | "computadores"
  | "monitores"
  | "teclados"
  | "audio"
  | "celulares"
  | "equipamentos"
  | "suplementos"
  | "casa_utilidades"
  | "cama_banho"
  | "limpeza"
  | "cozinha"
  | "organizacao"
  | "decoracao"
  | "moveis"
  | "pets"
  | "skincare"
  | "higiene"
  | "beleza_cabelo"
  | "beleza_cuidados"
  | "ferramentas"
  | "automotivo"
  | "mobilidade"
  | "pesca"
  | "brinquedos"
  | "esporte_lazer";

export type CatalogProduct = {
  id: number;
  title: string;
  description: string;
  audience: ProductAudience;
  ageGroup: AgeGroup;
  department: Department;
  category: Category;
  style?: ProductStyle | null;
  sourceItemId: string | null;
  productUrl: string;
  priceCents?: number | null;
  imageKey: string | null;
  imageUrl: string | null;
  createdAt: string;
  price?: string | null;
  sales?: string | null;
  storeName?: string | null;
  marketplace?: string | null;
  rating?: number | null;
  discountPercent?: number | null;
};

export const sampleProducts: CatalogProduct[] = [
  {
    id: -1,
    title: "Tênis urbano essencial",
    description: "Visual limpo e confortável para acompanhar a rotina.",
    audience: "masculino",
    ageGroup: "adulto",
    department: "moda",
    category: "sapatos",
    sourceItemId: null,
    productUrl: "#",
    imageKey: null,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=84",
    createdAt: "",
  },
  {
    id: -2,
    title: "Calça de corte moderno",
    description: "Uma base versátil para combinações casuais e elegantes.",
    audience: "masculino",
    ageGroup: "adulto",
    department: "moda",
    category: "calcas",
    sourceItemId: null,
    productUrl: "#",
    imageKey: null,
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=84",
    createdAt: "",
  },
  {
    id: -3,
    title: "Blusa casual premium",
    description: "Textura, conforto e presença na medida certa.",
    audience: "masculino",
    ageGroup: "adulto",
    department: "moda",
    category: "blusas",
    sourceItemId: null,
    productUrl: "#",
    imageKey: null,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=84",
    createdAt: "",
  },
  {
    id: -4,
    title: "Salto de linhas delicadas",
    description: "Elegância leve para transformar qualquer produção.",
    audience: "feminino",
    ageGroup: "adulto",
    department: "moda",
    category: "sapatos",
    sourceItemId: null,
    productUrl: "#",
    imageKey: null,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=84",
    createdAt: "",
  },
  {
    id: -5,
    title: "Jeans de modelagem reta",
    description: "Um clássico atual para usar de muitas maneiras.",
    audience: "feminino",
    ageGroup: "adulto",
    department: "moda",
    category: "calcas",
    sourceItemId: null,
    productUrl: "#",
    imageKey: null,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=84",
    createdAt: "",
  },
  {
    id: -6,
    title: "Blusa de toque acetinado",
    description: "Sofisticação suave do dia à noite.",
    audience: "feminino",
    ageGroup: "adulto",
    department: "moda",
    category: "blusas",
    sourceItemId: null,
    productUrl: "#",
    imageKey: null,
    imageUrl: "https://images.unsplash.com/photo-1564257577054-38e0f2ba4a51?auto=format&fit=crop&w=900&q=84",
    createdAt: "",
  },
];

const preservedProducts = seededProducts as CatalogProduct[];

const CATALOG_API_URL = "https://site-andrei.xtzadas.chatgpt.site/api/catalog";

type RemoteCatalog = {
  products: CatalogProduct[];
  settings: Record<string, string>;
};

async function getRemoteCatalog(): Promise<RemoteCatalog | null> {
  if (!process.env.VERCEL) return null;

  try {
    const response = await fetch(CATALOG_API_URL, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;

    const payload = await response.json() as Partial<RemoteCatalog>;
    if (!Array.isArray(payload.products)) return null;

    const preservedBySourceId = new Map(preservedProducts.filter((item) => item.sourceItemId).map((item) => [item.sourceItemId, item]));
    const enrichedProducts = (payload.products as CatalogProduct[]).map((product) => {
      const preserved = product.sourceItemId ? preservedBySourceId.get(product.sourceItemId) : undefined;
      return preserved ? {
        ...product,
        price: product.price ?? preserved.price,
        sales: product.sales ?? preserved.sales,
        storeName: product.storeName ?? preserved.storeName,
        marketplace: product.marketplace ?? preserved.marketplace,
        rating: product.rating ?? preserved.rating,
        discountPercent: product.discountPercent ?? preserved.discountPercent,
      } : product;
    });

    return {
      products: enrichedProducts,
      settings: payload.settings && typeof payload.settings === "object"
        ? payload.settings as Record<string, string>
        : {},
    };
  } catch {
    return null;
  }
}

export async function listProducts(filters: { audience?: Audience; department?: Department; ageGroup?: AgeGroup; style?: ProductStyle } = {}): Promise<CatalogProduct[]> {
  const remoteCatalog = await getRemoteCatalog();
  if (remoteCatalog) {
    return remoteCatalog.products.filter((item) =>
      Number.isInteger(item.priceCents) &&
      (!filters.audience || item.audience === filters.audience) &&
      (!filters.department || item.department === filters.department) &&
      (!filters.ageGroup || item.ageGroup === filters.ageGroup) &&
      (!filters.style || item.style === filters.style),
    );
  }

  try {
    const db = await getDb();
    const conditions: SQL[] = [isNotNull(products.priceCents)];
    // Gendered directories must stay strict. Unisex products remain available
    // through search and non-gendered directories instead of appearing in both.
    if (filters.audience) conditions.push(eq(products.audience, filters.audience));
    if (filters.department) conditions.push(eq(products.department, filters.department));
    if (filters.ageGroup) conditions.push(eq(products.ageGroup, filters.ageGroup));
    if (filters.style) conditions.push(eq(products.style, filters.style));
    const rows = await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt), desc(products.id));
    return rows as CatalogProduct[];
  } catch {
    // The designed sample collection keeps the first visit useful before the first upload.
  }
  return preservedProducts.filter((item) =>
    Number.isInteger(item.priceCents) &&
    (!filters.audience || item.audience === filters.audience) &&
    (!filters.department || item.department === filters.department) &&
    (!filters.ageGroup || item.ageGroup === filters.ageGroup) &&
    (!filters.style || item.style === filters.style),
  );
}

export async function getSetting(key: string): Promise<string> {
  const fallback = key === "tiktok_url"
    ? "https://www.tiktok.com/@castszadas?is_from_webapp=1&sender_device=pc"
    : "";
  const remoteCatalog = await getRemoteCatalog();
  if (remoteCatalog) return remoteCatalog.settings[key] || fallback;

  try {
    const db = await getDb();
    const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return row?.value || fallback;
  } catch {
    return fallback;
  }
}

export async function getProductById(id: number): Promise<CatalogProduct | null> {
  if (!Number.isInteger(id) || id < 1) return null;
  const remoteCatalog = await getRemoteCatalog();
  if (remoteCatalog) return remoteCatalog.products.find((product) => product.id === id && Number.isInteger(product.priceCents)) ?? null;

  try {
    const db = await getDb();
    const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (row?.priceCents) return row as CatalogProduct;
  } catch {
    // The JSON catalog is the production-safe source when no database is linked.
  }
  return preservedProducts.find((product) => product.id === id && Number.isInteger(product.priceCents)) ?? null;
}
