-- =====================================================================
-- USULAN MIGRASI — PORTAL SMI BPSDMP
-- STATUS: USULAN. BELUM DIJALANKAN. Jalankan hanya setelah disetujui.
--
-- Prinsip:
--   * Tidak mengubah atau menghapus tabel dan kebijakan RLS yang sudah ada.
--   * Pengunjung anonim TIDAK membaca tabel operasional. Capaian publik
--     dibaca dari view yang hanya memuat laporan terverifikasi.
--   * Konten portal hanya terlihat oleh anonim bila status_publikasi = 'dipublikasikan'.
--   * Data sensitif (temuan audit rinci, register risiko penyuapan, identitas
--     pelapor) tidak pernah dibuka kepada anonim.
--
-- Sesuaikan nama kolom profil_pengguna (id, peran, aktif) dan realisasi_bulanan
-- dengan skema yang berlaku sebelum menjalankan.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Fungsi bantu peran (membaca profil_pengguna, bukan klaim dari klien)
-- ---------------------------------------------------------------------
create or replace function public.peran_smi()
returns text language sql stable security definer set search_path = public as $$
  select peran from public.profil_pengguna where id = auth.uid() and aktif is true
$$;
revoke all on function public.peran_smi() from public;
grant execute on function public.peran_smi() to authenticated;

create or replace function public.is_admin_smi()
returns boolean language sql stable as $$ select coalesce(public.peran_smi() = 'admin', false) $$;

-- ---------------------------------------------------------------------
-- 1. Publikasi definisi dan capaian terverifikasi untuk pengunjung
-- ---------------------------------------------------------------------
-- Definisi sasaran, unit, dan kontribusi adalah informasi publik.
create policy "anon_baca_unit_kerja" on public.unit_kerja for select to anon using (true);
create policy "anon_baca_sasaran_smi" on public.sasaran_smi for select to anon using (true);
create policy "anon_baca_kontribusi_unit" on public.kontribusi_unit for select to anon using (true);

-- View capaian terverifikasi. Tanpa kendala, analisis, tindak lanjut, catatan verifikator, dan bukti.
-- View dimiliki oleh pemilik skema sehingga RLS tabel dasar tidak dibuka untuk anon.
create or replace view public.publik_realisasi_smi as
select r.id, r.sasaran_id, r.unit_id, r.tahun, r.bulan,
       r.pembilang, r.penyebut, r.nilai_indeks, r.realisasi,
       'terverifikasi'::text as status,
       r.updated_at
from public.realisasi_bulanan r
where r.status = 'terverifikasi';

