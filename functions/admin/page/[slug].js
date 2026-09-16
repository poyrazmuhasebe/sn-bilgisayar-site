import { renderAdminLayout } from "../../_lib/adminLayout.js";
import { escapeHtml } from "../../_lib/layout.js";
import { getPage } from "../../_lib/db.js";

const LABELS = {
  eyebrow: "Üst Etiket",
  title_pre: "Başlık (1. kısım)",
  title_highlight: "Başlık (vurgulu kısım, renkli)",
  title_post: "Başlık (3. kısım)",
  text: "Ana Metin",
  hero_title: "Sayfa Başlığı (H1)",
  hero_text: "Alt Açıklama",
  hero_btn1: "1. Buton Metni",
  hero_btn2: "2. Buton Metni",
  story_title: "Hikaye Başlığı",
  story_p1: "Hikaye - Paragraf 1",
  story_p2: "Hikaye - Paragraf 2",
  last_updated: "Son Güncelleme Tarihi",
  services_eyebrow: "Hizmetler Bölümü - Üst Etiket",
  services_title: "Hizmetler Bölümü - Başlık",
  services_text: "Hizmetler Bölümü - Açıklama",
  whyus_eyebrow: "Neden Biz Bölümü - Üst Etiket",
  whyus_title: "Neden Biz Bölümü - Başlık",
  principles_eyebrow: "Prensipler Bölümü - Üst Etiket",
  principles_title: "Prensipler Bölümü - Başlık",
  reviews_btn: "\"Tümünü Gör\" Buton Metni",
  cta_title: "Alt Çağrı Bandı - Başlık",
  cta_text: "Alt Çağrı Bandı - Açıklama",
  cta_btn: "Alt Çağrı Bandı - Buton Metni",
};
const LONG_FIELDS = new Set(["text", "hero_text", "story_p1", "story_p2", "services_text", "cta_text"]);

const SCHEMAS = {
  home: {
    simple: [
      "eyebrow", "title_pre", "title_highlight", "title_post", "text", "hero_btn1", "hero_btn2",
      "services_eyebrow", "services_title", "services_text", "whyus_eyebrow", "whyus_title",
      "cta_title", "cta_text", "cta_btn",
    ],
    groups: {
      stats: { labels: ["Sayı", "Etiket"], count: 4 },
      hero_cards: { labels: ["İkon", "Başlık", "Açıklama"], count: 4 },
      why_us: { labels: ["İkon", "Başlık", "Açıklama"], count: 3 },
    },
  },
  hakkimizda: {
    simple: [
      "hero_title", "hero_text", "story_title", "story_p1", "story_p2",
      "principles_eyebrow", "principles_title", "cta_title", "cta_text", "cta_btn",
    ],
    groups: {
      highlights: { labels: ["İkon", "Başlık", "Açıklama"], count: 3 },
      principles: { labels: ["Başlık", "Açıklama"], count: 4 },
    },
  },
  hizmetler: {
    simple: ["hero_title", "hero_text", "cta_title", "cta_text", "cta_btn"],
    groups: {},
  },
  urunler: {
    simple: ["hero_title", "hero_text", "cta_title", "cta_text", "cta_btn"],
    groups: {},
  },
  tavsiyeler: {
    simple: ["hero_title", "hero_text", "reviews_btn", "cta_title", "cta_text", "cta_btn"],
    groups: {},
  },
  iletisim: { simple: ["hero_title", "hero_text"], groups: {} },
  gizlilik: {
    simple: ["hero_title", "hero_text", "last_updated"],
    groups: { sections: { labels: ["Başlık", "Metin"], count: 8, longFields: [1] } },
  },
};

const PAGE_LABELS = {
  home: "Ana Sayfa",
  hakkimizda: "Hakkımızda",
  hizmetler: "Hizmetler",
  urunler: "Ürünler",
  tavsiyeler: "Bizi Tercih Edenler",
  iletisim: "İletişim",
  gizlilik: "Gizlilik Politikası / Aydınlatma Metni",
};

