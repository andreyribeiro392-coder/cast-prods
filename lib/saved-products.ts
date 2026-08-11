import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { products, userProductActions } from "@/db/schema";
import type { CatalogProduct } from "@/lib/catalog";

export type SavedAction = "liked" | "cart";

export type SavedState = {
  likedIds: number[];
  cartIds: number[];
};

export const emptySavedState: SavedState = { likedIds: [], cartIds: [] };

function normalizedEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getSavedState(email: string): Promise<SavedState> {
  try {
    const db = await getDb();
    const rows = await db
      .select({ productId: userProductActions.productId, action: userProductActions.action })
      .from(userProductActions)
      .where(eq(userProductActions.userEmail, normalizedEmail(email)));

    return {
      likedIds: rows.filter((row) => row.action === "liked").map((row) => row.productId),
      cartIds: rows.filter((row) => row.action === "cart").map((row) => row.productId),
    };
  } catch {
    return emptySavedState;
  }
}

export async function listSavedProducts(email: string, action: SavedAction): Promise<CatalogProduct[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select({ product: products })
      .from(userProductActions)
      .innerJoin(products, eq(products.id, userProductActions.productId))
      .where(and(
        eq(userProductActions.userEmail, normalizedEmail(email)),
        eq(userProductActions.action, action),
      ))
      .orderBy(desc(userProductActions.createdAt), desc(userProductActions.id));
    return rows.map((row) => row.product as CatalogProduct);
  } catch {
    return [];
  }
}

export async function getSavedCounts(email: string) {
  try {
    const db = await getDb();
    const rows = await db
      .select({ action: userProductActions.action, count: sql<number>`count(*)` })
      .from(userProductActions)
      .where(eq(userProductActions.userEmail, normalizedEmail(email)))
      .groupBy(userProductActions.action);
    return {
      liked: Number(rows.find((row) => row.action === "liked")?.count ?? 0),
      cart: Number(rows.find((row) => row.action === "cart")?.count ?? 0),
    };
  } catch {
    return { liked: 0, cart: 0 };
  }
}
