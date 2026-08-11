type StoredImage = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  writeHttpMetadata(headers: Headers): void;
};

type ImageBucket = { get(key: string): Promise<StoredImage | null> };

export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as { BUCKET?: ImageBucket }).BUCKET;
  if (!bucket) return new Response("Imagem indisponível", { status: 503 });

  const object = await bucket.get(decodeURIComponent(key));
  if (!object) return new Response("Imagem não encontrada", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", `\"${key}\"`);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
