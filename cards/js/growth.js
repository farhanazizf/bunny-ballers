import { TESTS, GROWTH_MODE, TIME_WEIGHT } from './config.js';

/** Skor satu tes, dalam poin 0–100. pre → post. */
export function testScore(test, pre, post, mode = GROWTH_MODE) {
  if (test.kind === 'count') {
    const gain = post - pre;
    const denom = mode === 'headroom' ? Math.max(test.max - pre, 1) : test.max;
    return (gain / denom) * 100;
  }
  if (!pre) return 0;
  return ((pre - post) / pre) * 100 * TIME_WEIGHT;
}

/** Growth score = rata-rata skor semua tes, dibulatkan. */
export function growthScore(snapshot, mode = GROWTH_MODE) {
  const scores = TESTS.map((t) => {
    const r = snapshot.results[t.key];
    return r ? testScore(t, r.pre, r.post, mode) : 0;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function formatSigned(n) {
  return `${n >= 0 ? '+' : '−'}${Math.abs(n)}`;
}

/** Nilai post siap tampil, mis. '7<i>/10</i>' atau '5.2<i>s</i>'. */
export function formatValue(test, snapshot) {
  const r = snapshot.results[test.key];
  if (!r) return '—';
  return test.kind === 'count'
    ? `${r.post}<i>/${test.max}</i>`
    : `${r.post.toFixed(1)}<i>s</i>`;
}

/** Delta pre→post dengan tanda yang benar per jenis tes. */
export function formatDelta(test, snapshot, withUnit = false) {
  const r = snapshot.results[test.key];
  if (!r) return '';
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
  if (!r) return false;
  return test.kind === 'count' ? r.post > r.pre : r.post < r.pre;
};
