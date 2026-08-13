import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/catalog";

const routes = [
  "",
  "/masculino",
  "/feminino",
  "/unissex",
  "/infantil",
  "/acessorios",
  "/academia",
  "/tecnologia",
  "/casa",
  "/beleza",
  "/ferramentas",
  "/esporte",
  "/sobre",
  "/contato",
  "/privacidade",
  "/termos",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();
  return [...routes.map((route) => ({
    url: `https://cast-prods.vercel.app${route}`,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/sobre") || route.startsWith("/contato") || route.startsWith("/privacidade") || route.startsWith("/termos") ? 0.4 : 0.8,
  })), ...products.map((product) => ({
    url: `https://cast-prods.vercel.app/produto/${product.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))];
}
