import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { ProductEngagement } from "@/components/product-engagement";
import { SiteFooter } from "@/components/site-footer";
import { getProductById, listProducts } from "@/lib/catalog";
import { CatalogView } from "@/components/catalog-view";
import { getProductDisplayTitle, getProductPitch } from "@/lib/product-copy";
import { productPriceDisplay } from "@/lib/price";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const product = await getProductById(Number((await params).id));
  if (!product) return { title: "Produto não encontrado" };
  return { title: getProductDisplayTitle(product.title), description: getProductPitch(product) };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await getProductById(Number((await params).id));
  if (!product) notFound();
  const title = getProductDisplayTitle(product.title, 110);
  const imageSrc = product.imageKey ? `/api/images/${encodeURIComponent(product.imageKey)}` : product.imageUrl;
  const price = productPriceDisplay(product.priceCents, product.price);
  const related = (await listProducts()).filter((item) => item.id !== product.id && item.category === product.category).slice(0, 8);
  return (
    <main className="product-detail-page">
      <BackButton />
      <header className="site-header catalog-header"><Link className="brand" href="/">CAST<span>.PRODS</span></Link><AccountNav /></header>
      <section className="product-detail-shell">
        <div className="detail-image">{imageSrc ? <img alt={title} src={imageSrc} /> : <div className="product-placeholder">CAST.PRODS</div>}<span>{product.marketplace || "Loja parceira"}</span></div>
        <div className="detail-copy">
          <p className="eyebrow">ACHADO SELECIONADO • {product.storeName || "LOJA PARCEIRA"}</p>
          <h1>{title}</h1>
          <p>{getProductPitch(product)}</p>
          <div className={price.available ? "detail-price-showcase" : "detail-price-showcase detail-price-showcase--live"}><div><small>{price.eyebrow}</small><strong>{price.value}</strong><span>Confira o valor e o estoque antes de finalizar.</span></div><i aria-hidden="true">{price.available ? "R$" : "↗"}</i></div>
          <div className="detail-facts">
            {product.sales && <div><small>VENDAS INFORMADAS</small><strong>{product.sales}</strong></div>}
            <div><small>COMPRA SEGURA</small><strong>Na loja parceira</strong></div>
          </div>
          <a className="detail-buy" href={product.productUrl} rel="noopener noreferrer sponsored" target="_blank">Ver preço e estoque atualizados <span aria-hidden="true">↗</span></a>
          <p className="detail-disclaimer">Preço, estoque, avaliações, entrega e pagamento são definidos pela loja parceira e podem mudar. A CAST.PRODS pode receber comissão pela indicação, sem custo adicional para você.</p>
        </div>
      </section>
      <ProductEngagement productId={product.id} title={title} price={price.value} imageUrl={imageSrc} />
      {related.length > 0 && <section className="related-products"><p className="eyebrow">PRODUTOS SEMELHANTES</p><h2>Você também pode gostar.</h2><CatalogView products={related} simple /></section>}
      <SiteFooter />
    </main>
  );
}
