/* =============================================================
   CCVC DRAWS FETCHER  –  js/draws.js
   Self-contained module that fetches a Volleyball NSW team draw
   page and renders results + upcoming games.

   Usage (HTML):

   <div
     data-draws-widget
     data-url="https://www.volleyballnsw.com.au/games/team/26016/411673"
     data-title="SVL – Men's Div 2 · 2026">
   </div>

   <script src="js/draws.js"></script>

   ============================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------
     PROXY
  ----------------------------------------------------------- */

  const PROXY = 'https://corsproxy.io/?';

  function proxyUrl(target) {
    return PROXY + encodeURIComponent(target);
  }

  /* -----------------------------------------------------------
     HELPERS
  ----------------------------------------------------------- */

  function resultClass(text) {

    const t = (text || '').toLowerCase();

    if (t === 'loss' || t === 'forfeit') {
      return 'result-loss';
    }

    if (t === 'win') {
      return 'result-win';
    }

    if (t === 'on duty') {
      return 'result-duty';
    }

    return 'result-upcoming';
  }

  function badgeClass(text) {

    const t = (text || '').toLowerCase();

    if (t === 'loss' || t === 'forfeit') {
      return 'badge-loss';
    }

    if (t === 'win') {
      return 'badge-win';
    }

    if (t === 'on duty') {
      return 'badge-duty';
    }

    return 'badge-upcoming';
  }

  function badgeLabel(text) {

    if (!text || text.trim() === '') {
      return 'Upcoming';
    }

    return text.trim();
  }

  /* -----------------------------------------------------------
     PARSER
  ----------------------------------------------------------- */

  function parseDrawPage(html) {

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const result = {
      title: '',
      wins: 0,
      draws: 0,
      losses: 0,
      streak: 0,
      games: []
    };

    /* ---------------------------------------------------------
       TITLE
    --------------------------------------------------------- */

    const h2 = doc.querySelector('h2');

    if (h2) {
      result.title = h2.textContent.trim();
    }

    /* ---------------------------------------------------------
       STATS
    --------------------------------------------------------- */

    const statContainer = doc.querySelector(
      '.card-body'
    );

    if (statContainer) {

      const statText = statContainer.textContent
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      const winsMatch = statText.match(
        /wins\s+(\d+)/
      );

      const drawsMatch = statText.match(
        /draws\s+(\d+)/
      );

      const lossesMatch = statText.match(
        /(losses|losses\/forfeits)\s+(\d+)/
      );

      const streakMatch = statText.match(
        /(biggest win streak|best streak)\s+(\d+)/
      );

      if (winsMatch) {
        result.wins = parseInt(winsMatch[1], 10);
      }

      if (drawsMatch) {
        result.draws = parseInt(drawsMatch[1], 10);
      }

      if (lossesMatch) {
        result.losses = parseInt(lossesMatch[2], 10);
      }

      if (streakMatch) {
        result.streak = parseInt(streakMatch[2], 10);
      }
    }

    /* ---------------------------------------------------------
       GAMES
    --------------------------------------------------------- */

    const cards = doc.querySelectorAll(
      '.card.card-hover.mb-4'
    );

    cards.forEach(card => {

      const cardText = card.textContent
        .replace(/\s+/g, ' ')
        .trim();

      /* -------------------------------------------------------
         ROUND
      ------------------------------------------------------- */

      const roundMatch = cardText.match(
        /Round\s+\d+/i
      );

      const round = roundMatch
        ? roundMatch[0]
        : 'Round';

      /* -------------------------------------------------------
         DATE
      ------------------------------------------------------- */

      const dateMatch = cardText.match(
        /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\s+\w+\s+\d{4}\b/
      );

      const date = dateMatch
        ? dateMatch[0]
        : '';

      /* -------------------------------------------------------
         TIME
      ------------------------------------------------------- */

      const timeMatch = cardText.match(
        /\b\d{2}:\d{2}\b/
      );

      const time = timeMatch
        ? timeMatch[0]
        : '';

      /* -------------------------------------------------------
         VENUE
      ------------------------------------------------------- */

      let venue = '';

      const venueCols = card.querySelectorAll(
        '.col'
      );

      venueCols.forEach(col => {

        const txt = col.textContent
          .replace(/\s+/g, ' ')
          .trim();

        if (
          txt.includes('Sports Halls') ||
          txt.includes('Court')
        ) {

          if (!venue.includes(txt)) {

            venue += venue
              ? ' · ' + txt
              : txt;
          }
        }
      });

      /* -------------------------------------------------------
         OPPONENT
      ------------------------------------------------------- */

      const oppLink = card.querySelector(
        'a[href*="/games/team/"]'
      );

      const opponent = oppLink
        ? oppLink.textContent
            .replace(/\s+/g, ' ')
            .trim()
        : 'On Duty';

      /* -------------------------------------------------------
         SCORE
      ------------------------------------------------------- */

      const scoreMatch = cardText.match(
        /\b\d+\s*-\s*\d+\b/
      );

      const score = scoreMatch
        ? scoreMatch[0]
        : '—';

      /* -------------------------------------------------------
         RESULT
      ------------------------------------------------------- */

      let resultText = '';

      if (/loss/i.test(cardText)) {
        resultText = 'Loss';
      }
      else if (/win/i.test(cardText)) {
        resultText = 'Win';
      }
      else if (/on duty/i.test(cardText)) {
        resultText = 'On duty';
      }
      else if (/forfeit/i.test(cardText)) {
        resultText = 'Forfeit';
      }

      /* -------------------------------------------------------
         PLAYED
      ------------------------------------------------------- */

      const played = /played/i.test(cardText);

      result.games.push({
        round,
        date,
        time,
        venue,
        opponent,
        score: played ? score : '—',
        result: resultText,
        played
      });

    });

    return result;
  }

  /* -----------------------------------------------------------
     RENDERER
  ----------------------------------------------------------- */

  function renderWidget(container, data) {

    const titleOverride =
      container.dataset.title || data.title;

    /* ---------------------------------------------------------
       STATS
    --------------------------------------------------------- */

    const statsHtml = `
      <div class="draws-summary">

        <div class="stat-pill">
          <div class="snum">${data.wins}</div>
          <div class="slbl">Wins</div>
        </div>

        <div class="stat-pill">
          <div class="snum">${data.draws}</div>
          <div class="slbl">Draws</div>
        </div>

        <div class="stat-pill">
          <div class="snum">${data.losses}</div>
          <div class="slbl">Losses</div>
        </div>

        <div class="stat-pill">
          <div class="snum">${data.streak}</div>
          <div class="slbl">Best Streak</div>
        </div>

      </div>
    `;

    /* ---------------------------------------------------------
       GAMES
    --------------------------------------------------------- */

    const gamesHtml = data.games.length
      ? data.games.map(g => `

        <div class="draw-card ${resultClass(g.result)}">

          <div>
            <div class="draw-round">
              ${g.round}
            </div>

            <div class="draw-date">
              ${g.date}${g.time ? ' · ' + g.time : ''}
            </div>
          </div>

          <div>
            <div class="draw-opponent">
              ${g.opponent}
            </div>

            <div class="draw-venue">
              <i class="fa fa-map-marker-alt"></i>
              ${g.venue || 'Sydney Olympic Park'}
            </div>
          </div>

          <div style="text-align:right">

            <div class="draw-score">
              ${g.score}
            </div>

            <span class="badge ${badgeClass(g.result)}">
              ${badgeLabel(g.result)}
            </span>

          </div>

        </div>

      `).join('')
      : `
        <p style="
          color:rgba(255,255,255,.5);
          text-align:center;
          padding:24px;
        ">
          No draw data available.
        </p>
      `;

    /* ---------------------------------------------------------
       EXTERNAL LINK
    --------------------------------------------------------- */

    const srcUrl = container.dataset.url || '#';

    const linkHtml = `
      <div
        class="draws-link"
        style="text-align:center;margin-top:28px;"
      >

        <a
          href="${srcUrl}"
          target="_blank"
          rel="noopener"
          class="btn-ghost"
        >
          <i class="fa fa-external-link-alt"></i>
          Full Draw on Volleyball NSW
        </a>

      </div>
    `;

    /* ---------------------------------------------------------
       RENDER
    --------------------------------------------------------- */

    container.innerHTML = `

      <div class="section-header light">
        <span class="tag">Live Results</span>
        <h2>${titleOverride}</h2>
      </div>

      ${statsHtml}

      <div class="draws-list">
        ${gamesHtml}
      </div>

      ${linkHtml}

    `;
  }

  /* -----------------------------------------------------------
     ERROR RENDERER
  ----------------------------------------------------------- */

  function renderError(container, err) {

    console.error(
      'Draw widget error:',
      err
    );

    container.innerHTML = `

      <div class="section-header light">
        <span class="tag">Results</span>

        <h2>
          ${container.dataset.title || 'Team Draw'}
        </h2>
      </div>

      <p style="
        color:rgba(255,255,255,.6);
        text-align:center;
        padding:24px 0;
      ">

        Could not load draw data.

        <br><br>

        <a
          href="${container.dataset.url}"
          target="_blank"
          style="color:var(--gold)"
        >
          View on Volleyball NSW →
        </a>

      </p>

    `;
  }

  /* -----------------------------------------------------------
     FETCH
  ----------------------------------------------------------- */

  function fetchDraw(container) {

    const url = container.dataset.url;

    if (!url) {
      return;
    }

    /* ---------------------------------------------------------
       LOADING
    --------------------------------------------------------- */

    container.innerHTML = `

      <div class="section-header light">
        <span class="tag">Live Results</span>

        <h2>
          ${container.dataset.title || 'Loading...'}
        </h2>
      </div>

      <div style="text-align:center;padding:40px 0;">

        <div style="
          display:inline-block;
          width:36px;
          height:36px;
          border:3px solid rgba(245,200,0,.2);
          border-top-color:var(--gold);
          border-radius:50%;
          animation:spin .8s linear infinite;
        "></div>

      </div>
    `;

    fetch(proxyUrl(url))
      .then(response => {

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        return response.text();
      })
      .then(html => {

        if (!html || html.length < 50) {
          throw new Error(
            'Empty response'
          );
        }

        const data = parseDrawPage(html);

        renderWidget(container, data);
      })
      .catch(err => {

        console.warn(
          'Draws fetch failed:',
          err
        );

        renderError(container, err);
      });
  }

  /* -----------------------------------------------------------
     INIT
  ----------------------------------------------------------- */

  function initAll() {

    const widgets = document.querySelectorAll(
      '[data-draws-widget]'
    );

    widgets.forEach(fetchDraw);
  }

  /* -----------------------------------------------------------
     DOM READY
  ----------------------------------------------------------- */

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      initAll
    );
  }
  else {
    initAll();
  }

})();