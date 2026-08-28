import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function SportlifeStreetPage() {
  await fetch("https://site-andrei.xtzadas.chatgpt.site/sportlife-street", { cache: "no-store" }).catch(() => undefined);
  const [products, tiktokUrl] = await Promise.all([listProducts({ style: "sportlife_street" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="sportlife_street" products={products} tiktokUrl={tiktokUrl} />;
}
