"use client";

import { useEffect, useRef, useState } from "react";

const stores = [
  { name: "Shopee", detail: "Loja ativa", active: true },
  { name: "TikTok Shop", detail: "Em breve", active: false },
  { name: "Mercado Livre", detail: "Em breve", active: false },
  { name: "AliExpress", detail: "Em breve", active: false },
];

export function StoresMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="stores-menu" ref={rootRef}>
      <button aria-expanded={open} aria-haspopup="menu" aria-label="Abrir lojas parceiras" className="stores-trigger" onClick={() => setOpen((value) => !value)} type="button">
        <span aria-hidden="true">•••</span>
      </button>
      {open && <div className="stores-popover" role="menu">
        <small>LOJAS PARCEIRAS</small>
        <strong>Onde encontrar nossos achados</strong>
        {stores.map((store) => (
          <div className={store.active ? "store-row store-row--active" : "store-row"} key={store.name} role="menuitem">
            <span>{store.name}</span><b>{store.detail}</b>
          </div>
        ))}
        <p>Novas lojas serão adicionadas aqui quando os catálogos estiverem prontos.</p>
      </div>}
    </div>
  );
}
