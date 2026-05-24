/* =============================================================
   CCVC GLOBAL JS  –  js/global.js
   Handles: component injection, preloader, navbar scroll +
   hamburger, active nav link detection.
   Runs on every page. No jQuery dependency.
   ============================================================= */

function loadComponent(selector, url, callback) {
  const el = document.querySelector(selector);
  if (!el) return;
  fetch(url)
    .then(r => r.text())
    .then(html => { el.innerHTML = html; if (callback) callback(); })
    .catch(err => console.warn('Component load failed:', url, err));
}

document.addEventListener('DOMContentLoaded', () => {
  
  loadComponent('#navbar-placeholder', 'components/navbar.html', () => {
    initNavbar();
    setActiveNavLink();
  });
  loadComponent('#footer-placeholder', 'components/footer.html');

  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    if (pre) { pre.style.opacity = '0'; setTimeout(() => pre.remove(), 500); }
  });
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  
  if (!navbar) return;

  /* On inner pages the navbar is always in scrolled (solid) state.
     On index.html it transitions in on scroll as normal.          */
  const isIndex = (window.location.pathname.split('/').pop() || 'index.html') === 'index.html';

  const onScroll = () => {
    if (isIndex) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      const nav_notice = document.getElementById('nav-ticker');
      if (!nav_notice) return;
      nav_notice.classList.toggle('scrolled', window.scrollY > 50);
    } else {
      navbar.classList.add('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* apply immediately on load */

  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', false);
      });
    });
  }
}

function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#nav-links li[data-page]').forEach(li => {
    if (li.dataset.page === page) li.classList.add('active');
  });
}