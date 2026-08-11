import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function TecnologiaPage() {
  const [products, tiktokUrl] = await Promise.all([listProducts({ department: "tecnologia" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="tecnologia" products={products} tiktokUrl={tiktokUrl} />;
}
