import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { settings } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";


function isValidTikTokUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && (url.hostname === "tiktok.com" || url.hostname.endsWith(".tiktok.com"));
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const [row] = await db.select().from(settings).where(eq(settings.key, "tiktok_url")).limit(1);
    return Response.json({ tiktokUrl: row?.value ?? "" });
  } catch {
    return Response.json({ tiktokUrl: "" });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!isAdminEmail(user?.email)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });

  const payload = (await request.json()) as { tiktokUrl?: string };
  const tiktokUrl = payload.tiktokUrl?.trim() ?? "";
  if (!isValidTikTokUrl(tiktokUrl)) return Response.json({ error: "Informe um link válido do TikTok." }, { status: 400 });

  const db = await getDb();
  await db.insert(settings).values({ key: "tiktok_url", value: tiktokUrl }).onConflictDoUpdate({
    target: settings.key,
    set: { value: tiktokUrl },
  });
  return Response.json({ tiktokUrl });
}
