import { CLUB, TESTS, DEFAULT_STYLE, DEFAULT_VIEW, DATA_URL } from './config.js';
import { growthScore, formatValue, formatDelta, formatSigned, isImprovement } from './growth.js';
import { groupPlayers, listPeriodIds, periodTitle, snapshotFor } from './players.js';
import { parseCSV } from './csv.js';
import { downloadAll, downloadCard, printCards } from './export.js';

/* ---------- fallback grafis ---------- */

const logoFallback = (stroke, accent) => `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${CLUB.name}">
  <circle cx="32" cy="32" r="29" fill="none" stroke="${stroke}" stroke-width="1.5"/>
  <text x="32" y="30" text-anchor="middle" font-family="monospace" font-size="17"
        font-weight="700" fill="#fff">BB</text>
  <text x="32" y="43" text-anchor="middle" font-family="monospace" font-size="6"
        fill="${accent}" letter-spacing="1.4">BALLERS</text>
</svg>`;

const photoFallback = `
<svg viewBox="0 0 214 252" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto belum tersedia">
  <g opacity=".4" fill="#fff">
    <ellipse cx="107" cy="58" rx="33" ry="38"/>
    <path d="M107 102c-15 0-27 3-38 9-14 8-22 21-24 38l-10 103h144l-10-103c-2-17-10-30-24-38-11-6-23-9-38-9z"/>
  </g>
  <text x="107" y="246" text-anchor="middle" font-family="monospace" font-size="9"
        fill="rgba(255,255,255,.5)" letter-spacing="1.5">FOTO BELUM ADA</text>
</svg>`;

function mountImage(slot, src, fallbackSVG) {
  if (!src) { slot.innerHTML = fallbackSVG; return; }
  const img = new Image();
  img.alt = '';
  img.crossOrigin = 'anonymous';
  img.addEventListener('error', () => { slot.innerHTML = fallbackSVG; }, { once: true });
  img.src = src;
  slot.replaceChildren(img);
}

/* ---------- template ---------- */

const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

const longName = (n) => (n.length > 15 ? 'long' : '');

function periodTrack(player, view) {
  if (player.periods.length < 2) return '';
  const parts = player.periods.map((snap) => {
    const g = growthScore(snap);
    const on = view !== 'career' && view === snap.period;
    return `<span class="${on ? 'on' : ''}">P${snap.period} ${formatSigned(g)}</span>`;
  });
  return `<div class="track">${parts.join('<i></i>')}</div>`;
}

function growthCaption(snap) {
  if (snap.view === 'career' && snap.periodFrom !== snap.periodTo) {
    return 'JEJAK PRE P1 → POST TERAKHIR';
  }
  return 'GROWTH PRE → POST';
}

function footNote(snap) {
  if (snap.view === 'career' && snap.periodFrom !== snap.periodTo) {
    return 'ANGKA POST TERAKHIR · DELTA DARI PRE PERIODE PERTAMA · BUKAN PERINGKAT';
  }
  return 'PRE → POST PERIODE INI · DIBANDING DIRI SENDIRI · BUKAN PERINGKAT';
}

function cardA(player, view) {
  const snap = snapshotFor(player, view);
  const g = growthScore(snap);
  const node = el(`
    <article class="card card--a">
      <div class="facet facet--1"></div><div class="facet facet--2"></div><div class="facet facet--3"></div>
      <div class="halo"></div>
      <div class="photo-slot photo-slot--a" data-slot="photo"></div>
      <div class="scrim"></div>
      <div class="growth">
        <div class="growth__n"><i>${g >= 0 ? '+' : '−'}</i>${Math.abs(g)}</div>
        <div class="growth__l">${growthCaption(snap)}</div>
      </div>
      <div class="logo-slot logo-slot--a" data-slot="logo"></div>
      <div class="card__bottom">
        <h2 class="card__name ${longName(snap.name)}">${snap.name}</h2>
        <p class="card__meta">${snap.position} · ${snap.squad} · ID ${snap.id} · ${snap.metaLabel}</p>
        ${periodTrack(player, view)}
        <div class="rule"></div>
        <div class="stats">
          ${TESTS.map((t) => `
            <div class="stat">
              <div class="stat__k">${t.short}</div>
              <div class="stat__v">${formatValue(t, snap)}</div>
              <div class="stat__d ${isImprovement(t, snap) ? '' : 'flat'}">${formatDelta(t, snap)}</div>
            </div>`).join('')}
        </div>
        <p class="card__foot">${footNote(snap)}</p>
      </div>
    </article>`);

  mountImage(node.querySelector('[data-slot="photo"]'), snap.photo, photoFallback);
  mountImage(node.querySelector('[data-slot="logo"]'), CLUB.logo,
             logoFallback('rgba(210,195,255,.55)', '#c4b2ff'));
  return tagCard(node, snap);
}

