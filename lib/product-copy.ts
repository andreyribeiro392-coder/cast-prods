import type { CatalogProduct, Category } from "@/lib/catalog";

const categoryPitches: Partial<Record<Category, string>> = {
  computadores: "Opções para estudar, trabalhar ou completar seu setup.",
  monitores: "Mais espaço e definição para seu setup.",
  teclados: "Mais conforto e estilo para jogar ou trabalhar.",
  perifericos: "Um upgrade prático para seus dispositivos.",
  audio: "Som e praticidade para acompanhar sua rotina.",
  celulares: "Tecnologia útil para facilitar o dia a dia.",
  ferramentas: "Praticidade para reparos, projetos e manutenção.",
  automotivo: "Um achado útil para cuidar melhor do seu veículo.",
  cozinha: "Mais praticidade e organização para sua cozinha.",
  casa_utilidades: "Uma escolha prática para facilitar sua rotina.",
  beleza_cuidados: "Um cuidado a mais para sua rotina.",
  skincare: "Cuidados para completar sua rotina de pele.",
  esporte_lazer: "Um achado para aproveitar melhor seu tempo livre.",
};

export function getProductDisplayTitle(title: string, maxLength = 72) {
  const cleaned = title
    .replace(/^\s*(?:enviar\s+do\s+brasil|lançamento|promoção|oferta)\s*[:\-–—]?\s*/i, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  const shortened = cleaned.slice(0, maxLength + 1).replace(/\s+\S*$/, "").trim();
  return `${shortened || cleaned.slice(0, maxLength).trim()}…`;
}

export function getProductPitch(product: CatalogProduct) {
  return categoryPitches[product.category]
    ?? (product.department === "moda" ? "Um achado versátil para renovar suas combinações."
      : product.department === "acessorios" ? "O detalhe certo para completar seu estilo."
        : product.department === "academia" ? "Mais conforto e praticidade para sua rotina de treino."
          : product.department === "casa" ? "Um achado para deixar sua casa mais prática."
            : product.department === "beleza" ? "Uma escolha para completar sua rotina de cuidados."
              : "Produto selecionado para você conferir todos os detalhes na loja.");
}
