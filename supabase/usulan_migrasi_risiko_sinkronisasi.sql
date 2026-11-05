-- =====================================================================================
-- USULAN MIGRASI — REGISTER RISIKO 2026 & SINKRONISASI DATA DOKUMEN (DRAF, BELUM DIJALANKAN)
-- Portal SMI BPSDMP · disiapkan 2026
--
-- PRINSIP
--  * Tidak membuat ulang / mengubah tabel yang sudah ada (unit_kerja, sasaran_smi, kontribusi_unit,
--    realisasi_bulanan, bukti_dukung, profil_pengguna). Semua objek baru memakai IF NOT EXISTS.
--  * RLS diaktifkan pada setiap tabel baru. Pengguna anonim hanya membaca VIEW ringkasan agregat.
--  * Register risiko penyuapan (sasaran/tujuan 1) tidak pernah masuk view publik.
--  * Data dari dokumen tidak pernah langsung berstatus 'terverifikasi'.
--  * Fungsi peran memakai public.profil_pengguna(peran). SESUAIKAN nama kolom id/peran bila berbeda.
--  * Jalankan di lingkungan uji terlebih dahulu, setelah disetujui.
-- =====================================================================================

-- Fungsi bantu peran (tidak menimpa bila sudah ada fungsi serupa dengan nama lain).
create or replace function public.smi_peran_saat_ini() returns text
language sql stable security definer set search_path = public as $$
  select peran::text from public.profil_pengguna where id = auth.uid() limit 1
$$;
revoke all on function public.smi_peran_saat_ini() from public;
grant execute on function public.smi_peran_saat_ini() to authenticated;

-- -------------------------------------------------------------------------------------
-- 1. REGISTER RISIKO
-- -------------------------------------------------------------------------------------
create table if not exists public.level_risiko (
  kode        text primary key,                    -- SR, R, S, T, ST
  nama        text not null,                       -- Sangat Rendah ... Sangat Tinggi
  skor_min    int  not null,
  skor_maks   int  not null,
  warna       text,
  urutan      int  not null
);
insert into public.level_risiko (kode, nama, skor_min, skor_maks, warna, urutan) values
  ('SR','Sangat Rendah',1,5,'#16A34A',1), ('R','Rendah',6,11,'#84CC16',2), ('S','Sedang',12,15,'#EAB308',3),
  ('T','Tinggi',16,19,'#F97316',4), ('ST','Sangat Tinggi',20,25,'#DC2626',5)
on conflict (kode) do nothing;

create table if not exists public.register_risiko (
  id                 uuid primary key default gen_random_uuid(),
  kode               text unique not null,          -- MR-01 ... (mengikuti matriks)
  tahun              int  not null default 2026,
  no_sasaran         int  not null,                 -- kolom "No" pada matriks (1–11)
  sasaran_tujuan     text not null,
  proses             text not null,
  risiko             text not null,
  penyebab           text,
  dampak             text,
  penanggung_jawab   text,
  kemungkinan        int  check (kemungkinan between 1 and 5),
  keparahan          int  check (keparahan between 1 and 5),
  skor               int,                            -- disalin apa adanya dari matriks (bukan K×D)
  level_kode         text references public.level_risiko(kode),
  respons            text,                           -- mis. Pencegahan
  klausul            text,
  sensitif_penyuapan boolean not null default false, -- true → hanya FKAP/admin
  sumber             text not null default 'Matriks_Risiko_SMI_BPSDMP_2026.xlsx',
  dibuat_pada        timestamptz not null default now(),
  diubah_pada        timestamptz not null default now()
);

create table if not exists public.pengendalian_risiko (
  id            uuid primary key default gen_random_uuid(),
  risiko_id     uuid not null references public.register_risiko(id) on delete cascade,
  uraian        text not null,
  waktu         text,
  pemantauan    text,
  bukti_path    text,                                -- path Storage privat; diakses via signed URL
  dibuat_pada   timestamptz not null default now()
);

create table if not exists public.tindak_lanjut_risiko (
  id                 uuid primary key default gen_random_uuid(),
  risiko_id          uuid not null references public.register_risiko(id) on delete cascade,
  periode            text not null,                  -- mis. 2026-T4
  status             text not null default 'belum_dimulai'
                     check (status in ('belum_dimulai','dalam_proses','selesai','terlambat')),
  residual_kemungkinan int check (residual_kemungkinan between 1 and 5),
  residual_keparahan   int check (residual_keparahan between 1 and 5),
  residual_skor      int,
  residual_level     text references public.level_risiko(kode),
  catatan            text,
  diperbarui_oleh    uuid default auth.uid(),
  diperbarui_pada    timestamptz not null default now()
);

