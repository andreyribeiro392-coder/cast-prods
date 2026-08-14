"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { getProductDisplayTitle } from "@/lib/product-copy";
import { productPriceDisplay } from "@/lib/price";

type SearchProduct = {
  id: number;
  title: string;
  department: string;
  category: string;
  productUrl: string;
  priceCents?: number | null;
  price?: string | null;
  imageKey: string | null;
  imageUrl: string | null;
};

const departmentLabels: Record<string, string> = {
  moda: "Moda",
  acessorios: "Acessórios",
  academia: "Academia",
  tecnologia: "Tecnologia",
  casa: "Casa",
  beleza: "Beleza",
  ferramentas: "Ferramentas",
  esporte_lazer: "Esporte e lazer",
};

function readableCategory(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ProductSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const data = await response.json() as { products?: SearchProduct[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Não foi possível pesquisar.");
        setResults(data.products ?? []);
      } catch (searchError) {
        if (searchError instanceof DOMException && searchError.name === "AbortError") return;
        setResults([]);
        setError("Não foi possível pesquisar agora. Tente novamente.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query]);

  function updateQuery(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
    }
  }

  return (
    <>
      <button className="account-link account-search-trigger" onClick={() => setOpen(true)} type="button">
        <span aria-hidden="true">⌕</span><b>Buscar</b>
      </button>
      {open && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Pesquisar produtos">
        <div className="search-panel">
          <div className="search-panel-top">
            <div><small>PESQUISA CAST.PRODS</small><strong>Encontre seu próximo achado.</strong></div>
            <button aria-label="Fechar pesquisa" onClick={() => setOpen(false)} type="button">×</button>
          </div>
          <label className="search-input-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              autoComplete="off"
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Pesquise por tênis, teclado, creatina..."
              ref={inputRef}
              type="search"
              value={query}
            />
            {query && <button aria-label="Limpar pesquisa" onClick={() => updateQuery("")} type="button">Limpar</button>}
          </label>

          <div className="search-status" aria-live="polite">
            {query.trim().length < 2 && <p>Digite pelo menos duas letras para pesquisar.</p>}
            {loading && <p>Procurando produtos...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && query.trim().length >= 2 && <p>{results.length} {results.length === 1 ? "produto encontrado" : "produtos encontrados"}</p>}
          </div>

          <div className="search-results">
            {results.map((product) => {
              const imageSrc = product.imageKey ? `/api/images/${encodeURIComponent(product.imageKey)}` : product.imageUrl;
              const displayTitle = getProductDisplayTitle(product.title);
              const price = productPriceDisplay(product.priceCents, product.price);
              return (
                <a href={`/produto/${product.id}`} key={product.id} onClick={() => {
                  track("busca_produto_aberto", { categoria: product.category, departamento: product.department, produto: displayTitle });
                  setOpen(false);
                }}>
                  {imageSrc ? <img alt="" src={imageSrc} /> : <span className="search-result-placeholder">CAST</span>}
                  <span className="search-result-copy">
                    <small>{departmentLabels[product.department] || product.department} • {readableCategory(product.category)}</small>
                    <strong title={product.title}>{displayTitle}</strong>
                    <b className={price.available ? "search-result-price" : "search-result-price search-result-price--live"}>{price.value}</b>
                  </span>
                  <b aria-hidden="true">↗</b>
                </a>
              );
            })}
          </div>
          {!loading && !error && query.trim().length >= 2 && results.length === 0 && <div className="search-empty">Nenhum produto com esse nome. Tente outra palavra.</div>}
        </div>
      </div>}
    </>
  );
}
