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

/* ===== BOOKING FORM ===== */
const rideForm = document.getElementById('rideForm');
if (rideForm) {

  /* Date min */
  const dateInput = document.getElementById('rideDate');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  /* Payment toggle */
  let payMode = 'later';
  let squareCard = null;
  window.selectPay = async function(mode) {
    payMode = mode;
    document.getElementById('payLater').classList.toggle('active', mode === 'later');
    document.getElementById('payNow').classList.toggle('active', mode === 'now');
    const sqEl = document.getElementById('sqWrap');
    if (sqEl) sqEl.style.display = mode === 'now' ? 'block' : 'none';

    if (mode === 'now' && !squareCard && typeof Square !== 'undefined') {
      try {
        const payments = Square.payments(window.SQUARE_APP_ID, window.SQUARE_LOCATION_ID);
        squareCard = await payments.card();
        await squareCard.attach('#sq-card');
      } catch(e) { console.warn('Square init:', e); }
    }
  };
  document.getElementById('payLater')?.classList.add('active');

  /* Multi-stop */
  let stopCount = 0;
  document.getElementById('addStop')?.addEventListener('click', () => {
    if (stopCount >= 4) return;
    stopCount++;
    const list = document.getElementById('stopsList');
    const row = document.createElement('div');
    row.className = 'stop-row'; row.id = `stop-row-${stopCount}`;
    row.innerHTML = `
      <div class="addr-wrap" style="flex:1">
        <svg class="addr-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>
        <input type="text" class="form-ctrl stop-input" id="stop-${stopCount}" placeholder="Stop address…" autocomplete="off"/>
      </div>
      <button type="button" class="stop-del" onclick="removeStop(${stopCount})" aria-label="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    list.appendChild(row);
    if (window.google) new google.maps.places.Autocomplete(document.getElementById(`stop-${stopCount}`), { componentRestrictions: { country: 'us' }, fields: ['formatted_address','name'] });
    if (stopCount >= 4) document.getElementById('addStop').style.opacity = '0.4';
  });
  window.removeStop = function(id) {
    document.getElementById(`stop-row-${id}`)?.remove();
    stopCount = Math.max(0, stopCount - 1);
    document.getElementById('addStop').style.opacity = '1';
  };

  /* Submit */
  rideForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const toast = document.getElementById('formToast');

    const required = ['serviceType','rideDate','rideTime','pickup','dropoff','clientName','clientPhone','clientEmail'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) { if(el) el.style.borderColor='var(--error)'; valid = false; }
      else el.style.borderColor = '';
    });
    if (!valid) { showToast('error', 'Please fill in all required fields.'); return; }

    const stops = [...document.querySelectorAll('.stop-input')].map(i => i.value.trim()).filter(Boolean);
    const data = {
      service:    document.getElementById('serviceType').value,
      vehicle:    document.getElementById('vehicle').value,
      date:       document.getElementById('rideDate').value,
      time:       document.getElementById('rideTime').value,
      pickup:     document.getElementById('pickup').value,
      stops:      stops.join(' → ') || 'None',
      dropoff:    document.getElementById('dropoff').value,
      passengers: document.getElementById('passengers').value,
      flight:     document.getElementById('flight')?.value || 'N/A',
      name:       document.getElementById('clientName').value,
      phone:      document.getElementById('clientPhone').value,
      email:      document.getElementById('clientEmail').value,
      notes:      document.getElementById('notes')?.value || '',
      payment:    payMode === 'now' ? 'Card (Square)' : 'Pay Later',
      to_email:   'berdnikov@pacificeliterides.com',
    };

    btn.classList.add('loading'); btn.disabled = true;

    try {
      if (payMode === 'now' && squareCard) {
        const res = await squareCard.tokenize();
        if (res.status !== 'OK') throw new Error(res.errors?.[0]?.message || 'Card error');
        data.payment = `Card – token: ${res.token}`;
      }

      if (typeof emailjs !== 'undefined' && window.EMAILJS_SERVICE && window.EMAILJS_SERVICE !== 'YOUR_SERVICE_ID') {
        await emailjs.send(window.EMAILJS_SERVICE, window.EMAILJS_TEMPLATE, data);
      } else {
        const body = Object.entries(data).map(([k,v]) => `${k}: ${v}`).join('\n');
        window.location.href = `mailto:berdnikov@pacificeliterides.com?subject=New Ride Request – ${data.name}&body=${encodeURIComponent(body)}`;
      }

      showToast('success', '✓ Request sent! We\'ll confirm within 15 minutes.');
      rideForm.reset();
      document.getElementById('stopsList').innerHTML = '';
      stopCount = 0;
      document.getElementById('payLater')?.classList.add('active');
      document.getElementById('payNow')?.classList.remove('active');
      document.getElementById('sqWrap') && (document.getElementById('sqWrap').style.display = 'none');

    } catch(err) {
      console.error(err);
      showToast('error', 'Something went wrong. Please call (619) 394-0452.');
    } finally {
      btn.classList.remove('loading'); btn.disabled = false;
    }
  });

  function showToast(type, msg) {
    const t = document.getElementById('formToast');
    t.className = 'toast ' + type; t.textContent = msg; t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 7000);
  }
}

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
