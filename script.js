/**
 * Anvi Ahuja · script.js
 * ─────────────────────────────────────────────────────────────
 * 1. Theme (dark/light) — persisted in localStorage
 * 2. Navigation — sticky glass + active link highlight
 * 3. Mobile menu
 * 4. Scroll reveal (IntersectionObserver)
 * 5. Smooth anchor scroll
 * 6. Footer year
 * 7. Back-to-top button
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ─────────────────────────────────────────────────────────────
   1. THEME
───────────────────────────────────────────────────────────── */
const THEME_KEY = 'anvi-theme';
const html      = document.documentElement;
const themeBtn  = $('#themeToggle');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  if (themeBtn) {
    themeBtn.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
    themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') { setTheme(saved); return; }
  setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}

// Follow OS preference only if user hasn't manually chosen
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem(THEME_KEY)) setTheme(e.matches ? 'dark' : 'light');
});

initTheme();


/* ─────────────────────────────────────────────────────────────
   2. NAVIGATION — glass on scroll + active section highlight
───────────────────────────────────────────────────────────── */
const header   = $('#siteHeader');
const navLinks = $$('.nav-link');

// Glass effect
function updateHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Active link via IntersectionObserver
function initActiveNav() {
  const sections = $$('section[id]');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l =>
          l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`)
        );
      }
    });
  }, {
    rootMargin: `-${Math.round(window.innerHeight * 0.4)}px 0px -${Math.round(window.innerHeight * 0.4)}px 0px`,
    threshold: 0
  });

  sections.forEach(s => io.observe(s));
}
initActiveNav();


/* ─────────────────────────────────────────────────────────────
   3. MOBILE MENU
───────────────────────────────────────────────────────────── */
const hamburger = $('#hamburger');
const mobileNav = $('#mobileNav');
const mobLinks  = $$('.mob-link');

function openMenu() {
  if (!hamburger || !mobileNav) return;
  mobileNav.classList.add('open');
  mobileNav.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!hamburger || !mobileNav) return;
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', () =>
    mobileNav.classList.contains('open') ? closeMenu() : openMenu()
  );
}

mobLinks.forEach(l => l.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

document.addEventListener('click', e => {
  if (
    mobileNav &&
    mobileNav.classList.contains('open') &&
    !mobileNav.contains(e.target) &&
    hamburger && !hamburger.contains(e.target)
  ) closeMenu();
});


/* ─────────────────────────────────────────────────────────────
   4. SCROLL REVEAL
───────────────────────────────────────────────────────────── */
function initReveal() {
  // Immediately show everything if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.reveal').forEach(el => el.classList.add('in'));
    return;
  }

  // Hero section elements use CSS animations — skip them for IntersectionObserver
  const heroEl = $('.hero');
  const els = $$('.reveal').filter(el => !heroEl || !heroEl.contains(el));
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -32px 0px'
  });

  els.forEach(el => io.observe(el));
}
initReveal();


/* ─────────────────────────────────────────────────────────────
   5. SMOOTH ANCHOR SCROLL (polyfill for Safari)
───────────────────────────────────────────────────────────── */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });
});


/* ─────────────────────────────────────────────────────────────
   6. FOOTER YEAR
───────────────────────────────────────────────────────────── */
const yrEl = $('#yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();


/* ─────────────────────────────────────────────────────────────
   7. BACK-TO-TOP BUTTON
───────────────────────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`;

  // Inline only the structural/positional styles; colours use CSS vars
  Object.assign(btn.style, {
    position:      'fixed',
    bottom:        '28px',
    right:         '28px',
    zIndex:        '90',
    width:         '40px',
    height:        '40px',
    borderRadius:  '50%',
    display:       'grid',
    placeItems:    'center',
    background:    'var(--mauve)',
    color:         '#fff',
    border:        'none',
    cursor:        'pointer',
    boxShadow:     '0 4px 14px rgba(122,85,102,.3)',
    opacity:       '0',
    transform:     'translateY(8px)',
    transition:    'opacity 300ms ease, transform 300ms ease',
    pointerEvents: 'none',
  });

  document.body.appendChild(btn);

  function updateBtn() {
    const show = window.scrollY > 600;
    btn.style.opacity      = show ? '1' : '0';
    btn.style.transform    = show ? 'translateY(0)' : 'translateY(8px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }

  window.addEventListener('scroll', updateBtn, { passive: true });

  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
})();


/* ─────────────────────────────────────────────────────────────
   8. SUBTLE CARD TILT (desktop pointer devices only)
   Max ±4° — tasteful, not gimmicky
───────────────────────────────────────────────────────────── */
(function initTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  $$('.work-card, .jc, .j-featured').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top)  / r.height - 0.5) * -4;
      const ry = ((e.clientX - r.left) / r.width  - 0.5) *  4;
      card.style.transform  =
        `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.transition = 'transform 60ms linear, box-shadow .42s ease, border-color .26s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = '';
    });
  });
})();
