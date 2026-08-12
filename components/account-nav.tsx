import Link from "next/link";
import { ProductSearch } from "@/components/product-search";

export function AccountNav() {
  return (
    <div className="account-nav" aria-label="Produtos salvos">
      <ProductSearch />
      <Link className="account-link" href="/curtidos" aria-label="Abrir produtos curtidos">
        <span aria-hidden="true">♡</span><b>Curtidos</b>
      </Link>
      <Link className="account-link" href="/carrinho" aria-label="Abrir carrinho">
        <span aria-hidden="true">▱</span><b>Carrinho</b>
      </Link>
    </div>
  );
}
