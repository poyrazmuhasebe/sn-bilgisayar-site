const ALLOWED = new Set(["og-image.png", "favicon.png", "logo.png"]);

export async function onRequestGet(context) {
  const filename = context.params.filename;
  if (!ALLOWED.has(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const object = await context.env.ASSETS_BUCKET.get(filename);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=3600");

  return new Response(object.body, { headers });
}
