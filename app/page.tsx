import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { HomeHighlights } from "@/components/home-highlights";
import { SiteFooter } from "@/components/site-footer";
import { getSetting, listProducts, type CatalogProduct } from "@/lib/catalog";
import { parseCatalogPrice } from "@/lib/price";

const DEFAULT_FEATURED_IDS = [433, 827, 619, 828, 826, 815, 830, 825];

function parseFeaturedIds(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => Number.isInteger(id) && id > 0)
      : DEFAULT_FEATURED_IDS;
  } catch {
    return DEFAULT_FEATURED_IDS;
  }
}

function selectFeaturedProducts(products: CatalogProduct[], featuredIds: number[]) {
  const ranked = [...products].sort((a, b) => {
    const aRank = featuredIds.indexOf(a.id);
    const bRank = featuredIds.indexOf(b.id);
    return (aRank < 0 ? 999 : aRank) - (bRank < 0 ? 999 : bRank);
  });
  const selected: CatalogProduct[] = [];
  const departments = new Set<string>();
  for (const product of ranked) {
    const preferred = featuredIds.includes(product.id);
    if (!preferred && departments.has(product.department)) continue;
    selected.push(product);
    departments.add(product.department);
    if (selected.length === 8) break;
  }
  return selected;
}

function selectPriceHighlights(products: CatalogProduct[], maximum: number) {
  const eligible = products
    .filter((product) => {
      const price = parseCatalogPrice(product.price);
      return price !== null && price <= maximum;
    })
    .sort((left, right) => right.id - left.id);
  const selected: CatalogProduct[] = [];
  const categories = new Set<string>();
  for (const product of eligible) {
    if (categories.has(product.category) && selected.length < 6) continue;
    selected.push(product);
    categories.add(product.category);
    if (selected.length === 8) break;
  }
  return selected;
}

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
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=86",
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
  const [tiktokUrl, products, featuredIdsValue] = await Promise.all([
    getSetting("tiktok_url"),
    listProducts(),
    getSetting("featured_product_ids"),
  ]);
  const featuredIds = parseFeaturedIds(featuredIdsValue);
  const featuredProducts = selectFeaturedProducts(products, featuredIds);
  const highlightGroups = {
    featured: featuredProducts,
    "10": selectPriceHighlights(products, 10),
    "19": selectPriceHighlights(products, 19),
    "50": selectPriceHighlights(products, 50),
    "100": selectPriceHighlights(products, 100),
    "1000": selectPriceHighlights(products, 1000),
  };
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

      <section className="trust-strip" aria-label="Como comprar">
        <div><b>01</b><span><strong>Escolha seu achado</strong>Use categorias ou pesquisa.</span></div>
        <div><b>02</b><span><strong>Confira a oferta atual</strong>Preço e estoque aparecem na loja.</span></div>
        <div><b>03</b><span><strong>Compre na plataforma</strong>Pagamento e entrega são feitos pela parceira.</span></div>
      </section>

      <section className="featured-section" id="destaques">
        <div className="section-heading featured-heading">
          <div>
            <p className="eyebrow eyebrow--dark">SELEÇÃO DA SEMANA</p>
            <h2>Achados em<br />destaque.</h2>
          </div>
          <p>Uma seleção de categorias diferentes para você começar. Abra o anúncio para conferir preço, avaliações, estoque e entrega atualizados.</p>
        </div>
        <HomeHighlights groups={highlightGroups} />
        <div className="featured-actions">
          <a className="primary-button primary-button--dark" href="#departamentos">Ver todos os departamentos <span aria-hidden="true">↘</span></a>
        </div>
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

      <SiteFooter />
    </main>
  );
}
