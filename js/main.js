/* ============================================================
   PACIFIC ELITE RIDES — Shared JavaScript
   ============================================================ */

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ===== MOBILE MENU ===== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function openMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}
if (hamburger) hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

/* ===== LANGUAGE SWITCHER ===== */
function setLang(lang) {
  const isEs = lang === 'es';
  localStorage.setItem('per_lang', lang);

  document.getElementById('btnEn')?.classList.toggle('active', !isEs);
  document.getElementById('btnEs')?.classList.toggle('active', isEs);
  document.getElementById('mbBtnEn')?.classList.toggle('active', !isEs);
  document.getElementById('mbBtnEs')?.classList.toggle('active', isEs);

  document.querySelectorAll('.lang-en').forEach(el => el.style.display = isEs ? 'none' : 'inline');
  document.querySelectorAll('.lang-es').forEach(el => el.style.display = isEs ? 'inline' : 'none');
  document.querySelectorAll('option[data-en]').forEach(opt => {
    opt.textContent = isEs ? opt.dataset.es : opt.dataset.en;
  });
}
(function initLang() {
  const saved = localStorage.getItem('per_lang');
  if (saved === 'es') setLang('es');
})();

/* ===== SCROLL REVEAL ===== */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); closeMenu(); }
  });
});

/* ===== PARTICLES ===== */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 2.5 + 0.8;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;bottom:${Math.random()*15}%;animation-duration:${Math.random()*14+10}s;animation-delay:${Math.random()*8}s;`;
    container.appendChild(p);
  }
})();

/* ===== FAQ ACCORDION ===== */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ===== ACTIVE NAV LINK ===== */
(function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && path.endsWith(href)) a.classList.add('active');
  });
})();

/* ===== CONVERSION TRACKING ===== */
/* Tracks a click on any phone number link as a GA4 event. GA4 + Google Ads are linked,
   so mark "phone_click" as a conversion in GA4 (Admin > Events) and import it into
   Google Ads (Goals > Conversions > Import > Google Analytics 4) rather than hardcoding
   a separate AW- conversion label here. */
document.querySelectorAll('a[href^="tel:"]').forEach(a => {
  a.addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'phone_click', { link_url: a.getAttribute('href') });
    }
  });
});

/* ===== GOOGLE PLACES INIT ===== */
window.initPlaces = function() {
  ['pickup','dropoff'].forEach(id => {
    const el = document.getElementById(id);
    if (el && window.google) {
      new google.maps.places.Autocomplete(el, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address','name'],
        types: ['establishment','geocode']
      });
    }
  });
};

/* ===== COOKIE CONSENT (California opt-out model) =====
   Analytics/ads cookies are on by default; "Decline" or a Global Privacy Control
   signal turns them off. The choice is remembered in localStorage. */
(function () {
  var KEY = 'per_cookie_consent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function apply(granted) {
    var v = granted ? 'granted' : 'denied';
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: v });
    }
    if (!granted) {
      // remove Google Analytics / Ads cookies already set on this domain
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (/^(_ga|_gid|_gat|_gcl)/.test(name)) {
          var host = location.hostname.replace(/^www\./, '');
          ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
          });
        }
      });
    }
  }

  function show() {
    if (document.getElementById('perCookieBanner')) return;
    var es = false; try { es = localStorage.getItem('per_lang') === 'es'; } catch (e) {}
    /* On a phone the long notice wrapped to five lines and pushed the buttons
       onto a second row — 177px, 22% of a 375x812 screen, covering three
       service cards on booking.html and the primary CTA on the ads pages.
       Every paid click from a new visitor lands on that. The short notice keeps
       both facts that matter (what the cookies are for, that data is not sold);
       the full disclosure lives on cookies.html, which is linked right here. */
    var narrow = false;
    try { narrow = window.matchMedia('(max-width: 600px)').matches; } catch (e) {}
    var t = es
      ? { msg: narrow
            ? 'Cookies de Google Analytics y Ads. No vendemos sus datos.'
            : 'Usamos cookies de Google Analytics y Google Ads para medir visitas y anuncios. No vendemos sus datos.',
          more: 'Política de cookies', ok: 'Aceptar', no: 'Rechazar' }
      : { msg: narrow
            ? 'Google Analytics and Ads cookies. We never sell your data.'
            : 'We use Google Analytics and Google Ads cookies to measure visits and ad performance. We never sell your data.',
          more: 'Cookie Policy', ok: 'Accept', no: 'Decline' };

    if (!document.getElementById('perCookieCss')) {
      var css = document.createElement('style');
      css.id = 'perCookieCss';
      css.textContent =
        '#perCookieBanner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:760px;margin:0 auto;' +
        'background:var(--black-card,#141414);border:1px solid var(--gold,#C9A84C);border-radius:12px;padding:18px 20px;' +
        'display:flex;gap:16px;align-items:center;flex-wrap:wrap;box-shadow:0 12px 40px rgba(0,0,0,.6);font-size:14px;line-height:1.5;color:var(--white-soft,#C8C2B8)}' +
        '#perCookieBanner p{margin:0;flex:1 1 320px}' +
        '#perCookieBanner a{color:var(--gold,#C9A84C);text-decoration:underline}' +
        '#perCookieBanner .pcb-actions{display:flex;gap:10px;flex:0 0 auto}' +
        '#perCookieBanner .btn{padding:10px 22px;min-width:110px;justify-content:center}' +
        '#perCookieBanner .btn:focus-visible{outline:2px solid var(--gold,#C9A84C);outline-offset:3px}' +
        /* Compact on phones: ~72px instead of 177px, and the buttons stay on the
           same row as the text instead of wrapping below it. Tap targets stay at
           44px, which is the accessibility floor — height is saved on padding,
           font size and line count, not on making the buttons harder to hit. */
        '@media (max-width:600px){' +
          '#perCookieBanner{left:8px;right:8px;bottom:8px;padding:10px 12px;gap:10px;' +
            'font-size:12.5px;line-height:1.35;border-radius:10px;flex-wrap:nowrap;align-items:center}' +
          '#perCookieBanner p{flex:1 1 auto;min-width:0}' +
          '#perCookieBanner .pcb-actions{gap:6px}' +
          '#perCookieBanner .btn{padding:0 12px;min-width:74px;height:44px;font-size:12px;white-space:nowrap}' +
        '}';
      document.head.appendChild(css);
    }

    var box = document.createElement('div');
    box.id = 'perCookieBanner';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', es ? 'Aviso de cookies' : 'Cookie notice');
    box.innerHTML =
      '<p>' + t.msg + ' <a href="/cookies.html">' + t.more + '</a></p>' +
      '<div class="pcb-actions">' +
      '<button type="button" class="btn btn-outline" data-c="denied">' + t.no + '</button>' +
      '<button type="button" class="btn btn-primary" data-c="granted">' + t.ok + '</button>' +
      '</div>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      var v = b.getAttribute('data-c');
      set(v);
      apply(v === 'granted');
      box.remove();
    });
    document.body.appendChild(box);
  }

  // Called by the "Change cookie settings" button on cookies.html
  window.perCookieSettings = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    show();
  };

  var gpc = navigator.globalPrivacyControl === true;
  if (gpc && get() !== 'denied') { set('denied'); apply(false); }
  else if (!get()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
    else show();
  }
})();
