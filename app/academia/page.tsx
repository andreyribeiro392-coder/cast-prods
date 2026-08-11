import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AcademiaPage() {
  const [products, tiktokUrl] = await Promise.all([listProducts({ department: "academia" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="academia" products={products} tiktokUrl={tiktokUrl} />;
}