function renderSimpleField(key, value) {
  const label = LABELS[key] || key;
  const input = LONG_FIELDS.has(key)
    ? `<textarea id="${key}" name="${key}" rows="3">${escapeHtml(value)}</textarea>`
    : `<input type="text" id="${key}" name="${key}" value="${escapeHtml(value)}">`;
  return `<div class="admin-field"><label for="${key}">${escapeHtml(label)}</label>${input}</div>`;
}

function renderGroup(groupKey, groupDef, items) {
  const longFields = new Set(groupDef.longFields || []);
  const rows = [];
  for (let i = 0; i < groupDef.count; i++) {
    const item = items[i] || [];
    const fields = groupDef.labels
      .map((label, fi) => {
        const name = `${groupKey}_${i}_${fi}`;
        const value = item[fi] || "";
        const input = longFields.has(fi)
          ? `<textarea id="${name}" name="${name}" rows="4">${escapeHtml(value)}</textarea>`
          : `<input type="text" id="${name}" name="${name}" value="${escapeHtml(value)}">`;
        return `<div class="admin-field"><label for="${name}">${escapeHtml(label)}</label>${input}</div>`;
      })
      .join("");
    rows.push(`<fieldset class="admin-fieldset"><legend>${escapeHtml(groupKey)} #${i + 1}</legend>${fields}</fieldset>`);
  }
  return rows.join("\n");
}

function renderForm(slug, page) {
  const schema = SCHEMAS[slug];
  const c = page.content || {};
  return `
  <div class="admin-card">
    <h1>${escapeHtml(PAGE_LABELS[slug] || slug)}</h1>
    <p class="hint">Bu sayfada görünen metinleri düzenle.</p>
    <form method="POST">
      <div class="admin-field">
        <label for="title">Sayfa Başlığı (tarayıcı sekmesi)</label>
        <input type="text" id="title" name="title" value="${escapeHtml(page.title || "")}">
      </div>
      <div class="admin-field">
        <label for="meta_description">Meta Açıklama (Google'da görünür)</label>
        <textarea id="meta_description" name="meta_description" rows="2">${escapeHtml(page.meta_description || "")}</textarea>
      </div>
      ${schema.simple.map((key) => renderSimpleField(key, c[key] || "")).join("\n      ")}
      ${Object.entries(schema.groups)
        .map(([groupKey, groupDef]) => renderGroup(groupKey, groupDef, c[groupKey] || []))
        .join("\n      ")}
      <button type="submit" class="btn btn-primary">Kaydet</button>
    </form>
  </div>`;
}

export async function onRequestGet(context) {
  const slug = context.params.slug;
  if (!SCHEMAS[slug]) return new Response("Sayfa bulunamadı", { status: 404 });
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const page = await getPage(context.env.DB, slug);
  if (!page) return new Response("Sayfa bulunamadı", { status: 404 });

  const html = renderAdminLayout({
    title: PAGE_LABELS[slug] || slug,
    userEmail,
    bodyHtml: renderForm(slug, page),
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function onRequestPost(context) {
  const slug = context.params.slug;
  const schema = SCHEMAS[slug];
  if (!schema) return new Response("Sayfa bulunamadı", { status: 404 });
  const db = context.env.DB;
  const userEmail = context.request.headers.get("Cf-Access-Authenticated-User-Email");
  const formData = await context.request.formData();
  const get = (k) => (formData.get(k) || "").toString().slice(0, 3000);

  const content = {};
  for (const key of schema.simple) content[key] = get(key);
  for (const [groupKey, groupDef] of Object.entries(schema.groups)) {
    const items = [];
    for (let i = 0; i < groupDef.count; i++) {
      items.push(groupDef.labels.map((_, fi) => get(`${groupKey}_${i}_${fi}`)));
    }
    content[groupKey] = items;
  }

  const title = get("title");
  const metaDescription = get("meta_description");

  await db
    .prepare("UPDATE pages SET title=?, meta_description=?, content=? WHERE slug=?")
    .bind(title, metaDescription, JSON.stringify(content), slug)
    .run();

  const page = await getPage(db, slug);
  const html = renderAdminLayout({
    title: PAGE_LABELS[slug] || slug,
    userEmail,
    notice: "Kaydedildi.",
    bodyHtml: renderForm(slug, page),
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
