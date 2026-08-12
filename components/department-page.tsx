import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { CatalogView } from "@/components/catalog-view";
import type { CatalogProduct, Department } from "@/lib/catalog";

type DirectoryPageKey = Department | "infantil";

const content: Record<DirectoryPageKey, { eyebrow: string; title: string; description: string; heading: string; empty: string }> = {
  moda: { eyebrow: "DEPARTAMENTO MODA", title: "Estilo para todos os momentos.", description: "Roupas, calçados e combinações para adultos e crianças.", heading: "Escolha seu próximo look.", empty: "As novidades de moda serão publicadas aqui." },
  acessorios: { eyebrow: "DEPARTAMENTO ACESSÓRIOS", title: "Detalhes que mudam tudo.", description: "Joias, pulseiras, cintos, óculos, bonés e muito mais.", heading: "Encontre o detalhe certo.", empty: "Novos acessórios chegarão em breve." },
  academia: { eyebrow: "DEPARTAMENTO ACADEMIA", title: "Movimento com mais conforto.", description: "Roupas esportivas e, em breve, equipamentos para seus treinos.", heading: "Prepare-se para o treino.", empty: "Os primeiros produtos de academia chegarão em breve." },
  tecnologia: { eyebrow: "DEPARTAMENTO TECNOLOGIA", title: "Seu setup começa aqui.", description: "Um novo espaço para peças de PC, periféricos e tecnologia.", heading: "Tecnologia e PC.", empty: "Este diretório já está pronto. Envie os links de peças de PC e periféricos para adicionar os primeiros produtos." },
  casa: { eyebrow: "DEPARTAMENTO CASA", title: "Boas escolhas para o seu espaço.", description: "Utilidades, organização e produtos para deixar a rotina mais prática.", heading: "Casa e utilidades.", empty: "Este diretório já está pronto para receber seus próximos produtos para casa." },
  beleza: { eyebrow: "DEPARTAMENTO BELEZA", title: "Cuidados que combinam com você.", description: "Skincare, cabelo, higiene e produtos para sua rotina de cuidados.", heading: "Beleza e cuidados.", empty: "Os primeiros produtos de beleza chegarão em breve." },
  ferramentas: { eyebrow: "FERRAMENTAS E AUTO", title: "Praticidade para fazer acontecer.", description: "Ferramentas, equipamentos e acessórios automotivos organizados em um só lugar.", heading: "Ferramentas e automotivo.", empty: "Os primeiros produtos de ferramentas chegarão em breve." },
  esporte_lazer: { eyebrow: "ESPORTE E LAZER", title: "Mais movimento para sua rotina.", description: "Bicicletas, mobilidade, pesca e achados para aproveitar seu tempo livre.", heading: "Esporte, mobilidade e lazer.", empty: "Os primeiros produtos de esporte e lazer chegarão em breve." },
  infantil: { eyebrow: "MODA INFANTIL", title: "Estilo para os pequenos.", description: "Somente roupas e calçados para bebês, meninos e meninas.", heading: "Moda infantil bem organizada.", empty: "As próximas roupas infantis chegarão em breve." },
};

export async function DepartmentPage({ directory, products, tiktokUrl }: { directory: DirectoryPageKey; products: CatalogProduct[]; tiktokUrl: string }) {
  const page = content[directory];
  return (
    <main className={`catalog-page catalog-page--${directory}`}>
      <BackButton />
      <header className="site-header catalog-header">
        <Link className="brand" href="/" aria-label="CAST.PRODS - início">CAST<span>.PRODS</span></Link>
        <nav className="header-nav" aria-label="Navegação por departamentos">
          <Link href="/masculino">Masculino</Link>
          <Link href="/feminino">Feminino</Link>
          <Link href="/unissex">Unissex</Link>
          <Link href="/acessorios">Acessórios</Link>
          <Link href="/tecnologia">Tecnologia</Link>
          {tiktokUrl ? <a href={tiktokUrl} rel="noopener noreferrer" target="_blank">TikTok</a> : <Link href="/#social">TikTok</Link>}
          <AccountNav />
        </nav>
      </header>

      <section className="catalog-hero"><div><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.description}</p></div></section>
      <section className="catalog-content">
        <div className="catalog-title-row"><div><p className="eyebrow eyebrow--dark">CATÁLOGO CAST.PRODS</p><h2>{page.heading}</h2></div><span>{products.length} {products.length === 1 ? "item" : "itens"}</span></div>
        <CatalogView
          emptyMessage={page.empty}
          products={products}
          showAgeGrouping={directory === "acessorios"}
        />
      </section>
      <footer><Link className="brand brand--footer" href="/">CAST<span>.PRODS</span></Link><p>Achados para todos os momentos.</p></footer>
    </main>
  );
}
