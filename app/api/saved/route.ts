import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { products, userProductActions } from "@/db/schema";
import { getSavedState, type SavedAction } from "@/lib/saved-products";

const actions = new Set<SavedAction>(["liked", "cart"]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  return Response.json(await getSavedState(user.email));
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });

  let body: { productId?: unknown; action?: unknown; active?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const productId = Number(body.productId);
  const action = String(body.action ?? "") as SavedAction;
  const active = body.active;
  if (!Number.isInteger(productId) || productId < 1 || !actions.has(action) || typeof active !== "boolean") {
    return Response.json({ error: "Produto ou ação inválida." }, { status: 400 });
  }

  const db = await getDb();
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return Response.json({ error: "Produto não encontrado." }, { status: 404 });

  const userEmail = user.email.trim().toLowerCase();
  if (active) {
    await db.insert(userProductActions).values({ userEmail, productId, action }).onConflictDoNothing();
  } else {
    await db.delete(userProductActions).where(and(
      eq(userProductActions.userEmail, userEmail),
      eq(userProductActions.productId, productId),
      eq(userProductActions.action, action),
    ));
  }

  return Response.json({ ok: true, productId, action, active });
}
