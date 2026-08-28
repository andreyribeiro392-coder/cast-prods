import { DepartmentPage } from "@/components/department-page";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function SportlifeFutebolPage() {
  await fetch("https://site-andrei.xtzadas.chatgpt.site/sportlife-futebol", { cache: "no-store" }).catch(() => undefined);
  const [products, tiktokUrl] = await Promise.all([listProducts({ style: "sportlife_futebol" }), getSetting("tiktok_url")]);
  return <DepartmentPage directory="sportlife_futebol" products={products} tiktokUrl={tiktokUrl} />;
}
