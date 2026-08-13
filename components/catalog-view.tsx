"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import type { AgeGroup, CatalogProduct, Category, Department } from "@/lib/catalog";
import { getProductDisplayTitle, getProductPitch } from "@/lib/product-copy";
import type { SavedAction } from "@/lib/saved-products";

const storageKeys: Record<SavedAction, string> = {
  liked: "cast-prods-liked",
  cart: "cast-prods-cart",
};

function readSavedIds(action: SavedAction): number[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKeys[action]) ?? "[]");
    return Array.isArray(value) ? value.filter((item) => Number.isInteger(item)) : [];
  } catch {
    return [];
  }
}

const categoryLabels: Record<Category, string> = {
  sapatos: "Sapatos",
  calcas: "Calças",
  blusas: "Blusas e camisetas",
  camisas: "Camisas",
  moletons: "Moletons",
  casacos: "Casacos",
  shorts: "Shorts e bermudas",
  conjuntos: "Conjuntos",
  vestidos: "Vestidos",
  pijamas: "Pijamas",
  roupas_intimas: "Roupas íntimas",
  roupas_bebe: "Roupas de bebê",
  fantasias: "Fantasias",
  meias: "Meias",
  mochilas: "Mochilas",
  acessorios: "Acessórios",
  bolsas: "Bolsas e carteiras",
  pulseiras: "Pulseiras",
  colares: "Colares e correntes",
  aneis: "Anéis",
  cintos: "Cintos",
  oculos: "Óculos",
  bones: "Bonés e chapéus",
  brincos: "Brincos e joias",
  relogios: "Relógios",
  cabelo: "Cabelo",
  gravatas: "Gravatas",
  piercings: "Piercings",
  componentes_pc: "Peças de PC",
  perifericos: "Periféricos",
  computadores: "Computadores",
  monitores: "Monitores",
  teclados: "Teclados",
  audio: "Áudio e fones",
  celulares: "Celulares",
  equipamentos: "Equipamentos",
  suplementos: "Suplementos",
  casa_utilidades: "Casa e utilidades",
  cama_banho: "Cama e banho",
  limpeza: "Limpeza",
  cozinha: "Cozinha",
  organizacao: "Organização",
  decoracao: "Decoração",
  moveis: "Móveis",
  pets: "Pets",
  skincare: "Cuidados com a pele",
  higiene: "Higiene",
  beleza_cabelo: "Cuidados com o cabelo",
  beleza_cuidados: "Beleza e cuidados",
  ferramentas: "Ferramentas",
  automotivo: "Automotivo",
  mobilidade: "Mobilidade",
  pesca: "Pesca",
  brinquedos: "Brinquedos",
  esporte_lazer: "Esporte e lazer",
};

const departmentLabels: Record<Department, string> = {
  moda: "MODA",
  acessorios: "ACESSÓRIOS",
  academia: "ACADEMIA",
  tecnologia: "TECNOLOGIA",
  casa: "CASA",
  beleza: "BELEZA",
  ferramentas: "FERRAMENTAS",
  esporte_lazer: "ESPORTE E LAZER",
};

const ageLabels: Record<AgeGroup, { eyebrow: string; title: string; description: string }> = {
  adulto: { eyebrow: "PARA ADULTOS", title: "Adulto", description: "Produtos selecionados para o público adulto." },
  infantil: { eyebrow: "PARA CRIANÇAS", title: "Infantil", description: "Achados selecionados para crianças." },
  geral: { eyebrow: "CATÁLOGO GERAL", title: "Geral", description: "Produtos que não dependem de faixa etária." },
};

const categoryOrder = Object.keys(categoryLabels) as Category[];

function initialAgeFor(products: CatalogProduct[]): AgeGroup {
  return products.some((product) => product.ageGroup === "adulto") ? "adulto" : "infantil";
}

