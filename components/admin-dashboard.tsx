"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

type Status = { type: "idle" | "loading" | "success" | "error"; message: string };

export function AdminDashboard() {
  const formRef = useRef<HTMLFormElement>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [tiktokUrl, setTiktokUrl] = useState("");

  async function refreshData() {
    const [productsResponse, settingsResponse] = await Promise.all([
      fetch("/api/products", { cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" }),
    ]);
    const productData = (await productsResponse.json()) as { products?: CatalogProduct[] };
    const settingsData = (await settingsResponse.json()) as { tiktokUrl?: string };
    setProducts(productData.products ?? []);
    setTiktokUrl(settingsData.tiktokUrl ?? "");
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/products", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/settings", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([productData, settingsData]: [{ products?: CatalogProduct[] }, { tiktokUrl?: string }]) => {
      if (!active) return;
      setProducts(productData.products ?? []);
      setTiktokUrl(settingsData.tiktokUrl ?? "");
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Adicionando produto..." });
    const response = await fetch("/api/products", { method: "POST", body: new FormData(event.currentTarget) });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus({ type: "error", message: data.error ?? "Não foi possível adicionar." });
      return;
    }
    formRef.current?.reset();
    setStatus({ type: "success", message: "Produto adicionado e publicado no catálogo." });
    await refreshData();
  }

  async function removeProduct(id: number) {
    if (!window.confirm("Deseja realmente remover este produto?")) return;
    const response = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus({ type: "error", message: data.error ?? "Não foi possível remover." });
      return;
    }
    setProducts((current) => current.filter((product) => product.id !== id));
    setStatus({ type: "success", message: "Produto removido." });
  }

  async function saveTikTok(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Salvando TikTok..." });
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tiktokUrl }),
    });
    const data = (await response.json()) as { error?: string };
    setStatus(response.ok
      ? { type: "success", message: "Link do TikTok salvo." }
      : { type: "error", message: data.error ?? "Não foi possível salvar." });
  }

  return (
    <div className="admin-shell">
      <section className="admin-intro">
        <p className="eyebrow">PAINEL CAST.PRODS</p>
        <h1>Controle seu catálogo.</h1>
        <p>Adicione fotos, descrições e links em todos os departamentos do CAST.PRODS.</p>
      </section>

      {status.type !== "idle" && <div aria-live="polite" className={`admin-status admin-status--${status.type}`}>{status.message}</div>}

      <div className="admin-grid">
        <section className="admin-card admin-card--form">
          <div className="admin-card-heading"><span>01</span><div><h2>Novo produto</h2><p>Preencha todos os detalhes do achado.</p></div></div>
          <form className="admin-form" onSubmit={addProduct} ref={formRef}>
            <label>Departamento<select name="department" required defaultValue=""><option value="" disabled>Selecione</option><option value="moda">Moda</option><option value="acessorios">Acessórios</option><option value="academia">Academia</option><option value="tecnologia">Tecnologia e PC</option><option value="casa">Casa e utilidades</option><option value="beleza">Beleza e cuidados</option><option value="ferramentas">Ferramentas e automotivo</option><option value="esporte_lazer">Esporte e lazer</option></select></label>
            <div className="form-row">
              <label>Diretório<select name="audience" required defaultValue=""><option value="" disabled>Selecione</option><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="unissex">Unissex (sem misturar os diretórios)</option></select></label>
              <label>Faixa etária<select name="ageGroup" required defaultValue=""><option value="" disabled>Selecione</option><option value="geral">Geral (sem idade)</option><option value="adulto">Adulto — roupas e acessórios</option><option value="infantil">Infantil</option></select></label>
            </div>
            <label>Categoria<select name="category" required defaultValue=""><option value="" disabled>Selecione</option><optgroup label="Moda e infantil"><option value="sapatos">Sapatos</option><option value="calcas">Calças</option><option value="blusas">Blusas e camisetas</option><option value="camisas">Camisas</option><option value="moletons">Moletons</option><option value="casacos">Casacos</option><option value="shorts">Shorts e bermudas</option><option value="conjuntos">Conjuntos</option><option value="vestidos">Vestidos</option><option value="pijamas">Pijamas</option><option value="roupas_intimas">Roupas íntimas</option><option value="roupas_bebe">Roupas de bebê</option><option value="fantasias">Fantasias</option><option value="brinquedos">Brinquedos</option><option value="meias">Meias</option><option value="mochilas">Mochilas</option></optgroup><optgroup label="Acessórios"><option value="acessorios">Acessórios em geral</option><option value="bolsas">Bolsas e carteiras</option><option value="pulseiras">Pulseiras</option><option value="colares">Colares e correntes</option><option value="aneis">Anéis</option><option value="cintos">Cintos</option><option value="oculos">Óculos</option><option value="bones">Bonés e chapéus</option><option value="brincos">Brincos e joias</option><option value="relogios">Relógios</option><option value="cabelo">Cabelo</option><option value="gravatas">Gravatas</option><option value="piercings">Piercings</option></optgroup><optgroup label="Tecnologia"><option value="computadores">Computadores</option><option value="monitores">Monitores</option><option value="teclados">Teclados</option><option value="audio">Áudio e fones</option><option value="celulares">Celulares</option><option value="componentes_pc">Peças de PC</option><option value="perifericos">Periféricos</option></optgroup><optgroup label="Academia"><option value="equipamentos">Equipamentos</option><option value="suplementos">Suplementos</option></optgroup><optgroup label="Casa"><option value="casa_utilidades">Casa e utilidades</option><option value="cama_banho">Cama e banho</option><option value="limpeza">Limpeza</option><option value="cozinha">Cozinha</option><option value="organizacao">Organização</option><option value="decoracao">Decoração</option><option value="moveis">Móveis</option><option value="pets">Pets</option></optgroup><optgroup label="Beleza"><option value="skincare">Cuidados com a pele</option><option value="higiene">Higiene</option><option value="beleza_cabelo">Cuidados com o cabelo</option><option value="beleza_cuidados">Beleza e cuidados</option></optgroup><optgroup label="Ferramentas e auto"><option value="ferramentas">Ferramentas</option><option value="automotivo">Automotivo</option></optgroup><optgroup label="Esporte e lazer"><option value="mobilidade">Mobilidade</option><option value="pesca">Pesca</option><option value="brinquedos">Brinquedos</option><option value="esporte_lazer">Esporte e lazer</option></optgroup></select></label>
            <label>Nome do produto<input name="title" required maxLength={90} placeholder="Ex.: Tênis casual branco" /></label>
            <label>Descrição<textarea name="description" required maxLength={400} rows={4} placeholder="Explique os destaques do produto..." /></label>
            <label>Link do produto<input name="productUrl" required type="url" placeholder="https://..." /></label>
            <div className="image-options">
              <label>Enviar foto<input accept="image/*" name="image" type="file" /></label>
              <span>ou</span>
              <label>Link da foto<input name="imageUrl" type="url" placeholder="https://..." /></label>
            </div>
            <button className="admin-submit" disabled={status.type === "loading"} type="submit">Adicionar ao catálogo <span>↗</span></button>
          </form>
        </section>

        <aside className="admin-side">
          <section className="admin-card">
            <div className="admin-card-heading"><span>02</span><div><h2>Seu TikTok</h2><p>Conecte sua rede ao site.</p></div></div>
            <form className="admin-form" onSubmit={saveTikTok}>
              <label>Link do perfil<input onChange={(event) => setTiktokUrl(event.target.value)} placeholder="https://www.tiktok.com/@..." type="url" value={tiktokUrl} /></label>
              <button className="secondary-button" type="submit">Salvar TikTok</button>
            </form>
          </section>
          <section className="admin-card admin-summary">
            <p>PRODUTOS PUBLICADOS</p>
            <strong>{products.length.toString().padStart(2, "0")}</strong>
            <span>{products.filter((item) => item.department === "moda").length} moda • {products.filter((item) => item.department === "acessorios").length} acessórios • {products.filter((item) => item.department === "tecnologia").length} tecnologia • {products.filter((item) => item.department === "casa").length} casa</span>
          </section>
        </aside>
      </div>

      <section className="admin-products">
        <div className="admin-card-heading"><span>03</span><div><h2>Produtos cadastrados</h2><p>Gerencie o que está aparecendo no site.</p></div></div>
        {products.length === 0 ? <div className="admin-empty">Seu primeiro produto aparecerá aqui.</div> : (
          <div className="admin-product-list">
            {products.map((product) => (
              <article key={product.id}>
                <img alt="" src={product.imageKey ? `/api/images/${encodeURIComponent(product.imageKey)}` : product.imageUrl ?? ""} />
                <div><small>{product.department} • {product.audience} • {product.ageGroup} • {product.category}</small><h3>{product.title}</h3><p>{product.description}</p></div>
                <button aria-label={`Remover ${product.title}`} onClick={() => removeProduct(product.id)} type="button">Remover</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
