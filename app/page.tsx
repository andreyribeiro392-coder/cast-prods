import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { HomeHighlights } from "@/components/home-highlights";
import { HomeCuration } from "@/components/home-curation";
import { SiteFooter } from "@/components/site-footer";
import { getSetting, listProducts, type CatalogProduct } from "@/lib/catalog";
import { parseCatalogPrice, productPriceDisplay } from "@/lib/price";
import { getProductDisplayTitle } from "@/lib/product-copy";

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
  const productsById = new Map(products.map((product) => [product.id, product]));
  return featuredIds
    .map((id) => productsById.get(id))
    .filter((product): product is CatalogProduct => Boolean(product));
}

const HOME_CURATION_CATEGORIES = new Set([
  "cozinha", "casa_utilidades", "cama_banho", "limpeza", "organizacao",
  "decoracao", "moveis", "ferramentas", "automotivo", "beleza_cabelo",
  "beleza_cuidados", "higiene", "skincare", "sapatos", "camisas", "calcas",
  "blusas", "pijamas", "casacos", "conjuntos", "relogios", "oculos", "audio",
  "celulares", "mobilidade", "esporte_lazer", "pesca", "bolsas", "acessorios",
]);

function productSalesScore(value: string | null | undefined) {
  if (!value) return 0;
  const normalized = value.toLowerCase().replace(/,/g, ".").replace(/\s/g, "");
  const match = normalized.match(/(\d+(?:\.\d+)?)(mil|k)?\+?/);
  if (!match) return 0;
  return Math.round(Number(match[1]) * (match[2] ? 1000 : 1));
}

function homeCurationCandidates(products: CatalogProduct[]) {
  const seenLinks = new Set<string>();
  return products.filter((product) => {
    const adultClothing = product.department !== "moda" || product.ageGroup === "adulto";
    const eligible = product.ageGroup !== "infantil" &&
      adultClothing &&
      HOME_CURATION_CATEGORIES.has(product.category) &&
      /^https:\/\/s\.shopee\.com\.br\//.test(product.productUrl) &&
      Boolean(product.imageKey || product.imageUrl) &&
      Number.isInteger(product.priceCents) &&
      productSalesScore(product.sales) > 0 &&
      !seenLinks.has(product.productUrl);
    if (eligible) seenLinks.add(product.productUrl);
    return eligible;
  }).sort((left, right) =>
    productSalesScore(right.sales) - productSalesScore(left.sales) || right.id - left.id
  );
}

function selectTopTen(products: CatalogProduct[]) {
  const candidates = homeCurationCandidates(products);
  const selected: CatalogProduct[] = [];
  const categories = new Set<string>();
  const departments = new Map<string, number>();
  for (const product of candidates) {
    const departmentCount = departments.get(product.department) ?? 0;
    if (categories.has(product.category) || departmentCount >= 2) continue;
    selected.push(product);
    categories.add(product.category);
    departments.set(product.department, departmentCount + 1);
    if (selected.length === 10) return selected;
  }
  for (const product of candidates) {
    if (selected.some((item) => item.id === product.id)) continue;
    selected.push(product);
    if (selected.length === 10) break;
  }
  return selected;
}