export function CatalogView({
  products,
  emptyMessage = "Nenhum produto encontrado neste subdiretório.",
  savedOnly,
  simple = false,
  showAgeGrouping = false,
}: {
  products: CatalogProduct[];
  emptyMessage?: string;
  savedOnly?: SavedAction;
  simple?: boolean;
  showAgeGrouping?: boolean;
}) {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(() => initialAgeFor(products));
  const [category, setCategory] = useState<Category | null>(null);
  const [likedIds, setLikedIds] = useState(() => new Set<number>());
  const [cartIds, setCartIds] = useState(() => new Set<number>());
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLikedIds(new Set(readSavedIds("liked")));
      setCartIds(new Set(readSavedIds("cart")));
      setSavedLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const visibleForAge = useMemo(
    () => simple || !showAgeGrouping ? products : products.filter((product) => product.ageGroup === ageGroup),
    [ageGroup, products, showAgeGrouping, simple],
  );
  const categoryFiltered = useMemo(
    () => simple || !category
      ? visibleForAge
      : visibleForAge.filter((product) => product.category === category),
    [category, simple, visibleForAge],
  );
  const filtered = useMemo(() => {
    if (!savedOnly) return categoryFiltered;
    const savedIds = savedOnly === "liked" ? likedIds : cartIds;
    return categoryFiltered.filter((product) => savedIds.has(product.id));
  }, [cartIds, categoryFiltered, likedIds, savedOnly]);
  const availableCategories = useMemo(
    () => categoryOrder.filter((item) => visibleForAge.some((product) => product.category === item)),
    [visibleForAge],
  );
  const availableAgeGroups = useMemo(
    () => (Object.keys(ageLabels) as AgeGroup[]).filter(
      (item) => products.some((product) => product.ageGroup === item),
    ),
    [products],
  );

  function selectAge(nextAge: AgeGroup) {
    setAgeGroup(nextAge);
    setCategory(null);
  }

  function toggleSaved(productId: number, action: SavedAction) {
    const currentSet = action === "liked" ? likedIds : cartIds;
    const setCurrent = action === "liked" ? setLikedIds : setCartIds;
    const active = !currentSet.has(productId);
    const next = new Set(currentSet);
    if (active) next.add(productId); else next.delete(productId);
    setCurrent(next);
    try {
      window.localStorage.setItem(storageKeys[action], JSON.stringify([...next]));
      setNotice(action === "liked"
        ? (active ? "Produto adicionado aos curtidos." : "Produto retirado dos curtidos.")
        : (active ? "Produto adicionado ao carrinho." : "Produto retirado do carrinho."));
    } catch {
      setCurrent(currentSet);
      setNotice("Não foi possível salvar neste navegador.");
    }
  }

  return (
    <>
      <p className="save-notice" aria-live="polite">{notice}</p>
      {!simple && showAgeGrouping && availableAgeGroups.length > 1 && products.length > 0 && <div className="age-directory-grid" role="group" aria-label="Escolher faixa etária">
        {availableAgeGroups.map((item) => {
          const count = products.filter((product) => product.ageGroup === item).length;
          return (
            <button
              aria-pressed={ageGroup === item}
              className={ageGroup === item ? "age-directory age-directory--active" : "age-directory"}
              key={item}
              onClick={() => selectAge(item)}
              type="button"
            >
              <span>{ageLabels[item].eyebrow}</span>
              <strong>{ageLabels[item].title}</strong>
              <small>{ageLabels[item].description}</small>
              <b>{count.toString().padStart(2, "0")} itens <i aria-hidden="true">↘</i></b>
            </button>
          );
        })}
      </div>}

      {!simple && products.length > 0 && <><div className="filter-heading">
        <div><span>MODALIDADES</span><strong>Escolha uma categoria</strong></div>
        <small>{filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}</small>
      </div>
      <div className="filter-row" role="group" aria-label="Filtrar produtos por categoria">
        <button
          aria-pressed={category === null}
          className={category === null ? "filter-button filter-button--active" : "filter-button"}
          onClick={() => setCategory(null)}
          type="button"
        >
          Todos
        </button>
        {availableCategories.map((item) => (
          <button
            aria-pressed={category === item}
            className={category === item ? "filter-button filter-button--active" : "filter-button"}
            key={item}
            onClick={() => setCategory(item)}
            type="button"
          >
            {categoryLabels[item]}
          </button>
        ))}
      </div>
      </>}

      <div className="product-grid">
        {filtered.map((product, index) => {
          const imageSrc = product.imageKey ? `/api/images/${encodeURIComponent(product.imageKey)}` : product.imageUrl;
          const isSample = product.productUrl === "#";
          const displayTitle = getProductDisplayTitle(product.title);
          return (
            <article className="product-card" key={product.id} style={{ animationDelay: `${index * 80}ms` }}>
              <div className="product-image-wrap">
                {imageSrc ? <img src={imageSrc} alt={displayTitle} /> : <div className="product-placeholder">CAST.PRODS</div>}
                <span className="product-category">{categoryLabels[product.category]}</span>
                {!isSample && <span className="partner-badge">OFERTA NA SHOPEE</span>}
                {showAgeGrouping && product.ageGroup !== "geral" && <span className="product-age">{product.ageGroup === "infantil" ? "INFANTIL" : "ADULTO"}</span>}
                {isSample && <span className="sample-badge">DEMO</span>}
              </div>
              <div className="product-info">
                <p>{showAgeGrouping && product.ageGroup === "infantil" ? `${departmentLabels[product.department]} • INFANTIL` : `${departmentLabels[product.department]} • ${product.audience === "unissex" ? "UNISSEX" : product.audience.toUpperCase()}`}</p>
                <h2 title={product.title}>{displayTitle}</h2>
                <span>{getProductPitch(product)}</span>
                {!isSample && <div className="product-save-actions">
                  <button
                    aria-pressed={likedIds.has(product.id)}
                    className={likedIds.has(product.id) ? "save-button save-button--active" : "save-button"}
                    onClick={() => toggleSaved(product.id, "liked")}
                    type="button"
                  >
                    <i aria-hidden="true">{likedIds.has(product.id) ? "♥" : "♡"}</i>
                    <span>{likedIds.has(product.id) ? "Curtido" : "Curtir"}</span>
                  </button>
                  <button
                    aria-pressed={cartIds.has(product.id)}
                    className={cartIds.has(product.id) ? "save-button save-button--active" : "save-button"}
                    onClick={() => toggleSaved(product.id, "cart")}
                    type="button"
                  >
                    <i aria-hidden="true">{cartIds.has(product.id) ? "✓" : "+"}</i>
                    <span>{cartIds.has(product.id) ? "No carrinho" : "Carrinho"}</span>
                  </button>
                </div>}
                {isSample ? (
                  <span className="product-link product-link--disabled">Link adicionado pelo administrador</span>
                ) : (
                  <a
                    className="product-link"
                    href={product.productUrl}
                    onClick={() => track("produto_aberto", { categoria: product.category, departamento: product.department, produto: displayTitle })}
                    rel="noopener noreferrer sponsored"
                    target="_blank"
                  >
                    Ver preço atualizado <b aria-hidden="true">↗</b>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {(!savedOnly || savedLoaded) && filtered.length === 0 && <div className="catalog-empty">{emptyMessage}</div>}
    </>
  );
}
