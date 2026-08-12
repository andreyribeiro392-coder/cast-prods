import { and, desc, eq, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { products, settings } from "@/db/schema";
import seededProducts from "@/data/products.json";

export type Audience = "masculino" | "feminino" | "unissex";
export type ProductAudience = Audience;
export type AgeGroup = "adulto" | "infantil" | "geral";
export type Department = "moda" | "acessorios" | "academia" | "tecnologia" | "casa" | "beleza" | "ferramentas" | "esporte_lazer";
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
  sourceItemId: string | null;
  productUrl: string;
  imageKey: string | null;
  imageUrl: string | null;
  createdAt: string;
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

export async function listProducts(filters: { audience?: Audience; department?: Department; ageGroup?: AgeGroup } = {}): Promise<CatalogProduct[]> {
  try {
    const db = await getDb();
    const conditions: SQL[] = [];
    // Gendered directories must stay strict. Unisex products remain available
    // through search and non-gendered directories instead of appearing in both.
    if (filters.audience) conditions.push(eq(products.audience, filters.audience));
    if (filters.department) conditions.push(eq(products.department, filters.department));
    if (filters.ageGroup) conditions.push(eq(products.ageGroup, filters.ageGroup));
    const rows = conditions.length
      ? await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt), desc(products.id))
      : await db.select().from(products).orderBy(desc(products.createdAt), desc(products.id));
    return rows as CatalogProduct[];
  } catch {
    // The designed sample collection keeps the first visit useful before the first upload.
  }
  return preservedProducts.filter((item) =>
    (!filters.audience || item.audience === filters.audience) &&
    (!filters.department || item.department === filters.department) &&
    (!filters.ageGroup || item.ageGroup === filters.ageGroup),
  );
}

export async function getSetting(key: string): Promise<string> {
  try {
    const db = await getDb();
    const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return row?.value ?? "";
  } catch {
    return "";
  }
}
