import Link from "next/link";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { AccountNav } from "@/components/account-nav";
import { BackButton } from "@/components/back-button";
import { getSavedCounts } from "@/lib/saved-products";
import { isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const user = await requireChatGPTUser("/conta");
  const counts = await getSavedCounts(user.email);
  const firstName = (user.fullName || user.email.split("@")[0]).split(" ")[0];
  const isAdmin = isAdminEmail(user.email);

  return (
    <main className="member-page account-page">
      <BackButton />
      <header className="site-header member-header">
        <Link className="brand" href="/">CAST<span>.PRODS</span></Link>
        <AccountNav />
      </header>
      <section className="account-shell">
        <div className="account-intro">
          <p className="eyebrow">MINHA CONTA</p>
          <h1>Olá, {firstName}.</h1>
          <p>Seu carrinho e seus produtos curtidos ficam guardados nesta conta para você acessar quando quiser.</p>
        </div>
        <div className="account-dashboard">
          <article className="profile-card">
            <span className="profile-avatar">{firstName.slice(0, 1).toUpperCase()}</span>
            <div><small>CONTA CONECTADA</small><h2>{user.fullName || firstName}</h2><p>{user.email}</p></div>
            <a href={chatGPTSignOutPath("/")}>Sair da conta</a>
          </article>
          <div className="account-stats">
            <Link href="/curtidos"><span>♡</span><strong>{counts.liked}</strong><p>Produtos curtidos</p><b>Abrir lista ↗</b></Link>
            <Link href="/carrinho"><span>▱</span><strong>{counts.cart}</strong><p>Itens no carrinho</p><b>Abrir carrinho ↗</b></Link>
          </div>
          {isAdmin && <Link className="admin-shortcut" href="/admin"><span>PAINEL EXCLUSIVO</span><strong>Administrar produtos</strong><b>↗</b></Link>}
        </div>
      </section>
    </main>
  );
}
