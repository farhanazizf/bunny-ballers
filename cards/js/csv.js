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

  const dataRows = rows.filter((r) => !String(r[0] ?? '').trim().startsWith('#'));
  const [header, ...body] = dataRows;
  const keys = header.map((h) => h.trim());
  return body
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])))
    .filter((row) => Object.values(row).some((v) => v !== ''));
}
