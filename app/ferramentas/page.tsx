import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function FerramentasPage() {
  const [products, tiktokUrl] = await Promise.all([listProducts({ department: "ferramentas" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="ferramentas" products={products} tiktokUrl={tiktokUrl} />;
}
