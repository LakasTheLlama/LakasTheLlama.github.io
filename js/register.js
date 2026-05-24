/* =============================================================
   REGISTER PAGE  –  js/register.js
   Membership card selection + form submit.
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.membership-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.membership-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const ti = document.getElementById('membershipType');
      if (ti) ti.value = card.dataset.type || card.querySelector('h3').textContent;
    });
  });
  const first = document.querySelector('.membership-card');
  if (first) first.click();

  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      if (!f.value.trim()) { f.style.borderColor = '#ef4444'; valid = false; }
      else f.style.borderColor = '';
    });
    if (!valid) return;
    const btn = form.querySelector('.register-submit');
    btn.disabled = true; btn.textContent = 'Submitting…';
    setTimeout(() => {
      btn.disabled = false; btn.textContent = 'Submit Expression of Interest';
      alert("Registration submitted! We'll be in touch shortly.");
      form.reset();
    }, 1200);
  });
  form.querySelectorAll('input, select').forEach(f => f.addEventListener('input', () => { f.style.borderColor = ''; }));
});