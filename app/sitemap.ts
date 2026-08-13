import type { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://cast-prods.vercel.app${route}`,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/sobre") || route.startsWith("/contato") || route.startsWith("/privacidade") || route.startsWith("/termos") ? 0.4 : 0.8,
  }));
}
