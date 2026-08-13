type StoredImage = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  writeHttpMetadata(headers: Headers): void;
};

type ImageBucket = { get(key: string): Promise<StoredImage | null> };

const CATALOG_ORIGIN = "https://site-andrei.xtzadas.chatgpt.site";

export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  const decodedKey = decodeURIComponent(key);

  if (process.env.VERCEL) {
    try {
      const source = await fetch(
        `${CATALOG_ORIGIN}/api/images/${encodeURIComponent(decodedKey)}`,
        { cache: "force-cache" },
      );
      if (!source.ok || !source.body) {
        return new Response("Imagem não encontrada", { status: source.status || 404 });
      }

      const headers = new Headers();
      for (const name of ["content-type", "etag", "last-modified"]) {
        const value = source.headers.get(name);
        if (value) headers.set(name, value);
      }
      headers.set("cache-control", "public, max-age=31536000, immutable");
      return new Response(source.body, { status: 200, headers });
    } catch {
      return new Response("Imagem indisponível", { status: 503 });
    }
  }

  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as { BUCKET?: ImageBucket }).BUCKET;
  if (!bucket) return new Response("Imagem indisponível", { status: 503 });

  const object = await bucket.get(decodedKey);
  if (!object) return new Response("Imagem não encontrada", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", `"${key}"`);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
