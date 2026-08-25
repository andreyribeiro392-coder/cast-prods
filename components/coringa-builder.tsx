"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogProduct, Category, Department } from "@/lib/catalog";

type GoalKey = "setup" | "homeoffice" | "academia" | "infantil" | "cozinha" | "presente";
type TierKey = "economico" | "equilibrado" | "completo";
type PriorityKey = "custo-beneficio" | "economia" | "completo" | "visual";

const goals: Record<GoalKey, { icon: string; title: string; description: string; department?: Department; categories: Category[] }> = {
  setup: { icon: "⌨", title: "Setup gamer", description: "Teclado, mouse, áudio, monitor e PC de verdade.", department: "tecnologia", categories: ["teclados", "perifericos", "audio", "monitores", "computadores", "componentes_pc"] },
  homeoffice: { icon: "▦", title: "Home office", description: "Conforto e produtividade para trabalhar ou estudar.", categories: ["teclados", "perifericos", "audio", "moveis", "monitores", "computadores", "organizacao"] },
  academia: { icon: "◆", title: "Kit academia", description: "Itens para começar ou melhorar seu treino.", categories: ["equipamentos", "suplementos", "sapatos", "conjuntos", "shorts", "blusas"] },
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

function normalizedTitle(product: CatalogProduct) {
  return product.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function actualPrice(product: CatalogProduct): number | null {
  return Number.isInteger(product.priceCents) && Number(product.priceCents) > 0 ? Number(product.priceCents) : null;
}

function isRealProduct(product: CatalogProduct) {
  const title = normalizedTitle(product);
  const price = actualPrice(product);
  if (!price || !product.productUrl.startsWith("http")) return false;
  const accessory = /\b(adaptador(?:es)?|protetor(?:es)?|pelicula(?:s)?|adesivo(?:s)?|capa(?:s)?|capinha(?:s)?|tampa(?:s)?|suporte(?:s)?|extensor(?:es)?|conector(?:es)?|espuma(?:s)?|almofada(?:s)?|reparo(?:s)?|peca(?:s)? de reposicao|decorativo(?:s)?|enfeite(?:s)?|caveira(?:s)?|limpador(?:es)?|chaveiro(?:s)?|gaveta(?:s)?|bateria(?:s)?|fonte(?:s)?|carcaca(?:s)?)\b/.test(title);

  switch (product.category) {
    case "computadores": return price >= 40000 && /\b(notebook|computador|desktop|mini pc|pc gamer|laptop)\b/.test(title) && !accessory && !/\b(compativel|para notebook|para laptop|para computador|memoria|mochila|placa|teclado|carregador|tela)\b/.test(title);
    case "monitores": return price >= 15000 && /\bmonitor\b/.test(title) && !accessory;
    case "teclados": return price >= 2200 && /\b(teclado|keyboard)\b/.test(title) && !accessory;
    case "perifericos": return price >= 1400 && /\b(mouse|webcam|camera|controle|mousepad|mouse pad)\b/.test(title) && !accessory && !/\b(cabo|pendrive|otg)\b/.test(title);
    case "audio": return price >= 1800 && /\b(fone|headset|microfone|caixa de som|speaker|earbuds)\b/.test(title) && !accessory && !/\b(cabo|espiral|mochila|lancheira|estojo|bolsa|carregador|celular)\b/.test(title);
    case "componentes_pc": return price >= 3000 && /\b(ssd|placa de video|placa mae|memoria ram|processador|gabinete|cooler)\b/.test(title) && !accessory;
    case "moveis": return price >= 5000 && /\b(cadeira|mesa|escrivaninha|estante|armario|sofa)\b/.test(title) && !accessory;
    default: return true;
  }
}

function eligibleProducts(products: CatalogProduct[], goal: GoalKey) {
  const config = goals[goal];
  return products.filter((product) => {
    if (!isRealProduct(product)) return false;
    if (goal === "infantil" && (product.ageGroup !== "infantil" || !["moda", "acessorios"].includes(product.department))) return false;
    if (config.department && product.department !== config.department) return false;
    if (goal === "academia" && product.department !== "academia") {
      if (product.department !== "moda" || product.ageGroup === "infantil") return false;
      if (!/\b(academia|fitness|treino|corrida|esport|training|gym)\b/.test(normalizedTitle(product))) return false;
    }
    if (goal === "homeoffice" && !["tecnologia", "casa"].includes(product.department)) return false;
    if (goal === "presente" && product.ageGroup === "infantil" && product.category !== "brinquedos") return false;
    return config.categories.includes(product.category);
  });
}

function buildSelection(candidates: CatalogProduct[], goal: GoalKey, tier: TierKey, budgetReais: number, featuredIds: number[], priority: PriorityKey) {
  const config = goals[goal];
  const tierConfig = tiers[tier];
  const target = Math.round(budgetReais * 100 * tierConfig.budgetShare);
  const idealPrice = Math.max(Math.round(target / tierConfig.count), 1500);
  const featured = new Set(featuredIds);
  const ranked = [...candidates].sort((a, b) => {
    const aPrice = actualPrice(a)!;
    const bPrice = actualPrice(b)!;
    if (priority === "economia") return aPrice - bPrice || b.id - a.id;
    if (priority === "visual") {
      const imageDifference = Number(Boolean(b.imageUrl || b.imageKey)) - Number(Boolean(a.imageUrl || a.imageKey));
      if (imageDifference) return imageDifference;
    }
    const featuredDifference = Number(featured.has(b.id)) - Number(featured.has(a.id));
    if (featuredDifference) return featuredDifference;
    if (priority === "completo") return aPrice - bPrice || b.id - a.id;
    return Math.abs(aPrice - idealPrice) - Math.abs(bPrice - idealPrice) || aPrice - bPrice;
  });
  const byCategory = new Map<Category, CatalogProduct[]>();
  for (const item of ranked) {
    const group = byCategory.get(item.category) ?? [];
    group.push(item);
    byCategory.set(item.category, group);
  }
  const selected: CatalogProduct[] = [];
  const selectedIds = new Set<number>();
  let pricedTotal = 0;

  for (const category of config.categories) {
    if (selected.length >= tierConfig.count) break;
    const categoryChoices = byCategory.get(category) ?? [];
    const preferredChoices = (goal === "setup" || goal === "homeoffice") && category === "perifericos"
      ? categoryChoices.filter((item) => /\bmouse\b/.test(normalizedTitle(item)) && !/\bmousepad\b/.test(normalizedTitle(item)))
      : goal === "setup" && category === "audio"
        ? categoryChoices.filter((item) => /\b(fone|headset)\b/.test(normalizedTitle(item)))
        : categoryChoices;
    const choices = preferredChoices.length ? preferredChoices : categoryChoices;
    const choice = choices.find((item) => !selectedIds.has(item.id) && pricedTotal + actualPrice(item)! <= target);
    if (!choice) continue;
    selected.push(choice);
    selectedIds.add(choice.id);
    pricedTotal += actualPrice(choice)!;
  }
  for (const product of ranked) {
    if (selected.length >= tierConfig.count) break;
    if (selectedIds.has(product.id)) continue;
    if (pricedTotal + actualPrice(product)! > target) continue;
    selected.push(product);
    selectedIds.add(product.id);
    pricedTotal += actualPrice(product)!;
  }
  return selected;
}

export function CoringaBuilder({ products, featuredIds }: { products: CatalogProduct[]; featuredIds: number[] }) {
  const [goal, setGoal] = useState<GoalKey>("setup");
  const [budget, setBudget] = useState("1500");
  const [priority, setPriority] = useState<PriorityKey>("custo-beneficio");
  const [generated, setGenerated] = useState(false);
  const [selections, setSelections] = useState<Record<TierKey, CatalogProduct[]>>({ economico: [], equilibrado: [], completo: [] });
  const [notice, setNotice] = useState("");
  const compatibleProducts = useMemo(() => eligibleProducts(products, goal), [goal, products]);
  const availableCount = compatibleProducts.length;

  function generate(nextGoal = goal) {
    const requestedBudget = Number(budget);
    if (!Number.isFinite(requestedBudget) || requestedBudget < 1) {
      setNotice("Informe um orçamento válido para montar sua seleção.");
      return;
    }
    const value = Math.max(1, requestedBudget);
    const candidates = nextGoal === goal ? compatibleProducts : eligibleProducts(products, nextGoal);
    setGoal(nextGoal);
    setSelections({
      economico: buildSelection(candidates, nextGoal, "economico", value, featuredIds, priority),
      equilibrado: buildSelection(candidates, nextGoal, "equilibrado", value, featuredIds, priority),
      completo: buildSelection(candidates, nextGoal, "completo", value, featuredIds, priority),
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
    if (!item) return;
    const budgetLimit = Math.round(Number(budget) * 100 * tiers[tier].budgetShare);
    const otherItemsTotal = current.reduce((total, product, itemIndex) => total + (itemIndex === index ? 0 : actualPrice(product) ?? 0), 0);
    const currentIds = new Set(current.map((product) => product.id));
    const replacement = compatibleProducts
      .filter((product) => product.category === item.category && !currentIds.has(product.id) && otherItemsTotal + actualPrice(product)! <= budgetLimit)
      .sort((a, b) => Math.abs(actualPrice(a)! - actualPrice(item)!) - Math.abs(actualPrice(b)! - actualPrice(item)!))[0];
    if (!replacement) {
      setNotice("Não há outro produto compatível dessa categoria dentro do seu orçamento.");
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
          <label><span>SEU ORÇAMENTO</span><div className="budget-input"><b>R$</b><input aria-label="Orçamento em reais" inputMode="numeric" min="1" onChange={(event) => setBudget(event.target.value)} type="number" value={budget} /></div></label>
          <label><span>O QUE IMPORTA MAIS?</span><select onChange={(event) => setPriority(event.target.value as PriorityKey)} value={priority}><option value="custo-beneficio">Melhor custo-benefício</option><option value="economia">Economizar ao máximo</option><option value="completo">Ter o kit mais completo</option><option value="visual">Visual e estilo</option></select></label>
          <div className="coringa-control-actions"><button className="coringa-generate" disabled={availableCount === 0} onClick={() => generate()} type="button">Montar por mim <span>↘</span></button><button className="coringa-surprise" onClick={surprise} type="button">✦ Surpreenda-me</button></div>
        </div>
        <p className="availability-note"><b>{availableCount}</b> produtos compatíveis encontrados agora • Prioridade: {priority.replace("-", " ")}</p>
      </section>

      {generated && <section className="coringa-results" id="resultado-coringa">
        <div className="coringa-section-heading"><p>PASSO 02 • RESULTADO PERSONALIZADO</p><h2>Três caminhos.<br />Você decide.</h2><span>Troque qualquer item, salve no carrinho ou abra a oferta. Os preços e a disponibilidade final são confirmados na loja.</span></div>
        <div className="kit-grid">
          {(Object.keys(tiers) as TierKey[]).map((tier) => {
            const items = selections[tier];
            const knownTotal = items.reduce((total, item) => total + (actualPrice(item) ?? 0), 0);
            return <article className={tier === "equilibrado" ? "kit-card kit-card--featured" : "kit-card"} key={tier}>
              <div className="kit-card-top"><span>{tiers[tier].badge}</span><h3>{tiers[tier].label}</h3><p>{tiers[tier].description}</p></div>
              <div className="kit-products">
                {items.map((item, index) => {
                  const image = item.imageKey ? `/api/images/${encodeURIComponent(item.imageKey)}` : item.imageUrl;
                  return <div className="kit-product" key={item.id}>
                    {image ? <img alt={item.title} src={image} /> : <div className="kit-product-placeholder">CAST</div>}
                    <div><small>{item.category.replaceAll("_", " ")}</small><strong>{item.title}</strong><span>{money(actualPrice(item)!)}</span></div>
                    <button aria-label={`Trocar ${item.title}`} onClick={() => swapProduct(tier, index)} type="button">↻<span>Trocar</span></button>
                  </div>;
                })}
                {items.length === 0 && <p className="kit-empty">Ainda não há produtos suficientes para esta montagem.</p>}
              </div>
              {items.length > 0 && <><div className="kit-total"><span>Total da seleção</span><strong>{money(knownTotal)}</strong><small>Dentro do orçamento de {money(Math.round(Number(budget) * 100 * tiers[tier].budgetShare))}.</small></div>
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
