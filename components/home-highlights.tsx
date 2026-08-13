"use client";

import { useState } from "react";
import { CatalogView } from "@/components/catalog-view";
import type { CatalogProduct } from "@/lib/catalog";

const options = [
  { key: "featured", label: "Destaques" },
  { key: "10", label: "Até R$ 10" },
  { key: "19", label: "Até R$ 19" },
  { key: "50", label: "Até R$ 50" },
  { key: "100", label: "Até R$ 100" },
  { key: "1000", label: "Até R$ 1.000" },
] as const;

type PriceKey = (typeof options)[number]["key"];

export function HomeHighlights({ groups }: { groups: Record<PriceKey, CatalogProduct[]> }) {
  const [active, setActive] = useState<PriceKey>("featured");
  const products = groups[active];

  return (
    <>
      <div className="home-price-filter" role="group" aria-label="Filtrar destaques por preço">
        <div className="home-price-filter__copy">
          <span>FAIXA DE PREÇO</span>
          <strong>Quanto você quer gastar?</strong>
        </div>
        <div className="home-price-filter__options">
          {options.map((option) => (
            <button
              aria-pressed={active === option.key}
              className={active === option.key ? "home-price-chip home-price-chip--active" : "home-price-chip"}
              key={option.key}
              onClick={() => setActive(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <small>{products.length} achados nessa seleção</small>
      </div>
      <CatalogView products={products} simple />
    </>
  );
}
