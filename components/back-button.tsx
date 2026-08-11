"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      aria-label="Voltar para a página anterior"
      className="mobile-back"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      type="button"
    >
      <span aria-hidden="true">←</span>
      <b>Voltar</b>
    </button>
  );
}
