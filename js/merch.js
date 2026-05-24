/* =============================================================
   CONTACT PAGE  –  js/contact.js
   Form validation + submission feedback.
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      if (!f.value.trim()) { f.style.borderColor = '#ef4444'; valid = false; }
      else f.style.borderColor = '';
    });
    if (!valid) return;

    const btn = form.querySelector('.submit-btn');
    btn.disabled = true; btn.textContent = 'Sending…';
    setTimeout(() => {
      form.reset(); btn.disabled = false; btn.textContent = 'Send Message';
      if (success) { success.style.display = 'block'; setTimeout(() => { success.style.display = 'none'; }, 5000); }
    }, 1200);
  });

  form.querySelectorAll('input, textarea').forEach(f => {
    f.addEventListener('input', () => { f.style.borderColor = ''; });
  });
});