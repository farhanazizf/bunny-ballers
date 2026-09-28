import { TESTS, GROWTH_MODE, TIME_WEIGHT } from './config.js';

export function hasPair(result) {
  return result != null && result.pre != null && result.post != null;
}

export function hasClosedResults(snapshot) {
  return TESTS.some((t) => hasPair(snapshot.results[t.key]));
}

/** Skor satu tes, dalam poin 0–100. pre → post. */
export function testScore(test, pre, post, mode = GROWTH_MODE) {
  if (pre == null || post == null) return 0;
  if (test.kind === 'count') {
    const gain = post - pre;
    const denom = mode === 'headroom' ? Math.max(test.max - pre, 1) : test.max;
    return (gain / denom) * 100;
  }
  if (!pre) return 0;
  return ((pre - post) / pre) * 100 * TIME_WEIGHT;
}

/** Rata-rata tes yang sudah pre+post. Null kalau baru pre saja. */
export function growthScore(snapshot, mode = GROWTH_MODE) {
  const scores = [];
  for (const t of TESTS) {
    const r = snapshot.results[t.key];
    if (hasPair(r)) scores.push(testScore(t, r.pre, r.post, mode));
  }
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Skor 0–100 dari satu tes pre (bukan growth). */
export function startScore(test, pre) {
  if (pre == null) return null;
  if (test.kind === 'count') return (pre / test.max) * 100;
  if (!pre || test.target == null) return null;
  return Math.min((test.target / pre) * 100, 100);
}

/** Rata-rata skor awal dari semua tes yang punya pre. */
export function baselineScore(snapshot) {
  const scores = [];
  for (const t of TESTS) {
    const s = startScore(t, snapshot.results[t.key]?.pre);
    if (s != null) scores.push(s);
  }
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Growth kalau post ada; kalau belum, skor awal dari pre. */
export function headline(snapshot) {
  const growth = growthScore(snapshot);
  if (growth != null) return { kind: 'growth', value: growth };
  return { kind: 'start', value: baselineScore(snapshot) };
}

export function formatSigned(n) {
  if (n == null) return '—';
  return `${n >= 0 ? '+' : '−'}${Math.abs(n)}`;
}

function shownValue(result) {
  if (!result) return null;
  return result.post != null ? result.post : result.pre;
}

/** Nilai tampil: post kalau ada, kalau belum ya pre. */
export function formatValue(test, snapshot) {
  const r = snapshot.results[test.key];
  const value = shownValue(r);
  if (value == null) return '—';
  const pending = r.post == null;
  if (test.kind === 'count') {
    return pending ? `${value}<i>pre</i>` : `${value}<i>/${test.max}</i>`;
  }
  const n = Number(value).toFixed(1);
  return pending ? `${n}<i>pre</i>` : `${n}<i>s</i>`;
}

/** Delta pre→post. Kosong kalau post belum ada. */
export function formatDelta(test, snapshot, withUnit = false) {
  const r = snapshot.results[test.key];
  if (!hasPair(r)) {
    const s = startScore(test, r?.pre);
    return s == null ? '' : `${Math.round(s)}`;
  }
  if (test.kind === 'count') {
    const d = r.post - r.pre;
    return d === 0 ? '±0' : (d > 0 ? `+${d}` : `−${Math.abs(d)}`);
  }
  const d = Number((r.pre - r.post).toFixed(1));
  const u = withUnit ? 's' : '';
  return d === 0 ? '±0' : (d > 0 ? `−${d}${u}` : `+${Math.abs(d)}${u}`);
}

export const isImprovement = (test, snapshot) => {
  const r = snapshot.results[test.key];
  if (!hasPair(r)) return false;
  return test.kind === 'count' ? r.post > r.pre : r.post < r.pre;
};