function selectWeeklyHighlights(products: CatalogProduct[], topTen: CatalogProduct[]) {
  const candidates = homeCurationCandidates(products).filter(
    (product) => !topTen.some((item) => item.id === product.id),
  );
  if (candidates.length === 0) return [];
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const start = (week * 13) % candidates.length;
  const selected: CatalogProduct[] = [];
  const categories = new Set<string>();
  const departments = new Map<string, number>();
  for (let offset = 0; offset < candidates.length && selected.length < 8; offset += 1) {
    const product = candidates[(start + offset) % candidates.length];
    const departmentCount = departments.get(product.department) ?? 0;
    if (categories.has(product.category) || departmentCount >= 3) continue;
    selected.push(product);
    categories.add(product.category);
    departments.set(product.department, departmentCount + 1);
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
    href: "/categorias",
    eyebrow: "MODA • ESTILO URBANO",
    title: "Streetwear",
    description: "Peças urbanas e confortáveis para montar seu estilo.",
    image: "/sportlife-street.png",
    position: "center 38%",
    className: "directory-card--dark",
  },
  {
    href: "/categorias",
    eyebrow: "MODA • DIA A DIA",
    title: "Looks casuais",
    description: "Roupas versáteis para diferentes momentos da rotina.",
    image: "/sportlife-futebol.png",
    position: "center 30%",
    className: "directory-card--sports",
  },
  {
    href: "/masculino",
    eyebrow: "MODA MASCULINA",
    title: "Masculino",
    description: "Roupas e calçados masculinos para adultos.",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=86",
    position: "center 24%",
    className: "directory-card--dark",
  },
  {
    href: "/feminino",
    eyebrow: "MODA FEMININA",
    title: "Feminino",
    description: "Moda feminina adulta para todos os momentos.",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=86",
    position: "center 28%",
    className: "directory-card--light",
  },
  {
    href: "/unissex",
    eyebrow: "MODA SEM RÓTULOS",
    title: "Unissex",
    description: "Peças adultas versáteis para todos os estilos.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=86",
    position: "center 22%",
    className: "directory-card--unisex",
  },
  {
    href: "/infantil",
    eyebrow: "BEBÊS E CRIANÇAS",
    title: "Infantil",
    description: "Somente roupas e calçados para bebês, meninos e meninas.",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=86",
    position: "center 32%",
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
  const topTen = selectTopTen(products);
  const weeklyHighlights = selectWeeklyHighlights(products, topTen);
  // Keep the catalog highlights intact; replace only the shorts in the hero showcase.
  const heroSelection = featuredProducts.filter((product) => product.imageKey || product.imageUrl).slice(0, 3);
  const heroElectronic = products.find((product) =>
    product.category === "audio" && /^fones?\b/i.test(product.title) && /bluetooth/i.test(product.title) &&
    (product.imageKey || product.imageUrl) &&
    !heroSelection.some((featured) => featured.id === product.id)
  );
  const heroProducts = heroSelection.map((product) =>
    product.category === "shorts" && heroElectronic ? heroElectronic : product
  );
  const highlightGroups = {
    featured: featuredProducts,
    "10": selectPriceHighlights(products, 10),
    "19": selectPriceHighlights(products, 19),
    "50": selectPriceHighlights(products, 50),
    "100": selectPriceHighlights(products, 100),
    "1000": selectPriceHighlights(products, 1000),
  };
  return (
    <main className="storefront-v4">
      <div className="store-announcement"><span>CURADORIA CAST.PRODS</span><b aria-hidden="true">/</b><span>ESCOLHAS PARA O SEU DIA A DIA</span><b aria-hidden="true">/</b><span>COMPRA DIRETO NA LOJA PARCEIRA</span></div>
      <header className="site-header site-header--overlay store-header">
        <Link className="brand" href="/" aria-label="CAST.PRODS - início">
          CAST<span>.PRODS</span>
        </Link>
        <nav className="header-nav" aria-label="Navegação principal">
          <Link href="/colecoes/promocoes">Promoções</Link>
          <Link href="#moda">Moda</Link>
          <Link href="/categorias">Categorias</Link>
          <Link href="/tecnologia">Tecnologia</Link>
          <Link href="/casa">Casa</Link>
          <AccountNav />
        </nav>
      </header>

      <section className="hero store-hero">
        <div className="store-hero-copy">
          <p className="eyebrow">ESCOLHA MENOS ÓBVIO.</p>
          <h1>Seu próximo<br /><span>bom achado.</span></h1>
          <p>Do seu estilo ao seu espaço. Explore a seleção, compare os detalhes e encontre o que combina com você.</p>
          <div className="hero-actions"><a className="primary-button" href="#destaques">Explorar achados <span aria-hidden="true">↗</span></a><a className="secondary-hero-button" href="#departamentos">Ver departamentos</a></div>
          <div className="store-hero-stats"><div><strong>{products.length.toLocaleString("pt-BR")}</strong><span>produtos para descobrir</span></div><div><strong>Seu ritmo.</strong><span>Salve. Compare. Escolha.</span></div></div>
        </div>
        {heroProducts.length > 0 && <div className="editorial-shelf" aria-label="Uma prévia da seleção">
          <div className="shelf-heading"><span>NA NOSSA SELEÇÃO</span><span>01 — {String(heroProducts.length).padStart(2, "0")}</span></div>
          <div className="shelf-products">
            {heroProducts.map((product, index) => {
              const title = getProductDisplayTitle(product.title, 60);
              const price = productPriceDisplay(product.priceCents, product.price);
              return <Link className={`shelf-product shelf-product--${index + 1}`} href={`/produto/${product.id}`} key={product.id}>
                <div className="shelf-image"><img src={product.imageKey ? `/api/images/${encodeURIComponent(product.imageKey)}` : product.imageUrl!} alt={title} loading={index === 0 ? "eager" : "lazy"} /><span className="shelf-index" aria-hidden="true">0{index + 1}</span></div>
                <div className="shelf-caption"><div><span>{title}</span><strong>{price.value}</strong></div><b aria-hidden="true">↗</b></div>
              </Link>;
            })}
          </div>
          <p className="shelf-footnote">Um novo olhar para as suas próximas escolhas.</p>
        </div>}
      </section>

      <HomeCuration kind="top10" products={topTen} />
      <HomeCuration kind="weekly" products={weeklyHighlights} />

      <section className="trust-strip" aria-label="Como comprar">
        <div><b>01</b><span><strong>Escolha seu achado</strong>Use categorias ou pesquisa.</span></div>
        <div><b>02</b><span><strong>Confira a oferta atual</strong>Preço e estoque aparecem na loja.</span></div>
        <div><b>03</b><span><strong>Compre na plataforma</strong>Pagamento e entrega são feitos pela parceira.</span></div>
      </section>

      <nav className="collection-shortcuts" aria-label="Coleções rápidas"><Link href="/colecoes/promocoes"><span>01</span><b>Promoções</b><i>↗</i></Link><Link href="/colecoes/novidades"><span>02</span><b>Novidades</b><i>↗</i></Link><Link href="#top-10"><span>03</span><b>Top 10</b><i>↗</i></Link><Link href="/colecoes/avaliados"><span>04</span><b>Melhores avaliações</b><i>↗</i></Link><Link href="/categorias"><span>05</span><b>Todas as categorias</b><i>↗</i></Link></nav>

      <section className="featured-section" id="destaques">
        <div className="section-heading featured-heading">
          <div>
            <p className="eyebrow eyebrow--dark">01 / A SELEÇÃO</p>
            <h2>Vale descobrir.</h2>
          </div>
          <p>Use os filtros rápidos por orçamento e encontre produtos de várias categorias sem perder tempo.</p>
        </div>
        <HomeHighlights groups={highlightGroups} />
        <div className="featured-actions">
          <a className="primary-button primary-button--dark" href="#departamentos">Ver todos os departamentos <span aria-hidden="true">↘</span></a>
        </div>
      </section>

      <section className="directory-section fashion-section" id="moda">
        <div className="section-heading">
          <div>
            <p className="eyebrow eyebrow--dark">02 / SEU ESTILO</p>
            <h2>Moda para todos<br />os estilos.</h2>
          </div>
          <p>Masculino, feminino e unissex reúnem somente moda adulta. Infantil reúne somente roupas e calçados para crianças.</p>
        </div>

        <div className="directory-grid fashion-grid">
          {fashionDirectories.map((directory, index) => (
            <Link className={`directory-card fashion-card ${directory.className}`} href={directory.href} key={directory.title}>
              <img src={directory.image} alt="" loading="lazy" style={{ objectPosition: directory.position }} />
              <div className="directory-shade" />
              <span className="fashion-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="directory-content"><p>{directory.eyebrow}</p><h3>{directory.title}</h3><span>{directory.description}</span></div>
              <div className="circle-arrow" aria-hidden="true">↗</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="directory-section departments-section" id="departamentos">
        <div className="section-heading">
          <div><p className="eyebrow eyebrow--dark">03 / SEU UNIVERSO</p><h2>Muito além<br />da moda.</h2></div>
          <p>Acessórios ficam em um espaço próprio, separados das roupas. Explore também academia, tecnologia, casa, beleza, ferramentas, esporte e lazer.</p>
        </div>
        <div className="directory-grid departments-grid">
          {directories.map((directory) => (
            <Link
              className={`directory-card ${directory.className}`}
              href={directory.href}
              key={directory.href}
            >
              <img src={directory.image} alt="" loading="lazy" />
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
