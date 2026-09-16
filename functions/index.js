import { renderLayout, escapeHtml } from "./_lib/layout.js";
import { getSettings, getNav, getPage, getCategories } from "./_lib/db.js";

export async function onRequestGet(context) {
  const { env } = context;
  const db = env.DB;

  const [settings, navItems, page, services] = await Promise.all([
    getSettings(db),
    getNav(db),
    getPage(db, "home"),
    getCategories(db, "service"),
  ]);
  const c = page ? page.content : {};

  const defaultHeroCards = [
    ["🖥️", "Bilgisayar Tamiri", "Aynı gün teşhis ve onarım"],
    ["🛠️", "Kurulum & Format", "Windows, sürücü, yazılım kurulumu"],
    ["🧩", "Parça Satışı", "Orijinal ve uyumlu parçalar"],
    ["🎥", "Güvenlik Sistemleri", "Kamera, alarm, kurulum ve destek"],
  ];

  const stats = c.stats || [];
  const whyUs = c.why_us || [];
  const heroCardRows = (c.hero_cards && c.hero_cards.length ? c.hero_cards : defaultHeroCards).filter(([, title]) => title);

  const bodyHtml = `
<section class="hero">
  <div class="wrap">
    <div class="hero-copy">
      <span class="eyebrow">${escapeHtml(c.eyebrow || "")}</span>
      <h1>${escapeHtml(c.title_pre || "")}<span>${escapeHtml(c.title_highlight || "")}</span>${escapeHtml(c.title_post || "")}</h1>
      <p>${escapeHtml(c.text || "")}</p>
      <div class="hero-actions">
        <a href="/iletisim" class="btn btn-primary">${escapeHtml(c.hero_btn1 || "Ücretsiz Teklif Al →")}</a>
        <a href="/hizmetler" class="btn btn-ghost">${escapeHtml(c.hero_btn2 || "Hizmetleri İncele")}</a>
      </div>
      <div class="trust-badge-mobile" style="margin-top:22px;">
        <span class="st">★★★★★</span> ${escapeHtml(settings.google_rating || "")} · <a href="/tavsiyeler">${escapeHtml(settings.google_review_count || "")} Google yorumu</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-card">
        ${heroCardRows
          .map(
            ([ic, title, desc]) =>
              `<div class="row"><div class="ic">${ic}</div><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(desc)}</span></div></div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </div>
</section>

<div class="stats">
  <div class="wrap">
    ${stats.map(([num, label]) => `<div class="stat"><b>${escapeHtml(num)}</b><span>${escapeHtml(label)}</span></div>`).join("\n    ")}
  </div>
</div>

<section>
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${escapeHtml(c.services_eyebrow || "Neler Yapıyoruz")}</span>
      <h2>${escapeHtml(c.services_title || "Kapsamlı Hizmetlerimiz")}</h2>
      <p>${escapeHtml(c.services_text || "Ev ve işyerleri için bilgisayar ve güvenlik alanında tek noktadan çözüm sunuyoruz.")}</p>
    </div>
    <div class="grid cols-3 service-list">
      ${services
        .map(
          (s) =>
            `<div class="card"><div class="ic-big">${s.icon || ""}</div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.short_description || "")}</p></div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${escapeHtml(c.whyus_eyebrow || "Neden Biz")}</span>
      <h2>${escapeHtml(c.whyus_title || "SN Bilgisayar'ı Tercih Etmeniz İçin 4 Neden")}</h2>
    </div>
    <div class="grid cols-3">
      ${whyUs
        .map(
          ([ic, title, desc]) =>
            `<div class="card center"><div class="ic-big">${ic}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p></div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="cta-band">
      <h2>${escapeHtml(c.cta_title || "Bilgisayarınızda veya güvenlik sisteminizde bir sorun mu var?")}</h2>
      <p>${escapeHtml(c.cta_text || "Hemen bize ulaşın, size en uygun çözümü sunalım.")}</p>
      <div class="hero-actions">
        <a href="/iletisim" class="btn btn-primary">${escapeHtml(c.cta_btn || "Bize Ulaşın")}</a>
        <a href="tel:+${escapeHtml(settings.whatsapp || "")}" class="btn btn-ghost">📞 ${escapeHtml(settings.phone || "")}</a>
      </div>
    </div>
  </div>
</section>`;

  const html = renderLayout({
    path: "/",
    title: page ? page.title : "SN Bilgisayar ve Güvenlik Sistemleri",
    description: page ? page.meta_description : "",
    navItems,
    settings,
    services,
    bodyHtml,
  });

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
