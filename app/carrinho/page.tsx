import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { CatalogView } from "@/components/catalog-view";
import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CarrinhoPage() {
  const products = await listProducts();

  return (
    <main className="member-page">
      <BackButton />
      <header className="site-header member-header">
        <Link className="brand" href="/">CAST<span>.PRODS</span></Link>
        <AccountNav />
      </header>
      <section className="member-hero">
        <p className="eyebrow">SEUS ACHADOS</p>
        <h1>Meu carrinho.</h1>
        <p>Os produtos que você guardou ficam salvos neste dispositivo. Abra o anúncio para comprar diretamente na loja.</p>
      </section>
      <section className="saved-content">
        <div className="saved-heading">
          <div><span>CARRINHO</span><h2>Escolha o que vai levar.</h2></div>
          <b>Salvo neste navegador</b>
        </div>
        <CatalogView
          emptyMessage="Você ainda não adicionou produtos ao carrinho. Explore os departamentos e toque em Carrinho."
          products={products}
          savedOnly="cart"
          simple
        />
        <Link className="member-cta" href="/#departamentos">Explorar produtos <span>↗</span></Link>
      </section>
    </main>
  );
}
