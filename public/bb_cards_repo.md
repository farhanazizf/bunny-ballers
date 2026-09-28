# bunny-ballers-cards

```
bunny-ballers-cards/
├── index.html
├── css/
│   └── cards.css
├── js/
│   ├── config.js      # konfigurasi klub + definisi tes
│   ├── growth.js      # perhitungan growth score (pure, testable)
│   ├── csv.js         # parser CSV minimal
│   └── render.js      # template kartu + bootstrap
├── data/
│   └── players.csv    # satu baris per anak — edit di Sheets, export CSV
├── assets/
│   ├── logo.png
│   └── photos/
│       ├── 0114.png
│       ├── 0118.png
│       └── 0121.png
└── README.md
```

---

## `index.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bunny Ballers — Player Cards</title>
<link rel="stylesheet" href="css/cards.css">
</head>
<body>
  <header class="toolbar">
    <h1>Bunny Ballers — Player Cards</h1>
    <div class="actions">
      <button type="button" data-action="print">Cetak / PDF</button>
      <button type="button" data-action="toggle-style">Gaya: A</button>
      <span data-role="count"></span>
    </div>
  </header>

  <main class="grid" data-role="grid" aria-live="polite"></main>

  <script type="module" src="js/render.js"></script>
</body>
</html>
```

---

## `js/config.js`

```js
export const CLUB = {
  name:  'BUNNY BALLERS',
  logo:  'assets/logo.png',
  term:  'T2/2026',
  coach: 'COACH BUDI',
};

export const DEFAULT_STYLE = 'A';          // 'A' = Crystal · 'B' = Bunny Ballers
export const PHOTO_DIR     = 'assets/photos';
export const DATA_URL      = 'data/players.csv';

/**
 * Definisi tes. Urutan di sini = urutan tampil di kartu.
 * kind 'count' → nilai naik itu membaik, butuh `max`
 * kind 'time'  → nilai turun itu membaik
 * Kolom CSV yang dibaca: `${key}_w1` dan `${key}_w12`.
 */
export const TESTS = [
  { key: 'ft',     short: 'FT',     long: 'FREE THROW 10x',  kind: 'count', max: 10 },
  { key: 'layL',   short: 'LAY-L',  long: 'LAYUP KIRI 10x',  kind: 'count', max: 10 },
  { key: 'jump',   short: 'JUMP',   long: 'JUMP SHOT 4M',    kind: 'count', max: 10 },
  { key: 'pass',   short: 'PASS',   long: 'CHEST PASS 10x',  kind: 'count', max: 10 },
  { key: 'sprint', short: 'SPRINT', long: 'SPRINT 28M',      kind: 'time'  },
  { key: 'slide',  short: 'SLIDE',  long: 'DEFENSIVE SLIDE', kind: 'time'  },
];

/**
 * Mode perhitungan growth — lihat README.
 *  'absolute'  → selisih dibagi skala penuh tes
 *  'headroom'  → selisih dibagi ruang yang tersisa di minggu 1
 * TIME_WEIGHT mengangkat bobot tes waktu, yang secara persentase selalu kecil.
 */
export const GROWTH_MODE = 'absolute';
export const TIME_WEIGHT = 2.5;
```

---

## `js/growth.js`

```js
import { TESTS, GROWTH_MODE, TIME_WEIGHT } from './config.js';

/** Skor satu tes, dalam poin 0–100. */
export function testScore(test, w1, w12, mode = GROWTH_MODE) {
  if (test.kind === 'count') {
    const gain = w12 - w1;
    const denom = mode === 'headroom' ? Math.max(test.max - w1, 1) : test.max;
    return (gain / denom) * 100;
  }
  // time: selalu relatif terhadap waktu awal, lalu diberi bobot
  if (!w1) return 0;
  return ((w1 - w12) / w1) * 100 * TIME_WEIGHT;
}

