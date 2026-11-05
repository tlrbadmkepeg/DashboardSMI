# Portal Sistem Manajemen Integrasi BPSDMP

Mutu Layanan • Integritas • Pendidikan • Perbaikan Berkelanjutan

Pusat informasi, dokumentasi, dan monitoring SMI (SNI ISO 9001:2015, ISO 37001:2025, ISO 21001:2025) Badan Pengembangan Sumber Daya Manusia Perdagangan, Kementerian Perdagangan.

## Akses

- Portal langsung terbuka tanpa login. Pengunjung membaca seluruh informasi yang telah disetujui untuk publikasi.
- Tombol **Login** kecil di kanan atas hanya untuk PIC unit kerja, verifikator, dan administrator (Supabase Auth). Setelah login muncul menu **Pengelolaan**; setelah logout pengguna tetap berada di portal.
- Pengunjung membaca capaian dari view `publik_realisasi_smi` (hanya laporan terverifikasi, tanpa kendala, catatan, dan bukti). Tabel operasional tidak dibuka untuk anonim.

## Konten portal dan dokumen resmi

Isi khusus BPSDMP (teks Kebijakan Mutu, ruang lingkup, struktur organisasi, SK Tim SMI, peta proses, SOP, register risiko, kegiatan, audit) **tidak ditulis di kode**. Semuanya dibaca dari tabel konten yang diusulkan di `supabase/usulan_migrasi_portal.sql`. Selama tabel belum dibuat atau kosong, halaman menampilkan status "menunggu dokumen resmi". Berkas SQL tersebut adalah usulan dan belum dijalankan.

Konten tetap yang ada di `src/content/portal.ts` hanya: identitas portal, ringkasan tujuh komitmen kebijakan dari pemilik portal, redaksi pembaruan Sasaran 3 dan 4 (untuk pembandingan, bukan pengganti data), dan penjelasan umum konsep ISO.

React + TypeScript + Tailwind CSS + komponen pola shadcn/ui + Lucide + Recharts + Supabase.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local      # isi VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev                      # http://localhost:5173
```

Gunakan publishable key (`sb_publishable_…`) atau anon key. Service role key dan secret key tidak boleh dimasukkan ke frontend.

## Menerbitkan sebagai website mandiri

```bash
npm run build                    # hasil di folder dist/
```

Folder `dist/` adalah situs statis. Navigasi memakai hash (`#/sasaran`), sehingga tidak memerlukan aturan rewrite. Pilihan hosting:

