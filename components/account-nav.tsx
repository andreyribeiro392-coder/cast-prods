import Link from "next/link";
import { ProductSearch } from "@/components/product-search";
import { StoresMenu } from "@/components/stores-menu";
import { MobileAccountMenu } from "@/components/mobile-account-menu";

export function AccountNav() {
  return (
    <div className="account-nav" aria-label="Produtos salvos">
      <Link className="account-link coringa-nav-link" href="/modo-coringa" aria-label="Abrir Modo Coringa">
        <span aria-hidden="true">♠</span><b>Montar</b>
      </Link>
      <ProductSearch />
      <Link className="account-link" href="/curtidos" aria-label="Abrir produtos curtidos">
        <span aria-hidden="true">♡</span><b>Curtidos</b>
      </Link>
      <Link className="account-link" href="/carrinho" aria-label="Abrir carrinho">
        <span aria-hidden="true">▱</span><b>Carrinho</b>
      </Link>
      <MobileAccountMenu />
      <StoresMenu />
    </div>
  );
}
