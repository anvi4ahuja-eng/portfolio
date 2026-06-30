/**
 * ═══════════════════════════════════════════════════════════
 *  Anvi Ahuja · script.js
 *  Handles: theme, navigation, mobile menu, scroll animations,
 *           active nav links, footer year, smooth scroll
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────────────────
   1. THEME  (Light / Dark — remembered in localStorage)
───────────────────────────────────────────────────────── */

const THEME_KEY  = 'anvi-theme';
const html       = document.documentElement;
const themeBtn   = document.getElementById('themeToggle');

/**
 * Apply and persist a theme.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  if (themeBtn) {
    themeBtn.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
    themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

/** Read saved preference → OS preference → default light. */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// Follow OS changes only if the user has never manually chosen.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

initTheme();


/* ─────────────────────────────────────────────────────────
   2. STICKY HEADER — glass effect on scroll
───────────────────────────────────────────────────────── */

const siteHeader = document.getElementById('siteHeader');

function updateHeader() {
  if (!siteHeader) return;
  siteHeader.classList.toggle('scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader(); // run once on load (handles refresh-at-mid-page)


/* ─────────────────────────────────────────────────────────
   3. MOBILE MENU
───────────────────────────────────────────────────────── */

const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

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

function toggleMenu() {
  const isOpen = mobileNav && mobileNav.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
}

if (hamburger) hamburger.addEventListener('click', toggleMenu);

mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// Close on outside tap
document.addEventListener('click', e => {
  if (
    mobileNav &&
    mobileNav.classList.contains('open') &&
    !mobileNav.contains(e.target) &&
    hamburger && !hamburger.contains(e.target)
  ) closeMenu();
});


/* ─────────────────────────────────────────────────────────
   4. SCROLL ANIMATIONS (IntersectionObserver)
───────────────────────────────────────────────────────── */

function initFadeUp() {
  // Honour reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.fade-up').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -36px 0px'
  });

  els.forEach(el => observer.observe(el));
}

initFadeUp();


/* ─────────────────────────────────────────────────────────
   5. ACTIVE NAV LINK — highlights current section
───────────────────────────────────────────────────────── */

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const setActive = id => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, {
    rootMargin: `-${Math.round(window.innerHeight * 0.38)}px 0px -${Math.round(window.innerHeight * 0.38)}px 0px`,
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));
}

initActiveNav();


/* ─────────────────────────────────────────────────────────
   6. SMOOTH SCROLL — anchor clicks (polyfill for older Safari)
───────────────────────────────────────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });
});


/* ─────────────────────────────────────────────────────────
   7. FOOTER YEAR
───────────────────────────────────────────────────────── */

const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ─────────────────────────────────────────────────────────
   8. HERO BACKGROUND — subtle parallax on mouse (desktop only)
───────────────────────────────────────────────────────── */

(function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let tx = 0, ty = 0, cx = 0, cy = 0, raf;

  document.addEventListener('mousemove', e => {
    tx = (e.clientX / window.innerWidth  - 0.5) * 30;
    ty = (e.clientY / window.innerHeight - 0.5) * 20;
  });

  function tick() {
    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    hero.style.setProperty('--px', `${cx}px`);
    hero.style.setProperty('--py', `${cy}px`);
    raf = requestAnimationFrame(tick);
  }

  // Only run while hero is visible
  const vis = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { tick(); }
    else { cancelAnimationFrame(raf); }
  });
  vis.observe(hero);
})();


/* ─────────────────────────────────────────────────────────
   9. PROJECT CARD — subtle 3-D tilt (desktop only)
───────────────────────────────────────────────────────── */

(function initTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.project-card, .journal-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const rx = ((e.clientY - top)  / height - 0.5) * -5;
      const ry = ((e.clientX - left) / width  - 0.5) *  5;
      card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.transition = 'transform 60ms linear, box-shadow 260ms ease, border-color 260ms ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = '';
    });
  });
})();


/* ─────────────────────────────────────────────────────────
   10. SCROLL-TO-TOP — appear after 600 px
───────────────────────────────────────────────────────── */

(function initScrollTop() {
  // Create button dynamically — keeps HTML clean
  const btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <polyline points="18 15 12 9 6 15"/>
    </svg>`;

  // Inline the minimum styles needed (the rest live in CSS)
  Object.assign(btn.style, {
    position:   'fixed',
    bottom:     '28px',
    right:      '28px',
    zIndex:     '90',
    width:      '40px',
    height:     '40px',
    borderRadius: '50%',
    background: 'var(--rose)',
    color:      '#fff',
    display:    'grid',
    placeItems: 'center',
    border:     'none',
    cursor:     'pointer',
    boxShadow:  '0 4px 14px rgba(216,180,180,0.45)',
    opacity:    '0',
    transform:  'translateY(10px)',
    transition: 'opacity 300ms ease, transform 300ms ease',
    pointerEvents: 'none',
  });

  document.body.appendChild(btn);

  function updateBtn() {
    const show = window.scrollY > 600;
    btn.style.opacity      = show ? '1' : '0';
    btn.style.transform    = show ? 'translateY(0)' : 'translateY(10px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }

  window.addEventListener('scroll', updateBtn, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
