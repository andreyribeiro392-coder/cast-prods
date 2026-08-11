import { CatalogPage } from "@/components/catalog-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function FemininoPage() {
  const [products, tiktokUrl] = await Promise.all([
    listProducts({ audience: "feminino", department: "moda", ageGroup: "adulto" }),
    getSetting("tiktok_url"),
  ]);
  return <CatalogPage audience="feminino" products={products} tiktokUrl={tiktokUrl} />;
}
