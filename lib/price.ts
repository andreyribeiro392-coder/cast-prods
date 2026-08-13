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
