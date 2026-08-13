"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MobileAccountMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="mobile-actions-menu" ref={rootRef}>
      <button
        aria-controls="mobile-account-shortcuts"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Abrir curtidos e carrinho"
        className="mobile-actions-trigger"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span aria-hidden="true">⋮</span>
      </button>

      {open && (
        <div className="mobile-actions-popover" id="mobile-account-shortcuts" role="menu">
          <small>SEUS ATALHOS</small>
          <strong>Curtidos e carrinho</strong>
          <Link href="/curtidos" onClick={() => setOpen(false)} role="menuitem">
            <span aria-hidden="true">♡</span>
            <span><b>Curtidos</b><small>Veja os produtos que você salvou</small></span>
            <i aria-hidden="true">›</i>
          </Link>
          <Link href="/carrinho" onClick={() => setOpen(false)} role="menuitem">
            <span aria-hidden="true">▱</span>
            <span><b>Carrinho</b><small>Abra sua lista para comprar</small></span>
            <i aria-hidden="true">›</i>
          </Link>
        </div>
      )}
    </div>
  );
}
