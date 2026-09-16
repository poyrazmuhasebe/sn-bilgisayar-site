import { renderAdminLayout } from "../_lib/adminLayout.js";
import { escapeHtml } from "../_lib/layout.js";

async function getAll(db, type) {
  const { results } = await db
    .prepare("SELECT * FROM categories WHERE type = ? ORDER BY sort_order ASC")
    .bind(type)
    .all();
  return results || [];
}

function serviceRow(item) {
  const bullets = item.bullets ? JSON.parse(item.bullets).join("\n") : "";
  return `<form method="POST" class="admin-fieldset">
    <input type="hidden" name="action" value="update">
    <input type="hidden" name="type" value="service">
    <input type="hidden" name="id" value="${item.id}">
    <div class="admin-field"><label>İkon (emoji)</label><input type="text" name="icon" value="${escapeHtml(item.icon || "")}"></div>
    <div class="admin-field"><label>Başlık</label><input type="text" name="title" value="${escapeHtml(item.title || "")}"></div>
    <div class="admin-field"><label>Kısa Açıklama (ana sayfa önizleme)</label><input type="text" name="short_description" value="${escapeHtml(item.short_description || "")}"></div>
    <div class="admin-field"><label>Uzun Açıklama (Hizmetler sayfası)</label><textarea name="description" rows="2">${escapeHtml(item.description || "")}</textarea></div>
    <div class="admin-field"><label>Madde Listesi (her satır ayrı madde)</label><textarea name="bullets" rows="4">${escapeHtml(bullets)}</textarea></div>
    <div class="admin-field" style="width:100px;"><label>Sıra</label><input type="text" name="sort_order" value="${item.sort_order}"></div>
    <button type="submit" class="btn btn-ghost" style="padding:10px 16px;font-size:.85rem;">Kaydet</button>
  </form>
  <form method="POST" style="margin:-8px 0 16px;">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="type" value="service">
    <input type="hidden" name="id" value="${item.id}">
    <button type="submit" class="btn btn-ghost" style="padding:6px 14px;font-size:.78rem;color:#ff6b6b;border-color:rgba(255,107,107,.3);">🗑 Sil</button>
  </form>`;
}

function productRow(item) {
  return `<form method="POST" class="admin-fieldset">
    <input type="hidden" name="action" value="update">
    <input type="hidden" name="type" value="product">
    <input type="hidden" name="id" value="${item.id}">
    <div class="admin-field"><label>Kategori Grubu (örn. Bilgisayar Parçaları)</label><input type="text" name="group_name" value="${escapeHtml(item.group_name || "")}"></div>
    <div class="admin-field"><label>Ürün Adı</label><input type="text" name="title" value="${escapeHtml(item.title || "")}"></div>
    <div class="admin-field"><label>Açıklama</label><input type="text" name="description" value="${escapeHtml(item.description || "")}"></div>
    <div class="admin-field"><label>Fiyat Notu</label><input type="text" name="price_note" value="${escapeHtml(item.price_note || "Fiyat için bize sorun")}"></div>
    <div class="admin-field" style="width:100px;"><label>Sıra</label><input type="text" name="sort_order" value="${item.sort_order}"></div>
    <button type="submit" class="btn btn-ghost" style="padding:10px 16px;font-size:.85rem;">Kaydet</button>
  </form>
  <form method="POST" style="margin:-8px 0 16px;">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="type" value="product">
    <input type="hidden" name="id" value="${item.id}">
    <button type="submit" class="btn btn-ghost" style="padding:6px 14px;font-size:.78rem;color:#ff6b6b;border-color:rgba(255,107,107,.3);">🗑 Sil</button>
  </form>`;
}

