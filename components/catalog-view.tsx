"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import Link from "next/link";
import type { AgeGroup, CatalogProduct, Category, Department } from "@/lib/catalog";
import { parseCatalogPrice } from "@/lib/price";
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

type SortMode = "relevance" | "price-asc" | "price-desc" | "sales" | "rating" | "discount" | "popular";

function numericPrice(product: CatalogProduct) {
  return parseCatalogPrice(product.price);
}

function salesScore(product: CatalogProduct) {
  const value = product.sales?.toLowerCase().replace(/\s/g, "") ?? "";
  const amount = Number(value.replace(/[^\d,.]/g, "").replace(",", ".")) || 0;
  return value.includes("mil") ? amount * 1_000 : amount;
}

function advertisedOffer(product: CatalogProduct) {
  return Boolean(product.discountPercent && product.discountPercent > 0)
    || /\b(promo(?:ç|c)ão|oferta|desconto|liquida(?:ç|c)ão)\b/i.test(product.title);
}

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
  const [visibleCount, setVisibleCount] = useState(simple ? 12 : 24);
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
  const savedFiltered = useMemo(() => {
    if (!savedOnly) return categoryFiltered;
    const savedIds = savedOnly === "liked" ? likedIds : cartIds;
    return categoryFiltered.filter((product) => savedIds.has(product.id));
  }, [cartIds, categoryFiltered, likedIds, savedOnly]);
  const hasRatings = useMemo(() => products.some((product) => typeof product.rating === "number" && product.rating > 0), [products]);
  const hasDiscounts = useMemo(() => products.some(advertisedOffer), [products]);
  const priceLimits = useMemo(() => {
    const prices = products.map(numericPrice).filter((price): price is number => price !== null);
    return prices.length ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) } : null;
  }, [products]);
  const filtered = useMemo(() => {
    const min = minimumPrice === "" ? null : Number(minimumPrice);
    const max = maximumPrice === "" ? null : Number(maximumPrice);
    const next = savedFiltered.filter((product) => {
      const price = numericPrice(product);
      if (min !== null && (price === null || price < min)) return false;
      if (max !== null && (price === null || price > max)) return false;
      if (onlyOffers && !advertisedOffer(product)) return false;
      return true;
    });
    return [...next].sort((left, right) => {
      const leftPrice = numericPrice(left);
      const rightPrice = numericPrice(right);
      if (sortMode === "price-asc") return (leftPrice ?? Infinity) - (rightPrice ?? Infinity);
      if (sortMode === "price-desc") return (rightPrice ?? -1) - (leftPrice ?? -1);
      if (sortMode === "sales") return salesScore(right) - salesScore(left);
      if (sortMode === "rating") return (right.rating ?? 0) - (left.rating ?? 0);
      if (sortMode === "discount") return (right.discountPercent ?? 0) - (left.discountPercent ?? 0);
      if (sortMode === "popular") return (salesScore(right) * 100 + right.id) - (salesScore(left) * 100 + left.id);
      return 0;
    });
  }, [maximumPrice, minimumPrice, onlyOffers, savedFiltered, sortMode]);
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
    setVisibleCount(24);
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
      <button aria-expanded={mobileFiltersOpen} className="mobile-filter-toggle" onClick={() => setMobileFiltersOpen((value) => !value)} type="button"><span>Preço e ordenação</span><b>{mobileFiltersOpen ? "Fechar ×" : "Abrir filtros +"}</b></button>
      <div className={mobileFiltersOpen ? "catalog-controls catalog-controls--mobile-open" : "catalog-controls"} aria-label="Preço e ordem dos produtos">
        <div className="price-control">
          <span>FAIXA DE PREÇO</span>
          <label>De R$<input inputMode="decimal" min={priceLimits?.min ?? 0} onChange={(event) => { setMinimumPrice(event.target.value); setVisibleCount(24); }} placeholder={priceLimits ? String(priceLimits.min) : "0"} type="number" value={minimumPrice} /></label>
          <label>Até R$<input inputMode="decimal" min={0} onChange={(event) => { setMaximumPrice(event.target.value); setVisibleCount(24); }} placeholder={priceLimits ? String(priceLimits.max) : "999"} type="number" value={maximumPrice} /></label>
        </div>
        <label className="sort-control"><span>ORDENAR POR</span><select onChange={(event) => { setSortMode(event.target.value as SortMode); setVisibleCount(24); }} value={sortMode}>
          <option value="relevance">Recomendados</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="sales">Mais vendidos</option>
          <option value="popular">Mais populares</option>
          <option disabled={!hasRatings} value="rating">Melhor avaliados{!hasRatings ? " — aguardando dados" : ""}</option>
          <option disabled={!products.some((product) => product.discountPercent)} value="discount">Maior desconto</option>
        </select></label>
        <button aria-pressed={onlyOffers} className={onlyOffers ? "offers-toggle offers-toggle--active" : "offers-toggle"} disabled={!hasDiscounts} onClick={() => { setOnlyOffers((value) => !value); setVisibleCount(24); }} type="button"><b>%</b><span>Somente ofertas<small>{hasDiscounts ? "Promoções anunciadas" : "Sem ofertas informadas"}</small></span></button>
        <button className="clear-catalog-filters" disabled={!minimumPrice && !maximumPrice && !onlyOffers && sortMode === "relevance"} onClick={() => { setMinimumPrice(""); setMaximumPrice(""); setOnlyOffers(false); setSortMode("relevance"); setVisibleCount(24); }} type="button">Limpar filtros</button>
      </div>
      <div className="catalog-price-shortcuts" role="group" aria-label="Atalhos de preço máximo">
        {[10, 19, 50, 100, 1000].map((limit) => (
          <button
            aria-pressed={maximumPrice === String(limit)}
            className={maximumPrice === String(limit) ? "catalog-price-shortcut catalog-price-shortcut--active" : "catalog-price-shortcut"}
            key={limit}
            onClick={() => { setMaximumPrice(String(limit)); setVisibleCount(24); }}
            type="button"
          >
            Até R$ {limit.toLocaleString("pt-BR")}
          </button>
        ))}
      </div>
      <div className="filter-row" role="group" aria-label="Filtrar produtos por categoria">
        <button
          aria-pressed={category === null}
          className={category === null ? "filter-button filter-button--active" : "filter-button"}
          onClick={() => { setCategory(null); setVisibleCount(24); }}
          type="button"
        >
          Todos
        </button>
        {availableCategories.map((item) => (
          <button
            aria-pressed={category === item}
            className={category === item ? "filter-button filter-button--active" : "filter-button"}
            key={item}
            onClick={() => { setCategory(item); setVisibleCount(24); }}
            type="button"
          >
            {categoryLabels[item]}
          </button>
        ))}
      </div>
      </>}

      <div className="product-grid">
        {filtered.slice(0, visibleCount).map((product, index) => {
          const imageSrc = product.imageKey ? `/api/images/${encodeURIComponent(product.imageKey)}` : product.imageUrl;
          const isSample = product.productUrl === "#";
          const displayTitle = getProductDisplayTitle(product.title);
          return (
            <article className="product-card" key={product.id} style={{ animationDelay: `${index * 80}ms` }}>
              <div className="product-image-wrap">
                {imageSrc ? <img src={imageSrc} alt={displayTitle} loading={index < 6 ? "eager" : "lazy"} /> : <div className="product-placeholder">CAST.PRODS</div>}
                <span className="product-category">{categoryLabels[product.category]}</span>
                {!isSample && <span className="partner-badge">OFERTA NA SHOPEE</span>}
                {showAgeGrouping && product.ageGroup !== "geral" && <span className="product-age">{product.ageGroup === "infantil" ? "INFANTIL" : "ADULTO"}</span>}
                {isSample && <span className="sample-badge">DEMO</span>}
              </div>
              <div className="product-info">
                <p>{showAgeGrouping && product.ageGroup === "infantil" ? `${departmentLabels[product.department]} • INFANTIL` : `${departmentLabels[product.department]} • ${product.audience === "unissex" ? "UNISSEX" : product.audience.toUpperCase()}`}</p>
                <h2 title={product.title}>{displayTitle}</h2>
                <span>{getProductPitch(product)}</span>
                {(product.price || product.sales) && <div className="product-commerce-facts">
                  {product.price && <strong>{product.price}</strong>}
                  {product.sales && <small>{product.sales} vendidos</small>}
                </div>}
                {(product.rating || product.discountPercent) && <div className="product-market-signals">
                  {product.rating && <span aria-label={`${product.rating} de 5 estrelas`}>★ {product.rating.toFixed(1)}</span>}
                  {product.discountPercent && <b>-{product.discountPercent}%</b>}
                </div>}
                {!isSample && <div className="product-save-actions">
                  <button
                    aria-pressed={likedIds.has(product.id)}
                    className={likedIds.has(product.id) ? "save-button save-button--active" : "save-button"}
                    onClick={() => toggleSaved(product.id, "liked")}
                    type="button"
                  >
                    <i aria-hidden="true">{likedIds.has(product.id) ? "♥" : "♡"}</i>
                    <span>{likedIds.has(product.id) ? "1 curtida" : "0 curtidas"}</span>
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
                  <Link
                    className="product-link"
                    href={`/produto/${product.id}`}
                    onClick={() => track("produto_detalhes_aberto", { categoria: product.category, departamento: product.department, produto: displayTitle })}
                  >
                    Ver produto e comentários <b aria-hidden="true">→</b>
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {visibleCount < filtered.length && <div className="load-more-wrap"><button onClick={() => setVisibleCount((count) => count + 24)} type="button">Mostrar mais produtos <span>{visibleCount} de {filtered.length}</span></button></div>}
      {(!savedOnly || savedLoaded) && filtered.length === 0 && <div className="catalog-empty">{emptyMessage}</div>}
    </>
  );
}
