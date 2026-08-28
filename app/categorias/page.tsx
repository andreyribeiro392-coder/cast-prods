import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { SiteFooter } from "@/components/site-footer";

const groups = [
  ["Moda", [["Masculino","/masculino"],["Feminino","/feminino"],["Unissex","/unissex"],["Infantil","/infantil"],["Streetwear","/sportlife-street"],["Futebol casual","/sportlife-futebol"]]],
  ["Departamentos", [["Acessórios","/acessorios"],["Academia","/academia"],["Tecnologia","/tecnologia"],["Casa","/casa"],["Beleza","/beleza"],["Ferramentas","/ferramentas"],["Esporte e lazer","/esporte"]]],
  ["Coleções", [["Promoções","/colecoes/promocoes"],["Novidades","/colecoes/novidades"],["Mais vendidos","/colecoes/vendidos"],["Melhores avaliações","/colecoes/avaliados"],["Até R$ 20","/colecoes/ate-20"],["Até R$ 50","/colecoes/ate-50"],["Até R$ 100","/colecoes/ate-100"]]],
] as const;

export default function CategoriesPage() { return <main className="categories-page"><BackButton /><header className="site-header catalog-header"><Link className="brand" href="/">CAST<span>.PRODS</span></Link><AccountNav /></header><section className="categories-shell"><p className="eyebrow">NAVEGUE DO SEU JEITO</p><h1>Todas as categorias.</h1><div className="categories-groups">{groups.map(([title, links]) => <section key={title}><h2>{title}</h2>{links.map(([label,href],index) => <Link href={href} key={href}><span>{String(index+1).padStart(2,"0")}</span><b>{label}</b><i>↗</i></Link>)}</section>)}</div></section><SiteFooter /></main>; }
