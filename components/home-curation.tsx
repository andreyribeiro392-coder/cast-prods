import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { productPriceDisplay } from "@/lib/price";
import { getProductDisplayTitle } from "@/lib/product-copy";

type HomeCurationKind = "top10" | "weekly";

const copy: Record<HomeCurationKind, { eyebrow: string; title: string; description: string }> = {
  top10: {
    eyebrow: "TOP 10 • MAIS PROCURADOS",
    title: "Os achados que estão em alta.",
    description: "Ordem baseada no volume de vendas informado nos anúncios da Shopee. Confira preço, estoque e avaliações atualizados na loja.",
  },
  weekly: {
    eyebrow: "SELEÇÃO ROTATIVA",
    title: "Destaques da semana.",
    description: "Uma nova seleção a cada semana, com itens práticos de casa, conforto e cuidados pessoais já cadastrados no CAST.PRODS.",
  },
};

export function HomeCuration({ kind, products }: { kind: HomeCurationKind; products: CatalogProduct[] }) {
  const sectionCopy = copy[kind];
  const isTopTen = kind === "top10";

  return (
    <section className={`home-curation home-curation--${kind}`} id={isTopTen ? "top-10" : "destaques-semana"} aria-labelledby={`home-curation-title-${kind}`}>
      <div className="home-curation__inner">
        <div className="home-curation__heading">
          <div>
            <p className="home-curation__eyebrow">{sectionCopy.eyebrow}</p>
            <h2 id={`home-curation-title-${kind}`}>{sectionCopy.title}</h2>
          </div>
          <p>{sectionCopy.description}</p>
        </div>
        {products.length > 0 ? (
          <div className="home-curation__grid">
            {products.map((product, index) => {
              const title = getProductDisplayTitle(product.title, 74);
              const price = productPriceDisplay(product.priceCents, product.price);
              const image = product.imageKey
                ? `/api/images/${encodeURIComponent(product.imageKey)}`
                : product.imageUrl;
              return (
                <Link className="home-curation__card" href={`/produto/${product.id}`} key={product.id}>
                  <div className="home-curation__image">
                    {image && <img alt={title} loading={index < 2 ? "eager" : "lazy"} src={image} />}
                    <span className="home-curation__badge">{isTopTen ? `#${String(index + 1).padStart(2, "0")}` : "DA SEMANA"}</span>
                  </div>
                  <div className="home-curation__body">
                    <span className="home-curation__category">{product.category.replaceAll("_", " ")}</span>
                    <h3>{title}</h3>
                    <strong className="home-curation__price">{price.value}</strong>
                    <div className="home-curation__meta">
                      <span>{product.sales ? `${product.sales} no anúncio` : "Link afiliado verificado"}</span>
                      <b>Ver oferta <span aria-hidden="true">↗</span></b>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="home-curation__empty">Os próximos produtos desta seleção aparecerão aqui assim que houver itens elegíveis no catálogo.</p>
        )}
      </div>
    </section>
  );
}
