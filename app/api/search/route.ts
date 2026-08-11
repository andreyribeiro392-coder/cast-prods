import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (query.length < 2) return Response.json({ products: [] });

  try {
    const db = await getDb();
    const normalizedQuery = normalizeSearch(query);
    const rows = await db
      .select({
        id: products.id,
        title: products.title,
        department: products.department,
        category: products.category,
        productUrl: products.productUrl,
        imageKey: products.imageKey,
        imageUrl: products.imageUrl,
        description: products.description,
      })
      .from(products)
      .orderBy(desc(products.createdAt), desc(products.id));

    const matches = rows
      .filter((product) => normalizeSearch(`${product.title} ${product.description}`).includes(normalizedQuery))
      .slice(0, 12)
      .map((product) => ({
        id: product.id,
        title: product.title,
        department: product.department,
        category: product.category,
        productUrl: product.productUrl,
        imageKey: product.imageKey,
        imageUrl: product.imageUrl,
      }));

    return Response.json({ products: matches });
  } catch {
    return Response.json({ products: [], error: "A pesquisa está temporariamente indisponível." }, { status: 503 });
  }
}

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
