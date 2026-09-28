# Bunny Ballers — Player Cards

Ringkasan satu kartu dari Term Development Report. Static, tanpa build step,
tanpa dependency. Tidak masuk routing situs marketing.

## Menjalankan

Dari root repo:

```bash
npm run cards
```

Atau dari folder ini: `npx serve .`

`fetch()` terhadap `data/players.csv` diblokir CORS kalau `index.html` dibuka
langsung dari filesystem (`file://`).

## Isi data

Buka `data/players.csv` di Sheets / Excel. **Jangan ubah nama kolom header.**
Baris yang diawali `#` hanya petunjuk, tidak jadi kartu.

| Kolom | Isi | Contoh |
| --- | --- | --- |
| Nama | nama lengkap | Arya Wicaksana |
| Umur | tahun | 15 |
| Posisi | Guard / Forward / Center | Guard |
| Skuad | kelompok umur | U-16 |
| ID | 4 digit; mengikat jejak antar periode | 0114 |
| Foto | kosong, atau path | _(kosong)_ |
| Periode | angka urut | 1 lalu 2 |
| Label | nama di kartu | T1/2026 |
| Hadir / Tes / Cedera | per periode itu | 22/24 · 9/9 · 0 |
| `*_pre` / `*_post` | tes awal & akhir periode | FT 4 → 7 |

Satu anak boleh banyak baris (periode 1, 2, 3, …) selama **ID sama**. Toolbar **Jejak** membandingkan pre periode pertama ke post terakhir. Tombol periode menampilkan pre→post periode itu saja.

Waktu pakai titik (`5.6`), bukan koma (`5,6`).

## Alur kerja per periode

1. Tambah baris baru (jangan timpa periode lama).
2. Isi `Periode` = 2, 3, … plus pre/post.
3. Taruh foto di `assets/photos/<ID>.png` bila belum ada.
4. `npm run cards`, refresh, Cetak / PDF.

## Foto

Slot 214×252 (gaya A) dan 158×186 (gaya B). Kolom `photo` kosong jatuh ke
`assets/photos/<id>.png`. Tanpa file, kartu pakai placeholder.

## Config

Edit `js/config.js` untuk coach, daftar tes, `GROWTH_MODE`, dan `TIME_WEIGHT`.
Label periode diisi di CSV (`Label`), bukan di config.
