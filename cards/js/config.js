export const CLUB = {
  name:  'BUNNY BALLERS',
  logo:  'assets/logo.png',
  coach: 'COACH BUDI',
};

export const DEFAULT_STYLE = 'A';          // 'A' = Crystal · 'B' = Bunny Ballers
export const DEFAULT_VIEW  = 'career';     // 'career' | nomor periode
export const PHOTO_DIR     = 'assets/photos';
export const PHOTO_EXTS    = ['.png', '.webp', '.jpg', '.jpeg'];
export const DATA_URL      = 'data/players.csv';

/** Nama kolom CSV (Indonesia) + alias spec Inggris. */
export const COLUMNS = {
  name:       ['Nama', 'name'],
  age:        ['Umur', 'age'],
  position:   ['Posisi', 'position'],
  squad:      ['Skuad', 'squad'],
  id:         ['ID', 'id'],
  photo:      ['Foto', 'photo'],
  period:     ['Periode', 'period'],
  label:      ['Label', 'label'],
  attendance: ['Hadir', 'attendance'],
  tests:      ['Tes', 'tests'],
  injuries:   ['Cedera', 'injuries'],
  coach:      ['Coach', 'coach'],
};

/**
 * Definisi tes. Urutan di sini = urutan tampil di kartu.
 * kind 'count' → nilai naik itu membaik, butuh `max`
 * kind 'time'  → nilai turun itu membaik
 * Satu periode: kolom `*_pre` dan `*_post`.
 */
export const TESTS = [
  { key: 'ft',     short: 'FT',     long: 'FREE THROW 10x',  kind: 'count', max: 10,
    pre: ['FT_pre', 'FT_minggu1', 'ft_w1'], post: ['FT_post', 'FT_minggu12', 'ft_w12'] },
  { key: 'layL',   short: 'LAY-L',  long: 'LAYUP KIRI 10x',  kind: 'count', max: 10,
    pre: ['LayupKiri_pre', 'LayupKiri_minggu1', 'layL_w1'],
    post: ['LayupKiri_post', 'LayupKiri_minggu12', 'layL_w12'] },
  { key: 'jump',   short: 'JUMP',   long: 'JUMP SHOT 4M',    kind: 'count', max: 10,
    pre: ['JumpShot_pre', 'JumpShot_minggu1', 'jump_w1'],
    post: ['JumpShot_post', 'JumpShot_minggu12', 'jump_w12'] },
  { key: 'pass',   short: 'PASS',   long: 'CHEST PASS 10x',  kind: 'count', max: 10,
    pre: ['ChestPass_pre', 'ChestPass_minggu1', 'pass_w1'],
    post: ['ChestPass_post', 'ChestPass_minggu12', 'pass_w12'] },
  { key: 'sprint', short: 'SPRINT', long: 'SPRINT 28M',      kind: 'time', target: 5.0,
    pre: ['Sprint28m_pre', 'Sprint28m_minggu1', 'sprint_w1'],
    post: ['Sprint28m_post', 'Sprint28m_minggu12', 'sprint_w12'] },
  { key: 'slide',  short: 'SLIDE',  long: 'DEFENSIVE SLIDE', kind: 'time', target: 11.0,
    pre: ['Slide_pre', 'Slide_minggu1', 'slide_w1'],
    post: ['Slide_post', 'Slide_minggu12', 'slide_w12'] },
];

/**
 * Mode perhitungan growth — lihat README.
 *  'absolute'  → selisih dibagi skala penuh tes
 *  'headroom'  → selisih dibagi ruang yang tersisa di pre
 * TIME_WEIGHT mengangkat bobot tes waktu, yang secara persentase selalu kecil.
 */
export const GROWTH_MODE = 'absolute';
export const TIME_WEIGHT = 2.5;