/** Growth score = rata-rata skor semua tes, dibulatkan. */
export function growthScore(player, mode = GROWTH_MODE) {
  const scores = TESTS.map((t) => {
    const r = player.results[t.key];
    return r ? testScore(t, r.w1, r.w12, mode) : 0;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Nilai minggu 12 siap tampil, mis. '7<i>/10</i>' atau '5.2<i>s</i>'. */
export function formatValue(test, player) {
  const r = player.results[test.key];
  if (!r) return '—';
  return test.kind === 'count'
    ? `${r.w12}<i>/${test.max}</i>`
    : `${r.w12.toFixed(1)}<i>s</i>`;
}

/** Delta w1→w12 dengan tanda yang benar per jenis tes. */
export function formatDelta(test, player, withUnit = false) {
  const r = player.results[test.key];
  if (!r) return '';
  if (test.kind === 'count') {
    const d = r.w12 - r.w1;
    return d === 0 ? '±0' : (d > 0 ? `+${d}` : `−${Math.abs(d)}`);
  }
  const d = Number((r.w1 - r.w12).toFixed(1));
  const u = withUnit ? 's' : '';
  return d === 0 ? '±0' : (d > 0 ? `−${d}${u}` : `+${Math.abs(d)}${u}`);
}

export const isImprovement = (test, player) => {
  const r = player.results[test.key];
  if (!r) return false;
  return test.kind === 'count' ? r.w12 > r.w1 : r.w12 < r.w1;
};
```

---

## `js/csv.js`

```js
/**
 * Parser CSV minimal — menangani quoted field dan koma di dalamnya.
 * Cukup untuk export Google Sheets; bukan pengganti PapaParse.
 */
export function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== '')) rows.push(row);

  const [header, ...body] = rows;
  const keys = header.map((h) => h.trim());
  return body.map((r) =>
    Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()]))
  );
}
```

---

## `js/render.js`

```js
import { CLUB, TESTS, DEFAULT_STYLE, PHOTO_DIR, DATA_URL } from './config.js';
import { growthScore, formatValue, formatDelta, isImprovement } from './growth.js';
import { parseCSV } from './csv.js';

/* ---------- data ---------- */

function toPlayer(row) {
  const results = {};
  for (const t of TESTS) {
    const w1 = Number(row[`${t.key}_w1`]);
    const w12 = Number(row[`${t.key}_w12`]);
    if (Number.isFinite(w1) && Number.isFinite(w12)) results[t.key] = { w1, w12 };
  }
  return {
    name: (row.name || '').toUpperCase(),
    age: row.age, position: (row.position || '').toUpperCase(),
    squad: (row.squad || '').toUpperCase(), id: row.id,
    photo: row.photo || `${PHOTO_DIR}/${row.id}.png`,
    attendance: row.attendance, tests: row.tests, injuries: row.injuries || '0',
    results,
  };
}

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

function cardA(p) {
  const g = growthScore(p);
  const node = el(`
    <article class="card card--a">
      <div class="facet facet--1"></div><div class="facet facet--2"></div><div class="facet facet--3"></div>
      <div class="halo"></div>
      <div class="photo-slot photo-slot--a" data-slot="photo"></div>
      <div class="scrim"></div>
      <div class="growth">
        <div class="growth__n"><i>${g >= 0 ? '+' : '−'}</i>${Math.abs(g)}</div>
        <div class="growth__l">GROWTH</div>
      </div>
      <div class="logo-slot logo-slot--a" data-slot="logo"></div>
      <div class="card__bottom">
        <h2 class="card__name ${longName(p.name)}">${p.name}</h2>
        <p class="card__meta">${p.position} · ${p.squad} · ID ${p.id} · ${CLUB.term}</p>
        <div class="rule"></div>
        <div class="stats">
          ${TESTS.map((t) => `
            <div class="stat">
              <div class="stat__k">${t.short}</div>
              <div class="stat__v">${formatValue(t, p)}</div>
              <div class="stat__d ${isImprovement(t, p) ? '' : 'flat'}">${formatDelta(t, p)}</div>
            </div>`).join('')}
        </div>
        <p class="card__foot">DIBANDING HASIL MINGGU 1 SENDIRI · BUKAN PERINGKAT</p>
      </div>
    </article>`);

  mountImage(node.querySelector('[data-slot="photo"]'), p.photo, photoFallback);
  mountImage(node.querySelector('[data-slot="logo"]'), CLUB.logo,
             logoFallback('rgba(210,195,255,.55)', '#c4b2ff'));
  return node;
}

