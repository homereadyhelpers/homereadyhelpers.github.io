// ── NAV TOGGLE ──
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu() {
  const open = navToggle.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeMenu() {
  navToggle.classList.remove('open');
  mobileMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

// ── PRICING TABS ──
function showTab(tab, btn) {
  document.querySelectorAll('.pricing-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.pricing-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  (btn || event.target).classList.add('active');
}

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── COUNT-UP NUMBERS (e.g. the $88 hourly rate badge) ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el) {
  const target = parseInt(el.dataset.countTo, 10);
  if (isNaN(target) || prefersReducedMotion) {
    el.textContent = (el.dataset.countPrefix || '') + target + (el.dataset.countSuffix || '');
    return;
  }
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = (el.dataset.countPrefix || '') + value + (el.dataset.countSuffix || '');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count-to]').forEach(el => countObserver.observe(el));

// ── ACTIVE NAV LINK ON SCROLL ──
const sectionIds = ['about', 'services', 'pricing'];
const navLinkMap = {};
document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
  navLinkMap[a.getAttribute('href').slice(1)] = a;
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const link = navLinkMap[entry.target.id];
    if (!link) return;
    if (entry.isIntersecting) {
      Object.values(navLinkMap).forEach(a => a.classList.remove('active-link'));
      link.classList.add('active-link');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

// ── NAV BACKGROUND / SCROLL PROGRESS / BACK-TO-TOP ──
const navEl = document.querySelector('nav');
const progressBar = document.querySelector('.scroll-progress');
const backToTop = document.querySelector('.back-to-top');

function onScroll() {
  const scrollY = window.scrollY;
  navEl.classList.toggle('scrolled', scrollY > 40);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = progress + '%';

  if (backToTop) backToTop.classList.toggle('show', scrollY > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// ── HERO PARALLAX (desktop / fine-pointer only) ──
const heroBg = document.querySelector('.hero-bg');
const heroLogoRing = document.querySelector('.hero-logo-ring');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (canHover && !prefersReducedMotion && heroBg) {
  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    heroBg.style.setProperty('--mx', xPct + '%');
    heroBg.style.setProperty('--my', yPct + '%');
    if (heroLogoRing) {
      const dx = (xPct - 50) / 50;
      const dy = (yPct - 50) / 50;
      heroLogoRing.style.transform = `translate(${dx * 8}px, ${dy * 8}px)`;
    }
  });
  hero.addEventListener('mouseleave', () => {
    if (heroLogoRing) heroLogoRing.style.transform = 'translate(0, 0)';
  });
}

// ── BUTTON RIPPLE ──
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    if (prefersReducedMotion) return;
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// ── AUTO-UPDATE FOOTER YEAR ──
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