- **Vercel / Netlify / Cloudflare Pages**: hubungkan repositori, perintah build `npm run build`, folder keluaran `dist`, tambahkan variabel `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di pengaturan proyek.
- **Server instansi (Nginx/Apache)**: salin isi `dist/` ke direktori web.

Setelah domain ditetapkan, tambahkan domain tersebut di Supabase › Authentication › URL Configuration.

## Langkah pertama setelah login

1. Masuk dengan akun `admin` atau `verifikator`.
2. Buka **Pengaturan › Pemeriksaan skema basis data** dan jalankan pemeriksaan.
3. Bila ada kolom yang ditandai ✕, sesuaikan urutan kandidat nama kolom di `src/config/schema.ts`. Seluruh nama tabel, kolom, fungsi RPC, dan pola jalur Storage berada di berkas itu saja.

Aplikasi tidak membuat, mengubah, atau menghapus tabel maupun kebijakan RLS.

## Struktur kode

| Folder | Isi |
|---|---|
| `src/config` | Lingkungan, pemetaan skema Supabase, peran dan hak menu |
| `src/auth` | Sesi dan profil pengguna (Supabase Auth + `profil_pengguna`) |
| `src/services` | Pengambilan data, normalisasi kolom, alur kerja RPC, akses berkas privat, ekspor, pemeriksaan skema |
| `src/domain` | Perhitungan indikator dan penyusun laporan |
| `src/components/ui` | Komponen dasar pola shadcn/ui (Button, Card, Badge, Dialog, Form, Toast) |
| `src/components/charts` | Donut, tren, target vs realisasi, unit kerja, heatmap, sparkline |
| `src/content` | Konten tetap portal (identitas, komitmen, konsep umum) |
| `src/components/portal` | Diagram pilar, alur kebijakan, PDCA, keadaan menunggu dokumen |
| `src/pages` | Beranda, Tentang, Kebijakan & Sasaran, Organisasi, Dokumen & SOP, Konteks, Risiko, Monitoring, Audit, Kegiatan, Pengelolaan |
| `supabase/` | Usulan migrasi tabel konten, view publikasi, dan RLS |

Komponen `ui` ditulis mengikuti pola shadcn/ui (cva + tailwind-merge) tanpa ketergantungan Radix agar ringan. Komponen resmi dapat ditambahkan kapan saja dengan `npx shadcn@latest add <komponen>`.

## Alur kerja dan keamanan

- Login hanya melalui Supabase Auth. Akun tanpa profil atau dengan status tidak aktif langsung dikeluarkan.
- PIC menyimpan draft dengan INSERT/UPDATE biasa (hanya untuk status Draft dan Perlu perbaikan), lalu mengajukan melalui `ajukan_realisasi_smi`.
- Verifikator memutuskan melalui `verifikasi_realisasi_smi`. Tidak ada UPDATE langsung ke kolom status dari browser.
- Bukti dukung disimpan di bucket privat `bukti-smi` dan dibuka dengan `createSignedUrl` berumur 5 menit.
- Menu disaring per peran untuk kenyamanan; batas akses data tetap ditegakkan oleh RLS.

## Metode perhitungan

- Status unit = laporan terakhir pada tahun terpilih s.d. bulan terpilih. Bawaan: hanya laporan terverifikasi.
- Memenuhi bila realisasi mencapai target; mendekati bila rasio 90–99,9%; di bawah target bila < 90%.
- Gabungan antarunit: Σ pembilang ÷ Σ penyebut untuk persentase; rata-rata nilai unit untuk indikator lain termasuk indeks.
- Indeks kepuasan (0–4) tidak pernah dirata-ratakan dengan persentase. Ringkasan lintas sasaran memakai jumlah sasaran yang memenuhi target dan rasio realisasi terhadap target.

## Kebutuhan backend yang perlu dikonfirmasi

1. **Status penyelesaian tindak lanjut** — belum ada kolomnya; aplikasi tidak menganggap tindak lanjut selesai hanya karena laporan terverifikasi.
2. **Riwayat verifikasi** — belum ada tabelnya; yang tampil hanya keputusan dan catatan terakhir.
3. **Nama parameter RPC** — aplikasi memakai `p_realisasi_id`, `p_keputusan`, `p_catatan`.
4. **Kebijakan Storage** — jalur unggah `{unit_id}/{tahun}/{bulan}/{realisasi_id}/{berkas}`.
5. **Kebijakan INSERT/UPDATE draft** untuk PIC dan INSERT `bukti_dukung`.

## Logo

Aplikasi tidak menyertakan logo tiruan. Letakkan berkas logo resmi di `public/` lalu isi `VITE_LOGO_URL=/nama-berkas.png`.

## Pratinjau desain

`preview/dashboard-smi-pratinjau.html` adalah versi pratinjau dengan data ilustrasi (`VITE_ENABLE_DESIGN_PREVIEW=true`). Mode ini tidak terhubung ke Supabase dan tidak boleh diaktifkan di produksi.

## Konten dokumen resmi PM.SMI (Rev. 1/0, 22 Juni 2026)

Isi 13 dokumen terkendali (PM.SMI.L1–L12 dan L14) ditranskripsi ke `src/content/resmi/`:

| Berkas | Dokumen | Dipakai di |
| --- | --- | --- |
| `dokumen.ts` | L1 ruang lingkup, L2 kebijakan, L3 18 sasaran, daftar dokumen | Kebijakan, Tentang, Sasaran, Dokumen, Konteks › Ruang Lingkup |
| `organisasi.ts` | L1/L6/L7/L8/L10/L12 per unit, L5 tata kelola, L6 peta proses | Organisasi, Profil Unit |
| `konteks.ts` | L7 isu & SWOT, L8 pemangku kepentingan, L9 persyaratan peraturan | Konteks |
| `risiko.ts` | L10 register risiko/peluang, L11 benturan kepentingan, L14 rencana FKAP | Risiko & FKAP, Kegiatan |
| `komunikasi.ts` | L12 matriks komunikasi | Organisasi › Matriks Komunikasi |
| `kegiatan.ts` | Kegiatan yang dicatat langsung (kerja sama BPSDMP–BSN, 16 Okt 2026) | Kegiatan, Beranda |

Aturan: bila tabel portal di Supabase sudah berisi data, data basis data selalu didahulukan; isi dokumen resmi
menjadi cadangan dan selalu diberi label sumber (kode · revisi · tanggal). Rincian skenario risiko penyuapan
(RP-01..RP-08) dan paparan per unit hanya tampil untuk petugas yang login. Halaman Sasaran membandingkan redaksi
dan target `sasaran_smi` dengan PM.SMI.L3.2026 dan hanya menampilkan catatan konfirmasi; data tidak diubah.

Catatan: bagan PM.SMI.L4.2026 berupa gambar sehingga belum ditranskripsi; PM.SMI.L13 tidak termasuk berkas yang diterima.
Foto kegiatan belum tersedia: unggah dokumentasi milik BPSDMP lalu isi `fotoUrl` di `kegiatan.ts` atau kolom `foto_url` tabel `kegiatan_smi`.


## Revisi tampilan dan substansi (Oktober 2026)

- Desain: palet navy #142D4E, royal blue #2563EB, teal #0F766E, soft gold #D9A441; judul memakai Plus Jakarta Sans.
- Status capaian hanya tiga: memenuhi target, belum memenuhi target, belum dilaporkan (tidak ada kategori "mendekati").
- Pemetaan sasaran–unit dibaca dari `kontribusi_unit`; `src/content/resmi/pemetaan.ts` memuat pemetaan yang ditetapkan
  (kode PUS01–PUS03, BAL01–BAL05, AKMET) dan halaman Sasaran menampilkan peringatan sinkronisasi bila tabel berbeda.
- Pratinjau secara bawaan tidak memuat realisasi apa pun ("Belum dilaporkan"). DATA SIMULASI hanya muncul bila dinyalakan
  dan diberi label pada setiap grafik. Mode operasional (Supabase) tidak pernah memakai data simulasi.
- Login pratinjau memakai akun uji `pic@pratinjau.smi`, `verifikator@pratinjau.smi`, `admin@pratinjau.smi` (kata sandi bebas).
- Audit: `/audit` (ringkasan), `/audit/tindak-lanjut` (progres, batas waktu, register), `/audit/temuan/:id` (detail, khusus petugas).
  View `publik_ringkasan_audit` pada usulan SQL kini juga menghitung status Belum dimulai, Dalam proses, dan Menunggu verifikasi.


## Logo dan diagram resmi (Oktober 2026)

- `public/brand/logo-kemendag.png` dan `logo-kemendag-simbol.png`: logo resmi yang diunggah pemilik portal; latar papan catur
  pada berkas sumber dibuat transparan tanpa mengubah bentuk atau proporsi. Dapat diganti melalui `VITE_LOGO_URL`.
- `public/diagram/`: gambar asli PM.SMI.L4.2026 (struktur organisasi), PM.SMI.L5.2026 (tata kelola SMI), dan PM.SMI.L6-2026
  (peta proses). Ditampilkan dengan penampil yang mendukung zoom, geser, layar penuh, unduh, dan area klik.
  Untuk ketajaman lebih baik saat diperbesar, ganti berkas dengan ekspor resolusi tinggi dari dokumen asli (nama berkas sama).
