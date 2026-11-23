/* =========================================================
   AYARLAR — burayı kendi bilgilerinle güncelle
   ========================================================= */
const EMAIL = 'mthnyusan@gmail.com';     // ← gerçek e-posta adresin
const GITHUB_USER = 'metehanyusan';

/* =========================================================
   YARDIMCILAR
   ========================================================= */
function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

const UI = {
  tr: {
    themeToDark: 'Koyu temaya geç', themeToLight: 'Aydınlık temaya geç', themeTitle: 'Tema',
    langAria: 'Switch to English', toTop: 'Yukarı çık', close: 'Kapat',
    copied: 'Kopyalandı!', failed: 'Kopyalanamadı'
  },
  en: {
    themeToDark: 'Switch to dark theme', themeToLight: 'Switch to light theme', themeTitle: 'Theme',
    langAria: 'Türkçeye geç', toTop: 'Back to top', close: 'Close',
    copied: 'Copied!', failed: 'Failed'
  }
};

let currentLang = read('lang') === 'en' ? 'en' : 'tr';

/* =========================================================
   1) TEMA
   Sadece kullanıcı düğmeyle seçtiyse kaydedilir; aksi halde sistem temasını izler.
   ========================================================= */
const themeBtn = document.getElementById('themeBtn');
const themeColorMeta = document.getElementById('themeColor');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeBtn) {
    const t = UI[currentLang];
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-label', theme === 'dark' ? t.themeToLight : t.themeToDark);
    themeBtn.setAttribute('title', t.themeTitle);
  }
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#0d1117' : '#ffffff');
  }
}

if (themeBtn) {
  themeBtn.addEventListener('click', function () {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store('theme', next);
    store('theme-manual', '1');
  });
}

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
  if (!read('theme-manual')) applyTheme(e.matches ? 'light' : 'dark');
});

/* =========================================================
   2) DİL (başlık ve meta açıklama dahil)
   ========================================================= */
function applyLang(lang) {
  currentLang = lang;
  const t = UI[lang];

  document.querySelectorAll('[data-tr]').forEach(function (el) {
    const val = el.dataset[lang];
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-tr-placeholder]').forEach(function (el) {
    const val = el.dataset[lang + 'Placeholder'];
    if (val) el.placeholder = val;
  });
  document.querySelectorAll('[data-tr-content]').forEach(function (el) {
    const val = el.dataset[lang + 'Content'];
    if (val) el.setAttribute('content', val);
  });
  document.querySelectorAll('[data-lang]').forEach(function (el) {
    el.classList.toggle('active', el.dataset.lang === lang);
  });

  document.documentElement.lang = lang;
  store('lang', lang);

  const btn = document.getElementById('langBtn');
  if (btn) {
    btn.textContent = lang === 'tr' ? 'EN' : 'TR';
    btn.setAttribute('aria-label', t.langAria);
  }
  const up = document.getElementById('toTop');
  if (up) { up.setAttribute('aria-label', t.toTop); up.setAttribute('title', t.toTop); }
  const closeBtn = document.getElementById('cvModalClose');
  if (closeBtn) closeBtn.setAttribute('aria-label', t.close);

  applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
}

const langBtn = document.getElementById('langBtn');
if (langBtn) {
  langBtn.addEventListener('click', function () {
    applyLang(currentLang === 'tr' ? 'en' : 'tr');
  });
}

applyLang(currentLang);

/* =========================================================
   3) E-POSTA (tek yerden) + KOPYALA
   ========================================================= */
document.querySelectorAll('[data-email-link]').forEach(function (a) {
  a.setAttribute('href', 'mailto:' + EMAIL);
});
document.querySelectorAll('[data-email-text]').forEach(function (el) {
  el.textContent = EMAIL;
});

function copyEmail() {
  const btn = document.getElementById('copyBtn');
  if (!btn) return;
  const t = UI[currentLang];
  navigator.clipboard.writeText(EMAIL).then(function () {
    btn.textContent = t.copied;
  }).catch(function () {
    btn.textContent = t.failed;
  }).then(function () {
    setTimeout(function () { btn.textContent = btn.dataset[currentLang]; }, 2000);
  });
}

/* =========================================================
   4) OKUMA İLERLEME ÇUBUĞU + YUKARI ÇIK
   ========================================================= */
const progress = document.getElementById('progress');
const toTop = document.getElementById('toTop');

window.addEventListener('scroll', function () {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  if (progress) progress.style.width = (max > 0 ? h.scrollTop / max * 100 : 0) + '%';
  if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
}, { passive: true });

if (toTop) {
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =========================================================
   5) MENÜDE AKTİF BÖLÜM
   ========================================================= */
const navLinks = document.querySelectorAll('.nav-links a');

// Yazılar sayfasındaysak "Yazılar" linkini aktif yap
if (/\/yazilar(\.html|\/|$)/.test(location.pathname)) {
  navLinks.forEach(function (a) {
    if (/(^|\/)yazilar\.html$/.test(a.getAttribute('href') || '')) a.classList.add('active');
  });
}

