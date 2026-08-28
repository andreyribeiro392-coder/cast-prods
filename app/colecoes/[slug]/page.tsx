import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { CatalogView } from "@/components/catalog-view";
import { SiteFooter } from "@/components/site-footer";
import { listProducts } from "@/lib/catalog";
import { collectionDefinitions, selectCollection, type CollectionSlug } from "@/lib/collections";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug as CollectionSlug;
  const definition = collectionDefinitions[slug];
  if (!definition) notFound();
  const products = selectCollection(await listProducts(), slug);
  return <main className="catalog-page collection-page"><BackButton /><header className="site-header catalog-header"><Link className="brand" href="/">CAST<span>.PRODS</span></Link><AccountNav /></header><section className="collection-hero"><p>{definition.eyebrow}</p><h1>{definition.title}</h1><span>{definition.description}</span><b>{products.length} produtos</b></section><section className="catalog-content"><CatalogView products={products} emptyMessage="Ainda não existem produtos com dados suficientes nesta coleção." /></section><SiteFooter /></main>;
}
