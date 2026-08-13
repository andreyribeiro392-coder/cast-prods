import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Sobre", description: "Conheça a curadoria de achados da CAST.PRODS." };

export default function SobrePage() {
  return <InfoPage eyebrow="SOBRE A CAST.PRODS" title="Achados sem perder tempo." intro="A CAST.PRODS organiza produtos de diferentes categorias para ajudar você a descobrir opções interessantes em um só lugar.">
    <h2>Como funciona</h2>
    <p>Nós selecionamos e organizamos anúncios de lojas parceiras por departamento e categoria. Ao escolher um produto, você é direcionado ao anúncio original para conferir preço, variações, estoque, avaliações e condições de entrega atualizadas.</p>
    <h2>O que a CAST.PRODS não faz</h2>
    <p>A CAST.PRODS não recebe pagamentos, não realiza entregas e não armazena dados de compra. A transação é concluída diretamente na plataforma parceira.</p>
    <h2>Nossa proposta</h2>
    <p>Facilitar a busca, destacar produtos úteis e manter um catálogo simples de navegar em qualquer dispositivo.</p>
  </InfoPage>;
}
