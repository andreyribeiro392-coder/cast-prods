export function parseCatalogPrice(price: string | null | undefined) {
  if (!price) return null;
  const normalized = price.toLowerCase().replace(/r\$/g, "").replace(/\s/g, "");
  const multiplier = normalized.includes("mil") ? 1_000 : 1;
  const numeric = normalized.replace(/mil/g, "").replace(/[^\d,.-]/g, "");
  const decimal = numeric.includes(",")
    ? numeric.replace(/\./g, "").replace(",", ".")
    : numeric;
  const value = Number(decimal);
  return Number.isFinite(value) ? value * multiplier : null;
}

export function formatPriceCents(priceCents: number | null | undefined) {
  if (!priceCents) return null;
  return (priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function productPriceDisplay(priceCents: number | null | undefined, price: string | null | undefined) {
  const formatted = formatPriceCents(priceCents) ?? price?.trim() ?? null;
  return formatted
    ? { eyebrow: "PREÇO DO ACHADO", value: formatted, available: true }
    : { eyebrow: "PREÇO ATUALIZADO", value: "Ver na Shopee", available: false };
}
