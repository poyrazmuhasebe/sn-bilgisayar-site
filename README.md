# SN Bilgisayar ve Güvenlik Sistemleri

> Bu proje SN Bilgisayar ve Güvenlik Sistemleri için geliştirilmiştir ve test aşamasında bırakılmıştır.

> Bahçelievler / İstanbul merkezli bilgisayar tamiri, kurulum, parça satışı ve güvenlik sistemleri işletmesi için kurumsal web sitesi.

**Durum:** 🚧 **Test / Beta aşamasında bırakılmıştır** — site hiçbir zaman gerçek anlamda yayına alınmadı. Cloudflare üzerindeki tüm kaynaklar (Pages, D1, R2, KV, Access) kaldırılmıştır; **şu anda canlı bir önizleme bulunmamaktadır.**

---

## İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji](#teknoloji)
- [Proje Yapısı](#proje-yapısı)
- [☁️ Cloudflare Kurulumu](#️-cloudflare-kurulumu)
- [⏯️ Sistemi Durdurma, Yeniden Başlatma ve Silme](#️-sistemi-durdurma-yeniden-başlatma-ve-silme)
- [💾 Cloudflare'daki Verileri Yedekleme](#-cloudflaredaki-verileri-yedekleme-veritabanı-görseller-mesajlar)
- [Yerel Geliştirme](#yerel-geliştirme)
- [Yayınlama (Deploy)](#yayınlama-deploy)
- [Sürümleme](#sürümleme)
- [🚀 Yayına Alma Öncesi Yapılacaklar Listesi](#-yayına-alma-öncesi-yapılacaklar-listesi)

---

## Özellikler

- **6 sayfa:** Ana Sayfa, Hakkımızda, Hizmetler, Ürünler, Bizi Tercih Edenler, İletişim — tamamı Cloudflare D1 veritabanından dinamik olarak render edilir
- **Admin Paneli** (`/admin`, sadece direkt bağlantıyla erişilir, üst menüde gösterilmez) — sayfa metinleri, genel ayarlar, menü (alt menü dahil), hizmet/ürün kategorileri ve logo/favicon/paylaşım görseli kod dokunmadan düzenlenebilir. Cloudflare Access ile tek kullanıcılı e-posta girişiyle korunur
- **İletişim formu** — Cloudflare Pages Function + R2 depolama; spam/bot koruması (bal küpü), IP/gün bazlı hız sınırlama, maliyet koruması (günlük üst limit)
- **WhatsApp hızlı teklif widget'ı** — hizmet türü + not seçip tek tıkla WhatsApp'a yönlendirme
- **Mobil öncelikli tasarım** — sabit alt eylem çubuğu (Ara / WhatsApp / Yol Tarifi), kompakt hizmet listesi, kısaltılmış giriş bölümü
- **Google Haritalar entegrasyonu** — doğru konum + yol tarifi butonu (API anahtarı gerektirmez)
- **Müşteri yorumları sayfası** — Google Haritalar'dan seçilmiş 5 yıldızlı yorumlar
- **SEO altyapısı hazır** (henüz aktif değil) — yapısal veri (JSON-LD, LocalBusiness + AggregateRating), sayfa bazlı meta description, Open Graph / Twitter Card görselleri, gerçek favicon, `sitemap.xml`
- **Güvenlik başlıkları** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options ve daha fazlası (`_headers`)
- **Cyberpunk temalı** koyu tasarım, admin panelinden değiştirilebilen logo/marka kimliği

## Teknoloji

| Katman | Teknoloji |
|---|---|
| Barındırma | Cloudflare Pages (Functions ile dinamik sayfa render) |
| Veritabanı | Cloudflare D1 (`sn-bilgisayar-db`) — sayfa metinleri, menü, kategoriler, ayarlar |
| Admin girişi | Cloudflare Access (tek kullanıcı, e-posta doğrulama) — özel kod yok |
| İletişim formu backend | Cloudflare Pages Functions (`functions/api/contact.js`) |
| Mesaj depolama | Cloudflare R2 (`sn-bilgisayar-mesajlar`) |
| Görsel depolama | Cloudflare R2 (`sn-bilgisayar-assets`) — logo, favicon, paylaşım görseli |
| Hız sınırlama | Cloudflare Workers KV |
| Frontend | Sunucu tarafında şablon üreten saf JavaScript (template literal) — framework veya build adımı yok |
| Harita | Google Haritalar (embed, API anahtarsız) |

## Proje Yapısı

```
├── functions/
│   ├── index.js, hakkimizda.js, hizmetler.js,    # 6 sayfa — D1'den okuyup HTML üretir
│   │   urunler.js, tavsiyeler.js, iletisim.js
│   ├── api/contact.js       # İletişim formu backend
│   ├── assets/[filename].js # Logo/favicon/OG görselini R2'den servis eder
│   ├── admin/                # Admin paneli (Cloudflare Access korumalı)
│   │   ├── index.js          # Panel ana ekranı
│   │   ├── settings.js       # Genel ayarlar (telefon, adres, saatler…)
│   │   ├── nav.js            # Menü yönetimi (alt menü dahil)
│   │   ├── categories.js     # Hizmet/ürün kategorileri
│   │   ├── branding.js       # Logo/favicon/OG görseli yükleme
│   │   └── page/[slug].js    # Sayfa metni düzenleyici
│   └── _lib/
│       ├── db.js              # D1 sorgu yardımcıları
│       ├── layout.js          # Ortak sayfa şablonu (header/footer/widget)
│       └── adminLayout.js     # Admin panel şablonu
├── style.css
├── script.js
├── schema.sql             # D1 tablo şeması
├── seed.sql                # İlk veri (mevcut içerikle birebir)
├── wrangler.toml            # Yerel/CI referans yapılandırması (D1/R2/KV binding'leri)
├── _headers                 # Güvenlik başlıkları + önbellekleme kuralları
├── robots.txt
├── sitemap.xml
├── og-design.html           # Varsayılan paylaşım görseli / favicon tasarım kaynağı
└── ornekler/
    └── mesaj-ornegi.txt      # İletişim mesajlarının R2'de hangi formatta saklandığını gösteren SAHTE örnek
```

## ☁️ Cloudflare Kurulumu (Sıfırdan, Adım Adım)

> Bu bölüm, kod yazmayı bilmeyen biri bile takip edebilsin diye ayrıntılı yazıldı. Her adımda "bu ne işe yarıyor?" açıklaması var. Sadece birkaç yerde bir bilgisayar komutu çalıştırmak gerekiyor (belirtilmiştir) — o kısımlarda bir geliştiriciden ya da Claude Code gibi bir yapay zekâ asistanından yardım alabilirsiniz.

### Önce: Cloudflare nedir, bu projede hangi parçaları kullanıyoruz?

Cloudflare, web sitenizi internette yayında tutan ve koruyan bir hizmet sağlayıcı. Bu proje, sitenin barındırılması dışında Cloudflare'ın birkaç farklı hizmetini bir arada kullanıyor. Hepsini günlük hayattan bir benzetmeyle özetleyelim:

| Cloudflare Hizmeti | Günlük hayattan benzetme | Bu projede ne işe yarıyor |
|---|---|---|
| **Pages** | Sitenin yayınlandığı "dükkân" | Web sitesinin kendisi burada çalışır |
| **D1** | Bir arşiv dolabı / Excel tablosu | Sayfa metinleri, menü, hizmet/ürün listeleri, iletişim bilgileri burada saklanır |
| **R2** | Evrak/dosya deposu | İletişim formundan gelen mesajlar, logo/favicon/paylaşım görseli burada saklanır |
| **KV** | Kapıdaki nöbetçi defteri | "Bugün kaç kişi form gönderdi" gibi sayaçları tutar, spam'i engeller |
| **Access** | Ofis kapısındaki elektronik kart okuyucu | Sadece sizin e-posta adresiniz `/admin` (yönetim paneli) kapısından içeri girebilir |

Bu hizmetlerin hepsi aynı Cloudflare hesabı içinde yer alır ve genelde **ücretsiz kullanım kotası** içinde kalınır (bu projede kotalar aşılmasın diye kod içine ayrıca günlük/aylık limitler de konuldu — bkz. `functions/api/contact.js`).

### Hazırlık — Cloudflare hesabı

1. [dash.cloudflare.com](https://dash.cloudflare.com) adresine gidin; hesabınız yoksa ücretsiz bir tane oluşturun (e-posta + şifre yeterli).
2. Giriş yaptığınızda karşınıza çıkan ekrana **Dashboard** (kontrol paneli) denir — aşağıdaki tüm adımlar bu ekrandan, sol taraftaki menüyü kullanarak yapılır.

### 1. Adım — Siteyi Cloudflare Pages'e yükleme

**Ne işe yarar?** Sitenin dosyalarını Cloudflare'ın sunucularına koyar ve herkesin internetten erişebileceği bir adres (örn. `sn-bilgisayar.pages.dev`) oluşturur. Bu, sitenin "ilk kez yayına girmesi" adımıdır.

Bu adım bir geliştirici tarafından, bilgisayarın komut satırından (terminal) şu komutla yapılır:

```powershell
wrangler pages deploy publish --project-name=sn-bilgisayar
```

İlk çalıştırmada tarayıcıda bir "Cloudflare hesabınıza bağlanmak istiyor, izin veriyor musunuz?" ekranı açılır, onaylamanız yeterli. Bundan sonra siteye her yapılan değişiklik bu komut tekrar çalıştırılarak yayına alınır — yani siteyi güncellemenin tek yolu budur.

### 2. Adım — Kendi alan adınızı bağlama (örn. www.sirketiniz.com)

**Ne işe yarar?** Cloudflare'ın verdiği `sn-bilgisayar.pages.dev` gibi bir adres yerine, kendi satın aldığınız alan adınızla siteye girilebilmesini sağlar.

1. Sol menüden **Workers & Pages**'e girin, projenizi (`sn-bilgisayar`) seçin.
2. Üstteki sekmelerden **Custom domains** (Özel Alan Adları) sekmesini açın.
3. **Set up a custom domain** butonuna basıp alan adınızı yazın.
4. Alan adı zaten aynı Cloudflare hesabında kayıtlıysa her şey otomatik ayarlanır; birkaç dakika içinde adres çubuğunda yeşil kilit simgesi (güvenli bağlantı) belirir. Alan adı başka bir firmadan alınmışsa Cloudflare size birkaç "DNS kaydı" (teknik yönlendirme bilgisi) gösterir; bunları alan adını satın aldığınız firmanın panelinden eklemeniz gerekir — bu kısım kafa karıştırıcı gelirse bir geliştiriciden yardım isteyin, tek seferlik bir işlemdir.

### 3. Adım — Veritabanı (D1) oluşturma

**Ne işe yarar?** Sitenizdeki tüm yazılar — Ana Sayfa metni, hizmet listesi, telefon numarası, menü öğeleri, müşteri yorumları — kodun içine sabit olarak yazılmıyor, bu veritabanında tutuluyor. Böylece siz admin panelinden bir yazıyı değiştirdiğinizde, kimsenin koda dokunmasına gerek kalmadan site anında güncelleniyor.

1. Sol menüden **Storage & Databases → D1** yolunu izleyin.
2. **Create database** (Veritabanı Oluştur) butonuna basın, bir isim verin — örneğin `sn-bilgisayar-db`.
3. Veritabanı oluşunca içine "tablo" denen bölmeleri ve başlangıç verisini (mevcut sayfa metinleri, hizmetler, menü) yüklemek gerekiyor. Bunun için projedeki `schema.sql` ve `seed.sql` dosyaları kullanılıyor:
   - Oluşturduğunuz veritabanına tıklayın, üstte **Console** (Konsol) sekmesini açın — burası, veritabanına doğrudan komut yazabileceğiniz bir kutudur.
   - `schema.sql` dosyasının tüm içeriğini bir metin editöründe açıp kopyalayın, konsola yapıştırıp çalıştırın (bu, veritabanının bölmelerini/tablolarını oluşturur).
   - Ardından aynı şekilde `seed.sql` dosyasının içeriğini kopyalayıp çalıştırın (bu da veritabanını mevcut site içeriğiyle doldurur).
   - *(Bir geliştirici bu ikisini tek satırlık komutlarla da yapabilir: `wrangler d1 execute sn-bilgisayar-db --remote --file schema.sql` ve ardından `--file seed.sql`.)*
4. Son olarak veritabanını web sitesine "tanıtmanız" gerekiyor, yoksa site veritabanını göremez:
   - Pages projeniz → **Settings → Functions** sekmesine girin.
   - **D1 database bindings** (D1 Veritabanı Bağlantıları) bölümünde **Add binding** butonuna basın.
   - "Variable name" (Değişken adı) kutusuna tam olarak `DB` yazın — büyük harflerle, birebir bu şekilde; başka bir isim yazılırsa site çalışmaz.
   - "D1 database" kutusundan az önce oluşturduğunuz veritabanını seçip kaydedin.

### 4. Adım — Dosya depoları (R2) oluşturma

**Ne işe yarar?** İki farklı şey saklanması gerekiyor: iletişim formunu dolduran müşterilerin mesajları, ve admin panelden yüklediğiniz logo/favicon/paylaşım görseli. Bunlar için iki ayrı "dosya dolabı" (R2 bucket) oluşturuyoruz.

1. Sol menüden **R2 Object Storage**'a girin. *(İlk kez giriyorsanız R2'yi etkinleştirmenizi isteyebilir, bazen kredi kartı bilgisi sorabilir — ama ücretsiz kota içinde kaldığınız sürece ücret yansımaz; bu projede zaten aşırı kullanımı önlemek için kodun içine ayrıca limitler konuldu.)*
2. **Create bucket** (Depo Oluştur) butonuna basıp bir isim verin — örneğin `sn-bilgisayar-mesajlar`. Ardından ikinci bir depo daha oluşturun — örneğin `sn-bilgisayar-assets` (görseller için).
3. Şimdi bu iki depoyu siteye tanıtın:
   - Pages projeniz → **Settings → Functions → R2 bucket bindings → Add binding**.
   - Birinci depo için: Variable name → `CONTACT_BUCKET`, Bucket → mesajlar deponuz.
   - Tekrar **Add binding**'e basıp ikinci depo için: Variable name → `ASSETS_BUCKET`, Bucket → görseller deponuz.
   - (Variable name'ler büyük/küçük harfe duyarlıdır, örnekteki gibi birebir yazılmalıdır — yanlış yazılırsa ilgili özellik, örn. görsel yükleme, çalışmaz.)

### 5. Adım — Spam/hız koruması için sayaç deposu (KV) — opsiyonel ama tavsiye edilir

**Ne işe yarar?** İletişim formunu kötüye kullanmaya çalışan botları veya aşırı/art arda gönderimleri engellemek için "bugün kaç mesaj geldi" gibi basit sayaçlar tutulur.

1. Sol menüden **Storage & Databases → KV**'ye girin.
2. **Create namespace** (Ad Alanı Oluştur) butonuna basıp bir isim verin — örn. `sn-bilgisayar-limit`.
3. Pages projeniz → **Settings → Functions → KV namespace bindings → Add binding**.
   - Variable name → `RATE_LIMIT_KV`, Namespace → az önce oluşturduğunuz.
4. Bu adımı atlarsanız iletişim formu yine çalışır, sadece günlük gönderim sınırı devre dışı kalır — bu yüzden tavsiye edilir ama zorunlu değildir.

### 6. Adım — Yönetim Paneline sadece sizin girebilmenizi sağlama (Cloudflare Access)

**Ne işe yarar?** `/admin` adresine giren herkes sayfa metinlerini, menüyü, görselleri değiştirebilir. Bu yüzden oraya sadece **sizin** e-posta adresinizle girilebilmesi çok önemli — bu adım o kilidi kuruyor. **Bu adım tamamlanmadan admin paneli herkese açık kalır, mutlaka yapılmalıdır.**

1. Sol menüden **Zero Trust**'a girin (ilk kez giriyorsanız kısa bir kurulum ekranı çıkabilir; ücretsiz planı seçmeniz yeterli, kredi kartı istemez).
2. **Access → Applications** (Uygulamalar) bölümüne gidin, **Add an application** (Uygulama Ekle) butonuna basın.
3. **Self-hosted** (Kendi barındırdığım) seçeneğini seçin.
4. Bir isim verin — örn. "SN Bilgisayar Admin" — ve "Domain" (Alan Adı) kutusuna sitenizin admin adresini yazın: `sizinalanadiniz.com/admin*` (sonundaki `*` işareti önemlidir, admin altındaki tüm sayfaları kapsamasını sağlar).
5. Devam edin, "Policy" (Kural) ekranında bir kural oluşturun:
   - Kural adı: örn. "Sadece Ben"
   - Action (Eylem): **Allow** (İzin Ver)
   - Include (Kimler dahil olsun) → **Emails** seçin, kendi e-posta adresinizi yazın.
6. Kaydedip tamamlayın.
7. Test etmek için tarayıcıdan `sizinalanadiniz.com/admin` adresine girin — karşınıza "e-posta adresinizi girin, size bir kod göndereceğiz" ekranı çıkmalı. Bu, korumanın düzgün çalıştığının kanıtıdır. E-postanıza gelen kodu girerek panele giriş yapabilirsiniz.

### 7. Adım — Siteyi güncellemek için erişim anahtarı (API Token)

**Ne işe yarar?** Bir geliştiricinin (veya sizin adınıza çalışan bir yapay zekâ asistanının) kendi bilgisayarından siteyi güncelleyebilmesi için Cloudflare hesabınıza, sınırlı yetkili bir "kapı anahtarı" oluşturmanız gerekiyor. Bu anahtar sizin şifreniz değildir; istediğiniz an iptal edebilirsiniz ve sadece izin verdiğiniz işlemleri yapabilir.

1. Sağ üstteki profil simgenize tıklayın → **My Profile** (Profilim).
2. **API Tokens** (API Anahtarları) sekmesine girin → **Create Token** (Anahtar Oluştur) → **Custom Token** (Özel Anahtar) seçin.
3. Bu proje için gereken izinleri tek tek ekleyin (her biri için **Add more** ile yeni bir satır açılır):
   - `Account` → `Cloudflare Pages` → `Edit`
   - `Account` → `Workers R2 Storage` → `Edit`
   - `Account` → `Workers KV Storage` → `Edit`
   - `Account` → `D1` → `Edit`
   - `Account` → `Access: Apps and Policies` → `Edit`
   - `Zone` → `DNS` → `Edit`
4. **Continue to summary → Create Token** ile oluşturun. Ekranda beliren uzun kod bir daha gösterilmez — kopyalayıp güvenli bir yerde (parola yöneticisi gibi) saklayın.
5. Bu anahtarı, deploy komutlarını çalıştıran kişiye/bilgisayara verirsiniz; o kişi bunu kendi bilgisayarında geçici olarak kullanır, hiçbir yere kalıcı olarak yazmaz.

### 8. Adım — Güvenli bağlantı (SSL/TLS) ayarı

**Ne işe yarar?** Sitenizi ziyaret edenlerin tarayıcısında adres çubuğunda "kilit" simgesinin (güvenli/şifreli bağlantı) doğru şekilde görünmesini sağlar.

1. Sol menüden **SSL/TLS → Overview**'e girin.
2. Modun **Full** veya tercihen **Full (Strict)** olduğundan emin olun.
3. **Edge Certificates** (Sınır Sertifikaları) sekmesinde **Minimum TLS Version** (En Düşük Güvenli Bağlantı Sürümü) en az **1.2** olarak ayarlı olsun.

---

**Özet — hangi adımı kim yapmalı?**

| Adım(lar) | Kimin yapması gerekir |
|---|---|
| 2, 6, 8 (alan adı, admin kilidi, SSL ayarı) | Sadece Cloudflare panelinden tıklayarak — teknik bilgi gerekmez, bu rehberi takip etmeniz yeterli |
| 3, 4, 5 (veritabanı ve depo oluşturma) | Panelden tıklayarak yapılır, sadece "binding" (bağlama) kısımlarında isimlerin birebir doğru yazılmasına dikkat edin |
| 1 ve 7 (siteyi ilk kez/tekrar yayına alma, erişim anahtarı ile deploy) | Bir geliştirici veya Claude Code gibi bir yapay zekâ asistanı — komut satırı gerektirir |

> Siteyi gerçek anlamda (arama motorlarına açık) yayına almadan önceki ek ayarlar için aşağıdaki [Yayına Alma Öncesi Yapılacaklar Listesi](#-yayına-alma-öncesi-yapılacaklar-listesi) bölümüne bakın.

## ⏯️ Sistemi Durdurma, Yeniden Başlatma ve Silme

Bu bölüm, siteyi ileride **geçici olarak durdurmak**, **yeniden aktif etmek** veya **tamamen (geri dönülmeyecek şekilde) kapatıp silmek** istediğinizde ne yapmanız gerektiğini anlatır.

> ⚠️ **Önce okuyun:** Aşağıdaki "silme" başlıklı adımlar **geri alınamaz**. Herhangi bir silme işleminden önce mutlaka [Verileri Yedekleme](#-cloudflaredaki-verileri-yedekleme-veritabanı-görseller-mesajlar) bölümündeki adımlarla bir yedek alın.

### A. Siteyi Geçici Olarak Durdurma (hiçbir şey silinmez, istediğiniz an geri alınabilir)

**Ne işe yarar?** Örneğin bakım yapacağınız, işletmenizi geçici olarak kapatacağınız veya siteyi bir süreliğine görünmez kılmak istediğinizde kullanılır. Veritabanı, mesajlar, görseller — hiçbiri silinmez; sadece ziyaretçilerin siteye erişimi kesilir.

1. Cloudflare panelinde **Workers & Pages** → `sn-bilgisayar` projesine girin.
2. **Custom domains** (Özel Alan Adları) sekmesine gidin.
3. Alan adınızın yanındaki **⋯ (üç nokta) → Remove domain** (Kaldır) seçeneğini kullanın.
4. Artık `sizinalanadiniz.com` adresine giren ziyaretçiler siteyi göremez. (`*.pages.dev` adresi teknik olarak hâlâ erişilebilir olsa da, bu adresi kimse bilmediği ve arama motorlarına kapalı olduğu için pratikte site "kapalı" sayılır.)

### B. Siteyi Yeniden Başlatma / Aktif Etme

1. Aynı **Custom domains** sekmesinden **Set up a custom domain** ile alan adınızı tekrar ekleyin — [Cloudflare Kurulumu bölümündeki 2. Adım](#️-cloudflare-kurulumu) ile birebir aynı işlem.
2. Birkaç dakika içinde site eskisi gibi erişilebilir olur. Hiçbir veri kaybı olmaz — veritabanı, görseller, mesajlar, admin paneli her şey nerede bıraktıysanız orada devam eder.

### C. Kodda Yapılan Bir Değişikliği Yayına Alma

Bu, sitenin "durdurulup başlatılması" değildir — sadece bir güncellemedir. Kod her değiştiğinde şu komutla yeniden yayınlanır (bkz. [Yayınlama](#yayınlama-deploy)):
```powershell
wrangler pages deploy publish --project-name=sn-bilgisayar --branch=main
```

### D. Tek Bir Kaynağı Silme (örn. artık kullanılmayan bir depo)

Normalde tek tek silmeniz gerekmez, ama yanlışlıkla oluşturduğunuz veya artık kullanmadığınız bir kaynak varsa:

- **R2 deposu silme**: Bir depo, önce **boşaltılmadan** silinemez. R2 Object Storage → depo → içindeki tüm dosyaları seçip silin → sonra depoyu silin.
- **KV ad alanı silme**: Storage & Databases → KV → ad alanının yanındaki **⋯ → Delete**.
- **D1 veritabanı silme**: Storage & Databases → D1 → veritabanı → Settings → Delete database. **Bunu yaparsanız site tamamen çalışmaz hale gelir** — tüm sayfa metinleri, menü, kategoriler, yorumlar kaybolur.

> Bir kaynağı sildiğinizde, ona bağlı olan Pages projesindeki "binding" (bağlama, Settings → Functions altında görünür) otomatik olarak geçersiz hale gelir; siteyi ayrıca güncellemeniz gerekmez ama o özelliği kullanan sayfa hata verebilir.

### E. Projeyi Tamamen Kapatıp Her Şeyi Silme

**Ne işe yarar?** İşletmeyi kapatmak, bu siteyle işi tamamen bırakmak veya sıfırdan başlamak istediğinizde, Cloudflare'da bu proje için oluşturulmuş her şeyi (ve onlara ait ücretlendirmeyi) temiz bir şekilde kaldırmak için. **Aşağıdaki adımların tamamı geri alınamaz.**

Önerilen sıra:

1. **Önce yedek alın** — [Verileri Yedekleme](#-cloudflaredaki-verileri-yedekleme-veritabanı-görseller-mesajlar) bölümündeki adımlarla veritabanını ve görselleri indirin.
2. **Admin erişimini kaldırın**: Zero Trust → Access → Applications → oluşturduğunuz uygulamayı silin.
3. **Pages projesini silin**:
   - Workers & Pages → `sn-bilgisayar` → **Custom domains** sekmesine girin, alan adının yanındaki **⋯ → Remove domain** ile önce özel alan adını kaldırın.
     > ⚠️ Bu adım atlanırsa Cloudflare projeyi silmenize izin vermez ve *"you must first delete all custom domains associated with your project"* hatası verir.
   - Ardından **Settings** sekmesine geçin, sayfanın en altında **Delete project** ile projeyi silin.
   - Kontrol için: sol menüden alan adınızın (zone) **DNS → Records** sekmesine bakın; `sn` alt alan adına (veya `pages.dev` adresine) işaret eden bir kayıt kalmışsa onu da silin. *(Sadece `sn` ile ilgili kaydı silin — alan adınızın diğer kayıtlarına, örneğin e-posta/MX kayıtlarına dokunmayın.)*
4. **R2 depolarını boşaltıp silin**: Önce `sn-bilgisayar-mesajlar` ve `sn-bilgisayar-assets` depolarının içindeki tüm dosyaları silin, ardından depoların kendisini silin.
5. **D1 veritabanını silin**: Storage & Databases → D1 → `sn-bilgisayar-db` → Settings → Delete database.
6. **KV ad alanını silin**: Storage & Databases → KV → oluşturduğunuz ad alanını silin.
7. **API Token'ı en son iptal edin**: My Profile → API Tokens → oluşturduğunuz token'ın yanındaki **Revoke** veya **Delete**.
   > 💡 Bu adımı bilerek en sona bıraktık: Token iptal edildiği anda `wrangler` komut satırı (ve bir geliştirici/yapay zekâ asistanının sizin adınıza yapabileceği hiçbir işlem) çalışmaz hale gelir — geri kalan tüm adımlar sadece Cloudflare panelinden elle yapılabilir. Token'ı önceden iptal ederseniz sorun olmaz, sadece kalan adımları panelden elle tamamlamanız gerekir.
8. *(Opsiyonel, dikkatli olun)* Alan adınızı Cloudflare'dan tamamen kaldırmak isterseniz **Websites** listesinden alan adınızı silebilirsiniz — ancak bu, o alan adı üzerinden Cloudflare'da yönettiğiniz e-posta veya başka DNS kayıtlarını da etkiler. Sadece bu site için kullanıyorsanız ve başka hiçbir şey için Cloudflare'a ihtiyacınız yoksa yapın.

Bu adımlar tamamlandığında Cloudflare hesabınızda bu projeyle ilgili ücretli/ücretsiz hiçbir kaynak kalmaz.

## 💾 Cloudflare'daki Verileri Yedekleme (Veritabanı, Görseller, Mesajlar)

Yukarıdaki kurulum adımları sitenin **kodunu** nasıl yayına alacağınızı anlatıyordu — kod zaten GitHub'da tutuluyor. Bu bölüm ise farklı bir şeyi anlatıyor: Cloudflare'da **saklanan gerçek veriyi** (veritabanındaki yazılar, yüklediğiniz logo/favicon görselleri, müşterilerden gelen iletişim mesajları) elle nasıl indirip bir yedek alacağınızı.

> ⚠️ **Önemli — önce okuyun:** İletişim formundan gelen mesajlar; müşterinin **adı, telefon numarası ve mesajı** gibi kişisel veriler içerir. Bu tür bilgileri GitHub'a yüklemek (repo özel/private olsa bile) veriyi git geçmişine kalıcı olarak yazar — bir dosyayı daha sonra silseniz bile eski hâli geçmişte kalır ve tamamen temizlemek teknik olarak zordur. **Bu yüzden aşağıdaki yöntemleri, ihtiyaç anında elle bir yedek almak için kullanmanızı öneririz; müşteri mesajlarını GitHub'a düzenli/otomatik olarak aktarmayı önermiyoruz.** Bir yedek almanız gerekiyorsa GitHub yerine kendi bilgisayarınızda saklamanız veya şifreli bir zip dosyası olarak, sadece ihtiyaç duyan kişiyle paylaşmanız daha güvenlidir. (Bu konu README'deki [KVKK uyum maddesiyle](#-yayına-alma-öncesi-yapılacaklar-listesi) de bağlantılıdır.)

Görseller (logo/favicon/OG resmi) ve site metinleri (veritabanı) için bu risk yok — onlar zaten halka açık olarak sitede görünüyor, istediğiniz zaman rahatça yedekleyip paylaşabilirsiniz.

### A. Veritabanını (D1) indirme

**Dashboard'dan (kod yazmadan):**
1. Cloudflare panelinde **Storage & Databases → D1** → veritabanınıza (`sn-bilgisayar-db`) tıklayın.
2. Sayfanın sağ üstünde veya **Settings** sekmesinde **Export** (Dışa Aktar) seçeneğini bulun, tıklayın.
3. İndirilen `.sql` dosyası, veritabanındaki tüm sayfa metinlerinin, menü öğelerinin, kategorilerin o anki hâlinin tam bir kopyasıdır — bilgisayarınızda saklayabilir, istersen ayrı bir "yedekler" klasörüne koyabilirsiniz.

**Komut satırından (bir geliştiriciyle):**
```powershell
wrangler d1 export sn-bilgisayar-db --remote --output yedek-veritabani.sql
```

### B. Görselleri (logo, favicon, paylaşım görseli) indirme

**Dashboard'dan:**
1. **R2 Object Storage** → görsellerin bulunduğu depoya (`sn-bilgisayar-assets`) girin.
2. Listede gördüğünüz her dosyanın (`logo.png`, `favicon.png`, `og-image.png`) üzerine tıklayın, açılan detay ekranında **Download** (İndir) butonunu kullanın. Dosyalar tek tek indirilir, toplu indirme seçeneği dashboard'da yok.

**Komut satırından (birden fazla dosya varsa daha pratik):**
```powershell
wrangler r2 object get sn-bilgisayar-assets/logo.png --file logo-yedek.png --remote
wrangler r2 object get sn-bilgisayar-assets/favicon.png --file favicon-yedek.png --remote
wrangler r2 object get sn-bilgisayar-assets/og-image.png --file og-image-yedek.png --remote
```

### C. İletişim formundan gelen mesajlar — nasıl bir formatta saklanıyor?

Gerçek müşteri mesajları **hiçbir zaman** bu repoya (GitHub'a) yüklenmiyor ve yüklenmemeli — yukarıdaki uyarıdaki gibi kişisel veri içeriyorlar. Sadece formatı görebilmeniz için, uydurma bilgilerle hazırlanmış **tek bir örnek dosya** repoda duruyor: [`ornekler/mesaj-ornegi.txt`](ornekler/mesaj-ornegi.txt). Gerçek bir mesaj geldiğinde R2'ye tam olarak bu düzende (tarih, ad-soyad, telefon, hizmet türü, mesaj metni) bir `.txt` dosyası olarak yazılır.

Gerçek mesajları görmeniz/indirmeniz gerekirse (örn. yanıt vermek için), Cloudflare panelinden bakabilirsiniz:
1. **R2 Object Storage** → mesajların bulunduğu depoya (`sn-bilgisayar-mesajlar`) girin.
2. `mesajlar/` klasörü altında, her mesaj ayrı bir `.txt` dosyası olarak durur (tarih + rastgele bir kodla adlandırılmış). Okumak istediğiniz dosyaya tıklayıp **Download** ile indirebilir veya doğrudan panelden içeriğini görüntüleyebilirsiniz — bu indirilen dosyayı GitHub'a değil, kendi bilgisayarınızda tutun.

### D. Bir yedeği GitHub'a koymak gerekiyorsa

Sadece **veritabanı yedeği** veya **görseller** için (mesajlar için önerilmez, yukarıdaki uyarıya bakın):

1. Ana kod deposundan (`sn-bilgisayar-site`) **ayrı**, mümkünse **özel (private)** bir yedek deposu açın — örn. `sn-bilgisayar-yedekler`.
2. İndirdiğiniz `.sql` dosyasını veya görselleri o depoya, sadece ihtiyaç anında (haftalık/aylık gibi) elle commit edip gönderin — otomatik/sürekli senkronizasyon kurmayın.
3. Eğer bir gün eski bir yedeği tamamen silmeniz gerekirse, tek bir dosyayı silmek yeterli olmaz — git geçmişini temizlemek gerekir; bu yüzden en başta "hangi veriyi, ne sıklıkla, kiminle paylaşacağım" sorusunu netleştirmek en kolay çözümdür.

## Yerel Geliştirme

Site artık D1 veritabanına bağlı olduğu için (`wrangler pages dev` bazı Windows kurulumlarında D1 emülasyonuyla ilgili bir hataya takılabiliyor), en güvenilir test yöntemi doğrudan Cloudflare'a geçici bir dala (`--branch=<isim>`) deploy edip önizleme adresinden kontrol etmektir:

```powershell
wrangler pages deploy publish --project-name=sn-bilgisayar --branch=test-onizleme
```

Not: Cloudflare Access sadece özel alan adını (`alanadiniz.com`) korur; `*.pages.dev` önizleme adresleri Access'e tabi değildir. Bu yüzden `/admin` testleri her zaman `--branch=main` ile gerçek alan adı üzerinden yapılmalıdır.

## Yayınlama (Deploy)

[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) ile Cloudflare Pages'e yayınlanır:

```powershell
wrangler pages deploy publish --project-name=sn-bilgisayar --branch=main
```

`publish/` klasörü, yayınlanacak dosyaların (node_modules, test dosyaları vb. hariç) temiz bir kopyasını içerir.

## Sürümleme

Proje [Semantic Versioning](https://semver.org/) + beta ön-sürüm etiketleri kullanır: `v1.0.0-beta.N`. Her anlamlı değişiklik bir Git etiketi ve [GitHub Release](../../releases) olarak yayımlanır (indirilebilir yedek zip dahil). Site gerçek yayına alındığında sürüm `v1.0.0` olarak sabitlenecektir.

---

## 🚀 Yayına Alma Öncesi Yapılacaklar Listesi

Site şu an **kasıtlı olarak** arama motorlarına kapalı ve test amaçlı yayında. Gerçek/halka açık yayına almadan önce aşağıdakiler tamamlanmalı:

### Arama motorlarına açma
- [ ] Tüm sayfalardaki `<meta name="robots" content="noindex, ...">` etiketini kaldır
- [ ] `_headers` dosyasındaki `X-Robots-Tag: noindex, ...` satırını kaldır
- [ ] `robots.txt`'i güncelle (taramaya izin ver, `sitemap.xml` referansını ekle)
- [ ] Cloudflare panelinde **Security → Settings → AI Crawlers / Content Signals** ayarını gözden geçir (bkz. proje notları)
- [ ] `sitemap.xml`'i Google Search Console'a ve Bing Webmaster Tools'a gönder
- [ ] **Google İşletme Profili** oluştur/bağla (yerel aramada haritada çıkmak için kritik)

### İçerik ve doğruluk kontrolü
- [ ] Tüm iletişim bilgilerini (telefon, adres, e-posta, çalışma saatleri) son bir kez doğrula
- [ ] Ürünler sayfasındaki hizmet/ürün açıklamalarını güncelliğini kontrol et
- [ ] "Bizi Tercih Edenler" sayfasındaki yorumların hâlâ güncel/doğru olduğunu teyit et

### Sosyal medya
- [ ] Instagram ve Facebook hesapları açıldığında, footer'daki placeholder (`href="#"`) linkleri gerçek hesap adresleriyle değiştir

### Teknik / güvenlik
- [ ] İletişim formunu canlıda gerçek bir mesajla uçtan uca test et, R2'ye düştüğünü doğrula
- [ ] Cloudflare SSL/TLS modunun **Full (Strict)** olduğunu doğrula
- [ ] Cloudflare panelinden kullanım/faturalandırma uyarı e-postası kurulumu (R2 için)

### Yasal
- [x] **KVKK (Kişisel Verilerin Korunması Kanunu) uyum** — `/gizlilik` adresinde bir Gizlilik Politikası / Aydınlatma Metni sayfası eklendi (admin panelden düzenlenebilir), iletişim formuna zorunlu onay kutusu kondu (hem tarayıcıda hem sunucuda doğrulanıyor). *Not: Metin taslak niteliğindedir, yayına almadan önce bir avukata kontrol ettirilmesi önerilir.*
- [x] Mesafeli satış / hizmet şartları — sitede online ödeme/satış olmadığı için gerekli görülmedi, atlandı

### Yayın sonrası
- [ ] Sürümü `v1.0.0` olarak etiketle (beta sonrası ilk resmi sürüm)
- [ ] Cloudflare Web Analytics veya benzeri bir analiz aracı kurulumu değerlendir

---

*Bu proje [Claude Code](https://claude.com/claude-code) ile geliştirilmektedir.*
