import { desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";
import type { Category, Department } from "@/lib/catalog";

const audiences = new Set(["masculino", "feminino", "unissex"]);
const ageGroups = new Set(["adulto", "infantil", "geral"]);
const departments = new Set(["moda", "acessorios", "academia", "tecnologia", "casa", "beleza", "ferramentas", "esporte_lazer"]);
const categories = new Set(["sapatos", "calcas", "blusas", "camisas", "moletons", "casacos", "shorts", "conjuntos", "vestidos", "pijamas", "roupas_intimas", "roupas_bebe", "fantasias", "meias", "mochilas", "acessorios", "bolsas", "pulseiras", "colares", "aneis", "cintos", "oculos", "bones", "brincos", "relogios", "cabelo", "gravatas", "piercings", "componentes_pc", "perifericos", "computadores", "monitores", "teclados", "audio", "celulares", "equipamentos", "suplementos", "casa_utilidades", "cama_banho", "limpeza", "cozinha", "organizacao", "decoracao", "moveis", "pets", "skincare", "higiene", "beleza_cabelo", "beleza_cuidados", "ferramentas", "automotivo", "mobilidade", "pesca", "brinquedos", "esporte_lazer"]);

type ImageBucket = {
  put(key: string, value: ReadableStream, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(key: string): Promise<unknown>;
};

async function getBucket(): Promise<ImageBucket> {
  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as { BUCKET?: ImageBucket }).BUCKET;
  if (!bucket) throw new Error("O armazenamento de imagens ainda não está disponível.");
  return bucket;
}

async function requireAdmin() {
  const user = await getChatGPTUser();
  return isAdminEmail(user?.email) ? user : null;
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });

  try {
    const db = await getDb();
    const rows = await db.select().from(products).orderBy(desc(products.createdAt), desc(products.id));
    return Response.json({ products: rows });
  } catch {
    return Response.json({ products: [], warning: "O catálogo ainda está sendo preparado." });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });

  try {
    const form = await request.formData();
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const audience = String(form.get("audience") ?? "");
    const requestedAgeGroup = String(form.get("ageGroup") ?? "");
    const department = String(form.get("department") ?? "");
    const category = String(form.get("category") ?? "");
    const productUrl = String(form.get("productUrl") ?? "").trim();
    const imageUrl = String(form.get("imageUrl") ?? "").trim();
    const image = form.get("image");

    if (!title || !description) return Response.json({ error: "Preencha o nome e a descrição." }, { status: 400 });
    if (!audiences.has(audience) || !ageGroups.has(requestedAgeGroup) || !departments.has(department) || !categories.has(category)) return Response.json({ error: "Escolha um departamento, um público, uma idade e uma categoria válidos." }, { status: 400 });
    if (!validHttpUrl(productUrl)) return Response.json({ error: "Informe um link de produto válido." }, { status: 400 });
    if (imageUrl && !validHttpUrl(imageUrl)) return Response.json({ error: "O link da foto não é válido." }, { status: 400 });

    let imageKey: string | null = null;
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) return Response.json({ error: "Envie somente arquivos de imagem." }, { status: 400 });
      if (image.size > 8 * 1024 * 1024) return Response.json({ error: "A foto deve ter no máximo 8 MB." }, { status: 400 });
      const extension = image.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
      imageKey = `product-${crypto.randomUUID()}.${extension}`;
      const bucket = await getBucket();
      await bucket.put(imageKey, image.stream(), { httpMetadata: { contentType: image.type } });
    }

    if (!imageKey && !imageUrl) return Response.json({ error: "Envie uma foto ou informe o link de uma imagem." }, { status: 400 });

    const db = await getDb();
    const usesAgeDirectory = department === "moda" || department === "acessorios";
    const ageGroup = usesAgeDirectory
      ? (requestedAgeGroup === "geral" ? "adulto" : requestedAgeGroup)
      : (requestedAgeGroup === "infantil" ? "infantil" : "geral");
    const [created] = await db.insert(products).values({
      title,
      description,
      audience: audience as "masculino" | "feminino" | "unissex",
      ageGroup: ageGroup as "adulto" | "infantil" | "geral",
      department: department as Department,
      category: category as Category,
      productUrl,
      imageKey,
      imageUrl: imageKey ? null : imageUrl,
    }).returning();

    return Response.json({ product: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível adicionar o produto.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Produto inválido." }, { status: 400 });

  const db = await getDb();
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) return Response.json({ error: "Produto não encontrado." }, { status: 404 });

  await db.delete(products).where(eq(products.id, id));
  if (product.imageKey) {
    const bucket = await getBucket();
    await bucket.delete(product.imageKey);
  }
  return Response.json({ ok: true });
}
