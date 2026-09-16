-- SN Bilgisayar ve Guvenlik Sistemleri - Admin Panel Veritabani Semasi

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  hours_weekday TEXT,
  hours_saturday TEXT,
  google_rating TEXT,
  google_review_count TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  og_image_url TEXT,
  brand_name TEXT,
  brand_tagline TEXT,
  header_cta_text TEXT,
  footer_about TEXT,
  footer_copyright TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  maps_directions_url TEXT,
  maps_embed_url TEXT,
  maps_reviews_url TEXT,
  map_lat TEXT,
  map_lng TEXT
);

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  meta_description TEXT,
  content TEXT
);

CREATE TABLE IF NOT EXISTS nav_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id INTEGER REFERENCES nav_items(id),
  sort_order INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  group_name TEXT,
  icon TEXT,
  title TEXT,
  description TEXT,
  bullets TEXT,
  price_note TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author TEXT,
  meta TEXT,
  review_text TEXT,
  sort_order INTEGER DEFAULT 0
);

