/**
 * Label ringkas sasaran (penandaan portal untuk tabel dan grafik; rumusan resmi tetap ditampilkan
 * pada tooltip/rincian) dan pemetaan kontribusi unit yang ditetapkan pemilik portal.
 * Sumber kebenaran operasional tetap tabel kontribusi_unit; pemetaan ini dipakai untuk
 * memeriksa kesesuaian dan untuk data simulasi pratinjau.
 */
import type { Dataset, Sasaran, Unit } from "@/types/domain";

export const NAMA_SINGKAT: Record<number, string> = {
  1: "Sertifikat bangkom aparatur tepat waktu",
  2: "Surat dinas hasil RPL tepat waktu",
  3: "Sertifikat pelatihan ekspor, metrologi, mutu & jasa tepat waktu",
  4: "Surat Rekomendasi Hasil Uji Kompetensi ≤ 15 hari kerja",
  5: "Rekomendasi formasi JF ≤ 13 hari kerja",
  6: "Dokumen kelulusan tepat waktu",
  7: "Lulusan terserap bekerja",
  8: "Pengajar dengan evaluasi minimal “Baik”",
  9: "Peserta uji kompetensi dinyatakan kompeten",
  10: "Peserta memenuhi kriteria evaluasi pembelajaran",
  11: "Program sesuai kurikulum dan silabus",
  12: "Rekomendasi evaluasi penyelenggaraan ditindaklanjuti",
  13: "Indeks kepuasan pengguna layanan",
  14: "Laporan gratifikasi, BK & penyuapan ditindaklanjuti",
  15: "Penandatanganan pakta integritas",
  16: "Pegawai fungsi berisiko ikut sosialisasi anti penyuapan",
  17: "Kebutuhan aksesibilitas peserta teridentifikasi",
  18: "Konsultasi & pengaduan ditindaklanjuti sesuai standar",
};

export const namaSingkat = (s: Pick<Sasaran, "nomor" | "nama">) =>
  NAMA_SINGKAT[s.nomor] ?? (s.nama.length > 64 ? `${s.nama.slice(0, 62)}…` : s.nama);

export const SEMUA = "SEMUA" as const;

/** Kode unit pada tabel unit_kerja per sasaran. */
export const PEMETAAN_KONTRIBUSI: Record<number, string[] | typeof SEMUA> = {
  1: ["PUS01", "BAL04", "BAL01", "BAL02", "BAL03"],
  2: ["PUS01", "BAL04", "BAL01", "BAL02", "BAL03"],
  3: ["PUS03", "BAL05"],
  4: ["PUS02"],
  5: ["PUS02"],
  6: ["AKMET"],
  7: ["AKMET"],
  8: ["PUS01", "PUS03", "BAL04", "BAL05", "BAL01", "BAL02", "BAL03"],
  9: ["PUS02"],
  10: ["PUS01", "PUS03", "BAL04", "BAL05", "BAL01", "BAL02", "BAL03"],
  11: ["PUS01", "PUS03", "BAL04", "BAL05", "BAL01", "BAL02", "BAL03"],
  12: ["PUS01", "PUS03", "BAL04", "BAL05", "BAL01", "BAL02", "BAL03"],
  13: SEMUA, 14: SEMUA, 15: SEMUA, 16: SEMUA,
  17: ["PUS01", "PUS03", "BAL04", "BAL05", "BAL01", "BAL02", "BAL03"],
  18: SEMUA,
};

export interface SelisihPemetaan { nomor: number; kurang: string[]; lebih: string[] }

/**
 * Membandingkan kontribusi_unit di basis data dengan pemetaan yang ditetapkan.
 * Hanya catatan; portal tidak mengubah tabel.
 */
export function cekPemetaan(data: Dataset): { selisih: SelisihPemetaan[]; kodeTidakDikenal: boolean } {
  const unitById = new Map<string, Unit>(data.units.map((u) => [u.id, u]));
  const codes = new Set(data.units.map((u) => u.kode.trim().toUpperCase()).filter(Boolean));
  const dikenal = ["PUS01", "PUS02", "PUS03", "BAL01", "BAL02", "BAL03", "BAL04", "BAL05", "AKMET"];
  const kodeTidakDikenal = dikenal.some((k) => !codes.has(k));
  const label = (u: Unit) => u.kode || u.singkatan;
  const selisih: SelisihPemetaan[] = [];
  for (const s of data.sasaran) {
    const harus = PEMETAAN_KONTRIBUSI[s.nomor];
    if (!harus) continue;
    const ada = data.kontribusi.filter((k) => k.sasaranId === s.id).map((k) => unitById.get(k.unitId)).filter((u): u is Unit => !!u);
    const harusUnits = harus === SEMUA ? data.units : data.units.filter((u) => harus.includes(u.kode.trim().toUpperCase()));
    const harusIds = new Set(harusUnits.map((u) => u.id));
    const adaIds = new Set(ada.map((u) => u.id));
    const kurang = harusUnits.filter((u) => !adaIds.has(u.id)).map(label);
    const lebih = ada.filter((u) => !harusIds.has(u.id)).map(label);
    if (harus !== SEMUA) {
      const hilang = harus.filter((k) => !codes.has(k));
      kurang.push(...hilang.map((k) => `${k} (kode tidak ditemukan)`));
    }
    if (kurang.length || lebih.length) selisih.push({ nomor: s.nomor, kurang, lebih });
  }
  return { selisih, kodeTidakDikenal };
}
