/**
 * Pembaca konten portal. Setiap tabel dibaca terpisah sehingga satu tabel yang belum ada
 * tidak menggagalkan halaman lain. RLS menentukan baris yang terlihat:
 * pengunjung anonim hanya menerima baris berstatus "dipublikasikan".
 */
import { getSupabase } from "@/lib/supabase";
import { PORTAL_TABLES } from "@/config/schema";
import { pick, toNum } from "./normalize";
import type {
  AnggotaTim, Dokumen, Isu, Kegiatan, Konten, LoadState, Pihak, PortalContent, Proses, Risiko, RingkasanAudit, StrukturNode, Temuan,
} from "@/types/portal";

type Row = Record<string, any>;
const s = (v: any) => (v === null || v === undefined ? "" : String(v));
const arr = (v: any): string[] => (Array.isArray(v) ? v.map(String) : s(v) ? s(v).split(/[;,]\s*/).filter(Boolean) : []);
const bool = (v: any) => v === true || ["true", "1", "ya", "y"].includes(s(v).toLowerCase());
const dt = (v: any) => (v ? s(v).slice(0, 10) : null);

const mappers = {
  konten: (r: Row): Konten => ({
    kunci: s(pick(r, ["kunci", "key", "slug"])),
    judul: s(pick(r, ["judul", "title"])),
    isi: s(pick(r, ["isi", "konten", "body"])),
    kodeDokumen: s(pick(r, ["kode_dokumen", "kode"])),
    revisi: s(pick(r, ["revisi", "nomor_revisi"])),
    tanggalBerlaku: dt(pick(r, ["tanggal_berlaku"])),
    pejabatPenetap: s(pick(r, ["pejabat_penetap", "ditetapkan_oleh"])),
    fileUrl: s(pick(r, ["file_url", "url_dokumen"])) || null,
    bolehUnduh: bool(pick(r, ["boleh_unduh", "izin_unduh"])),
  }),
  dokumen: (r: Row): Dokumen => ({
    id: s(pick(r, ["id"])),
    kode: s(pick(r, ["kode_dokumen", "kode"])),
    nama: s(pick(r, ["nama_dokumen", "nama", "judul"])),
    kategori: s(pick(r, ["kategori"])),
    jenis: s(pick(r, ["jenis", "jenis_dokumen", "jenis_sop"])),
    unitPemilik: s(pick(r, ["unit_pemilik", "unit"])),
    proses: s(pick(r, ["proses_bisnis", "proses"])),
    revisi: s(pick(r, ["revisi", "nomor_revisi"])),
    tanggalBerlaku: dt(pick(r, ["tanggal_berlaku"])),
    status: s(pick(r, ["status", "status_dokumen"])),
    fileUrl: s(pick(r, ["file_url", "url_dokumen"])) || null,
    bolehUnduh: bool(pick(r, ["boleh_unduh", "izin_unduh"])),
  }),
  struktur: (r: Row): StrukturNode => ({
    id: s(pick(r, ["id"])),
    parentId: s(pick(r, ["parent_id", "induk_id"])) || null,
    nama: s(pick(r, ["nama", "nama_unit", "jabatan"])),
    jenis: s(pick(r, ["jenis", "tingkat"])),
    tugasFungsi: s(pick(r, ["tugas_fungsi", "tugas", "deskripsi"])),
    unitId: s(pick(r, ["unit_id"])) || null,
    urutan: toNum(pick(r, ["urutan"])) ?? 999,
  }),
  timSmi: (r: Row): AnggotaTim => ({
    id: s(pick(r, ["id"])),
    kelompok: s(pick(r, ["kelompok", "bagian"])),
    jabatanTim: s(pick(r, ["jabatan_tim", "peran_tim"])),
    nama: s(pick(r, ["nama"])),
    jabatanDinas: s(pick(r, ["jabatan_dinas", "jabatan"])),
    unit: s(pick(r, ["unit", "unit_kerja"])),
    urutan: toNum(pick(r, ["urutan"])) ?? 999,
  }),
  proses: (r: Row): Proses => ({
    id: s(pick(r, ["id"])),
    kode: s(pick(r, ["kode", "kode_proses"])),
    nama: s(pick(r, ["nama", "nama_proses"])),
    kelompok: s(pick(r, ["kelompok", "jenis_proses"])).toLowerCase(),
    deskripsi: s(pick(r, ["deskripsi", "uraian"])),
    unitTerkait: arr(pick(r, ["unit_terkait"])),
    sopTerkait: arr(pick(r, ["sop_terkait"])),
    sasaranTerkait: arr(pick(r, ["sasaran_terkait"])).map(Number).filter((n) => !Number.isNaN(n)),
    risikoTerkait: arr(pick(r, ["risiko_terkait"])),
    dokumenTerkait: arr(pick(r, ["dokumen_terkait"])),
    urutan: toNum(pick(r, ["urutan"])) ?? 999,
  }),
  isu: (r: Row): Isu => ({
    id: s(pick(r, ["id"])),
    jenis: s(pick(r, ["jenis"])).toLowerCase(),
    isu: s(pick(r, ["isu", "uraian"])),
    kategori: s(pick(r, ["kategori"])),
    dampak: s(pick(r, ["dampak"])),
    unitTerkait: s(pick(r, ["unit_terkait"])),
    risikoPeluang: s(pick(r, ["risiko_peluang"])),
    respons: s(pick(r, ["respons", "respons_organisasi"])),
    statusTinjau: s(pick(r, ["status_peninjauan", "status"])),
  }),
  pihak: (r: Row): Pihak => ({
    id: s(pick(r, ["id"])),
    pihak: s(pick(r, ["pihak", "nama_pihak"])),
    kebutuhan: s(pick(r, ["kebutuhan"])),
    harapan: s(pick(r, ["harapan"])),
    persyaratan: s(pick(r, ["persyaratan", "persyaratan_relevan"])),
    proses: s(pick(r, ["proses_terkait", "proses"])),
  }),
  risiko: (r: Row): Risiko => ({
    id: s(pick(r, ["id"])),
    kode: s(pick(r, ["kode", "kode_risiko"])),
    jenis: s(pick(r, ["jenis"])).toLowerCase(),
    uraian: s(pick(r, ["uraian", "risiko"])),
    kategori: s(pick(r, ["kategori"])),
    unit: s(pick(r, ["unit", "unit_pemilik"])),
    kemungkinan: toNum(pick(r, ["kemungkinan", "likelihood"])),
    dampak: toNum(pick(r, ["dampak", "impact"])),
    tingkat: s(pick(r, ["tingkat", "tingkat_risiko", "level"])),
    pengendalian: s(pick(r, ["pengendalian"])),
    mitigasi: s(pick(r, ["mitigasi", "rencana_mitigasi"])),
    statusPantau: s(pick(r, ["status_pemantauan", "status"])),
  }),
  kegiatan: (r: Row): Kegiatan => ({
    id: s(pick(r, ["id"])),
    judul: s(pick(r, ["judul"])),
    kategori: s(pick(r, ["kategori"])),
    tanggal: dt(pick(r, ["tanggal", "tanggal_kegiatan"])),
    ringkasan: s(pick(r, ["ringkasan", "deskripsi"])),
    fotoUrl: s(pick(r, ["foto_url"])) || null,
    dokumentasiUrl: s(pick(r, ["dokumentasi_url"])) || null,
  }),
  auditRingkasan: (r: Row): RingkasanAudit => ({
    periode: s(pick(r, ["periode", "periode_audit"])),
    standar: s(pick(r, ["standar"])),
    unitDiaudit: toNum(pick(r, ["unit_diaudit", "jumlah_unit"])),
    statusPelaksanaan: s(pick(r, ["status_pelaksanaan", "status"])),
    ofi: toNum(pick(r, ["jumlah_ofi", "ofi"])),
    minor: toNum(pick(r, ["jumlah_minor", "minor"])),
    mayor: toNum(pick(r, ["jumlah_mayor", "mayor"])),
    tindakLanjut: toNum(pick(r, ["jumlah_tindak_lanjut"])),
    belumDimulai: toNum(pick(r, ["jumlah_belum_dimulai"])),
    dalamProses: toNum(pick(r, ["jumlah_dalam_proses"])),
    menungguVerifikasi: toNum(pick(r, ["jumlah_menunggu_verifikasi"])),
    selesai: toNum(pick(r, ["jumlah_selesai"])),
    belumSelesai: toNum(pick(r, ["jumlah_belum_selesai"])),
    terlambat: toNum(pick(r, ["jumlah_terlambat"])),
    diperbarui: s(pick(r, ["updated_at", "diperbarui"])) || null,
  }),
  temuan: (r: Row): Temuan => ({
    id: s(pick(r, ["id"])),
    nomor: s(pick(r, ["nomor_temuan", "nomor"])),
    tanggalAudit: dt(pick(r, ["tanggal_audit"])),
    unit: s(pick(r, ["unit", "unit_kerja"])),
    standar: s(pick(r, ["standar"])),
    klausul: s(pick(r, ["klausul"])),
    uraian: s(pick(r, ["uraian_temuan", "uraian"])),
    buktiObjektif: s(pick(r, ["bukti_objektif"])),
    kategori: s(pick(r, ["kategori"])),
    akarPenyebab: s(pick(r, ["akar_penyebab", "analisis_akar_penyebab"])),
    koreksi: s(pick(r, ["koreksi"])),
    tindakanKorektif: s(pick(r, ["tindakan_korektif"])),
    pic: s(pick(r, ["pic"])),
    targetSelesai: dt(pick(r, ["target_penyelesaian"])),
    realisasiSelesai: dt(pick(r, ["realisasi_penyelesaian"])),
    status: s(pick(r, ["status"])),
    verifikasiEfektivitas: s(pick(r, ["verifikasi_efektivitas"])),
    catatanAuditor: s(pick(r, ["catatan_auditor"])),
  }),
};

