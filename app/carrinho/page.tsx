import Link from "next/link";
import { chatGPTSignInPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { CatalogView } from "@/components/catalog-view";
import { getSavedState, listSavedProducts } from "@/lib/saved-products";

export const dynamic = "force-dynamic";

export default async function CarrinhoPage() {
  const user = await requireChatGPTUser("/carrinho");
  const [products, savedState] = await Promise.all([
    listSavedProducts(user.email, "cart"),
    getSavedState(user.email),
  ]);

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
        <p>Os produtos que você guardou ficam salvos na sua conta. Abra o anúncio para comprar diretamente na loja.</p>
      </section>
      <section className="saved-content">
        <div className="saved-heading">
          <div><span>CARRINHO</span><h2>{products.length ? "Escolha o que vai levar." : "Seu carrinho está vazio."}</h2></div>
          <b>{products.length} {products.length === 1 ? "produto" : "produtos"}</b>
        </div>
        <CatalogView
          emptyMessage="Você ainda não adicionou produtos ao carrinho. Explore os departamentos e toque em Carrinho."
          initialSavedState={savedState}
          isSignedIn
          products={products}
          signInHref={chatGPTSignInPath("/carrinho")}
          simple
        />
        {!products.length && <Link className="member-cta" href="/#departamentos">Explorar produtos <span>↗</span></Link>}
      </section>
    </main>
  );
}
