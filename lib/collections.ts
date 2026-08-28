import type { CatalogProduct } from "@/lib/catalog";
import { parseCatalogPrice } from "@/lib/price";

export const collectionDefinitions = {
  promocoes: { eyebrow: "OFERTAS E DESCONTOS", title: "Promoções", description: "Produtos com desconto informado ou sinal de oferta no anúncio." },
  novidades: { eyebrow: "RECÉM-ADICIONADOS", title: "Novidades", description: "Os produtos mais recentes do catálogo CAST.PRODS." },
  vendidos: { eyebrow: "PREFERIDOS DO PÚBLICO", title: "Mais vendidos", description: "Achados ordenados pelo volume de vendas informado." },
  avaliados: { eyebrow: "COMPRA BEM AVALIADA", title: "Melhores avaliações", description: "Produtos com as maiores avaliações disponíveis." },
  "ate-20": { eyebrow: "ECONOMIZE", title: "Até R$ 20", description: "Produtos com preço confirmado de até vinte reais." },
  "ate-50": { eyebrow: "BOM CUSTO-BENEFÍCIO", title: "Até R$ 50", description: "Produtos com preço confirmado de até cinquenta reais." },
  "ate-100": { eyebrow: "ESCOLHAS ACESSÍVEIS", title: "Até R$ 100", description: "Produtos com preço confirmado de até cem reais." },
} as const;

export type CollectionSlug = keyof typeof collectionDefinitions;

function price(product: CatalogProduct) { return product.priceCents ? product.priceCents / 100 : parseCatalogPrice(product.price); }
function sales(product: CatalogProduct) {
  const value = product.sales?.toLowerCase().replace(/\s/g, "") ?? "";
  const amount = Number(value.replace(/[^\d,.]/g, "").replace(",", ".")) || 0;
  return value.includes("mil") ? amount * 1000 : amount;
}

export function selectCollection(products: CatalogProduct[], slug: CollectionSlug) {
  if (slug === "promocoes") return products.filter((item) => (item.discountPercent ?? 0) > 0 || /promo|oferta|desconto/i.test(item.title)).sort((a,b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
  if (slug === "novidades") return [...products].sort((a,b) => b.id - a.id);
  if (slug === "vendidos") return products.filter((item) => sales(item) > 0).sort((a,b) => sales(b) - sales(a));
  if (slug === "avaliados") return products.filter((item) => (item.rating ?? 0) > 0).sort((a,b) => (b.rating ?? 0) - (a.rating ?? 0));
  const limit = slug === "ate-20" ? 20 : slug === "ate-50" ? 50 : 100;
  return products.filter((item) => { const value = price(item); return value !== null && value <= limit; }).sort((a,b) => (price(a) ?? 0) - (price(b) ?? 0));
}
