import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Termos e afiliados", description: "Termos de uso e transparência sobre links afiliados da CAST.PRODS." };

export default function TermosPage() {
  return <InfoPage eyebrow="TERMOS E TRANSPARÊNCIA" title="Antes de conferir sua oferta." intro="A CAST.PRODS funciona como catálogo e curadoria de produtos anunciados por lojas parceiras.">
    <h2>Links de afiliados</h2>
    <p>Alguns links do site são links de afiliados. Isso significa que a CAST.PRODS pode receber uma comissão quando uma compra elegível é realizada, sem aumentar o preço pago pelo comprador.</p>
    <h2>Preços, estoque e entrega</h2>
    <p>Preços, descontos, estoque, variações, avaliações e prazos podem mudar a qualquer momento. A informação válida é sempre a exibida no anúncio da loja parceira no momento da compra.</p>
    <h2>Responsabilidade pela compra</h2>
    <p>Pagamento, confirmação do pedido, envio, troca, devolução, garantia e atendimento pós-venda são de responsabilidade da plataforma e do vendedor escolhidos.</p>
    <h2>Comentários e curtidas</h2>
    <p>As interações exibidas nesta versão são salvas no dispositivo do visitante. Comentários devem tratar do produto, respeitar outras pessoas e não conter dados pessoais, conteúdo ofensivo ou publicidade.</p>
  </InfoPage>;
}
