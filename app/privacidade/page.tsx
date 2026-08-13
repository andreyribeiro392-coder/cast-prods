import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Privacidade", description: "Informações de privacidade da CAST.PRODS." };

export default function PrivacidadePage() {
  return <InfoPage eyebrow="PRIVACIDADE" title="Respeito aos seus dados." intro="O site foi pensado para funcionar sem cadastro obrigatório e sem solicitar dados de pagamento.">
    <h2>Dados salvos no seu dispositivo</h2>
    <p>As listas de produtos curtidos e adicionados ao carrinho são guardadas no armazenamento local do seu navegador. Esses dados permanecem no dispositivo e podem ser apagados ao limpar os dados do navegador.</p>
    <h2>Medição de uso</h2>
    <p>Utilizamos a ferramenta de análise da Vercel para medir visualizações, desempenho das páginas e cliques de forma agregada. Essas informações ajudam a melhorar o catálogo e a experiência de navegação.</p>
    <h2>Sites de terceiros</h2>
    <p>Ao abrir um produto, você acessa uma plataforma externa, que possui seus próprios termos e política de privacidade. A CAST.PRODS não recebe senhas, dados bancários ou informações de pagamento dessas plataformas.</p>
  </InfoPage>;
}
