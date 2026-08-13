import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { BackButton } from "@/components/back-button";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (process.env.VERCEL) {
    redirect("https://site-andrei.xtzadas.chatgpt.site/admin");
  }

  const user = await requireChatGPTUser("/admin");
  const isAdmin = isAdminEmail(user.email);

  return (
    <main className="admin-page">
      <BackButton />
      <header className="site-header admin-header">
        <Link className="brand" href="/">CAST<span>.PRODS</span></Link>
        <div className="admin-account"><span>{user.email}</span><a href={chatGPTSignOutPath("/")}>Sair</a></div>
      </header>
      {isAdmin ? <AdminDashboard /> : (
        <section className="access-denied"><span>!</span><h1>Acesso restrito</h1><p>Este painel é exclusivo para o administrador da CAST.PRODS.</p><Link href="/">Voltar ao site</Link></section>
      )}
    </main>
  );
}