if (navLinks.length && 'IntersectionObserver' in window) {
  const spyObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(function (s) { spyObs.observe(s); });
}

/* =========================================================
   6) KAYDIRINCA BELİRME
   ========================================================= */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('section:not(.featured-project), .timeline-item').forEach(function (el) {
    el.classList.add('reveal');
    revealObs.observe(el);
  });
}

/* =========================================================
   7) PROJE KARTLARINDA IŞIK
   ========================================================= */
document.querySelectorAll('.project-card').forEach(function (card) {
  card.addEventListener('mousemove', function (e) {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* =========================================================
   8) GITHUB: depo sayısı ve son güncellenen depo (otomatik)
   ========================================================= */
(function () {
  const countEl = document.getElementById('gh-count');
  const latestEl = document.getElementById('gh-latest');
  if (!countEl && !latestEl) return;

  if (countEl) {
    fetch('https://api.github.com/users/' + GITHUB_USER)
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (u) { if (typeof u.public_repos === 'number') countEl.textContent = u.public_repos; })
      .catch(function () {});
  }

  if (latestEl) {
    fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&type=owner&per_page=1')
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (repos) {
        if (repos && repos.length) {
          latestEl.textContent = repos[0].name;
          const row = latestEl.closest('.content-latest');
          if (row) row.hidden = false;
        }
      })
      .catch(function () {});
  }
})();

/* =========================================================
   9) CV MODAL: önce e-posta, sonra indirme
   ========================================================= */
const cvBtn = document.getElementById('cvBtn');
const cvModal = document.getElementById('cvModal');
const cvModalClose = document.getElementById('cvModalClose');
const cvForm = document.getElementById('cvForm');
const cvFormWrap = document.getElementById('cvFormWrap');
const cvEmail = document.getElementById('cvEmail');
const cvError = document.getElementById('cvError');
const cvDownload = document.getElementById('cvDownload');

function sessionGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
function sessionSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

function showCvStep(unlocked) {
  if (cvFormWrap) cvFormWrap.hidden = unlocked;
  if (cvDownload) cvDownload.hidden = !unlocked;
}

function openCvModal() {
  if (!cvModal) return;
  // Aynı ziyarette zaten e-posta bıraktıysa tekrar sorma
  const unlocked = sessionGet('cv-unlocked') === '1';
  showCvStep(unlocked);
  if (cvError) cvError.hidden = true;
  if (cvEmail) { cvEmail.classList.remove('invalid'); if (!unlocked) cvEmail.value = ''; }

  cvModal.hidden = false;
  cvModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const first = unlocked ? cvDownload.querySelector('a[href]') : cvEmail;
  if (first) first.focus();
}

function closeCvModal() {
  if (!cvModal) return;
  cvModal.hidden = true;
  cvModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (cvBtn) cvBtn.focus();
}

if (cvBtn && cvModal) {
  cvBtn.addEventListener('click', function (e) { e.preventDefault(); openCvModal(); });
}
if (cvModalClose) cvModalClose.addEventListener('click', closeCvModal);

if (cvModal) {
  cvModal.addEventListener('click', function (e) {
    if (e.target === cvModal) closeCvModal();
  });

  document.addEventListener('keydown', function (e) {
    if (cvModal.hidden) return;
    if (e.key === 'Escape') { closeCvModal(); return; }
    if (e.key === 'Tab') {
      // Odağı modal içinde tut (gizli öğeler hariç)
      const f = Array.prototype.filter.call(
        cvModal.querySelectorAll('a[href], button:not([disabled]), input'),
        function (el) { return el.offsetParent !== null; }
      );
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

if (cvForm && cvEmail && cvDownload) {
  cvForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = cvEmail.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!valid) {
      cvEmail.classList.add('invalid');
      if (cvError) cvError.hidden = false;
      cvEmail.focus();
      return;
    }
    cvEmail.classList.remove('invalid');
    if (cvError) cvError.hidden = true;

    const submitBtn = cvForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'tr' ? 'Gönderiliyor...' : 'Sending...';

    // Bildirimi sana ilet (arka planda). Başarısız olsa da kullanıcıyı engelleme.
    if (EMAIL === 'ornek@email.com') {
      console.warn('EMAIL hâlâ yer tutucu: bildirim gönderilmedi. script.js içindeki EMAIL değerini güncelle.');
    } else {
      fetch('https://formsubmit.co/ajax/' + EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email,
          _subject: 'CV İndirme Talebi — metehanyusan.com',
          _template: 'table',
          _honey: '',
          message: 'Bir ziyaretçi CV indirme talebinde bulundu. E-posta: ' + email
        })
      }).catch(function () {});
    }

    sessionSet('cv-unlocked', '1');

    setTimeout(function () {
      showCvStep(true);
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset[currentLang];
      const firstLink = cvDownload.querySelector('a[href]');
      if (firstLink) firstLink.focus();
    }, 400);
  });
}