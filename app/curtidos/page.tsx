import Link from "next/link";
import { chatGPTSignInPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { CatalogView } from "@/components/catalog-view";
import { getSavedState, listSavedProducts } from "@/lib/saved-products";

export const dynamic = "force-dynamic";

export default async function CurtidosPage() {
  const user = await requireChatGPTUser("/curtidos");
  const [products, savedState] = await Promise.all([
    listSavedProducts(user.email, "liked"),
    getSavedState(user.email),
  ]);

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
        <p>Marque seus favoritos com o coração e encontre todos eles aqui quando voltar.</p>
      </section>
      <section className="saved-content">
        <div className="saved-heading">
          <div><span>CURTIDOS</span><h2>{products.length ? "Seus favoritos em um só lugar." : "Nenhum produto curtido ainda."}</h2></div>
          <b>{products.length} {products.length === 1 ? "produto" : "produtos"}</b>
        </div>
        <CatalogView
          emptyMessage="Toque no coração de qualquer produto para montar sua lista de curtidos."
          initialSavedState={savedState}
          isSignedIn
          products={products}
          signInHref={chatGPTSignInPath("/curtidos")}
          simple
        />
        {!products.length && <Link className="member-cta" href="/#departamentos">Encontrar favoritos <span>↗</span></Link>}
      </section>
    </main>
  );
}
