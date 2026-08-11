"use client";

import { useMemo, useState } from "react";
import type { AgeGroup, CatalogProduct, Category, Department } from "@/lib/catalog";
import type { SavedAction, SavedState } from "@/lib/saved-products";

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

function firstCategoryFor(products: CatalogProduct[], ageGroup: AgeGroup): Category | null {
  return categoryOrder.find((item) => products.some(
    (product) => product.ageGroup === ageGroup && product.category === item,
  )) ?? null;
}

export function CatalogView({
  products,
  emptyMessage = "Nenhum produto encontrado neste subdiretório.",
  initialSavedState = { likedIds: [], cartIds: [] },
  isSignedIn = false,
  signInHref = "/signin-with-chatgpt?return_to=%2Fconta",
  simple = false,
  showAgeGrouping = false,
}: {
  products: CatalogProduct[];
  emptyMessage?: string;
  initialSavedState?: SavedState;
  isSignedIn?: boolean;
  signInHref?: string;
  simple?: boolean;
  showAgeGrouping?: boolean;
}) {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(() => initialAgeFor(products));
  const [category, setCategory] = useState<Category | null>(() => {
    if (simple) return null;
    const initialAge = initialAgeFor(products);
    return firstCategoryFor(products, initialAge);
  });
  const [likedIds, setLikedIds] = useState(() => new Set(initialSavedState.likedIds));
  const [cartIds, setCartIds] = useState(() => new Set(initialSavedState.cartIds));
  const [pending, setPending] = useState(() => new Set<string>());
  const [notice, setNotice] = useState("");
  const visibleForAge = useMemo(
    () => simple || !showAgeGrouping ? products : products.filter((product) => product.ageGroup === ageGroup),
    [ageGroup, products, showAgeGrouping, simple],
  );
  const filtered = useMemo(
    () => simple || !category
      ? visibleForAge
      : visibleForAge.filter((product) => product.category === category),
    [category, simple, visibleForAge],
  );
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
    setCategory(firstCategoryFor(products, nextAge));
  }

  async function toggleSaved(productId: number, action: SavedAction) {
    if (!isSignedIn) {
      window.location.assign(signInHref);
      return;
    }

    const key = `${action}-${productId}`;
    if (pending.has(key)) return;
    const currentSet = action === "liked" ? likedIds : cartIds;
    const setCurrent = action === "liked" ? setLikedIds : setCartIds;
    const active = !currentSet.has(productId);

    setPending((items) => new Set(items).add(key));
    setCurrent((items) => {
      const next = new Set(items);
      if (active) next.add(productId); else next.delete(productId);
      return next;
    });

    try {
      const response = await fetch("/api/saved", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, action, active }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar agora.");
      setNotice(action === "liked"
        ? (active ? "Produto adicionado aos curtidos." : "Produto retirado dos curtidos.")
        : (active ? "Produto adicionado ao carrinho." : "Produto retirado do carrinho."));
    } catch {
      setCurrent((items) => {
        const next = new Set(items);
        if (active) next.delete(productId); else next.add(productId);
        return next;
      });
      setNotice("Não foi possível salvar. Tente novamente.");
    } finally {
      setPending((items) => {
        const next = new Set(items);
        next.delete(key);
        return next;
      });
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
          return (
            <article className="product-card" key={product.id} style={{ animationDelay: `${index * 80}ms` }}>
              <div className="product-image-wrap">
                {imageSrc ? <img src={imageSrc} alt={product.title} /> : <div className="product-placeholder">CAST.PRODS</div>}
                <span className="product-category">{categoryLabels[product.category]}</span>
                {showAgeGrouping && product.ageGroup !== "geral" && <span className="product-age">{product.ageGroup === "infantil" ? "INFANTIL" : "ADULTO"}</span>}
                {isSample && <span className="sample-badge">DEMO</span>}
              </div>
              <div className="product-info">
                <p>{showAgeGrouping && product.ageGroup === "infantil" ? `${departmentLabels[product.department]} • INFANTIL` : `${departmentLabels[product.department]} • ${product.audience === "unissex" ? "UNISSEX" : product.audience.toUpperCase()}`}</p>
                <h2>{product.title}</h2>
                <span>{product.description}</span>
                {!isSample && <div className="product-save-actions">
                  <button
                    aria-pressed={likedIds.has(product.id)}
                    className={likedIds.has(product.id) ? "save-button save-button--active" : "save-button"}
                    disabled={pending.has(`liked-${product.id}`)}
                    onClick={() => toggleSaved(product.id, "liked")}
                    type="button"
                  >
                    <i aria-hidden="true">{likedIds.has(product.id) ? "♥" : "♡"}</i>
                    <span>{likedIds.has(product.id) ? "Curtido" : "Curtir"}</span>
                  </button>
                  <button
                    aria-pressed={cartIds.has(product.id)}
                    className={cartIds.has(product.id) ? "save-button save-button--active" : "save-button"}
                    disabled={pending.has(`cart-${product.id}`)}
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
                  <a className="product-link" href={product.productUrl} rel="noopener noreferrer sponsored" target="_blank">
                    Ver produto <b aria-hidden="true">↗</b>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="catalog-empty">{emptyMessage}</div>}
    </>
  );
}
