/**
 * portfolio — script.js
 * Handles: dark mode, sticky nav, mobile menu, scroll animations, active nav links
 */

'use strict';

/* ================================================================
   1. THEME (Dark / Light Mode)
   ================================================================ */

const THEME_KEY = 'portfolio-theme';
const html      = document.documentElement;
const themeBtn  = document.getElementById('themeToggle');

/**
 * Apply a theme ('light' | 'dark') and persist to localStorage.
 */
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  const isDark = theme === 'dark';
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', String(isDark));
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

/**
 * Determine initial theme:
 *   1. Saved preference in localStorage
 *   2. OS-level prefers-color-scheme
 *   3. Default: light
 */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved);
    return;
  }
  const prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefDark ? 'dark' : 'light');
}

// Toggle on button click
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// Watch for OS-level changes during the session
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // Only auto-switch if the user has not made a manual choice
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

initTheme();


/* ================================================================
   2. STICKY NAVIGATION — glassmorphism on scroll
   ================================================================ */

const navHeader = document.querySelector('.nav-header');

function handleNavScroll() {
  if (!navHeader) return;
  if (window.scrollY > 20) {
    navHeader.classList.add('scrolled');
  } else {
    navHeader.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // Run once in case page loads mid-scroll


/* ================================================================
   3. MOBILE MENU
   ================================================================ */

const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMenu() {
  if (!hamburger || !mobileMenu) return;
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeMenu() {
  if (!hamburger || !mobileMenu) return;
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function toggleMenu() {
  const isOpen = mobileMenu && mobileMenu.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
}

if (hamburger) hamburger.addEventListener('click', toggleMenu);

// Close on link click
mobileLinks.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (
    mobileMenu &&
    mobileMenu.classList.contains('open') &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMenu();
  }
});


/* ================================================================
   4. SCROLL ANIMATIONS (IntersectionObserver)
   ================================================================ */

/**
 * Observe all .reveal elements and add the .visible class
 * when they enter the viewport.
 */
function initScrollAnimations() {
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve once visible — no need to re-trigger
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,           // Trigger when 12% of element is visible
      rootMargin: '0px 0px -40px 0px' // Slight bottom offset for better feel
    }
  );

  elements.forEach((el) => observer.observe(el));
}

initScrollAnimations();


/* ================================================================
   5. ACTIVE NAV LINK — highlight current section
   ================================================================ */

function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    },
    {
      // Trigger when a section is in the middle third of the viewport
      rootMargin: `-${Math.round(window.innerHeight * 0.4)}px 0px -${Math.round(window.innerHeight * 0.4)}px 0px`,
      threshold: 0
    }
  );

  sections.forEach((section) => observer.observe(section));
}

initActiveNav();


/* ================================================================
   6. FOOTER YEAR
   ================================================================ */

const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ================================================================
   7. SMOOTH-SCROLL POLYFILL FOR SAFARI (anchor clicks)
   ================================================================ */

/**
 * Native scroll-behavior: smooth is well-supported now,
 * but this ensures hash link clicks also work on older Safari.
 */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update URL hash without jumping
    history.pushState(null, '', targetId);
  });
});


/* ================================================================
   8. HERO GLOW — subtle parallax on mouse move (desktop only)
   ================================================================ */

(function initHeroParallax() {
  const glow = document.querySelector('.hero-glow');
  if (!glow) return;

  // Only on pointer devices, not touch
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let rafId = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener('mousemove', (e) => {
    // Offset relative to viewport center, scaled down
    targetX = (e.clientX / window.innerWidth  - 0.5) * 60;
    targetY = (e.clientY / window.innerHeight - 0.5) * 40;
  });

  function animate() {
    // Lerp for buttery smoothness
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    glow.style.transform = `translateX(calc(-50% + ${currentX}px)) translateY(${currentY}px)`;

    rafId = requestAnimationFrame(animate);
  }

  animate();

  // Clean up if hero leaves the viewport (perf)
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const stop = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) cancelAnimationFrame(rafId);
      else animate();
    });
    stop.observe(heroSection);
  }
})();


/* ================================================================
   9. PROJECT CARD — tilt micro-interaction (desktop)
   ================================================================ */

(function initCardTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.project-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -4;  // Max 4° tilt
      const rotateY = ((x - cx) / cx) *  4;

      card.style.transform    = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.transition   = 'transform 80ms linear, box-shadow 250ms ease, border-color 250ms ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = '';
    });
  });
})();
