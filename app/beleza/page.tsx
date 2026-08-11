import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function BelezaPage() {
  const [products, tiktokUrl] = await Promise.all([listProducts({ department: "beleza" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="beleza" products={products} tiktokUrl={tiktokUrl} />;
}
