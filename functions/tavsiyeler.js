import { renderLayout, escapeHtml } from "./_lib/layout.js";
import { getSettings, getNav, getPage, getReviews, getCategories } from "./_lib/db.js";

function initials(name) {
  const words = (name || "").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  // Ad + soyad (ilk kelime + son kelime) bas harfleri
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export async function onRequestGet(context) {
  const db = context.env.DB;
  const [settings, navItems, page, reviews, services] = await Promise.all([
    getSettings(db),
    getNav(db),
    getPage(db, "tavsiyeler"),
    getReviews(db),
    getCategories(db, "service"),
  ]);
  const c = page ? page.content : {};

  const bodyHtml = `
<div class="page-hero">
  <div class="breadcrumb">Ana Sayfa / <span>Bizi Tercih Edenler</span></div>
  <h1>${escapeHtml(c.hero_title || "")}</h1>
  <p>${escapeHtml(c.hero_text || "")}</p>
</div>

<section>
  <div class="wrap">

    <div class="rating-badge">
      <div class="stars">★★★★★</div>
      <div class="score-meta">
        <span class="score">${escapeHtml(settings.google_rating || "")} / 5</span>
        <span>Google Haritalar · ${escapeHtml(settings.google_review_count || "")} yorum</span>
      </div>
    </div>

    <div class="grid cols-3">
      ${reviews
        .map(
          (r) => `<div class="card review-card">
        <div class="stars">★★★★★</div>
        <p class="review-text">"${escapeHtml(r.review_text)}"</p>
        <div class="review-author">
          <div class="review-avatar">${escapeHtml(initials(r.author))}</div>
          <div>
            <strong>${escapeHtml(r.author)}</strong>
            <span>${escapeHtml(r.meta || "")}</span>
          </div>
        </div>
      </div>`
        )
        .join("\n      ")}
    </div>

    <div style="text-align:center;margin-top:48px;">
      <a href="${escapeHtml(settings.maps_reviews_url || "https://www.google.com/maps/place/SN+B%C4%B0LG%C4%B0SAYAR+ve+G%C3%9CVENL%C4%B0K+S%C4%B0STEMLER%C4%B0/@41.0130571,28.855342,17z/data=!4m8!3m7!1s0x14caa5670f5002cd:0xdcbfefaaa8ed92b5!8m2!3d41.0130571!4d28.8579223!9m1!1b1!16s%2Fg%2F11kpdc2ply")}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
        ${escapeHtml(c.reviews_btn || "Tüm Yorumları Google'da Görüntüle →")}
      </a>
    </div>

  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="cta-band">
      <h2>${escapeHtml(c.cta_title || "Siz de aramıza katılın")}</h2>
      <p>${escapeHtml(c.cta_text || "Hizmetimizden memnun kalan yüzlerce müşterimize sizi de eklemek isteriz.")}</p>
      <div class="hero-actions">
        <a href="/iletisim" class="btn btn-primary">${escapeHtml(c.cta_btn || "İletişime Geçin")}</a>
      </div>
    </div>
  </div>
</section>`;

  const html = renderLayout({
    path: "/tavsiyeler",
    title: page ? page.title : "Bizi Tercih Edenler",
    description: page ? page.meta_description : "",
    navItems,
    settings,
    services,
    bodyHtml,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
