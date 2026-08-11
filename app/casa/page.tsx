import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CasaPage() {
  const [products, tiktokUrl] = await Promise.all([listProducts({ department: "casa" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="casa" products={products} tiktokUrl={tiktokUrl} />;
}
