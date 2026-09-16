// Cloudflare Pages Function — POST /api/contact
// İletişim formundan gelen veriyi doğrular, temizler ve R2 kovasına
// (Cloudflare'ın kendi depolama alanı) düz metin dosyası olarak kaydeder.
// Hiçbir üçüncü parti servise veri gönderilmez.
//
// MALİYET KORUMASI: R2 ücretsiz kotanın (10GB depolama, ayda 1M yazma işlemi)
// çok altında kalmak için hem kişi bazlı hem de GÜNLÜK TOPLAM üst sınır var.
// Böylece kötüye kullanım/spam durumunda bile kota asla aşılmaz.

const MAX_BODY_BYTES = 20000; // ~20KB üstü istekleri reddet
const RATE_LIMIT_MAX = 5; // aynı IP'den 10 dakikada en fazla 5 gönderim
const RATE_LIMIT_WINDOW_SECONDS = 600;
const DAILY_GLOBAL_MAX = 150; // TÜM ziyaretçiler için günde en fazla 150 mesaj (R2'ye yazılan)
const DAILY_WINDOW_SECONDS = 86400;

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1) Sadece kendi sitemizden gelen istekleri kabul et.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return jsonResponse({ ok: false, error: "Geçersiz istek kaynağı." }, 403);
  }

  // 2) İçerik türü ve boyut kontrolü.
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return jsonResponse({ ok: false, error: "Geçersiz istek." }, 400);
  }
  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "İstek çok büyük." }, 413);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Geçersiz veri." }, 400);
  }
  if (!data || typeof data !== "object") {
    return jsonResponse({ ok: false, error: "Geçersiz veri." }, 400);
  }

  // 3) Bal küpü: bu alan botlar tarafından doldurulur, gerçek kullanıcılar görmez.
  if (typeof data.website === "string" && data.website.trim() !== "") {
    // Botu fark ettiğimizi belli etmeden başarılıymış gibi davran.
    return jsonResponse({ ok: true });
  }

  const ip = request.headers.get("CF-Connecting-IP") || "bilinmiyor";

  // 4) Hız sınırlama ve GÜNLÜK GENEL ÜST SINIR (KV bağlıysa aktif olur).
  //    Bu ikisi olmadan da form çalışır, ama maliyet korumasını KV etkinleştirir.
  if (env.RATE_LIMIT_KV) {
    const rlKey = `contact:${ip}`;
    const current = parseInt((await env.RATE_LIMIT_KV.get(rlKey)) || "0", 10);
    if (current >= RATE_LIMIT_MAX) {
      return jsonResponse(
        { ok: false, error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." },
        429
      );
    }

    const dayKey = `daily:${new Date().toISOString().slice(0, 10)}`;
    const dailyCount = parseInt((await env.RATE_LIMIT_KV.get(dayKey)) || "0", 10);
    if (dailyCount >= DAILY_GLOBAL_MAX) {
      return jsonResponse(
        {
          ok: false,
          error: "Bugünkü mesaj kotamız doldu. Lütfen telefon veya WhatsApp ile ulaşın."
        },
        429
      );
    }

    // Sayaçları önce artır (yazma başarısız olsa bile kotayı korumak için).
    await env.RATE_LIMIT_KV.put(rlKey, String(current + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS
    });
    await env.RATE_LIMIT_KV.put(dayKey, String(dailyCount + 1), {
      expirationTtl: DAILY_WINDOW_SECONDS
    });
  }

  // 5) Girdi doğrulama ve temizleme (kontrol karakterlerini at, uzunluk sınırla).
  const ad = sanitizeText(data.ad, 100);
  const tel = sanitizeText(data.tel, 30);
  const konuRaw = sanitizeText(data.konu, 60);
  const konu = konuRaw || "Belirtilmedi";
  const mesaj = sanitizeText(data.mesaj, 2000);

  if (!ad || ad.length < 2) {
    return jsonResponse({ ok: false, error: "Lütfen adınızı girin." }, 400);
  }
  if (!/^[0-9+\s()-]{7,20}$/.test(tel)) {
    return jsonResponse({ ok: false, error: "Lütfen geçerli bir telefon numarası girin." }, 400);
  }
  if (data.kvkk !== true) {
    return jsonResponse(
      { ok: false, error: "Devam etmek için Gizlilik Politikası ve Aydınlatma Metni'ni onaylamanız gerekiyor." },
      400
    );
  }

  if (!env.CONTACT_BUCKET) {
    return jsonResponse(
      { ok: false, error: "Sunucu depolama yapılandırılmamış. Lütfen telefon ile ulaşın." },
      500
    );
  }

  // 6) Dosya adını SUNUCU üretir — kullanıcı girdisi asla dosya yoluna karışmaz
  //    (path traversal / enjeksiyon riskine karşı).
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const randomId = crypto.randomUUID().slice(0, 8);
  const filename = `mesajlar/${stamp}_${randomId}.txt`;

  const content = [
    `Tarih: ${now.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
    `Ad Soyad: ${ad}`,
    `Telefon: ${tel}`,
    `Hizmet Türü: ${konu}`,
    `Mesaj:`,
    mesaj || "(boş)",
    `--`,
    `Gönderen IP: ${ip}`
  ].join("\n");

  try {
    await env.CONTACT_BUCKET.put(filename, content, {
      httpMetadata: { contentType: "text/plain; charset=utf-8" }
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: "Mesaj kaydedilemedi. Lütfen tekrar deneyin." }, 500);
  }

  return jsonResponse({ ok: true });
}

// Yalnızca POST desteklenir; diğer yöntemler için net bir hata döndür.
export async function onRequestGet() {
  return jsonResponse({ ok: false, error: "Yalnızca POST istekleri kabul edilir." }, 405);
}

function sanitizeText(value, maxLen) {
  if (typeof value !== "string") return "";
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const isTabOrNewline = code === 9 || code === 10 || code === 13;
    const isControlChar = (code < 32 && !isTabOrNewline) || code === 127;
    if (isControlChar) continue;
    out += value[i];
  }
  return out.trim().slice(0, maxLen);
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
