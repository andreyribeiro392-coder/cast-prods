import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand-block">
        <Link className="brand brand--footer" href="/">CAST<span>.PRODS</span></Link>
        <p>Achados para todos os momentos.</p>
      </div>
      <nav aria-label="Informações e transparência" className="footer-links">
        <Link href="/categorias">Todas as categorias</Link>
        <Link href="/colecoes/promocoes">Promoções</Link>
        <Link href="/colecoes/novidades">Novidades</Link>
        <Link href="/sobre">Sobre</Link>
        <Link href="/contato">Contato</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/termos">Termos e afiliados</Link>
      </nav>
      <p className="footer-disclosure">Alguns links são de afiliados. A compra e o pagamento acontecem na loja parceira.</p>
    </footer>
  );
}
