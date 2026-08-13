import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { products, settings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const [catalog, siteSettings] = await Promise.all([
      db.select().from(products).orderBy(desc(products.createdAt), desc(products.id)),
      db.select().from(settings),
    ]);

    return Response.json(
      {
        products: catalog,
        settings: Object.fromEntries(siteSettings.map((entry) => [entry.key, entry.value])),
      },
      { headers: { "cache-control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json(
      { error: "O catálogo não está disponível no momento." },
      { status: 503, headers: { "cache-control": "no-store, max-age=0" } },
    );
  }
}
