import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { CatalogView } from "@/components/catalog-view";
import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CurtidosPage() {
  const products = await listProducts();

  return (
    <main className="member-page member-page--liked">
      <BackButton />
      <header className="site-header member-header">
        <Link className="brand" href="/">CAST<span>.PRODS</span></Link>
        <AccountNav />
      </header>
      <section className="member-hero">
        <p className="eyebrow">SUA LISTA PESSOAL</p>
        <h1>Produtos curtidos.</h1>
        <p>Marque seus favoritos com o coração e encontre todos eles aqui neste dispositivo.</p>
      </section>
      <section className="saved-content">
        <div className="saved-heading">
          <div><span>CURTIDOS</span><h2>Seus favoritos em um só lugar.</h2></div>
          <b>Salvos neste navegador</b>
        </div>
        <CatalogView
          emptyMessage="Toque no coração de qualquer produto para montar sua lista de curtidos."
          products={products}
          savedOnly="liked"
          simple
        />
        <Link className="member-cta" href="/#departamentos">Encontrar favoritos <span>↗</span></Link>
      </section>
    </main>
  );
}
