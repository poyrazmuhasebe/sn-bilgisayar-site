// Veritabani yardimci fonksiyonlari

export async function getSettings(db) {
  const row = await db.prepare("SELECT * FROM site_settings WHERE id = 1").first();
  return row || {};
}

export async function getNav(db) {
  const { results } = await db
    .prepare("SELECT * FROM nav_items WHERE visible = 1 ORDER BY sort_order ASC")
    .all();
  return results || [];
}

export async function getPage(db, slug) {
  const row = await db.prepare("SELECT * FROM pages WHERE slug = ?").bind(slug).first();
  if (!row) return null;
  let content = {};
  try {
    content = JSON.parse(row.content || "{}");
  } catch {
    content = {};
  }
  return { ...row, content };
}

export async function getCategories(db, type) {
  const { results } = await db
    .prepare("SELECT * FROM categories WHERE type = ? ORDER BY sort_order ASC")
    .bind(type)
    .all();
  return (results || []).map((r) => ({
    ...r,
    bullets: r.bullets ? JSON.parse(r.bullets) : [],
  }));
}

export async function getReviews(db) {
  const { results } = await db
    .prepare("SELECT * FROM reviews ORDER BY sort_order ASC")
    .all();
  return results || [];
}
