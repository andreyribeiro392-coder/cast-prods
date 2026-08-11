import Link from "next/link";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { CatalogView } from "@/components/catalog-view";
import { isAdminEmail } from "@/lib/admin";
import type { Audience, CatalogProduct } from "@/lib/catalog";
import { emptySavedState, getSavedState } from "@/lib/saved-products";

export async function CatalogPage({ audience, products, tiktokUrl }: { audience: Audience; products: CatalogProduct[]; tiktokUrl: string }) {
  const page = {
    masculino: { eyebrow: "MODA MASCULINA", title: "Presença em cada escolha.", description: "Roupas e calçados masculinos para o público adulto." },
    feminino: { eyebrow: "MODA FEMININA", title: "Seu estilo, do seu jeito.", description: "Roupas e calçados femininos para o público adulto." },
    unissex: { eyebrow: "MODA UNISSEX", title: "Estilo sem rótulos.", description: "Peças versáteis feitas para todos os estilos." },
  }[audience];
  const fashionProducts = products.filter((product) => product.department === "moda");
  const returnTo = `/${audience}`;
  const user = await getChatGPTUser();
  const savedState = user ? await getSavedState(user.email) : emptySavedState;
  return (
    <main className={`catalog-page catalog-page--${audience}`}>
      <BackButton />
      <header className="site-header catalog-header">
        <Link className="brand" href="/" aria-label="CAST.PRODS - início">CAST<span>.PRODS</span></Link>
        <nav className="header-nav" aria-label="Navegação da coleção">
          <Link href="/masculino">Masculino</Link>
          <Link href="/feminino">Feminino</Link>
          <Link href="/unissex">Unissex</Link>
          <Link href="/infantil">Infantil</Link>
          {tiktokUrl ? <a href={tiktokUrl} rel="noopener noreferrer" target="_blank">TikTok</a> : <Link href="/#social">TikTok</Link>}
          <AccountNav />
        </nav>
      </header>

      <section className="catalog-hero">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </div>
      </section>

      <section className="catalog-content">
        <div className="catalog-title-row">
          <div>
            <p className="eyebrow eyebrow--dark">COLEÇÃO ADULTA</p>
            <h2>Encontre seu próximo look.</h2>
          </div>
          <span>{fashionProducts.length} {fashionProducts.length === 1 ? "item" : "itens"}</span>
        </div>
        <CatalogView
          initialSavedState={savedState}
          isSignedIn={Boolean(user)}
          products={fashionProducts}
          signInHref={chatGPTSignInPath(returnTo)}
        />
      </section>

      <footer>
        <Link className="brand brand--footer" href="/">CAST<span>.PRODS</span></Link>
        <p>Achados para todos os momentos.</p>
        {isAdminEmail(user?.email) && <Link href="/admin">Área do administrador</Link>}
      </footer>
    </main>
  );
}
