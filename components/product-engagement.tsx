"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Comment = { id: string; name: string; text: string; createdAt: string };

export function ProductEngagement({ productId }: { productId: number }) {
  const likeKey = `cast-prods-public-like-${productId}`;
  const commentKey = `cast-prods-comments-${productId}`;
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLiked(window.localStorage.getItem(likeKey) === "1");
      try {
        const saved = JSON.parse(window.localStorage.getItem(commentKey) ?? "[]");
        if (Array.isArray(saved)) setComments(saved.slice(0, 20));
      } catch { /* Ignore invalid browser data. */ }
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [commentKey, likeKey]);

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

  return (
    <section className="engagement-card" aria-labelledby="opinions-title">
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
