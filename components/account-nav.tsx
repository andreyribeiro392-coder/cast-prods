import Link from "next/link";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { ProductSearch } from "@/components/product-search";

export async function AccountNav() {
  const user = await getChatGPTUser();

  return (
    <div className="account-nav" aria-label="Conta e produtos salvos">
      <ProductSearch />
      <Link className="account-link" href="/curtidos" aria-label="Abrir produtos curtidos">
        <span aria-hidden="true">♡</span><b>Curtidos</b>
      </Link>
      <Link className="account-link" href="/carrinho" aria-label="Abrir carrinho">
        <span aria-hidden="true">▱</span><b>Carrinho</b>
      </Link>
      {user ? (
        <Link className="nav-pill account-pill" href="/conta">Minha conta</Link>
      ) : (
        <a className="nav-pill account-pill" href={chatGPTSignInPath("/conta")}>Entrar</a>
      )}
    </div>
  );
}