create table if not exists public.riwayat_risiko (
  id           bigserial primary key,
  tabel        text not null,
  baris_id     uuid not null,
  aksi         text not null,                         -- INSERT / UPDATE / DELETE
  data_lama    jsonb,
  data_baru    jsonb,
  oleh         uuid default auth.uid(),
  pada         timestamptz not null default now()
);

create or replace function public.catat_riwayat_risiko() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.riwayat_risiko (tabel, baris_id, aksi, data_lama, data_baru)
  values (tg_table_name, coalesce(new.id, old.id), tg_op,
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

drop trigger if exists trg_riwayat_register_risiko on public.register_risiko;
create trigger trg_riwayat_register_risiko after insert or update or delete on public.register_risiko
  for each row execute function public.catat_riwayat_risiko();
drop trigger if exists trg_riwayat_pengendalian_risiko on public.pengendalian_risiko;
create trigger trg_riwayat_pengendalian_risiko after insert or update or delete on public.pengendalian_risiko
  for each row execute function public.catat_riwayat_risiko();
drop trigger if exists trg_riwayat_tl_risiko on public.tindak_lanjut_risiko;
create trigger trg_riwayat_tl_risiko after insert or update or delete on public.tindak_lanjut_risiko
  for each row execute function public.catat_riwayat_risiko();

alter table public.level_risiko         enable row level security;
alter table public.register_risiko      enable row level security;
alter table public.pengendalian_risiko  enable row level security;
alter table public.tindak_lanjut_risiko enable row level security;
alter table public.riwayat_risiko       enable row level security;

create policy "level_risiko dibaca semua" on public.level_risiko for select using (true);

-- Petugas login membaca register non-sensitif; risiko penyuapan hanya admin/verifikator (FKAP).
create policy "register dibaca petugas" on public.register_risiko for select to authenticated
  using (not sensitif_penyuapan or public.smi_peran_saat_ini() in ('admin','verifikator'));
create policy "register dikelola admin" on public.register_risiko for all to authenticated
  using (public.smi_peran_saat_ini() = 'admin') with check (public.smi_peran_saat_ini() = 'admin');

create policy "pengendalian dibaca petugas" on public.pengendalian_risiko for select to authenticated
  using (exists (select 1 from public.register_risiko r where r.id = risiko_id
                 and (not r.sensitif_penyuapan or public.smi_peran_saat_ini() in ('admin','verifikator'))));
create policy "pengendalian dikelola admin" on public.pengendalian_risiko for all to authenticated
  using (public.smi_peran_saat_ini() = 'admin') with check (public.smi_peran_saat_ini() = 'admin');

create policy "tl risiko dibaca petugas" on public.tindak_lanjut_risiko for select to authenticated
  using (exists (select 1 from public.register_risiko r where r.id = risiko_id
                 and (not r.sensitif_penyuapan or public.smi_peran_saat_ini() in ('admin','verifikator'))));
create policy "tl risiko dikelola admin/verifikator" on public.tindak_lanjut_risiko for all to authenticated
  using (public.smi_peran_saat_ini() in ('admin','verifikator'))
  with check (public.smi_peran_saat_ini() in ('admin','verifikator'));

create policy "riwayat risiko dibaca admin" on public.riwayat_risiko for select to authenticated
  using (public.smi_peran_saat_ini() = 'admin');
-- Tidak ada policy insert/update/delete untuk riwayat: hanya trigger (security definer) yang menulis.

-- View publik: hanya agregat, tanpa uraian, tanpa risiko penyuapan per baris.
create or replace view public.publik_ringkasan_risiko with (security_invoker = false) as
select r.tahun, r.no_sasaran, r.level_kode, r.kemungkinan, r.keparahan, count(*)::int as jumlah,
       bool_or(r.sensitif_penyuapan) as memuat_penyuapan
from public.register_risiko r
group by r.tahun, r.no_sasaran, r.level_kode, r.kemungkinan, r.keparahan;
grant select on public.publik_ringkasan_risiko to anon, authenticated;

-- -------------------------------------------------------------------------------------
-- 2. SINKRONISASI DOKUMEN → BASIS DATA (usulan + persetujuan + jejak)
-- -------------------------------------------------------------------------------------
create table if not exists public.usulan_perubahan_data (
  id             uuid primary key default gen_random_uuid(),
  jenis          text not null check (jenis in ('kontribusi','realisasi')),
  tabel_tujuan   text not null,
  payload        jsonb not null,
  sumber         text not null,                         -- mis. PM.SMI.L3-01.2026
  alasan         text not null,
  status         text not null default 'diajukan' check (status in ('diajukan','disetujui','ditolak','diterapkan')),
  diajukan_oleh  uuid default auth.uid(),
  diajukan_pada  timestamptz not null default now(),
  diputus_oleh   uuid,
  diputus_pada   timestamptz,
  catatan        text
);

create table if not exists public.riwayat_perubahan_data (
  id           bigserial primary key,
  usulan_id    uuid references public.usulan_perubahan_data(id),
  tabel        text not null,
  aksi         text not null,
  data_baru    jsonb,
  oleh         uuid default auth.uid(),
  pada         timestamptz not null default now()
);

alter table public.usulan_perubahan_data  enable row level security;
alter table public.riwayat_perubahan_data enable row level security;

create policy "usulan dibaca admin" on public.usulan_perubahan_data for select to authenticated
  using (public.smi_peran_saat_ini() = 'admin');
create policy "usulan diajukan admin" on public.usulan_perubahan_data for insert to authenticated
  with check (public.smi_peran_saat_ini() = 'admin' and status = 'diajukan');
create policy "riwayat data dibaca admin" on public.riwayat_perubahan_data for select to authenticated
  using (public.smi_peran_saat_ini() = 'admin');

-- Penerapan satu usulan yang telah DISETUJUI. Realisasi masuk berstatus 'diajukan' — tetap
-- harus melalui verifikasi biasa. SESUAIKAN nama kolom dengan hasil Pemeriksaan Skema.
create or replace function public.terapkan_usulan_perubahan(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare u public.usulan_perubahan_data;
begin
  if public.smi_peran_saat_ini() <> 'admin' then raise exception 'Hanya administrator'; end if;
  select * into u from public.usulan_perubahan_data where id = p_id for update;
  if u.status <> 'disetujui' then raise exception 'Usulan belum disetujui'; end if;

  if u.jenis = 'kontribusi' then
    insert into public.kontribusi_unit (sasaran_id, unit_id)
    select (u.payload->>'sasaran_id')::uuid, (u.payload->>'unit_id')::uuid
    where not exists (select 1 from public.kontribusi_unit k
                      where k.sasaran_id = (u.payload->>'sasaran_id')::uuid and k.unit_id = (u.payload->>'unit_id')::uuid);
  elsif u.jenis = 'realisasi' then
    insert into public.realisasi_bulanan (sasaran_id, unit_id, tahun, bulan, realisasi, nilai_indeks, status)
    select (u.payload->>'sasaran_id')::uuid, (u.payload->>'unit_id')::uuid,
           (u.payload->>'tahun')::int, (u.payload->>'bulan')::int,
           case when (u.payload->>'indeks')::boolean then null else (u.payload->>'nilai')::numeric end,
           case when (u.payload->>'indeks')::boolean then (u.payload->>'nilai')::numeric else null end,
           'diajukan'
    where not exists (select 1 from public.realisasi_bulanan r
                      where r.sasaran_id = (u.payload->>'sasaran_id')::uuid and r.unit_id = (u.payload->>'unit_id')::uuid
                        and r.tahun = (u.payload->>'tahun')::int and r.bulan = (u.payload->>'bulan')::int);
  end if;

  insert into public.riwayat_perubahan_data (usulan_id, tabel, aksi, data_baru) values (u.id, u.tabel_tujuan, 'INSERT', u.payload);
  update public.usulan_perubahan_data set status = 'diterapkan' where id = u.id;
end $$;
revoke all on function public.terapkan_usulan_perubahan(uuid) from public;
grant execute on function public.terapkan_usulan_perubahan(uuid) to authenticated;

-- Keputusan usulan (setujui/tolak) oleh admin — dicatat siapa dan kapan.
create or replace function public.putuskan_usulan_perubahan(p_id uuid, p_setuju boolean, p_catatan text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.smi_peran_saat_ini() <> 'admin' then raise exception 'Hanya administrator'; end if;
  update public.usulan_perubahan_data
     set status = case when p_setuju then 'disetujui' else 'ditolak' end,
         diputus_oleh = auth.uid(), diputus_pada = now(), catatan = p_catatan
   where id = p_id and status = 'diajukan';
end $$;
revoke all on function public.putuskan_usulan_perubahan(uuid, boolean, text) from public;
grant execute on function public.putuskan_usulan_perubahan(uuid, boolean, text) to authenticated;
