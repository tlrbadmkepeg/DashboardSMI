/**
 * Menggabungkan pencapaian dari dokumen PM.SMI.L3-01.2026 ke dataset.
 * Dipakai bila basis data belum memuat realisasi tahun 2026 (pratinjau atau Supabase yang belum disinkronkan).
 * Nilai dokumen diberi status "dokumen" — tidak pernah "terverifikasi".
 */
import type { Dataset, Kontribusi, Realisasi } from "@/types/domain";
import { PENCAPAIAN_2026, SUMBER_PENCAPAIAN } from "@/content/resmi/pencapaian";

const kodeCocok = (u: { kode: string; nama: string }, kode: string) => {
  const k = u.kode.trim().toUpperCase();
  if (k === kode) return true;
  if (kode === "SEKRETARIAT") return /sekretariat/i.test(u.nama);
  return false;
};

export function gabungPencapaianDokumen(d: Dataset): Dataset {
  const tahun = SUMBER_PENCAPAIAN.tahun;
  if (d.realisasi.some((r) => r.tahun === tahun && r.status !== "dokumen")) return d;
  const unitOf = (kode: string) => d.units.find((u) => kodeCocok(u, kode));
  const sasaranOf = (n: number) => d.sasaran.find((s) => s.nomor === n);
  const nilaiDokumen: Record<string, (number | "NA" | null)[]> = {};
  const agregatDokumen: Record<string, (number | "NA" | null)[]> = {};
  const buktiTautan: Record<string, string> = {};
  const kontribusiDok: Kontribusi[] = [];
  const realisasi: Realisasi[] = [];
  for (const b of PENCAPAIAN_2026) {
    const s = sasaranOf(b.nomor);
    if (!s) continue;
    if (b.kode === "BPSDMP") { agregatDokumen[s.id] = b.nilai; continue; }
    const u = unitOf(b.kode);
    if (!u) continue;
    const key = `${s.id}|${u.id}`;
    nilaiDokumen[key] = b.nilai;
    if (b.bukti) buktiTautan[key] = b.bukti;
    kontribusiDok.push({ sasaranId: s.id, unitId: u.id });
    b.nilai.forEach((v, i) => {
      if (typeof v !== "number") return;
      const indeks = s.jenis === "indeks";
      realisasi.push({
        id: `dok-${b.nomor}-${u.id}-${i + 1}`, sasaranId: s.id, unitId: u.id, tahun, bulan: i + 1,
        pembilang: null, penyebut: null, nilaiIndeks: indeks ? v : null, realisasiDb: v,
        status: "dokumen", statusRaw: "dokumen", kendala: "", analisis: "", tindakLanjut: "", batasWaktu: null,
        statusTindakLanjut: null, catatanVerifikator: "", diajukanPada: null, diverifikasiPada: null, updatedAt: null,
      });
    });
  }
  // Basis data adalah sumber kebenaran pemetaan; dokumen hanya dipakai bila tabel kontribusi_unit kosong.
  const kontribusi = d.kontribusi.length ? d.kontribusi : kontribusiDok;
  return { ...d, kontribusi, kontribusiDb: d.kontribusi, kontribusiDokumen: kontribusiDok, realisasi: [...d.realisasi, ...realisasi], nilaiDokumen, agregatDokumen, buktiTautan, simulasi: true };
}

/** N/A seluruh bulan s.d. posisi → tidak ada pengukuran (bukan belum dilaporkan). */
export function semuaNA(nilai: (number | "NA" | null)[] | undefined, sampai: number) {
  if (!nilai) return false;
  const seg = nilai.slice(0, sampai);
  return seg.length > 0 && seg.every((v) => v === "NA");
}
