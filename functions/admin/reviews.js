import { renderAdminLayout } from "../_lib/adminLayout.js";
import { escapeHtml } from "../_lib/layout.js";
import { getReviews } from "../_lib/db.js";

function reviewRow(item) {
  return `<form method="POST" class="admin-fieldset" style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;">
    <input type="hidden" name="action" value="update">
    <input type="hidden" name="id" value="${item.id}">
    <div class="admin-field" style="flex:1;min-width:160px;margin-bottom:0;">
      <label>Müşteri Adı</label>
      <input type="text" name="author" value="${escapeHtml(item.author || "")}">
    </div>
    <div class="admin-field" style="flex:1;min-width:160px;margin-bottom:0;">
      <label>Alt Bilgi (örn. tarih, hizmet türü)</label>
      <input type="text" name="meta" value="${escapeHtml(item.meta || "")}">
    </div>
    <div class="admin-field" style="width:90px;margin-bottom:0;">
      <label>Sıra</label>
      <input type="text" name="sort_order" value="${item.sort_order}">
    </div>
    <div class="admin-field" style="width:100%;margin-bottom:0;">
      <label>Yorum Metni</label>
      <textarea name="review_text" rows="2">${escapeHtml(item.review_text || "")}</textarea>
    </div>
    <button type="submit" class="btn btn-ghost" style="padding:10px 16px;font-size:.85rem;">Kaydet</button>
  </form>
  <form method="POST" style="margin:-8px 0 16px;">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="id" value="${item.id}">
    <button type="submit" class="btn btn-ghost" style="padding:6px 14px;font-size:.78rem;color:#ff6b6b;border-color:rgba(255,107,107,.3);">🗑 Sil</button>
  </form>`;
}

function renderPage(reviews) {
  return `
  <div class="admin-card">
    <h1>Google Yorumları</h1>
    <p class="hint">"Bizi Tercih Edenler" sayfasında görünen müşteri yorumları.</p>
    ${reviews.map(reviewRow).join("\n    ")}
  </div>

  <div class="admin-card">
    <h2 style="font-size:1rem;">Yeni Yorum Ekle</h2>
    <form method="POST">
      <input type="hidden" name="action" value="create">
      <div class="admin-field"><label>Müşteri Adı</label><input type="text" name="author" required></div>
      <div class="admin-field"><label>Alt Bilgi (örn. tarih, hizmet türü)</label><input type="text" name="meta"></div>
      <div class="admin-field"><label>Yorum Metni</label><textarea name="review_text" rows="3"></textarea></div>
      <div class="admin-field" style="width:100px;"><label>Sıra</label><input type="text" name="sort_order" value="99"></div>
      <button type="submit" class="btn btn-primary">Ekle</button>
    </form>
  </div>`;
}

export async function onRequestGet(context) {
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const reviews = await getReviews(context.env.DB);
  const html = renderAdminLayout({ title: "Google Yorumları", userEmail, bodyHtml: renderPage(reviews) });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const formData = await context.request.formData();
  const action = formData.get("action");
  const get = (k, max) => (formData.get(k) || "").toString().slice(0, max || 300);

  if (action === "create") {
    await db
      .prepare("INSERT INTO reviews (author, meta, review_text, sort_order) VALUES (?, ?, ?, ?)")
      .bind(get("author", 100), get("meta", 100), get("review_text", 1000), parseInt(get("sort_order"), 10) || 99)
      .run();
  } else if (action === "update") {
    await db
      .prepare("UPDATE reviews SET author=?, meta=?, review_text=?, sort_order=? WHERE id=?")
      .bind(get("author", 100), get("meta", 100), get("review_text", 1000), parseInt(get("sort_order"), 10) || 0, parseInt(formData.get("id"), 10))
      .run();
  } else if (action === "delete") {
    await db.prepare("DELETE FROM reviews WHERE id=?").bind(parseInt(formData.get("id"), 10)).run();
  }

  const reviews = await getReviews(db);
  const html = renderAdminLayout({
    title: "Google Yorumları",
    userEmail,
    notice: "Kaydedildi.",
    bodyHtml: renderPage(reviews),
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
