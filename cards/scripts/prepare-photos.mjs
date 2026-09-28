/**
 * Hapus background foto (JPG/WebP/PNG) → PNG transparan.
 *
 * Taruh file mentah di cards/assets/photos/raw/0114.jpg
 * (nama file = ID anak), lalu:
 *
 *   npm run cards:photos
 *
 * Hasil: cards/assets/photos/0114.png
 * Model diunduh sekali di run pertama.
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { extname, join, parse, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const RAW = join(ROOT, 'assets/photos/raw');
const OUT = join(ROOT, 'assets/photos');
const FORCE = process.argv.includes('--force');
const RAW_EXTS = new Set(['.jpg', '.jpeg', '.webp', '.png']);

let removeBackground;
try {
  ({ removeBackground } = await import('@imgly/background-removal-node'));
} catch {
  console.error('Install dulu: npm i -D @imgly/background-removal-node');
  process.exit(1);
}

await mkdir(RAW, { recursive: true });
await mkdir(OUT, { recursive: true });

const files = (await readdir(RAW)).filter((name) => RAW_EXTS.has(extname(name).toLowerCase()));
if (!files.length) {
  console.log(`Tidak ada foto di ${RAW}`);
  console.log('Taruh 0114.jpg (nama = ID) lalu jalankan lagi.');
  process.exit(0);
}

const existing = new Set(await readdir(OUT));

for (const name of files) {
  const id = parse(name).name;
  const dest = join(OUT, `${id}.png`);
  if (!FORCE && existing.has(`${id}.png`)) {
    console.log(`lewati ${id}.png (sudah ada, pakai --force untuk timpa)`);
    continue;
  }

  console.log(`proses ${name} → ${id}.png`);
  const blob = await removeBackground(join(RAW, name), {
    model: 'medium',
    output: { format: 'image/png', quality: 1 },
  });
  await writeFile(dest, Buffer.from(await blob.arrayBuffer()));
}

console.log('Selesai. Refresh npm run cards.');