function cardB(p) {
  const g = growthScore(p);
  const node = el(`
    <article class="card card--b">
      <div class="band"></div>
      <div class="logo-slot logo-slot--b" data-slot="logo"></div>
      <div class="photo-slot photo-slot--b" data-slot="photo"></div>
      <div class="growth growth--b">
        <div class="growth__n">${g >= 0 ? '+' : '−'}${Math.abs(g)}</div>
        <div class="growth__l">GROWTH SCORE</div>
      </div>
      <div class="card__bottom card__bottom--b">
        <h2 class="card__name card__name--b ${longName(p.name)}">${p.name}</h2>
        <p class="card__meta card__meta--b">${p.age} TH · ${p.squad} · ${p.position} · ID ${p.id} · ${CLUB.term}</p>
        <div class="rows">
          ${TESTS.map((t) => `
            <div class="row">
              <span class="row__k">${t.long}</span>
              <span class="row__v">${formatValue(t, p)}</span>
              <span class="row__d">${formatDelta(t, p, true)}</span>
            </div>`).join('')}
        </div>
        <p class="card__foot card__foot--b">
          HADIR ${p.attendance} · TES ${p.tests} · CEDERA ${p.injuries} · ${CLUB.coach}<br>
          SEMUA ANGKA DIBANDING HASIL MINGGU 1 ANAK SENDIRI
        </p>
      </div>
    </article>`);

  mountImage(node.querySelector('[data-slot="photo"]'), p.photo, photoFallback);
  mountImage(node.querySelector('[data-slot="logo"]'), CLUB.logo,
             logoFallback('#FF4A0F', '#FF4A0F'));
  return node;
}

/* ---------- bootstrap ---------- */

const grid    = document.querySelector('[data-role="grid"]');
const counter = document.querySelector('[data-role="count"]');
const toggle  = document.querySelector('[data-action="toggle-style"]');

let style = DEFAULT_STYLE;
let players = [];

function render() {
  grid.replaceChildren(...players.map((p) => (style === 'A' ? cardA(p) : cardB(p))));
  toggle.textContent = `Gaya: ${style}`;
  counter.textContent = `${players.length} KARTU`;
}

document.querySelector('[data-action="print"]')
  .addEventListener('click', () => window.print());
toggle.addEventListener('click', () => { style = style === 'A' ? 'B' : 'A'; render(); });

