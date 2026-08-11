import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AcessoriosPage() {
  const [products, tiktokUrl] = await Promise.all([listProducts({ department: "acessorios" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="acessorios" products={products} tiktokUrl={tiktokUrl} />;
}
