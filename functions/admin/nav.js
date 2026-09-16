import { renderAdminLayout } from "../_lib/adminLayout.js";
import { escapeHtml } from "../_lib/layout.js";

async function getAllNav(db) {
  const { results } = await db.prepare("SELECT * FROM nav_items ORDER BY parent_id IS NOT NULL, sort_order ASC").all();
  return results || [];
}

function renderRow(item, topLevelOptions) {
  return `<form method="POST" class="admin-fieldset" style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;">
    <input type="hidden" name="action" value="update">
    <input type="hidden" name="id" value="${item.id}">
    <div class="admin-field" style="flex:1;min-width:140px;margin-bottom:0;">
      <label>Etiket</label>
      <input type="text" name="label" value="${escapeHtml(item.label)}">
    </div>
    <div class="admin-field" style="flex:1;min-width:140px;margin-bottom:0;">
      <label>Adres (örn. /iletisim)</label>
      <input type="text" name="url" value="${escapeHtml(item.url)}">
    </div>
    <div class="admin-field" style="width:90px;margin-bottom:0;">
      <label>Sıra</label>
      <input type="text" name="sort_order" value="${item.sort_order}">
    </div>
    <div class="admin-field" style="min-width:160px;margin-bottom:0;">
      <label>Üst Menü</label>
      <select name="parent_id">
        <option value="">Yok (üst menü)</option>
        ${topLevelOptions
          .filter((o) => o.id !== item.id)
          .map((o) => `<option value="${o.id}"${item.parent_id === o.id ? " selected" : ""}>${escapeHtml(o.label)}</option>`)
          .join("")}
      </select>
    </div>
    <button type="submit" class="btn btn-ghost" style="padding:10px 16px;font-size:.85rem;">Kaydet</button>
  </form>
  <form method="POST" style="margin:-8px 0 16px;">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="id" value="${item.id}">
    <button type="submit" class="btn btn-ghost" style="padding:6px 14px;font-size:.78rem;color:#ff6b6b;border-color:rgba(255,107,107,.3);">🗑 Sil</button>
  </form>`;
}

function renderPage(items, notice) {
  const topLevel = items.filter((i) => !i.parent_id);
  return `
  <div class="admin-card">
    <h1>Menü Yönetimi</h1>
    <p class="hint">Üst menüdeki (ve mobil menüdeki) bağlantıları düzenle, sırala, alt menü olarak grupla veya yeni ekle.</p>
    ${items.map((item) => renderRow(item, topLevel)).join("\n    ")}
  </div>

  <div class="admin-card">
    <h2 style="font-size:1.05rem;">Yeni Menü Öğesi Ekle</h2>
    <form method="POST">
      <input type="hidden" name="action" value="create">
      <div class="admin-field">
        <label>Etiket</label>
        <input type="text" name="label" placeholder="örn. Blog" required>
      </div>
      <div class="admin-field">
        <label>Adres</label>
        <input type="text" name="url" placeholder="örn. /blog" required>
      </div>
      <div class="admin-field">
        <label>Sıra (küçük sayı önce gelir)</label>
        <input type="text" name="sort_order" value="99">
      </div>
      <div class="admin-field">
        <label>Üst Menü (alt menü yapmak için seç)</label>
        <select name="parent_id">
          <option value="">Yok (üst menü)</option>
          ${topLevel.map((o) => `<option value="${o.id}">${escapeHtml(o.label)}</option>`).join("")}
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Ekle</button>
    </form>
  </div>`;
}

export async function onRequestGet(context) {
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const items = await getAllNav(context.env.DB);
  const html = renderAdminLayout({ title: "Menü", userEmail, bodyHtml: renderPage(items) });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const formData = await context.request.formData();
  const action = formData.get("action");

  if (action === "create") {
    const label = (formData.get("label") || "").toString().slice(0, 100);
    const url = (formData.get("url") || "").toString().slice(0, 200);
    const sortOrder = parseInt(formData.get("sort_order") || "99", 10) || 99;
    const parentId = formData.get("parent_id") ? parseInt(formData.get("parent_id"), 10) : null;
    if (label && url) {
      await db
        .prepare("INSERT INTO nav_items (label, url, parent_id, sort_order, visible) VALUES (?, ?, ?, ?, 1)")
        .bind(label, url, parentId, sortOrder)
        .run();
    }
  } else if (action === "update") {
    const id = parseInt(formData.get("id"), 10);
    const label = (formData.get("label") || "").toString().slice(0, 100);
    const url = (formData.get("url") || "").toString().slice(0, 200);
    const sortOrder = parseInt(formData.get("sort_order") || "0", 10) || 0;
    const parentIdRaw = formData.get("parent_id");
    const parentId = parentIdRaw ? parseInt(parentIdRaw, 10) : null;
    await db
      .prepare("UPDATE nav_items SET label=?, url=?, sort_order=?, parent_id=? WHERE id=?")
      .bind(label, url, sortOrder, parentId, id)
      .run();
  } else if (action === "delete") {
    const id = parseInt(formData.get("id"), 10);
    await db.prepare("UPDATE nav_items SET parent_id=NULL WHERE parent_id=?").bind(id).run();
    await db.prepare("DELETE FROM nav_items WHERE id=?").bind(id).run();
  }

  const items = await getAllNav(db);
  const html = renderAdminLayout({ title: "Menü", userEmail, notice: "Kaydedildi.", bodyHtml: renderPage(items) });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