try {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  players = parseCSV(await res.text()).map(toPlayer);
  render();
} catch (err) {
  grid.innerHTML = `<p class="error">Gagal memuat <code>${DATA_URL}</code> — ${err.message}.
    File ini perlu dilayani lewat HTTP (<code>npx serve</code> atau GitHub Pages);
    membuka index.html langsung dari filesystem akan diblokir CORS.</p>`;
  console.error(err);
}
```

---

## `data/players.csv`

```csv
name,age,position,squad,id,photo,attendance,tests,injuries,ft_w1,ft_w12,layL_w1,layL_w12,jump_w1,jump_w12,pass_w1,pass_w12,sprint_w1,sprint_w12,slide_w1,slide_w12
Arya Wicaksana,15,Guard,U-16,0114,,22/24,9/9,0,4,7,3,8,3,5,7,9,5.6,5.2,12.9,11.8
Dimas Pratama,14,Forward,U-16,0118,,24/24,9/9,0,6,8,5,7,4,7,8,9,5.3,5.1,12.2,11.5
Raka Nugroho,16,Center,U-16,0121,,20/24,9/9,1,3,6,2,6,2,4,6,8,6.1,5.5,13.8,12.4
```

Kolom `photo` boleh dikosongkan — otomatis jatuh ke `assets/photos/<id>.png`.

---

## `css/cards.css`

```css
:root{
  --orange:#FF4A0F;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,"Roboto Mono",monospace;
  --sans:"Helvetica Neue",Inter,system-ui,-apple-system,Arial,sans-serif;
  --card-w:340px;
  --card-h:540px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#141414;font-family:var(--sans);color:#fff;padding:32px 20px 70px}

/* ---------- toolbar ---------- */
.toolbar{max-width:1180px;margin:0 auto 34px;border-bottom:1px solid #303030;padding-bottom:16px}
.toolbar h1{font-size:13.5px;letter-spacing:.16em;font-family:var(--mono);
  text-transform:uppercase;font-weight:700}
.actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px}
.actions button{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  background:#242424;border:1px solid #3a3a3a;color:#ddd;padding:9px 13px;border-radius:6px;cursor:pointer}
.actions button:hover{background:#2e2e2e;border-color:#555}
.actions span{font-family:var(--mono);font-size:10px;color:#666;letter-spacing:.1em}
.error{font-family:var(--mono);font-size:12px;color:#ff8a66;line-height:1.8;max-width:620px}
.error code{color:#fff}

/* ---------- grid ---------- */
.grid{max-width:1180px;margin:0 auto;display:flex;gap:34px;flex-wrap:wrap;
  justify-content:center;align-items:flex-start}

/* ---------- shared card ---------- */
.card{width:var(--card-w);height:var(--card-h);position:relative;overflow:hidden;
  border-radius:16px;flex:none}
.photo-slot{position:absolute;z-index:3;overflow:hidden}
.photo-slot img{width:100%;height:100%;object-fit:contain;object-position:bottom;display:block;
  -webkit-mask-image:linear-gradient(to bottom,#000 74%,rgba(0,0,0,.25) 93%,transparent 100%);
          mask-image:linear-gradient(to bottom,#000 74%,rgba(0,0,0,.25) 93%,transparent 100%)}
.photo-slot svg{width:100%;height:100%;display:block}
.logo-slot{position:absolute;z-index:8}
.logo-slot img,.logo-slot svg{width:100%;height:100%;object-fit:contain;display:block}
.card__bottom{position:absolute;left:0;right:0;bottom:18px;z-index:9;padding:0 18px;text-align:center}
.card__name{font-size:26px;font-weight:800;letter-spacing:-.025em;line-height:1.05;white-space:nowrap}
.card__name.long{font-size:21px}

/* ---------- variant A ---------- */
.card--a{background:linear-gradient(168deg,#1a0f38 0%,#2e1668 44%,#120a28 100%);
  border:1px solid rgba(155,120,255,.32);
  box-shadow:0 0 0 1px rgba(255,255,255,.04) inset,0 20px 56px rgba(0,0,0,.65)}
.facet{position:absolute;mix-blend-mode:screen;pointer-events:none}
.facet--1{width:300px;height:300px;top:6px;left:-70px;opacity:.38;
  background:linear-gradient(140deg,#4b3cff,transparent 64%);
  clip-path:polygon(24% 0,100% 14%,76% 100%,0 70%)}
.facet--2{width:250px;height:300px;top:40px;right:-50px;opacity:.34;
  background:linear-gradient(205deg,#00cfff,transparent 60%);
  clip-path:polygon(0 10%,100% 0,84% 86%,12% 100%)}
.facet--3{width:210px;height:210px;top:150px;left:66px;opacity:.2;
  background:linear-gradient(90deg,#9b5cf6,transparent 72%);
  clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)}
.halo{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse 60% 40% at 50% 28%,rgba(255,255,255,.12),transparent 70%)}
.scrim{position:absolute;left:0;right:0;bottom:0;height:300px;pointer-events:none;z-index:5;
  background:linear-gradient(to bottom,rgba(16,9,38,0) 0%,rgba(15,8,36,.55) 26%,
             rgba(13,7,32,.93) 56%,#0c0620 100%)}
.photo-slot--a{top:80px;left:50%;transform:translateX(-50%);width:214px;height:252px}
.logo-slot--a{top:22px;right:22px;width:62px;height:62px}
.growth{position:absolute;top:24px;left:26px;z-index:8}
.growth__n{font-size:56px;font-weight:800;line-height:.84;letter-spacing:-.04em;
  text-shadow:0 4px 22px rgba(0,0,0,.55)}
.growth__n i{font-size:28px;font-style:normal;vertical-align:.34em;font-weight:700}
.growth__l{font-family:var(--mono);font-size:8.5px;letter-spacing:.24em;color:#c4b2ff;margin-top:9px}
.card--a .card__name{text-shadow:0 2px 16px rgba(0,0,0,.7)}
.card__meta{font-family:var(--mono);font-size:8.5px;letter-spacing:.19em;color:#b7a6e8;margin-top:9px}
.rule{height:1px;margin:13px 20px;
  background:linear-gradient(to right,transparent,rgba(190,170,255,.45),transparent)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px 4px}
.stat__k{font-family:var(--mono);font-size:8px;letter-spacing:.15em;color:#ab99e0}
.stat__v{font-size:22px;font-weight:800;letter-spacing:-.03em;line-height:1.22;margin-top:1px}
.stat__v i{font-size:12px;font-style:normal;font-weight:600;opacity:.6}
.stat__d{font-family:var(--mono);font-size:8.5px;font-weight:700;color:#5cf0a0;line-height:1.2}
.stat__d.flat{color:#9a8ac4}
.card__foot{font-family:var(--mono);font-size:7px;letter-spacing:.15em;color:#8878b8;margin-top:15px}

/* ---------- variant B ---------- */
.card--b{background:#0b0b0b;box-shadow:0 20px 56px rgba(0,0,0,.65)}
.band{position:absolute;top:0;left:0;right:0;height:196px;background:var(--orange);z-index:1;
  clip-path:polygon(0 0,100% 0,100% 74%,0 100%)}
.logo-slot--b{top:18px;left:20px;width:52px;height:52px}
.photo-slot--b{top:18px;right:6px;width:158px;height:186px}
.growth--b{top:84px;left:22px;color:#0b0b0b}
.growth--b .growth__n{font-family:var(--mono);font-size:50px;font-weight:700;
  line-height:.88;letter-spacing:-.05em;text-shadow:none}
.growth--b .growth__l{font-family:var(--mono);font-size:8px;letter-spacing:.22em;
  font-weight:700;margin-top:7px;color:inherit}
.card__bottom--b{padding:0 22px;text-align:left}
.card__name--b{font-size:24px}
.card__name--b.long{font-size:19px}
.card__meta--b{color:#8b8b8b}
.rows{margin-top:16px;border-top:1px solid #2b2b2b}
.row{display:grid;grid-template-columns:1fr 66px 48px;align-items:center;
  height:32px;border-bottom:1px solid #1c1c1c}
.row:last-child{border-bottom:none}
.row__k{font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;color:#8b8b8b}
.row__v{font-family:var(--mono);font-size:17px;font-weight:700;color:#fff;
  text-align:right;letter-spacing:-.02em}
.row__v i{font-size:10.5px;font-style:normal;color:#6a6a6a}
.row__d{font-family:var(--mono);font-size:9px;font-weight:700;color:var(--orange);text-align:right}
.card__foot--b{font-family:var(--mono);font-size:7px;letter-spacing:.12em;
  color:#585858;line-height:1.9;margin-top:14px}

/* ---------- print ---------- */
@media print{
  body{background:#fff;padding:0}
  .toolbar{display:none}
  .grid{gap:10px;justify-content:flex-start;max-width:none}
  .card{break-inside:avoid;page-break-inside:avoid;box-shadow:none;margin:5px;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
}
```

---

## `README.md`

````markdown
# Bunny Ballers — Player Cards

Ringkasan satu kartu dari Term Development Report. Static, tanpa build step,
tanpa dependency.

## Menjalankan

```bash
npx serve .          # atau: python3 -m http.server
```

`fetch()` terhadap `data/players.csv` diblokir CORS kalau `index.html` dibuka
langsung dari filesystem (`file://`). Harus lewat HTTP server atau GitHub Pages.

## Alur kerja per term

1. Coach isi hasil tes di Google Sheets.
2. File → Download → CSV, timpa `data/players.csv`.
3. Taruh foto di `assets/photos/<id>.png` — PNG transparan, potret se-dada.
4. Commit, push. GitHub Pages meng-deploy otomatis.

Tombol **Cetak / PDF** menghasilkan kartu siap potong; `print-color-adjust:exact`
menjaga background gelap tetap ikut tercetak.

## Foto

Slot berukuran 214×252 (gaya A) dan 158×186 (gaya B), rata bawah, dengan mask
gradien di 26% bagian bawah supaya potongan dada menyatu ke background.

Crop harus konsisten antar anak, kalau tidak posisi kepala akan naik-turun saat
kartu dijejer. Patokan: potong tepat di bawah siku, sisakan sedikit ruang di
atas kepala.

## Growth score

Rata-rata perbaikan enam tes terhadap hasil minggu 1 **anak itu sendiri**.
Tidak ada angka yang membandingkan satu anak dengan anak lain — ini disengaja
dan sejalan dengan kebijakan report induknya.

Per tes, dalam poin 0–100:

| Jenis | Rumus |
| --- | --- |
| `count` | `(w12 − w1) / max × 100` |
| `time`  | `(w1 − w12) / w1 × 100 × TIME_WEIGHT` |

Growth score = rata-rata keenamnya, dibulatkan.

### `TIME_WEIGHT`

Perbaikan waktu selalu kecil secara persentase — sprint 5.6s→5.2s hanya 7,1 poin,
sementara layup +5/10 langsung 50 poin. Tanpa bobot, growth score praktis hanya
mencerminkan empat tes skill. Default `2.5` mengangkat tes waktu ke rentang yang
sebanding. Set ke `1` untuk mematikannya.

### `GROWTH_MODE`

- **`absolute`** (default) — selisih dibagi skala penuh tes. Anak yang sudah
  9/10 di minggu 1 maksimal hanya bisa menyumbang 10 poin dari tes itu, jadi
  anak yang sudah bagus cenderung dapat growth kecil.
- **`headroom`** — selisih dibagi ruang yang tersisa (`max − w1`). Anak 9/10
  yang naik ke 10/10 dapat 100 poin penuh. Lebih adil untuk anak yang sudah
  mendekati plafon, tapi jadi sangat sensitif — naik satu angka dari 9 ke 10
  setara dengan naik lima angka dari 0 ke 5.

Keduanya defensible. `absolute` lebih mudah dijelaskan ke orang tua; `headroom`
lebih baik kalau banyak anak sudah mendekati nilai penuh.

## Mengubah daftar tes

Edit `TESTS` di `js/config.js`, lalu sesuaikan header kolom CSV
(`<key>_w1`, `<key>_w12`). Kartu, perhitungan, dan label ikut menyesuaikan —
tidak ada yang hardcoded di template.

## Struktur

| File | Isi |
| --- | --- |
| `js/config.js` | satu-satunya file yang rutin disentuh |
| `js/growth.js` | fungsi murni, tanpa DOM — gampang di-unit test |
| `js/csv.js` | parser minimal, cukup untuk export Sheets |
| `js/render.js` | template kartu + bootstrap |
````
````

