import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function InfantilPage() {
  const [products, tiktokUrl] = await Promise.all([listProducts({ ageGroup: "infantil", department: "moda" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="infantil" products={products} tiktokUrl={tiktokUrl} />;
}
