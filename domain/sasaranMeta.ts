import type { Sasaran } from "@/types/domain";
import { REVISI_SASARAN, TEMA_LAIN, TEMA_SASARAN } from "@/content/portal";
import { SASARAN_RESMI } from "@/content/resmi/dokumen";

/**
 * Tema navigasi: kolom kelompok di basis data bila ada; selain itu jenis sasaran menurut
 * PM.SMI.L3.2026 (penandaan portal); terakhir pencocokan kata kunci.
 */
export function temaSasaran(s: Sasaran): { tema: string; resmi: boolean } {
  if (s.kelompok.trim()) return { tema: s.kelompok.trim(), resmi: true };
  const r = SASARAN_RESMI.find((x) => x.nomor === s.nomor);
  if (r) return { tema: r.kelompok, resmi: false };
  const hit = TEMA_SASARAN.find((t) => t.kata.test(`${s.nama} ${s.rumus}`));
  return { tema: hit?.nama ?? TEMA_LAIN, resmi: false };
}

export interface CatatanRevisi { nomor: number; harus: string; catatan: string; sesuai: boolean }

const norm = (x: string) => x.toLowerCase().replace(/[“”"]/g, "").replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();

/**
 * Membandingkan redaksi dan target di basis data dengan PM.SMI.L3.2026 (Rev. 1/0).
 * Hasilnya hanya catatan konfirmasi; data sasaran tidak diubah oleh aplikasi.
 */
export function cekRevisi(s: Sasaran): CatatanRevisi | null {
  const r = SASARAN_RESMI.find((x) => x.nomor === s.nomor);
  if (!r) return null;
  const khusus = REVISI_SASARAN[s.nomor];
  const adaLarangan = khusus?.tidakBoleh.some((re) => re.test(s.nama)) ?? false;
  const namaSesuai = norm(s.nama) === norm(r.nama) || norm(s.nama).includes(norm(r.nama));
  const targetSesuai = s.target === null || Math.abs(s.target - r.target) < 1e-9;
  const catatan = [
    !namaSesuai || adaLarangan ? khusus?.catatan ?? "Redaksi di basis data berbeda dengan PM.SMI.L3.2026." : "",
    !targetSesuai ? `Target di basis data (${s.target}) berbeda dengan dokumen (${r.targetLabel}).` : "",
  ].filter(Boolean).join(" ");
  return { nomor: s.nomor, harus: r.nama, catatan, sesuai: namaSesuai && !adaLarangan && targetSesuai };
}