function cardB(player, view) {
  const snap = snapshotFor(player, view);
  const g = growthScore(snap);
  const node = el(`
    <article class="card card--b">
      <div class="band"></div>
      <div class="logo-slot logo-slot--b" data-slot="logo"></div>
      <div class="photo-slot photo-slot--b" data-slot="photo"></div>
      <div class="growth growth--b">
        <div class="growth__n">${formatSigned(g)}</div>
        <div class="growth__l">${growthCaption(snap)}</div>
      </div>
      <div class="card__bottom card__bottom--b">
        <h2 class="card__name card__name--b ${longName(snap.name)}">${snap.name}</h2>
        <p class="card__meta card__meta--b">${snap.age} TH · ${snap.squad} · ${snap.position} · ID ${snap.id} · ${snap.metaLabel}</p>
        ${periodTrack(player, view)}
        <div class="rows">
          ${TESTS.map((t) => `
            <div class="row">
              <span class="row__k">${t.long}</span>
              <span class="row__v">${formatValue(t, snap)}</span>
              <span class="row__d">${formatDelta(t, snap, true)}</span>
            </div>`).join('')}
        </div>
        <p class="card__foot card__foot--b">
          HADIR ${snap.attendance} · TES ${snap.tests} · CEDERA ${snap.injuries} · ${snap.coach}<br>
          ${footNote(snap)}
        </p>
      </div>
    </article>`);

  mountImage(node.querySelector('[data-slot="photo"]'), snap.photo, photoFallback);
  mountImage(node.querySelector('[data-slot="logo"]'), CLUB.logo,
             logoFallback('#FF4A0F', '#FF4A0F'));
  return tagCard(node, snap);
}

function tagCard(node, snap) {
  node.dataset.id = snap.id;
  node.dataset.name = snap.name;
  return node;
}

function wrapCard(node) {
  const wrap = el(`
    <div class="card-wrap">
      <div class="card-export" data-role="export">
        <button type="button" data-export="png">PNG</button>
        <button type="button" data-export="jpeg">JPG</button>
        <button type="button" data-export="pdf">PDF</button>
      </div>
    </div>`);
  wrap.prepend(node);
  wrap.querySelector('[data-export="png"]').addEventListener('click', () => runExport(node, 'png'));
  wrap.querySelector('[data-export="jpeg"]').addEventListener('click', () => runExport(node, 'jpeg'));
  wrap.querySelector('[data-export="pdf"]').addEventListener('click', () => printCards(node));
  return wrap;
}

async function runExport(card, type) {
  try {
    await downloadCard(card, type, view);
  } catch (err) {
    console.error(err);
    counter.textContent = 'Gagal unduh. Coba refresh, atau cek koneksi (butuh CDN).';
  }
}

/* ---------- bootstrap ---------- */

const grid    = document.querySelector('[data-role="grid"]');
const counter = document.querySelector('[data-role="count"]');
const toggle  = document.querySelector('[data-action="toggle-style"]');
const views   = document.querySelector('[data-role="views"]');

let style = DEFAULT_STYLE;
let view = DEFAULT_VIEW;
let players = [];

function visiblePlayers() {
  if (view === 'career') return players;
  return players.filter((p) => p.periods.some((s) => s.period === view));
}

function render() {
  const list = visiblePlayers();
  grid.replaceChildren(...list.map((p) => wrapCard(style === 'A' ? cardA(p, view) : cardB(p, view))));
  toggle.textContent = `Gaya: ${style}`;
  counter.textContent = `${list.length} KARTU`;
  views.querySelectorAll('[data-view]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.view === String(view)));
  });
}

function mountViewButtons(ids) {
  const buttons = [
    { value: 'career', label: 'Jejak' },
    ...ids.map((n) => {
      const sample = players.find((p) => p.periods.some((s) => s.period === n));
      const row = sample?.periods.find((s) => s.period === n);
      return { value: String(n), label: row ? periodTitle(row) : `Periode ${n}` };
    }),
  ];
  views.replaceChildren(...buttons.map(({ value, label }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.view = value;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      view = value === 'career' ? 'career' : Number(value);
      render();
    });
    return btn;
  }));
}

document.querySelector('[data-action="print"]').addEventListener('click', () => printCards());
document.querySelector('[data-action="png-all"]').addEventListener('click', async (ev) => {
  const btn = ev.currentTarget;
  btn.disabled = true;
  try {
    await downloadAll([...grid.querySelectorAll('.card')], 'png', view, (msg) => {
      counter.textContent = msg || `${visiblePlayers().length} KARTU`;
    });
  } catch (err) {
    console.error(err);
    counter.textContent = 'Gagal unduh semua. Coba satu per satu.';
  } finally {
    btn.disabled = false;
  }
});
toggle.addEventListener('click', () => { style = style === 'A' ? 'B' : 'A'; render(); });

try {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  players = groupPlayers(parseCSV(await res.text()));
  mountViewButtons(listPeriodIds(players));
  render();
} catch (err) {
  grid.innerHTML = `<p class="error">Gagal memuat <code>${DATA_URL}</code> — ${err.message}.
    File ini perlu dilayani lewat HTTP (<code>npx serve</code> atau GitHub Pages);
    membuka index.html langsung dari filesystem akan diblokir CORS.</p>`;
  console.error(err);
}
