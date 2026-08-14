import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (query.length < 2) return Response.json({ products: [] });

  const normalizedQuery = normalizeSearch(query);
  const catalog = await listProducts();
  const matches = catalog
    .filter((product) => normalizeSearch(`${product.title} ${product.description}`).includes(normalizedQuery))
    .slice(0, 12)
    .map(({ id, title, department, category, productUrl, priceCents, price, imageKey, imageUrl }) => ({
      id, title, department, category, productUrl, priceCents, price, imageKey, imageUrl,
    }));

  return Response.json(
    { products: matches },
    { headers: { "cache-control": "no-store, max-age=0" } },
  );
}

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
