import { renderLayout, escapeHtml } from "./_lib/layout.js";
import { getSettings, getNav, getPage, getCategories } from "./_lib/db.js";

function groupBy(items, key) {
  const groups = [];
  const map = new Map();
  for (const item of items) {
    const k = item[key] || "";
    if (!map.has(k)) {
      const g = { name: k, items: [] };
      map.set(k, g);
      groups.push(g);
    }
    map.get(k).items.push(item);
  }
  return groups;
}

function renderTable(group) {
  return `
    <div class="section-head" style="text-align:left;margin-bottom:28px;max-width:none;">
      <span class="badge">${escapeHtml(group.name)}</span>
    </div>
    <div class="table-wrap" style="margin-bottom:70px;">
      <table class="price-table">
        <thead>
          <tr><th>Ürün</th><th>Açıklama</th><th>Fiyat</th><th></th></tr>
        </thead>
        <tbody>
          ${group.items
            .map(
              (p) => `<tr>
            <td data-label="Ürün"><strong>${escapeHtml(p.title)}</strong></td>
            <td data-label="Açıklama">${escapeHtml(p.description || "")}</td>
            <td class="tag" data-label="Fiyat">${escapeHtml(p.price_note || "Fiyat için bize sorun")}</td>
            <td><a href="/iletisim" class="btn btn-ghost" style="padding:8px 16px;font-size:.82rem;">Teklif Al</a></td>
          </tr>`
            )
            .join("\n          ")}
        </tbody>
      </table>
    </div>`;
}

export async function onRequestGet(context) {
  const db = context.env.DB;
  const [settings, navItems, page, products, services] = await Promise.all([
    getSettings(db),
    getNav(db),
    getPage(db, "urunler"),
    getCategories(db, "product"),
    getCategories(db, "service"),
  ]);
  const c = page ? page.content : {};
  const groups = groupBy(products, "group_name");

  const bodyHtml = `
<div class="page-hero">
  <div class="breadcrumb">Ana Sayfa / <span>Ürünler</span></div>
  <h1>${escapeHtml(c.hero_title || "")}</h1>
  <p>${escapeHtml(c.hero_text || "")}</p>
</div>

<section>
  <div class="wrap">
    ${groups.map(renderTable).join("\n    ")}
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="cta-band">
      <h2>${escapeHtml(c.cta_title || "İhtiyacınıza uygun ürünü birlikte bulalım")}</h2>
      <p>${escapeHtml(c.cta_text || "Bütçenize ve kullanım amacınıza en uygun ürün/paket önerisi için bizimle iletişime geçin.")}</p>
      <div class="hero-actions">
        <a href="/iletisim" class="btn btn-primary">${escapeHtml(c.cta_btn || "Ücretsiz Teklif Al")}</a>
      </div>
    </div>
  </div>
</section>`;

  const html = renderLayout({
    path: "/urunler",
    title: page ? page.title : "Ürünler",
    description: page ? page.meta_description : "",
    navItems,
    settings,
    services,
    bodyHtml,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
