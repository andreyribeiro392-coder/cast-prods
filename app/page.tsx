import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { getSetting } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const fashionDirectories = [
  {
    href: "/masculino",
    eyebrow: "MODA MASCULINA",
    title: "Masculino",
    description: "Roupas e calçados masculinos para adultos.",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=86",
    className: "directory-card--dark",
  },
  {
    href: "/feminino",
    eyebrow: "MODA FEMININA",
    title: "Feminino",
    description: "Moda feminina adulta para todos os momentos.",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=86",
    className: "directory-card--light",
  },
  {
    href: "/unissex",
    eyebrow: "MODA SEM RÓTULOS",
    title: "Unissex",
    description: "Peças adultas versáteis para todos os estilos.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=86",
    className: "directory-card--unisex",
  },
  {
    href: "/infantil",
    eyebrow: "BEBÊS E CRIANÇAS",
    title: "Infantil",
    description: "Somente roupas e calçados para bebês, meninos e meninas.",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=86",
    className: "directory-card--kids",
  },
];

const directories = [
  {
    href: "/acessorios",
    eyebrow: "DETALHES E JOIAS",
    title: "Acessórios",
    description: "Colares, anéis, pulseiras, cintos, óculos, bonés e mais.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=86",
    className: "directory-card--accessories",
  },
  {
    href: "/academia",
    eyebrow: "TREINO E MOVIMENTO",
    title: "Academia",
    description: "Roupas esportivas e um espaço pronto para novos equipamentos.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=86",
    className: "directory-card--fitness",
  },
  {
    href: "/tecnologia",
    eyebrow: "TECNOLOGIA E PC",
    title: "Seu setup",
    description: "Computadores, monitores, teclados e periféricos para seu setup.",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=86",
    className: "directory-card--tech",
  },
  {
    href: "/casa",
    eyebrow: "CASA E UTILIDADES",
    title: "Para sua casa",
    description: "Limpeza, cama e banho, cozinha, organização e praticidade.",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=86",
    className: "directory-card--home",
  },
  {
    href: "/beleza",
    eyebrow: "BELEZA E CUIDADOS",
    title: "Cuide de você",
    description: "Skincare, cabelo, higiene e cuidados para sua rotina.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=86",
    className: "directory-card--beauty",
  },
  {
    href: "/ferramentas",
    eyebrow: "FERRAMENTAS E AUTO",
    title: "Mãos à obra",
    description: "Ferramentas, kits e acessórios automotivos para diferentes tarefas.",
    image: "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=1200&q=86",
    className: "directory-card--tools",
  },
  {
    href: "/esporte",
    eyebrow: "ESPORTE E LAZER",
    title: "Viva em movimento",
    description: "Bicicletas, mobilidade, pesca e produtos para seu tempo livre.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=86",
    className: "directory-card--sports",
  },
];

export default async function Home() {
  const tiktokUrl = await getSetting("tiktok_url");
  return (
    <main>
      <header className="site-header site-header--overlay">
        <Link className="brand" href="/" aria-label="CAST.PRODS - início">
          CAST<span>.PRODS</span>
        </Link>
        <nav className="header-nav" aria-label="Navegação principal">
          <Link href="#moda">Moda</Link>
          <Link href="#departamentos">Departamentos</Link>
          <Link href="/acessorios">Acessórios</Link>
          <Link href="/academia">Academia</Link>
          <Link href="#social">TikTok</Link>
          <AccountNav />
        </nav>
      </header>

      <section className="hero">
        <div className="hero-orb hero-orb--one" />
        <div className="hero-orb hero-orb--two" />
        <div className="joker-card joker-card--one" aria-hidden="true"><span>♠</span><b>A</b></div>
        <div className="joker-card joker-card--two" aria-hidden="true"><span>♣</span><b>J</b></div>
        <div className="joker-card joker-card--three" aria-hidden="true"><span>♦</span><b>K</b></div>
        <div className="hero-content reveal-up">
          <p className="eyebrow">ACHADOS PARA VOCÊ • 2026</p>
          <h1>
            Seu próximo achado
            <span>começa aqui.</span>
          </h1>
          <p className="hero-copy">
            Moda, infantil, acessórios, academia, tecnologia, casa, beleza, ferramentas e muito mais em um
            catálogo organizado para você encontrar tudo sem perder tempo.
          </p>
          <a className="primary-button" href="#moda">
            Explorar coleções <span aria-hidden="true">↘</span>
          </a>
        </div>
        <p className="scroll-cue"><span /> Role para descobrir</p>
      </section>

      <section className="directory-section fashion-section" id="moda">
        <div className="section-heading">
          <div>
            <p className="eyebrow eyebrow--dark">MODA POR ESTILO E IDADE</p>
            <h2>Moda para todos<br />os estilos.</h2>
          </div>
          <p>Masculino, feminino e unissex reúnem somente moda adulta. Infantil reúne somente roupas e calçados para crianças.</p>
        </div>

        <div className="directory-grid fashion-grid">
          {fashionDirectories.map((directory, index) => (
            <Link className={`directory-card fashion-card ${directory.className}`} href={directory.href} key={directory.href}>
              <img src={directory.image} alt="" />
              <div className="directory-shade" />
              <span className="fashion-number">0{index + 1}</span>
              <div className="directory-content"><p>{directory.eyebrow}</p><h3>{directory.title}</h3><span>{directory.description}</span></div>
              <div className="circle-arrow" aria-hidden="true">↗</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="directory-section departments-section" id="departamentos">
        <div className="section-heading">
          <div><p className="eyebrow eyebrow--dark">OUTROS DEPARTAMENTOS</p><h2>Muito além<br />da moda.</h2></div>
          <p>Acessórios ficam em um espaço próprio, separados das roupas. Explore também academia, tecnologia, casa, beleza, ferramentas, esporte e lazer.</p>
        </div>
        <div className="directory-grid departments-grid">
          {directories.map((directory) => (
            <Link
              className={`directory-card ${directory.className}`}
              href={directory.href}
              key={directory.href}
            >
              <img src={directory.image} alt="" />
              <div className="directory-shade" />
              <div className="directory-content">
                <p>{directory.eyebrow}</p>
                <h3>{directory.title}</h3>
                <span>{directory.description}</span>
              </div>
              <div className="circle-arrow" aria-hidden="true">↗</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="social-section" id="social">
        <div className="social-marquee" aria-hidden="true">
          <span>NOVIDADES • ACHADINHOS • TECNOLOGIA • INFANTIL • CASA • BELEZA • ACADEMIA •</span>
        </div>
        <div className="social-inner">
          <div>
            <p className="eyebrow">VÍDEOS NOVOS NO TIKTOK</p>
            <h2>Veja os produtos<br />em movimento.</h2>
          </div>
          <a
            className="tiktok-button"
            href={tiktokUrl || "#social"}
            rel={tiktokUrl ? "noopener noreferrer" : undefined}
            target={tiktokUrl ? "_blank" : undefined}
            aria-label={tiktokUrl ? "Abrir TikTok da CAST.PRODS" : "TikTok da CAST.PRODS"}
          >
            <span className="tiktok-note">♪</span>
            <span><small>ACOMPANHE NO</small>TikTok</span>
            <b aria-hidden="true">↗</b>
          </a>
        </div>
      </section>

      <footer>
        <Link className="brand brand--footer" href="/">CAST<span>.PRODS</span></Link>
        <p>Achados para todos os momentos.</p>
      </footer>
    </main>
  );
}