revoke all on public.publik_realisasi_smi from anon, authenticated;
grant select on public.publik_realisasi_smi to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Konten halaman (kebijakan, latar belakang, ruang lingkup, metode risiko, FKAP, pelaporan)
-- ---------------------------------------------------------------------
create table if not exists public.konten_portal (
  id uuid primary key default gen_random_uuid(),
  kunci text not null unique,             -- kebijakan_smi, latar_belakang_smi, ruang_lingkup_smi, metode_penilaian_risiko, fungsi_kepatuhan_anti_penyuapan, mekanisme_pelaporan
  judul text not null,
  isi text not null,                       -- teks resmi, disalin utuh dari dokumen
  kode_dokumen text,
  revisi text,
  tanggal_berlaku date,
  pejabat_penetap text,
  file_url text,                           -- URL berkas di bucket publik dokumen-publik-smi
  boleh_unduh boolean not null default false,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik')),
  diperbarui_oleh uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Dokumen dan SOP
-- ---------------------------------------------------------------------
create table if not exists public.dokumen_smi (
  id uuid primary key default gen_random_uuid(),
  kode_dokumen text not null unique,
  nama_dokumen text not null,
  kategori text not null,                  -- salah satu dari 20 kategori Document Center
  jenis text,                              -- jenis SOP bila kategori = 'SOP'
  unit_pemilik text,
  proses_bisnis text,
  revisi text,
  tanggal_berlaku date,
  status text,                             -- Berlaku / Dalam revisi / Dicabut
  file_url text,
  boleh_unduh boolean not null default false,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. Organisasi, Tim SMI, proses bisnis
-- ---------------------------------------------------------------------
create table if not exists public.struktur_organisasi (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.struktur_organisasi(id),
  nama text not null,
  jenis text,
  tugas_fungsi text,
  unit_id uuid,                            -- sesuaikan tipe dengan unit_kerja.id
  urutan int default 0,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik'))
);

create table if not exists public.tim_smi (
  id uuid primary key default gen_random_uuid(),
  kelompok text not null,                  -- Pengarah, Ketua, Sekretariat, Tim pelaksana, FKAP, Auditor internal, PIC unit kerja
  jabatan_tim text,
  nama text not null,
  jabatan_dinas text,
  unit text,
  nomor_sk text,
  urutan int default 0,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik'))
);

create table if not exists public.proses_bisnis (
  id uuid primary key default gen_random_uuid(),
  kode text,
  nama text not null,
  kelompok text not null check (kelompok in ('manajemen','utama','pendukung')),
  deskripsi text,
  unit_terkait text[],
  sop_terkait text[],                      -- kode dokumen SOP
  sasaran_terkait int[],                   -- nomor sasaran
  risiko_terkait text[],                   -- kode risiko
  dokumen_terkait text[],
  urutan int default 0,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik'))
);

-- ---------------------------------------------------------------------
-- 5. Konteks organisasi
-- ---------------------------------------------------------------------
create table if not exists public.isu_konteks (
  id uuid primary key default gen_random_uuid(),
  jenis text not null check (jenis in ('internal','eksternal')),
  isu text not null,
  kategori text,
  dampak text,
  unit_terkait text,
  risiko_peluang text,
  respons_organisasi text,
  status_peninjauan text,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik'))
);

create table if not exists public.pihak_berkepentingan (
  id uuid primary key default gen_random_uuid(),
  pihak text not null,
  kebutuhan text,
  harapan text,
  persyaratan_relevan text,
  proses_terkait text,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik'))
);

create table if not exists public.matriks_komunikasi (
  id uuid primary key default gen_random_uuid(),
  informasi text not null, kapan text, kepada text, cara text, oleh text,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik'))
);

-- ---------------------------------------------------------------------
-- 6. Risiko dan peluang
-- ---------------------------------------------------------------------
create table if not exists public.risiko_peluang (
  id uuid primary key default gen_random_uuid(),
  kode text,
  jenis text not null check (jenis in ('mutu','penyuapan','peluang')),
  uraian text not null,
  kategori text,
  unit_pemilik text,
  kemungkinan int check (kemungkinan between 1 and 5),
  dampak int check (dampak between 1 and 5),
  tingkat_risiko text,
  pengendalian text,
  rencana_mitigasi text,
  status_pemantauan text,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik'))
);

-- ---------------------------------------------------------------------
-- 7. Kegiatan
-- ---------------------------------------------------------------------
create table if not exists public.kegiatan_smi (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  kategori text not null,
  tanggal date,
  ringkasan text,
  foto_url text,
  dokumentasi_url text,
  status_publikasi text not null default 'draf' check (status_publikasi in ('draf','dipublikasikan','ditarik'))
);

-- ---------------------------------------------------------------------
-- 8. Audit internal (rinci = internal; ringkasan = publik melalui view)
-- ---------------------------------------------------------------------
create table if not exists public.program_audit (
  id uuid primary key default gen_random_uuid(),
  periode text not null,
  standar text,
  jumlah_unit int,
  status_pelaksanaan text,                 -- Direncanakan / Berlangsung / Selesai
  ringkasan_dipublikasikan boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.temuan_audit (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.program_audit(id),
  nomor_temuan text not null,
  tanggal_audit date,
  unit_kerja text,
  standar text,
  klausul text,
  uraian_temuan text,
  bukti_objektif text,                     -- TERBATAS
  kategori text check (kategori in ('OFI','Minor','Mayor')),
  akar_penyebab text,
  koreksi text,
  tindakan_korektif text,
  pic text,
  target_penyelesaian date,
  realisasi_penyelesaian date,
  status text check (status in ('Belum ditindaklanjuti','Dalam proses','Menunggu verifikasi','Selesai','Terlambat')),
  verifikasi_efektivitas text,
  catatan_auditor text,                    -- TERBATAS
  updated_at timestamptz not null default now()
);

create or replace view public.publik_ringkasan_audit as
select p.periode, p.standar, p.jumlah_unit as unit_diaudit, p.status_pelaksanaan,
       count(*) filter (where t.kategori = 'OFI')   as jumlah_ofi,
       count(*) filter (where t.kategori = 'Minor') as jumlah_minor,
       count(*) filter (where t.kategori = 'Mayor') as jumlah_mayor,
       count(t.id)                                   as jumlah_tindak_lanjut,
       count(*) filter (where t.status = 'Belum dimulai')       as jumlah_belum_dimulai,
       count(*) filter (where t.status = 'Dalam proses')        as jumlah_dalam_proses,
       count(*) filter (where t.status = 'Menunggu verifikasi') as jumlah_menunggu_verifikasi,
       count(*) filter (where t.status = 'Selesai')             as jumlah_selesai,
       count(*) filter (where t.status <> 'Selesai')            as jumlah_belum_selesai,
       count(*) filter (where t.status <> 'Selesai' and t.target_penyelesaian < current_date) as jumlah_terlambat,
       p.updated_at
from public.program_audit p
left join public.temuan_audit t on t.program_id = p.id
where p.ringkasan_dipublikasikan
group by p.id;
grant select on public.publik_ringkasan_audit to anon, authenticated;

-- ---------------------------------------------------------------------
-- 9. RLS untuk tabel baru
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['konten_portal','dokumen_smi','struktur_organisasi','tim_smi','proses_bisnis',
                           'isu_konteks','pihak_berkepentingan','matriks_komunikasi','kegiatan_smi'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "publik_baca_%1$s" on public.%1$I for select to anon, authenticated using (status_publikasi = ''dipublikasikan'')', t);
    execute format('create policy "admin_kelola_%1$s" on public.%1$I for all to authenticated using (public.is_admin_smi()) with check (public.is_admin_smi())', t);
  end loop;
end $$;

-- Risiko: anonim hanya risiko mutu dan peluang yang dipublikasikan; risiko penyuapan hanya petugas.
alter table public.risiko_peluang enable row level security;
create policy "publik_baca_risiko" on public.risiko_peluang for select to anon
  using (status_publikasi = 'dipublikasikan' and jenis <> 'penyuapan');
create policy "petugas_baca_risiko" on public.risiko_peluang for select to authenticated
  using (public.peran_smi() in ('admin','verifikator','pic_unit'));
create policy "admin_kelola_risiko" on public.risiko_peluang for all to authenticated
  using (public.is_admin_smi()) with check (public.is_admin_smi());

-- Audit: tidak ada akses anonim ke tabel; ringkasan melalui view.
alter table public.program_audit enable row level security;
alter table public.temuan_audit enable row level security;
create policy "petugas_baca_program_audit" on public.program_audit for select to authenticated
  using (public.peran_smi() in ('admin','verifikator','pic_unit'));
create policy "petugas_baca_temuan" on public.temuan_audit for select to authenticated
  using (public.peran_smi() in ('admin','verifikator','pic_unit'));
create policy "admin_kelola_program_audit" on public.program_audit for all to authenticated
  using (public.is_admin_smi()) with check (public.is_admin_smi());
create policy "admin_kelola_temuan" on public.temuan_audit for all to authenticated
  using (public.is_admin_smi()) with check (public.is_admin_smi());

-- ---------------------------------------------------------------------
-- 10. Bucket publik untuk dokumen yang disetujui dan foto kegiatan
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('dokumen-publik-smi', 'dokumen-publik-smi', true)
on conflict (id) do nothing;
create policy "admin_unggah_dokumen_publik" on storage.objects for insert to authenticated
  with check (bucket_id = 'dokumen-publik-smi' and public.is_admin_smi());
-- Bucket bukti-smi tetap privat dan tidak diubah.
