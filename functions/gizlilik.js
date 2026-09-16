import { renderLayout, escapeHtml } from "./_lib/layout.js";
import { getSettings, getNav, getPage, getCategories } from "./_lib/db.js";

export async function onRequestGet(context) {
  const db = context.env.DB;
  const [settings, navItems, page, services] = await Promise.all([
    getSettings(db),
    getNav(db),
    getPage(db, "gizlilik"),
    getCategories(db, "service"),
  ]);
  const c = page ? page.content : {};
  const sections = (c.sections || []).filter(([title]) => title && title.trim());

  const bodyHtml = `
<div class="page-hero">
  <div class="breadcrumb">Ana Sayfa / <span>Gizlilik Politikası</span></div>
  <h1>${escapeHtml(c.hero_title || "")}</h1>
  <p>${escapeHtml(c.hero_text || "")}</p>
  ${c.last_updated ? `<p style="color:var(--text-muted);font-size:.85rem;">Son güncelleme: ${escapeHtml(c.last_updated)}</p>` : ""}
</div>

<section>
  <div class="wrap" style="max-width:820px;">
    ${sections
      .map(
        ([title, text], i) =>
          `<div style="margin-bottom:32px;">
        <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:10px;">${i + 1}. ${escapeHtml(title)}</h2>
        <p style="color:var(--text-muted);white-space:pre-line;line-height:1.7;">${escapeHtml(text)}</p>
      </div>`
      )
      .join("\n    ")}
  </div>
</section>`;

  const html = renderLayout({
    path: "/gizlilik",
    title: page ? page.title : "Gizlilik Politikası",
    description: page ? page.meta_description : "",
    navItems,
    settings,
    services,
    bodyHtml,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
