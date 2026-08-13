import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { SiteFooter } from "@/components/site-footer";

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="info-page">
      <BackButton />
      <header className="site-header info-header">
        <Link className="brand" href="/">CAST<span>.PRODS</span></Link>
        <Link className="info-home-link" href="/#departamentos">Explorar produtos</Link>
      </header>
      <section className="info-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <article className="info-content">{children}</article>
      <SiteFooter />
    </main>
  );
}
