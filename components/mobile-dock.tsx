"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Início", path: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" },
  { href: "/categorias", label: "Explorar", path: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { href: "/curtidos", label: "Curtidos", path: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" },
  { href: "/carrinho", label: "Carrinho", path: "M6 7h12l2 14H4L6 7Zm3 0V5a3 3 0 0 1 6 0v2" },
];

export function MobileDock() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <nav className="mobile-bottom-nav atelier-dock" aria-label="Navegação rápida no celular">
    {items.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
      <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={item.path} /></svg>
      <b>{item.label}</b>
    </Link>)}
  </nav>;
}
