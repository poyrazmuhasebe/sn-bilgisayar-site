import { renderAdminLayout } from "../_lib/adminLayout.js";
import { escapeHtml } from "../_lib/layout.js";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const SLOTS = {
  logo: { key: "logo.png", column: "logo_url", label: "Site Logosu", hint: "Üst menüde ve footer'da 'SN' rozetinin yerine gösterilir. Kare veya yatay, şeffaf arka plan (PNG) önerilir." },
  favicon: { key: "favicon.png", column: "favicon_url", label: "Favicon", hint: "Tarayıcı sekmesinde görünen küçük ikon. Kare, en az 32×32px önerilir." },
  og_image: { key: "og-image.png", column: "og_image_url", label: "Paylaşım Görseli (OG Image)", hint: "Link paylaşıldığında (WhatsApp, Facebook, vb.) önizlemede görünür. 1200×630px önerilir." },
};

async function getSettings(db) {
  return await db.prepare("SELECT * FROM site_settings WHERE id = 1").first();
}

function slotCard(slotId, slot, settings) {
  const url = settings[slot.column];
  const preview = url
    ? `<img src="${escapeHtml(url)}?t=${Date.now()}" alt="${escapeHtml(slot.label)}" style="max-width:220px;max-height:140px;border-radius:8px;border:1px solid var(--border);background:#fff;object-fit:contain;">`
    : `<span style="color:var(--text-muted);font-size:.85rem;">Henüz yüklenmedi — varsayılan kullanılıyor.</span>`;

  return `
  <div class="admin-fieldset">
    <legend>${escapeHtml(slot.label)}</legend>
    <p class="hint" style="margin-bottom:14px;">${escapeHtml(slot.hint)}</p>
    <div style="margin-bottom:16px;">${preview}</div>
    <form method="POST" enctype="multipart/form-data">
      <input type="hidden" name="slot" value="${slotId}">
      <div class="admin-field">
        <label>Yeni dosya seç (PNG, JPG veya WEBP, max 2MB)</label>
        <input type="file" name="file" accept="image/png,image/jpeg,image/webp" required>
      </div>
      <button type="submit" class="btn btn-primary">Yükle</button>
    </form>
  </div>`;
}

function renderPage(settings) {
  return `
  <div class="admin-card">
    <h1>Görsel Yönetimi</h1>
    <p class="hint">Site logosu, favicon ve paylaşım görselini buradan değiştirebilirsin. Yüklenen dosya, ilgili varsayılanın yerine hemen canlı sitede kullanılır.</p>
    ${Object.entries(SLOTS).map(([id, slot]) => slotCard(id, slot, settings)).join("\n    ")}
  </div>`;
}

export async function onRequestGet(context) {
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const settings = await getSettings(context.env.DB);
  const html = renderAdminLayout({ title: "Görsel Yönetimi", userEmail, bodyHtml: renderPage(settings) });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  let notice = "Kaydedildi.";

  try {
    const formData = await context.request.formData();
    const slotId = formData.get("slot");
    const file = formData.get("file");
    const slot = SLOTS[slotId];

    if (!slot || !(file instanceof File)) {
      notice = "Geçersiz istek.";
    } else if (!ALLOWED_TYPES.has(file.type)) {
      notice = "Desteklenmeyen dosya türü. Lütfen PNG, JPG veya WEBP yükleyin.";
    } else if (file.size > MAX_BYTES) {
      notice = "Dosya çok büyük (max 2MB).";
    } else {
      await context.env.ASSETS_BUCKET.put(slot.key, file.stream(), {
        httpMetadata: { contentType: file.type },
      });
      const publicUrl = `/assets/${slot.key}`;
      await db.prepare(`UPDATE site_settings SET ${slot.column} = ? WHERE id = 1`).bind(publicUrl).run();
      notice = `${slot.label} güncellendi.`;
    }
  } catch (e) {
    notice = "Yükleme sırasında bir hata oluştu.";
  }

  const settings = await getSettings(db);
  const html = renderAdminLayout({ title: "Görsel Yönetimi", userEmail, notice, bodyHtml: renderPage(settings) });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
