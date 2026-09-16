import { renderLayout, escapeHtml } from "./_lib/layout.js";
import { getSettings, getNav, getPage, getCategories } from "./_lib/db.js";

export async function onRequestGet(context) {
  const db = context.env.DB;
  const [settings, navItems, page, services] = await Promise.all([
    getSettings(db),
    getNav(db),
    getPage(db, "iletisim"),
    getCategories(db, "service"),
  ]);
  const c = page ? page.content : {};
  const telHref = "tel:+" + escapeHtml(settings.whatsapp || "");
  const waHref = "https://wa.me/" + escapeHtml(settings.whatsapp || "");

  const bodyHtml = `
<div class="page-hero">
  <div class="breadcrumb">Ana Sayfa / <span>İletişim</span></div>
  <h1>${escapeHtml(c.hero_title || "")}</h1>
  <p>${escapeHtml(c.hero_text || "")}</p>
</div>

<section>
  <div class="wrap contact-grid">

    <div>
      <div class="contact-item">
        <div class="ic">📞</div>
        <div><strong>Telefon</strong><a href="${telHref}">${escapeHtml(settings.phone || "")}</a></div>
      </div>
      <div class="contact-item">
        <div class="ic">💬</div>
        <div><strong>WhatsApp</strong><a href="${waHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(settings.phone || "")}</a></div>
      </div>
      <div class="contact-item">
        <div class="ic">✉️</div>
        <div><strong>E-posta</strong><a href="mailto:${escapeHtml(settings.email || "")}">${escapeHtml(settings.email || "")}</a></div>
      </div>
      <div class="contact-item">
        <div class="ic">📍</div>
        <div><strong>Adres</strong><span>${escapeHtml(settings.address || "")}</span></div>
      </div>
      <div class="contact-item">
        <div class="ic">🕒</div>
        <div><strong>Çalışma Saatleri</strong><span>${escapeHtml(settings.hours_weekday || "")} · ${escapeHtml(settings.hours_saturday || "")}</span></div>
      </div>

      <form class="contact-form" style="margin-top:32px;" id="contactForm">
        <div>
          <label for="ad">Ad Soyad</label>
          <input type="text" id="ad" name="ad" placeholder="Adınız Soyadınız" maxlength="100" required>
        </div>
        <div>
          <label for="tel">Telefon</label>
          <input type="tel" id="tel" name="tel" placeholder="05xx xxx xx xx" maxlength="30" required>
        </div>
        <div>
          <label for="konu">Hizmet Türü</label>
          <select id="konu" name="konu">
            ${(services && services.length
              ? services.map((s) => s.title)
              : ["Bilgisayar Tamiri", "Kurulum & Format", "Parça Satışı", "Güvenlik Sistemleri", "Ağ & İnternet Kurulumu", "Kurumsal IT Destek"]
            )
              .map((s) => `<option>${escapeHtml(s)}</option>`)
              .join("\n            ")}
            <option>Diğer</option>
          </select>
        </div>
        <div>
          <label for="mesaj">Mesajınız</label>
          <textarea id="mesaj" name="mesaj" rows="4" maxlength="2000" placeholder="Talebinizi kısaca açıklayın..."></textarea>
        </div>
        <div style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
          <label for="website">Web siteniz</label>
          <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
        </div>
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:.82rem;color:var(--text-muted);margin-bottom:-4px;">
          <input type="checkbox" id="kvkk" name="kvkk" required style="width:auto;margin-top:3px;flex:none;">
          <span>Kişisel verilerimin işlenmesine ilişkin <a href="/gizlilik" target="_blank" rel="noopener noreferrer" style="color:var(--accent-2);">Gizlilik Politikası ve Aydınlatma Metni'ni</a> okudum, kabul ediyorum.</span>
        </label>
        <button type="submit" class="btn btn-primary" style="justify-content:center;">Gönder</button>
        <p class="form-status" role="status" style="font-size:.85rem;min-height:1.2em;"></p>
      </form>
    </div>

    <div>
      <div class="map-box">
        <iframe src="${escapeHtml(settings.maps_embed_url || "https://www.google.com/maps?q=SN+B%C4%B0LG%C4%B0SAYAR+ve+G%C3%9CVENL%C4%B0K+S%C4%B0STEMLER%C4%B0&output=embed")}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <a href="${escapeHtml(settings.maps_directions_url || "https://www.google.com/maps/dir/?api=1&destination=41.0130571,28.8579223")}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="justify-content:center;width:100%;margin-top:16px;">📍 Yol Tarifi Al</a>
    </div>

  </div>
</section>`;

  const html = renderLayout({
    path: "/iletisim",
    title: page ? page.title : "İletişim",
    description: page ? page.meta_description : "",
    navItems,
    settings,
    services,
    bodyHtml,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
