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
