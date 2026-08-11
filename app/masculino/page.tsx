import { CatalogPage } from "@/components/catalog-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function MasculinoPage() {
  const [products, tiktokUrl] = await Promise.all([
    listProducts({ audience: "masculino", department: "moda", ageGroup: "adulto" }),
    getSetting("tiktok_url"),
  ]);
  return <CatalogPage audience="masculino" products={products} tiktokUrl={tiktokUrl} />;
}
