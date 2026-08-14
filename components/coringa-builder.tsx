"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogProduct, Category, Department } from "@/lib/catalog";
import { parseCatalogPrice } from "@/lib/price";

type GoalKey = "setup" | "homeoffice" | "academia" | "infantil" | "cozinha" | "presente";
type TierKey = "economico" | "equilibrado" | "completo";

const goals: Record<GoalKey, { icon: string; title: string; description: string; department?: Department; categories: Category[] }> = {
  setup: { icon: "⌨", title: "Setup gamer", description: "PC, monitor, teclado, áudio e periféricos.", department: "tecnologia", categories: ["computadores", "monitores", "teclados", "audio", "perifericos", "componentes_pc"] },
  homeoffice: { icon: "▦", title: "Home office", description: "Conforto e produtividade para trabalhar ou estudar.", categories: ["computadores", "monitores", "teclados", "perifericos", "moveis", "organizacao", "audio"] },
  academia: { icon: "◆", title: "Kit academia", description: "Itens para começar ou melhorar seu treino.", department: "academia", categories: ["equipamentos", "suplementos", "sapatos", "conjuntos", "shorts", "blusas"] },
  infantil: { icon: "★", title: "Look infantil", description: "Uma combinação completa para os pequenos.", categories: ["conjuntos", "blusas", "calcas", "sapatos", "casacos", "mochilas", "roupas_bebe"] },
  cozinha: { icon: "◇", title: "Cozinha prática", description: "Achados que economizam tempo na rotina.", department: "casa", categories: ["cozinha", "organizacao", "limpeza", "casa_utilidades"] },
  presente: { icon: "♡", title: "Escolher presente", description: "Sugestões diferentes dentro do seu orçamento.", categories: ["relogios", "bolsas", "colares", "audio", "beleza_cuidados", "brinquedos", "decoracao"] },
};

const tiers: Record<TierKey, { label: string; badge: string; description: string; count: number; budgetShare: number }> = {
  economico: { label: "Essencial", badge: "MENOR PREÇO", description: "Somente o necessário para começar.", count: 3, budgetShare: .6 },
  equilibrado: { label: "Equilibrado", badge: "RECOMENDADO", description: "A seleção com melhor equilíbrio.", count: 5, budgetShare: .82 },
  completo: { label: "Completo", badge: "MAIS ITENS", description: "Uma montagem mais completa, sem ultrapassar sua meta quando os preços estão cadastrados.", count: 7, budgetShare: 1 },
};

function money(value: number) {
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function productPriceCents(product: CatalogProduct) {
  if (product.priceCents !== null && product.priceCents !== undefined) return product.priceCents;
  const parsed = parseCatalogPrice(product.price);
  return parsed === null ? null : Math.round(parsed * 100);
}

function eligibleProducts(products: CatalogProduct[], goal: GoalKey) {
  const config = goals[goal];
  return products.filter((product) => {
    if (product.productUrl === "#") return false;
    if (goal === "infantil" && product.ageGroup !== "infantil") return false;
    if (config.department && product.department !== config.department) return false;
    return config.categories.includes(product.category);
  });
}

function buildSelection(products: CatalogProduct[], goal: GoalKey, tier: TierKey, budgetReais: number, featuredIds: number[]) {
  const config = goals[goal];
  const tierConfig = tiers[tier];
  const candidates = eligibleProducts(products, goal).sort((a, b) => {
    const featuredDifference = featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id);
    const aFeatured = featuredIds.includes(a.id);
    const bFeatured = featuredIds.includes(b.id);
    if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
    if (aFeatured && bFeatured && featuredDifference !== 0) return featuredDifference;
    const aPrice = productPriceCents(a);
    const bPrice = productPriceCents(b);
    if (aPrice !== null && bPrice !== null) return aPrice - bPrice;
    return b.id - a.id;
  });
  const target = Math.round(budgetReais * 100 * tierConfig.budgetShare);
  const selected: CatalogProduct[] = [];
  let pricedTotal = 0;

  for (const category of config.categories) {
    if (selected.length >= tierConfig.count) break;
    const choices = candidates.filter((item) => item.category === category && !selected.some((chosen) => chosen.id === item.id));
    const fitting = choices.find((item) => {
      const price = productPriceCents(item);
      return price === null || pricedTotal + price <= target;
    });
    const choice = fitting ?? choices[0];
    if (!choice) continue;
    selected.push(choice);
    pricedTotal += productPriceCents(choice) ?? 0;
  }
  for (const product of candidates) {
    if (selected.length >= tierConfig.count) break;
    if (selected.some((chosen) => chosen.id === product.id)) continue;
    const price = productPriceCents(product);
    if (price !== null && pricedTotal + price > target) continue;
    selected.push(product);
    pricedTotal += price ?? 0;
  }
  return selected;
}

