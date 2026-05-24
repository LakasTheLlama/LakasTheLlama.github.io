/* =============================================================
   FAQ PAGE  –  js/faq.js
   Accordion open/close + keyboard support.
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
    btn.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); btn.click(); } });
  });

  if (window.location.hash) {
    const t = document.querySelector(window.location.hash);
    if (t && t.classList.contains('faq-item')) { t.classList.add('active'); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
  }
});