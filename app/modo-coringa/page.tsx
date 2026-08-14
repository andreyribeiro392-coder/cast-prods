import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { CoringaBuilder } from "@/components/coringa-builder";
import { getSetting, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ModoCoringaPage() {
  const [products, featuredSetting] = await Promise.all([listProducts(), getSetting("featured_product_ids")]);
  let featuredIds: number[] = [];
  try {
    const parsed = JSON.parse(featuredSetting);
    if (Array.isArray(parsed)) featuredIds = parsed.filter(Number.isInteger);
  } catch {}

  return <main className="coringa-page">
    <BackButton />
    <header className="site-header site-header--overlay">
      <Link className="brand" href="/">CAST<span>.PRODS</span></Link>
      <nav className="header-nav" aria-label="Navegação do Modo Coringa"><Link href="/">Início</Link><Link href="/tecnologia">Tecnologia</Link><Link href="/carrinho">Carrinho</Link><AccountNav /></nav>
    </header>
    <section className="coringa-hero">
      <div className="coringa-hero-card" aria-hidden="true"><span>CAST</span><strong>♠</strong><b>PRODS</b></div>
      <div><p className="eyebrow">EXCLUSIVO CAST.PRODS</p><h1>Modo<br /><em>Coringa.</em></h1><p>Diga o que precisa e quanto quer gastar. Nós vasculhamos o catálogo e montamos opções prontas para você decidir mais rápido.</p><a href="#montar">Começar agora <span>↘</span></a></div>
      <aside><span>01</span><p>Escolha o objetivo</p><span>02</span><p>Informe seu orçamento</p><span>03</span><p>Receba três seleções</p></aside>
    </section>
    <div id="montar"><CoringaBuilder featuredIds={featuredIds} products={products} /></div>
    <footer><Link className="brand brand--footer" href="/">CAST<span>.PRODS</span></Link><p>Você diz a missão. O Modo Coringa encontra os achados.</p></footer>
  </main>;
}
