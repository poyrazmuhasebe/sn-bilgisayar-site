import { renderLayout, escapeHtml } from "./_lib/layout.js";
import { getSettings, getNav, getPage, getCategories } from "./_lib/db.js";

export async function onRequestGet(context) {
  const db = context.env.DB;
  const [settings, navItems, page, services] = await Promise.all([
    getSettings(db),
    getNav(db),
    getPage(db, "hakkimizda"),
    getCategories(db, "service"),
  ]);
  const c = page ? page.content : {};
  const principles = c.principles || [];
  const defaultHighlights = [
    ["🎯", "Misyonumuz", "Hızlı, dürüst ve kaliteli teknik hizmet sunmak"],
    ["🚀", "Vizyonumuz", "Bölgenin güvenilir teknoloji çözüm ortağı olmak"],
    ["🤝", "Değerimiz", "Şeffaflık, güven ve müşteri memnuniyeti"],
  ];
  const highlights = (c.highlights && c.highlights.length ? c.highlights : defaultHighlights).filter(([, title]) => title);

  const bodyHtml = `
<div class="page-hero">
  <div class="breadcrumb">Ana Sayfa / <span>Hakkımızda</span></div>
  <h1>${escapeHtml(c.hero_title || "")}</h1>
  <p>${escapeHtml(c.hero_text || "")}</p>
</div>

<section>
  <div class="wrap two-col">
    <div>
      <span class="eyebrow">Hikayemiz</span>
      <h2 style="font-size:1.8rem;font-weight:800;margin:16px 0 18px;">${escapeHtml(c.story_title || "")}</h2>
      <p style="color:var(--text-muted);margin-bottom:16px;">${escapeHtml(c.story_p1 || "")}</p>
      <p style="color:var(--text-muted);">${escapeHtml(c.story_p2 || "")}</p>
    </div>
    <div class="hero-card">
      ${highlights
        .map(
          ([ic, title, desc]) =>
            `<div class="row"><div class="ic">${ic || ""}</div><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(desc)}</span></div></div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${escapeHtml(c.principles_eyebrow || "Çalışma Prensiplerimiz")}</span>
      <h2>${escapeHtml(c.principles_title || "Bizi Biz Yapan Değerler")}</h2>
    </div>
    <div class="value-list" style="max-width:720px;margin:0 auto;">
      ${principles
        .map(
          ([title, desc], i) =>
            `<div class="value-item"><div class="num">${i + 1}</div><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p></div></div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="cta-band">
      <h2>${escapeHtml(c.cta_title || "Bizimle çalışmaya hazır mısınız?")}</h2>
      <p>${escapeHtml(c.cta_text || "Sorununuzu anlatın, size en uygun çözümü birlikte bulalım.")}</p>
      <div class="hero-actions">
        <a href="/iletisim" class="btn btn-primary">${escapeHtml(c.cta_btn || "İletişime Geçin")}</a>
      </div>
    </div>
  </div>
</section>`;

  const html = renderLayout({
    path: "/hakkimizda",
    title: page ? page.title : "Hakkımızda",
    description: page ? page.meta_description : "",
    navItems,
    settings,
    services,
    bodyHtml,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
