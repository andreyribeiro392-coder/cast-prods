import { CatalogPage } from "@/components/catalog-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function UnissexPage() {
  const [products, tiktokUrl] = await Promise.all([
    listProducts({ audience: "unissex", department: "moda", ageGroup: "adulto" }),
    getSetting("tiktok_url"),
  ]);
  return <CatalogPage audience="unissex" products={products} tiktokUrl={tiktokUrl} />;
}
