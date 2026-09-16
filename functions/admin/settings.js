import { renderAdminLayout } from "../_lib/adminLayout.js";
import { escapeHtml } from "../_lib/layout.js";
import { getSettings } from "../_lib/db.js";

const FIELDS = [
  ["phone", "Telefon (görünen, örn. +90 543 123 45 67)"],
  ["whatsapp", "WhatsApp / Telefon (sadece rakam, örn. 905431234567)"],
  ["email", "E-posta"],
  ["address", "Adres"],
  ["hours_weekday", "Çalışma Saatleri - Hafta İçi"],
  ["hours_saturday", "Çalışma Saatleri - Cumartesi"],
  ["google_rating", "Google Puanı (örn. 4,8)"],
  ["google_review_count", "Google Yorum Sayısı (örn. 166)"],
];

const HEADER_FOOTER_FIELDS = [
  ["brand_name", "Marka Adı (logo yanında, örn. SN BİLGİSAYAR)"],
  ["brand_tagline", "Marka Alt Yazısı (örn. VE GÜVENLİK SİSTEMLERİ)"],
  ["header_cta_text", "Üst Menü Buton Metni (örn. Ücretsiz Teklif Al)"],
  ["footer_about", "Footer Tanıtım Yazısı"],
  ["footer_copyright", "Footer Telif Hakkı Metni"],
  ["instagram_url", "Instagram Adresi (boş bırakılırsa ikon gösterilmez)"],
  ["facebook_url", "Facebook Adresi (boş bırakılırsa ikon gösterilmez)"],
];

const MAPS_FIELDS = [
  ["maps_directions_url", "Yol Tarifi Linki (mobil alt çubuk + İletişim sayfası butonu)"],
  ["maps_embed_url", "Harita Gömme (embed) Linki (İletişim sayfasındaki harita kutusu)"],
  ["maps_reviews_url", "Google Yorumlarını Görüntüle Linki (Bizi Tercih Edenler sayfası)"],
  ["map_lat", "Enlem (latitude, sadece Google'a bildirilen konum verisi için)"],
  ["map_lng", "Boylam (longitude, sadece Google'a bildirilen konum verisi için)"],
];

function form(settings, notice) {
  return `
  <div class="admin-card">
    <h1>Genel Ayarlar</h1>
    <p class="hint">Bu bilgiler tüm sayfalarda (footer, iletişim, alt eylem çubuğu) otomatik kullanılır.</p>
    <form method="POST">
      ${FIELDS.map(
        ([key, label]) => `<div class="admin-field">
        <label for="${key}">${escapeHtml(label)}</label>
        <input type="text" id="${key}" name="${key}" value="${escapeHtml(settings[key] || "")}">
      </div>`
      ).join("\n      ")}
      <button type="submit" class="btn btn-primary">Kaydet</button>
    </form>
  </div>

  <div class="admin-card">
    <h1>Header &amp; Footer</h1>
    <p class="hint">Sitenin üst menüsünde ve alt bilgi (footer) alanında görünen sabit metinler ve sosyal medya bağlantıları.</p>
    <form method="POST">
      ${HEADER_FOOTER_FIELDS.map(([key, label]) => {
        const input =
          key === "footer_about"
            ? `<textarea id="${key}" name="${key}" rows="2">${escapeHtml(settings[key] || "")}</textarea>`
            : `<input type="text" id="${key}" name="${key}" value="${escapeHtml(settings[key] || "")}">`;
        return `<div class="admin-field"><label for="${key}">${escapeHtml(label)}</label>${input}</div>`;
      }).join("\n      ")}
      <input type="hidden" name="section" value="header_footer">
      <button type="submit" class="btn btn-primary">Kaydet</button>
    </form>
  </div>

  <div class="admin-card">
    <h1>Google Haritalar Bağlantıları</h1>
    <p class="hint">
      Yol tarifi, harita önizlemesi ve yorumlar linkini Google Haritalar'da işletmenizi bulup
      "Paylaş" butonuyla kopyalayabilirsiniz. Embed (gömme) linki için: Google Haritalar'da işletmenizi açın →
      Paylaş → Bir harita yerleştirin → verilen koddaki <code>src="..."</code> arasındaki adresi kopyalayın.
    </p>
    <form method="POST">
      ${MAPS_FIELDS.map(
        ([key, label]) => `<div class="admin-field">
        <label for="${key}">${escapeHtml(label)}</label>
        <input type="text" id="${key}" name="${key}" value="${escapeHtml(settings[key] || "")}">
      </div>`
      ).join("\n      ")}
      <input type="hidden" name="section" value="maps">
      <button type="submit" class="btn btn-primary">Kaydet</button>
    </form>
  </div>`;
}

export async function onRequestGet(context) {
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const settings = await getSettings(context.env.DB);
  const html = renderAdminLayout({ title: "Genel Ayarlar", userEmail, bodyHtml: form(settings) });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const formData = await context.request.formData();

  if (formData.get("section") === "header_footer") {
    const values = HEADER_FOOTER_FIELDS.map(([key]) => (formData.get(key) || "").toString().slice(0, 500));
    await db
      .prepare(
        `UPDATE site_settings SET brand_name=?, brand_tagline=?, header_cta_text=?, footer_about=?, footer_copyright=?, instagram_url=?, facebook_url=? WHERE id=1`
      )
      .bind(...values)
      .run();
  } else if (formData.get("section") === "maps") {
    const values = MAPS_FIELDS.map(([key]) => (formData.get(key) || "").toString().slice(0, 1000));
    await db
      .prepare(
        `UPDATE site_settings SET maps_directions_url=?, maps_embed_url=?, maps_reviews_url=?, map_lat=?, map_lng=? WHERE id=1`
      )
      .bind(...values)
      .run();
  } else {
    const values = FIELDS.map(([key]) => (formData.get(key) || "").toString().slice(0, 500));
    await db
      .prepare(
        `UPDATE site_settings SET phone=?, whatsapp=?, email=?, address=?, hours_weekday=?, hours_saturday=?, google_rating=?, google_review_count=? WHERE id=1`
      )
      .bind(...values)
      .run();
  }

  const settings = await getSettings(db);
  const html = renderAdminLayout({
    title: "Genel Ayarlar",
    userEmail,
    notice: "Ayarlar kaydedildi.",
    bodyHtml: form(settings),
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
