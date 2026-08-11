import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function EsportePage() {
  const [products, tiktokUrl] = await Promise.all([listProducts({ department: "esporte_lazer" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="esporte_lazer" products={products} tiktokUrl={tiktokUrl} />;
}
