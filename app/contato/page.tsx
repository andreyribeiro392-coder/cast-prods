import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Contato", description: "Orientações de contato e atendimento da CAST.PRODS." };

export default function ContatoPage() {
  return <InfoPage eyebrow="CONTATO E ATENDIMENTO" title="Fale com o canal certo." intro="Para receber ajuda mais rápido, procure o responsável correto pelo assunto.">
    <h2>Pedido, pagamento ou entrega</h2>
    <p>O atendimento deve ser solicitado diretamente na plataforma em que a compra foi concluída. Abra seus pedidos na loja parceira para falar com o vendedor ou com o suporte responsável.</p>
    <h2>Produto indisponível ou link incorreto</h2>
    <p>Use os canais oficiais da CAST.PRODS apresentados em nossos perfis para avisar qual produto precisa ser revisado. Nunca envie senha, código de acesso ou dados de pagamento.</p>
    <h2>Segurança</h2>
    <p>A CAST.PRODS não solicita pagamento por mensagem e não pede senha ou código de verificação.</p>
  </InfoPage>;
}
