import { CLUB, COLUMNS, PHOTO_DIR, TESTS } from './config.js';

export function cell(row, aliases) {
  for (const key of aliases) {
    if (row[key] != null && String(row[key]).trim() !== '') return String(row[key]).trim();
  }
  return '';
}

function readResults(row) {
  const results = {};
  for (const t of TESTS) {
    const pre = Number(cell(row, t.pre));
    const post = Number(cell(row, t.post));
    if (Number.isFinite(pre) && Number.isFinite(post)) results[t.key] = { pre, post };
  }
  return results;
}

/** Satu baris CSV = satu anak di satu periode. */
export function toPeriodRow(row) {
  const id = cell(row, COLUMNS.id);
  const rawPeriod = cell(row, COLUMNS.period);
  const period = Number(rawPeriod);
  return {
    name: cell(row, COLUMNS.name).toUpperCase(),
    age: cell(row, COLUMNS.age),
    position: cell(row, COLUMNS.position).toUpperCase(),
    squad: cell(row, COLUMNS.squad).toUpperCase(),
    id,
    photo: cell(row, COLUMNS.photo) || (id ? `${PHOTO_DIR}/${id}.png` : ''),
    attendance: cell(row, COLUMNS.attendance),
    tests: cell(row, COLUMNS.tests),
    injuries: cell(row, COLUMNS.injuries) || '0',
    period: Number.isFinite(period) && period > 0 ? period : 1,
    label: cell(row, COLUMNS.label),
    coach: cell(row, COLUMNS.coach) || CLUB.coach,
    results: readResults(row),
  };
}

export function periodTitle(row) {
  return row.label || `PERIODE ${row.period}`;
}

/** Gabung semua periode per ID, urut 1 → 2 → … */
export function groupPlayers(rows) {
  const map = new Map();
  for (const row of rows) {
    const snap = toPeriodRow(row);
    if (!snap.name || !snap.id) continue;
    if (!map.has(snap.id)) {
      map.set(snap.id, {
        name: snap.name,
        age: snap.age,
        position: snap.position,
        squad: snap.squad,
        id: snap.id,
        photo: snap.photo,
        periods: [],
      });
    }
    const player = map.get(snap.id);
    player.periods.push(snap);
    if (snap.photo) player.photo = snap.photo;
    if (snap.age) player.age = snap.age;
    if (snap.position) player.position = snap.position;
    if (snap.squad) player.squad = snap.squad;
    if (snap.name) player.name = snap.name;
  }

  return [...map.values()].map((player) => {
    player.periods.sort((a, b) => a.period - b.period);
    player.first = player.periods[0];
    player.latest = player.periods[player.periods.length - 1];
    return player;
  });
}

export function listPeriodIds(players) {
  return [...new Set(players.flatMap((p) => p.periods.map((s) => s.period)))].sort((a, b) => a - b);
}

/** Snapshot angka yang ditampil: satu periode, atau jejak (pre P1 → post terakhir). */
export function snapshotFor(player, view) {
  if (view === 'career') {
    const results = {};
    for (const t of TESTS) {
      const pre = player.first.results[t.key]?.pre;
      const post = player.latest.results[t.key]?.post;
      if (Number.isFinite(pre) && Number.isFinite(post)) results[t.key] = { pre, post };
    }
    return {
      ...player.latest,
      name: player.name,
      age: player.age,
      position: player.position,
      squad: player.squad,
      id: player.id,
      photo: player.photo,
      results,
      view: 'career',
      periodFrom: player.first.period,
      periodTo: player.latest.period,
      metaLabel: player.periods.length > 1
        ? `${periodTitle(player.first)} → ${periodTitle(player.latest)}`
        : periodTitle(player.latest),
    };
  }

  const snap = player.periods.find((s) => s.period === view) ?? player.latest;
  return {
    ...snap,
    name: player.name,
    age: player.age,
    position: player.position,
    squad: player.squad,
    id: player.id,
    photo: player.photo,
    view: 'period',
    periodFrom: snap.period,
    periodTo: snap.period,
    metaLabel: periodTitle(snap),
  };
}
