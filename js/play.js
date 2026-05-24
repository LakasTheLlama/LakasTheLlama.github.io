/* =============================================================
   PLAY PAGE  –  js/play.js
   Registration warning dismissal + session accordion.
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const warning = document.getElementById('reg-warning');
  if (warning) warning.addEventListener('click', () => warning.classList.add('hidden'));

  document.querySelectorAll('.play-dropdown').forEach(dropdown => {
    dropdown.addEventListener('click', e => {
      e.stopPropagation();
      const section  = dropdown.closest('.play-section');
      const wasActive = section.classList.contains('active');
      document.querySelectorAll('.play-section').forEach(s => s.classList.remove('active'));
      if (!wasActive) { section.classList.add('active'); section.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector('.play-section' + hash);
    if (target) target.classList.add('active');
  }
});