export function CoringaBuilder({ products, featuredIds }: { products: CatalogProduct[]; featuredIds: number[] }) {
  const [goal, setGoal] = useState<GoalKey>("setup");
  const [budget, setBudget] = useState("1500");
  const [priority, setPriority] = useState("custo-beneficio");
  const [generated, setGenerated] = useState(false);
  const [selections, setSelections] = useState<Record<TierKey, CatalogProduct[]>>({ economico: [], equilibrado: [], completo: [] });
  const [notice, setNotice] = useState("");
  const availableCount = useMemo(() => eligibleProducts(products, goal).length, [goal, products]);

  function generate(nextGoal = goal) {
    const value = Math.max(50, Number(budget) || 1500);
    setGoal(nextGoal);
    setSelections({
      economico: buildSelection(products, nextGoal, "economico", value, featuredIds),
      equilibrado: buildSelection(products, nextGoal, "equilibrado", value, featuredIds),
      completo: buildSelection(products, nextGoal, "completo", value, featuredIds),
    });
    setGenerated(true);
    setNotice("");
    window.setTimeout(() => document.getElementById("resultado-coringa")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function surprise() {
    const keys = Object.keys(goals) as GoalKey[];
    generate(keys[Math.floor(Math.random() * keys.length)]);
  }

  function swapProduct(tier: TierKey, index: number) {
    const current = selections[tier];
    const item = current[index];
    const candidates = eligibleProducts(products, goal).filter((product) => product.category === item.category && !current.some((chosen) => chosen.id === product.id));
    const fallback = eligibleProducts(products, goal).filter((product) => !current.some((chosen) => chosen.id === product.id));
    const replacement = candidates[0] ?? fallback[0];
    if (!replacement) {
      setNotice("Esse já é o melhor conjunto disponível para essa opção.");
      return;
    }
    setSelections((all) => ({ ...all, [tier]: current.map((product, itemIndex) => itemIndex === index ? replacement : product) }));
    setNotice("Produto trocado. A montagem já foi atualizada.");
  }

  function addToCart(items: CatalogProduct[]) {
    try {
      const current = JSON.parse(window.localStorage.getItem("cast-prods-cart") ?? "[]");
      const ids = new Set<number>(Array.isArray(current) ? current : []);
      items.forEach((item) => ids.add(item.id));
      window.localStorage.setItem("cast-prods-cart", JSON.stringify([...ids]));
      setNotice(`${items.length} produtos foram adicionados ao seu carrinho.`);
    } catch {
      setNotice("Não foi possível salvar o carrinho neste navegador.");
    }
  }

  async function share(items: CatalogProduct[], tier: TierKey) {
    const text = `Minha seleção ${tiers[tier].label} no CAST.PRODS: ${items.map((item) => item.title).join(", ")}`;
    try {
      if (navigator.share) await navigator.share({ title: "Minha seleção CAST.PRODS", text, url: window.location.href });
      else await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setNotice(navigator.share ? "Seleção compartilhada." : "Seleção copiada. Agora é só enviar!");
    } catch {
      setNotice("Compartilhamento cancelado.");
    }
  }

  return (
    <>
      <p className="save-notice" aria-live="polite">{notice}</p>
      <section className="coringa-config" aria-labelledby="coringa-config-title">
        <div className="coringa-section-heading"><p>PASSO 01</p><h2 id="coringa-config-title">O que você quer montar?</h2><span>Escolha uma missão. O Modo Coringa procura combinações dentro do catálogo atual.</span></div>
        <div className="goal-grid">
          {(Object.keys(goals) as GoalKey[]).map((key) => (
            <button aria-pressed={goal === key} className={goal === key ? "goal-card goal-card--active" : "goal-card"} key={key} onClick={() => { setGoal(key); setGenerated(false); }} type="button">
              <i aria-hidden="true">{goals[key].icon}</i><strong>{goals[key].title}</strong><span>{goals[key].description}</span><b>{goal === key ? "Selecionado" : "Escolher"} ↗</b>
            </button>
          ))}
        </div>
        <div className="coringa-controls">
          <label><span>SEU ORÇAMENTO</span><div className="budget-input"><b>R$</b><input aria-label="Orçamento em reais" inputMode="numeric" min="50" onChange={(event) => setBudget(event.target.value)} type="number" value={budget} /></div></label>
          <label><span>O QUE IMPORTA MAIS?</span><select onChange={(event) => setPriority(event.target.value)} value={priority}><option value="custo-beneficio">Melhor custo-benefício</option><option value="economia">Economizar ao máximo</option><option value="completo">Ter o kit mais completo</option><option value="visual">Visual e estilo</option></select></label>
          <div className="coringa-control-actions"><button className="coringa-generate" disabled={availableCount === 0} onClick={() => generate()} type="button">Montar por mim <span>↘</span></button><button className="coringa-surprise" onClick={surprise} type="button">✦ Surpreenda-me</button></div>
        </div>
        <p className="availability-note"><b>{availableCount}</b> produtos compatíveis encontrados agora • Prioridade: {priority.replace("-", " ")}</p>
      </section>

      {generated && <section className="coringa-results" id="resultado-coringa">
        <div className="coringa-section-heading"><p>PASSO 02 • RESULTADO PERSONALIZADO</p><h2>Três caminhos.<br />Você decide.</h2><span>Troque qualquer item, salve no carrinho ou abra a oferta. Os preços e a disponibilidade final são confirmados na loja.</span></div>
        <div className="kit-grid">
          {(Object.keys(tiers) as TierKey[]).map((tier) => {
            const items = selections[tier];
            const knownTotal = items.reduce((total, item) => total + (productPriceCents(item) ?? 0), 0);
            const missingPrices = items.filter((item) => productPriceCents(item) === null).length;
            return <article className={tier === "equilibrado" ? "kit-card kit-card--featured" : "kit-card"} key={tier}>
              <div className="kit-card-top"><span>{tiers[tier].badge}</span><h3>{tiers[tier].label}</h3><p>{tiers[tier].description}</p></div>
              <div className="kit-products">
                {items.map((item, index) => {
                  const image = item.imageKey ? `/api/images/${encodeURIComponent(item.imageKey)}` : item.imageUrl;
                  return <div className="kit-product" key={item.id}>
                    {image ? <img alt={item.title} src={image} /> : <div className="kit-product-placeholder">CAST</div>}
                    <div><small>{item.category.replaceAll("_", " ")}</small><strong>{item.title}</strong><span>{productPriceCents(item) ? money(productPriceCents(item)!) : "Preço na loja"}</span></div>
                    <button aria-label={`Trocar ${item.title}`} onClick={() => swapProduct(tier, index)} type="button">↻<span>Trocar</span></button>
                  </div>;
                })}
                {items.length === 0 && <p className="kit-empty">Ainda não há produtos suficientes para esta montagem.</p>}
              </div>
              {items.length > 0 && <><div className="kit-total"><span>{missingPrices ? "Subtotal dos itens com preço" : "Total da seleção"}</span><strong>{knownTotal ? money(knownTotal) : "Confira nas ofertas"}</strong>{missingPrices > 0 && <small>{missingPrices} {missingPrices === 1 ? "item será confirmado" : "itens serão confirmados"} na loja.</small>}</div>
              <div className="kit-actions"><button onClick={() => addToCart(items)} type="button">+ Adicionar ao carrinho</button><button onClick={() => share(items, tier)} type="button">Compartilhar</button></div>
              <div className="kit-buy-links">{items.map((item) => <a href={item.productUrl} key={item.id} rel="noopener noreferrer sponsored" target="_blank">Ver {item.title.slice(0, 34)}{item.title.length > 34 ? "…" : ""} <span>↗</span></a>)}</div></>}
            </article>;
          })}
        </div>
        <div className="coringa-restart"><button onClick={() => { setGenerated(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} type="button">← Fazer outra montagem</button><Link href="/tecnologia">Ver catálogo completo →</Link></div>
      </section>}
    </>
  );
}