function renderPage(services, products) {
  return `
  <div class="admin-card">
    <h1>Hizmetler</h1>
    <p class="hint">Ana sayfa ve Hizmetler sayfasında görünen kartlar.</p>
    ${services.map(serviceRow).join("\n    ")}
  </div>
  <div class="admin-card">
    <h2 style="font-size:1rem;">Yeni Hizmet Ekle</h2>
    <form method="POST">
      <input type="hidden" name="action" value="create">
      <input type="hidden" name="type" value="service">
      <div class="admin-field"><label>İkon (emoji)</label><input type="text" name="icon" placeholder="🖥️"></div>
      <div class="admin-field"><label>Başlık</label><input type="text" name="title" required></div>
      <div class="admin-field"><label>Kısa Açıklama</label><input type="text" name="short_description"></div>
      <div class="admin-field"><label>Uzun Açıklama</label><textarea name="description" rows="2"></textarea></div>
      <div class="admin-field"><label>Madde Listesi (her satır ayrı madde)</label><textarea name="bullets" rows="4"></textarea></div>
      <div class="admin-field" style="width:100px;"><label>Sıra</label><input type="text" name="sort_order" value="99"></div>
      <button type="submit" class="btn btn-primary">Ekle</button>
    </form>
  </div>

  <div class="admin-card">
    <h1>Ürünler</h1>
    <p class="hint">Ürünler sayfasındaki fiyat tabloları.</p>
    ${products.map(productRow).join("\n    ")}
  </div>
  <div class="admin-card">
    <h2 style="font-size:1rem;">Yeni Ürün Ekle</h2>
    <form method="POST">
      <input type="hidden" name="action" value="create">
      <input type="hidden" name="type" value="product">
      <div class="admin-field"><label>Kategori Grubu (yeni bir isim yazarsan yeni kategori oluşur)</label><input type="text" name="group_name" required></div>
      <div class="admin-field"><label>Ürün Adı</label><input type="text" name="title" required></div>
      <div class="admin-field"><label>Açıklama</label><input type="text" name="description"></div>
      <div class="admin-field"><label>Fiyat Notu</label><input type="text" name="price_note" value="Fiyat için bize sorun"></div>
      <div class="admin-field" style="width:100px;"><label>Sıra</label><input type="text" name="sort_order" value="99"></div>
      <button type="submit" class="btn btn-primary">Ekle</button>
    </form>
  </div>`;
}

export async function onRequestGet(context) {
  const db = context.env.DB;
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const [services, products] = await Promise.all([getAll(db, "service"), getAll(db, "product")]);
  const html = renderAdminLayout({ title: "Hizmetler & Ürünler", userEmail, bodyHtml: renderPage(services, products) });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const formData = await context.request.formData();
  const action = formData.get("action");
  const type = formData.get("type");
  const get = (k, max) => (formData.get(k) || "").toString().slice(0, max || 300);

  if (action === "create" && type === "service") {
    const bullets = get("bullets", 1000)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    await db
      .prepare(
        "INSERT INTO categories (type, icon, title, short_description, description, bullets, sort_order) VALUES ('service', ?, ?, ?, ?, ?, ?)"
      )
      .bind(get("icon", 10), get("title"), get("short_description"), get("description", 1000), JSON.stringify(bullets), parseInt(get("sort_order"), 10) || 99)
      .run();
  } else if (action === "update" && type === "service") {
    const bullets = get("bullets", 1000)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    await db
      .prepare(
        "UPDATE categories SET icon=?, title=?, short_description=?, description=?, bullets=?, sort_order=? WHERE id=?"
      )
      .bind(get("icon", 10), get("title"), get("short_description"), get("description", 1000), JSON.stringify(bullets), parseInt(get("sort_order"), 10) || 0, parseInt(formData.get("id"), 10))
      .run();
  } else if (action === "create" && type === "product") {
    await db
      .prepare(
        "INSERT INTO categories (type, group_name, title, description, price_note, sort_order) VALUES ('product', ?, ?, ?, ?, ?)"
      )
      .bind(get("group_name"), get("title"), get("description"), get("price_note") || "Fiyat için bize sorun", parseInt(get("sort_order"), 10) || 99)
      .run();
  } else if (action === "update" && type === "product") {
    await db
      .prepare("UPDATE categories SET group_name=?, title=?, description=?, price_note=?, sort_order=? WHERE id=?")
      .bind(get("group_name"), get("title"), get("description"), get("price_note"), parseInt(get("sort_order"), 10) || 0, parseInt(formData.get("id"), 10))
      .run();
  } else if (action === "delete") {
    await db.prepare("DELETE FROM categories WHERE id=?").bind(parseInt(formData.get("id"), 10)).run();
  }

  const [services, products] = await Promise.all([getAll(db, "service"), getAll(db, "product")]);
  const html = renderAdminLayout({
    title: "Hizmetler & Ürünler",
    userEmail,
    notice: "Kaydedildi.",
    bodyHtml: renderPage(services, products),
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