type Key = keyof typeof mappers;

function classify(message: string): { kind: "belum-tersedia" | "tidak-berwenang" | "galat"; reason: string } {
  if (/does not exist|relation|schema cache|not found|42P01|PGRST20/i.test(message)) {
    return { kind: "belum-tersedia", reason: "Tabel konten belum dibuat di basis data." };
  }
  if (/permission|denied|401|403|JWT|row-level/i.test(message)) {
    return { kind: "tidak-berwenang", reason: "Informasi ini hanya dapat dilihat oleh petugas yang berwenang." };
  }
  return { kind: "galat", reason: message };
}

async function loadTable<K extends Key>(key: K): Promise<LoadState<ReturnType<(typeof mappers)[K]>>> {
  try {
    const { data, error } = await getSupabase().from(PORTAL_TABLES[key]).select("*").limit(2000);
    if (error) return { status: "unavailable", ...classify(error.message) };
    return { status: "ok", rows: (data ?? []).map(mappers[key] as any) as any };
  } catch (e: any) {
    return { status: "unavailable", ...classify(e?.message ?? "") };
  }
}

export async function loadPortalSupabase(loggedIn: boolean): Promise<PortalContent> {
  const keys: Key[] = ["konten", "dokumen", "struktur", "timSmi", "proses", "isu", "pihak", "risiko", "kegiatan", "auditRingkasan"];
  const results = await Promise.all(keys.map((k) => loadTable(k)));
  const out = Object.fromEntries(keys.map((k, i) => [k, results[i]])) as any;
  out.temuan = loggedIn
    ? await loadTable("temuan")
    : { status: "unavailable", kind: "tidak-berwenang", reason: "Detail temuan, bukti objektif, dan catatan auditor hanya dapat dilihat petugas yang berwenang." };
  return out as PortalContent;
}

/**
 * Pratinjau desain: konten portal sengaja kosong. Dokumen, SOP, nama pejabat, temuan audit,
 * dan kegiatan tidak boleh dikarang, sehingga pratinjau menampilkan status menunggu dokumen resmi.
 */
export async function loadPortalPreview(loggedIn = false): Promise<PortalContent> {
  const none = { status: "unavailable", kind: "belum-tersedia", reason: "Menunggu dokumen resmi dimuat ke basis data." } as const;
  return {
    konten: none, dokumen: none, struktur: none, timSmi: none, proses: none, isu: none, pihak: none,
    risiko: none, kegiatan: none, auditRingkasan: none,
    // Petugas melihat register kosong (belum ada temuan resmi); pengunjung tidak berwenang.
    temuan: loggedIn ? { status: "ok", rows: [] } : { status: "unavailable", kind: "tidak-berwenang", reason: "Detail temuan hanya untuk petugas yang berwenang." },
  };
}
