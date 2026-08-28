"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Comment = { id: string; name: string; text: string; createdAt: string };

export function ProductEngagement({ productId, title, price, imageUrl }: { productId: number; title: string; price: string; imageUrl: string | null }) {
  const likeKey = `cast-prods-public-like-${productId}`;
  const commentKey = `cast-prods-comments-${productId}`;
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLiked(window.localStorage.getItem(likeKey) === "1");
      try {
        const saved = JSON.parse(window.localStorage.getItem(commentKey) ?? "[]");
        if (Array.isArray(saved)) setComments(saved.slice(0, 20));
      } catch { /* Ignore invalid browser data. */ }
      setReady(true);
      try {
        const recent = JSON.parse(window.localStorage.getItem("cast-prods-recent") ?? "[]") as unknown[];
        const entry = { id: productId, title, price, imageUrl, viewedAt: Date.now() };
        window.localStorage.setItem("cast-prods-recent", JSON.stringify([entry, ...recent.filter((item) => typeof item === "object" && item !== null && (item as { id?: number }).id !== productId)].slice(0, 12)));
      } catch { /* Ignore unavailable browser storage. */ }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [commentKey, imageUrl, likeKey, price, productId, title]);

  const countLabel = useMemo(() => `${liked ? 1 : 0} ${liked ? "curtida" : "curtidas"}`, [liked]);

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    window.localStorage.setItem(likeKey, next ? "1" : "0");
  }

  function addComment(event: FormEvent) {
    event.preventDefault();
    const cleanName = name.trim().slice(0, 40);
    const cleanText = text.trim().slice(0, 400);
    if (!cleanName || !cleanText) return;
    const next = [{ id: crypto.randomUUID(), name: cleanName, text: cleanText, createdAt: new Date().toISOString() }, ...comments].slice(0, 20);
    setComments(next);
    window.localStorage.setItem(commentKey, JSON.stringify(next));
    setText("");
  }

  async function shareProduct() {
    const data = { title, text: `${title} — ${price}`, url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else { await navigator.clipboard.writeText(window.location.href); setActionNotice("Link copiado."); }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setActionNotice("Link copiado.");
    } catch { setActionNotice("Não foi possível copiar neste navegador."); }
  }
  function togglePriceAlert() {
    const key = "cast-prods-price-alerts";
    let saved: number[] = [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
      if (Array.isArray(parsed)) saved = parsed.filter((id): id is number => typeof id === "number");
    } catch { /* Ignore invalid browser data. */ }
    const active = saved.includes(productId);
    window.localStorage.setItem(key, JSON.stringify(active ? saved.filter((id) => id !== productId) : [...saved, productId]));
    setActionNotice(active ? "Alerta de preço removido." : "Alerta salvo neste dispositivo.");
  }

  return (
    <section className="engagement-card" aria-labelledby="opinions-title">
      <div className="product-quick-actions"><button onClick={shareProduct} type="button">Compartilhar</button><button onClick={copyLink} type="button">Copiar link</button><button onClick={togglePriceAlert} type="button">Alerta de preço</button><span aria-live="polite">{actionNotice}</span></div>
      <div className="engagement-heading">
        <div><small>COMUNIDADE CAST.PRODS</small><h2 id="opinions-title">Opiniões sobre este achado</h2></div>
        <button aria-pressed={liked} className={liked ? "detail-like detail-like--active" : "detail-like"} disabled={!ready} onClick={toggleLike} type="button">
          <span aria-hidden="true">{liked ? "♥" : "♡"}</span><b>{countLabel}</b>
        </button>
      </div>
      <form className="comment-form" onSubmit={addComment}>
        <label>Seu nome<input maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="Como quer aparecer" required value={name} /></label>
        <label>Seu comentário<textarea maxLength={400} onChange={(event) => setText(event.target.value)} placeholder="Conte o que achou do produto" required rows={4} value={text} /></label>
        <div><small>Comentários ficam salvos neste dispositivo. Não publique dados pessoais.</small><button type="submit">Adicionar comentário <span aria-hidden="true">↗</span></button></div>
      </form>
      <div className="comment-list">
        {comments.map((comment) => <article key={comment.id}><div><b>{comment.name}</b><time dateTime={comment.createdAt}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(comment.createdAt))}</time></div><p>{comment.text}</p></article>)}
        {ready && comments.length === 0 && <p className="comments-empty">Seja a primeira pessoa a comentar neste dispositivo.</p>}
      </div>
    </section>
  );
}
