import { renderAdminLayout } from "../_lib/adminLayout.js";
import { escapeHtml } from "../_lib/layout.js";

const PAGE_LABELS = {
  home: "Ana Sayfa",
  hakkimizda: "Hakkımızda",
  hizmetler: "Hizmetler (üst metin)",
  urunler: "Ürünler (üst metin)",
  tavsiyeler: "Bizi Tercih Edenler (üst metin)",
  iletisim: "İletişim (üst metin)",
  gizlilik: "Gizlilik Politikası / Aydınlatma Metni",
};

export async function onRequestGet(context) {
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");

  const bodyHtml = `
  <div class="admin-card">
    <h1>Yönetim Paneli</h1>
    <p class="hint">Sayfa metinlerini ve genel ayarları buradan düzenleyebilirsin. Değişiklikler kaydettiğin anda canlı siteye yansır.</p>
    <div class="admin-list">
      ${Object.entries(PAGE_LABELS)
        .map(([slug, label]) => `<a href="/admin/page/${slug}">📝 ${escapeHtml(label)}</a>`)
        .join("\n      ")}
      <a href="/admin/settings">⚙️ Genel Ayarlar (telefon, adres, e-posta, çalışma saatleri)</a>
      <a href="/admin/nav">📋 Menü Yönetimi (ekle / sil / alt menü yap)</a>
      <a href="/admin/categories">🗂️ Hizmetler & Ürünler (kategori ekle / sil)</a>
      <a href="/admin/reviews">⭐ Google Yorumları (ekle / düzenle / sil)</a>
      <a href="/admin/branding">🖼️ Görsel Yönetimi (logo, favicon, paylaşım görseli)</a>
    </div>
  </div>`;

  const html = renderAdminLayout({ title: "Panel", userEmail, bodyHtml });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
