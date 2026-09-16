document.addEventListener("DOMContentLoaded", function () {
  var burger = document.querySelector(".burger");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  var form = document.getElementById("contactForm");
  if (form) {
    var statusEl = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var original = btn.textContent;

      var payload = {
        ad: form.ad.value,
        tel: form.tel.value,
        konu: form.konu.value,
        mesaj: form.mesaj.value,
        kvkk: form.kvkk.checked,
        website: form.website.value // honeypot; boş kalmalı
      };

      btn.disabled = true;
      btn.textContent = "Gönderiliyor...";
      if (statusEl) { statusEl.textContent = ""; statusEl.style.color = ""; }

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok && data.ok, error: data.error };
          });
        })
        .then(function (result) {
          if (result.ok) {
            btn.textContent = "Gönderildi ✓";
            if (statusEl) {
              statusEl.textContent = "Mesajınız alındı, en kısa sürede size dönüş yapacağız.";
              statusEl.style.color = "var(--accent-2)";
            }
            form.reset();
          } else {
            btn.textContent = original;
            if (statusEl) {
              statusEl.textContent = result.error || "Mesaj gönderilemedi. Lütfen telefon veya WhatsApp ile ulaşın.";
              statusEl.style.color = "#ff6b6b";
            }
          }
        })
        .catch(function () {
          btn.textContent = original;
          if (statusEl) {
            statusEl.textContent = "Bağlantı hatası. Lütfen telefon veya WhatsApp ile ulaşın.";
            statusEl.style.color = "#ff6b6b";
          }
        })
        .finally(function () {
          btn.disabled = false;
        });
    });
  }

  // Kaydırma animasyonu (scroll-reveal)
  var revealEls = document.querySelectorAll(".card, .hero-card, .cta-band, .value-item, .contact-item");
  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  // WhatsApp hizli teklif widget'i (masaustu balonu + mobil alt cubuk ayni paneli acar)
  var waTriggers = document.querySelectorAll("[data-wa-trigger]");
  var waPanel = document.getElementById("waPanel");
  var waClose = document.getElementById("waClose");
  var waSend = document.getElementById("waSend");
  if (waTriggers.length && waPanel) {
    waTriggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        waPanel.classList.toggle("open");
      });
    });
    if (waClose) {
      waClose.addEventListener("click", function () {
        waPanel.classList.remove("open");
      });
    }
    if (waSend) {
      waSend.addEventListener("click", function () {
        var number = waPanel.closest(".wa-widget").dataset.waNumber || "905431234567";
        var note = document.getElementById("waNote").value.trim();
        var msg = "Merhaba, Bilgisayar ve Güvenlik Sistemleri hakkında bilgi almak istiyorum.";
        if (note) msg += " Notunuz: " + note;
        var url = "https://wa.me/" + number + "?text=" + encodeURIComponent(msg);
        window.open(url, "_blank", "noopener");
      });
    }
  }
});
