/** Penyusun baris laporan/ekspor. Dipakai halaman Sasaran, Unit, dan Laporan agar isinya konsisten. */
import type { DashboardModel, SasaranSummary } from "./indicators";
import { CAPAIAN_META, LAPORAN_META } from "@/components/common/status";
import { fmtValue, BULAN, fmtDate } from "@/lib/format";
import type { Dataset, Filters, Realisasi } from "@/types/domain";

export const sasaranColumns = ["No", "Sasaran mutu", "Target", "Satuan", "Rumus", "Periode", "Unit berkontribusi", "Realisasi", "Rasio thd target (%)", "Status capaian", "Laporan terverifikasi", "Menunggu verifikasi", "Bukti dukung"];

export const sasaranRow = (s: SasaranSummary) => [
  s.sasaran.nomor,
  s.sasaran.nama,
  s.sasaran.targetLabel || fmtValue(s.sasaran.target, s.sasaran.satuan),
  s.sasaran.satuan,
  s.sasaran.rumus,
  s.sasaran.periode,
  s.units.map((u) => u.singkatan).join(", "),
  fmtValue(s.value, s.sasaran.satuan),
  s.ratio === null ? null : Math.round(s.ratio * 10) / 10,
  CAPAIAN_META[s.status].label,
  s.verifiedCount,
  s.pendingCount,
  s.buktiCount,
];

export const unitColumns = ["Unit kerja", "Sasaran berlaku", "Memenuhi", "Belum memenuhi", "Belum ada data", "Menunggu verifikasi", "Ketercapaian (%)"];
export const unitRows = (m: DashboardModel) =>
  m.units.map((u) => [u.unit.nama, u.applicable, u.memenuhi, u.belum, u.nodata, u.pending, u.pct === null ? null : Math.round(u.pct * 10) / 10]);

export const monthlyColumns = ["Bulan", "Laporan dinilai", "Memenuhi", "Belum memenuhi", "Ketercapaian (%)"];
export const monthlyRows = (m: DashboardModel, bulanMax: number) =>
  m.monthly.filter((p) => p.bulan <= bulanMax).map((p) => [BULAN[p.bulan - 1], p.laporan, p.memenuhi, p.belum, p.pct === null ? null : Math.round(p.pct * 10) / 10]);

export const laporanColumns = ["Unit kerja", "Sasaran", "Periode", "Realisasi", "Status laporan", "Kendala", "Analisis penyebab", "Tindak lanjut", "Batas waktu", "Catatan verifikator"];
export function laporanRows(list: Realisasi[], data: Dataset) {
  const sm = new Map(data.sasaran.map((s) => [s.id, s]));
  const um = new Map(data.units.map((u) => [u.id, u]));
  return list.map((r) => {
    const s = sm.get(r.sasaranId);
    const value = r.realisasiDb ?? (s?.jenis === "indeks" ? r.nilaiIndeks : r.pembilang !== null && r.penyebut ? (r.pembilang / r.penyebut) * 100 : null);
    return [
      um.get(r.unitId)?.nama ?? r.unitId,
      s ? `${s.nomor}. ${s.nama}` : r.sasaranId,
      `${BULAN[r.bulan - 1] ?? r.bulan} ${r.tahun}`,
      s ? fmtValue(value, s.satuan) : value,
      LAPORAN_META[r.status].label,
      r.kendala,
      r.analisis,
      r.tindakLanjut,
      fmtDate(r.batasWaktu),
      r.catatanVerifikator,
    ];
  });
}

export const filterReports = (data: Dataset, f: Filters) =>
  data.realisasi.filter((r) => r.tahun === f.tahun && r.bulan <= f.bulan && (f.unitId === "all" || r.unitId === f.unitId));

export const fileStamp = (f: Filters) => `${f.tahun}-${String(f.bulan).padStart(2, "0")}`;
