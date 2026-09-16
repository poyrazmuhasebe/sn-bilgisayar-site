import { renderLayout, escapeHtml } from "./_lib/layout.js";
import { getSettings, getNav, getPage, getCategories } from "./_lib/db.js";

export async function onRequestGet(context) {
  const db = context.env.DB;
  const [settings, navItems, page, services] = await Promise.all([
    getSettings(db),
    getNav(db),
    getPage(db, "hizmetler"),
    getCategories(db, "service"),
  ]);
  const c = page ? page.content : {};

  const bodyHtml = `
<div class="page-hero">
  <div class="breadcrumb">Ana Sayfa / <span>Hizmetler</span></div>
  <h1>${escapeHtml(c.hero_title || "")}</h1>
  <p>${escapeHtml(c.hero_text || "")}</p>
</div>

<section>
  <div class="wrap">
    <div class="grid cols-2">
      ${services
        .map(
          (s) => `<div class="card">
        <div class="ic-big">${s.icon || ""}</div>
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.description || "")}</p>
        <ul>
          ${(s.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("\n          ")}
        </ul>
      </div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="cta-band">
      <h2>${escapeHtml(c.cta_title || "Aradığınız hizmeti bulamadınız mı?")}</h2>
      <p>${escapeHtml(c.cta_text || "Bize ulaşın, ihtiyacınıza özel bir çözüm sunalım.")}</p>
      <div class="hero-actions">
        <a href="/iletisim" class="btn btn-primary">${escapeHtml(c.cta_btn || "Bize Ulaşın")}</a>
        <a href="tel:+${escapeHtml(settings.whatsapp || "")}" class="btn btn-ghost">📞 ${escapeHtml(settings.phone || "")}</a>
      </div>
    </div>
  </div>
</section>`;

  const html = renderLayout({
    path: "/hizmetler",
    title: page ? page.title : "Hizmetler",
    description: page ? page.meta_description : "",
    navItems,
    settings,
    services,
    bodyHtml,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
