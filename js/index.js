/* =============================================================
   INDEX PAGE  –  js/index.js
   Media reel tab filtering.
   ============================================================= */

const MEDIA_ITEMS = [
  { type:'highlights', title:'Round 1 Highlights vs Lynx VC',       yt:true  },
  { type:'training',   title:'Thursday Night Training – Week 3',     yt:false },
  { type:'highlights', title:'Round 2 Match Recap vs Housecats',     yt:true  },
  { type:'social',     title:'End of Season Presentation Night',     yt:false },
  { type:'training',   title:'Beginners Session – How to Serve',     yt:true  },
  { type:'social',     title:'Club BBQ & Social Night 2025',         yt:false },
];

const MEDIA_LABELS = { highlights:'Match Highlights', training:'Training', social:'Club Social' };
const MEDIA_ICONS  = { highlights:'fa-volleyball-ball', training:'fa-dumbbell', social:'fa-camera' };

function renderMedia(filter) {
  const grid = document.getElementById('mediaGrid');
  if (!grid) return;
  const items = filter === 'all' ? MEDIA_ITEMS : MEDIA_ITEMS.filter(m => m.type === filter);
  grid.innerHTML = items.map(item => `
    <div class="media-card">
      <div class="media-thumb-placeholder"><i class="fa ${MEDIA_ICONS[item.type]}"></i></div>
      ${item.yt ? '<div class="media-yt-badge"><i class="fab fa-youtube"></i> YouTube</div>' : ''}
      <div class="media-play-btn"><i class="fa fa-play"></i></div>
      <div class="media-caption">
        <div class="mc-tag">${MEDIA_LABELS[item.type]}</div>
        <h4>${item.title}</h4>
      </div>
    </div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.media-tab').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.media-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderMedia(this.dataset.tab);
    });
  });
  renderMedia('all');
});