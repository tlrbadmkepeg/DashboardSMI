/**
 * PERHITUNGAN INDIKATOR SMI
 *
 * Prinsip:
 * 1. Setiap nilai dibandingkan dengan target sasarannya sendiri, dalam satuannya sendiri.
 * 2. Indeks kepuasan (skala 0–4) TIDAK pernah dirata-ratakan bersama indikator persentase.
 * 3. Agregasi lintas sasaran memakai dua ukuran yang sebanding:
 *    - tingkat ketercapaian = jumlah memenuhi ÷ jumlah yang punya data (biner, bebas satuan);
 *    - rasio capaian = realisasi ÷ target × 100 (untuk arah "naik"), target ÷ realisasi × 100 (arah "turun").
 * 4. Nilai realisasi resmi diambil dari kolom database. Perhitungan di browser hanya cadangan
 *    bila kolom realisasi kosong dan ditandai sebagai "dihitung sistem".
 * 5. Status periode = laporan terakhir setiap unit s.d. bulan terpilih pada tahun terpilih.
 */
import type {
  Dataset, Filters, Realisasi, Sasaran, StatusCapaian, Unit,
} from "@/types/domain";
import { semuaNA } from "@/services/dokumenPencapaian";

/**
 * Status capaian hanya tiga: memenuhi target, belum memenuhi target, belum dilaporkan.
 * Kategori "mendekati target" tidak dipakai karena belum ada ambang yang disetujui;
 * nilai di bawah target selalu dihitung sebagai belum memenuhi target.
 */

export interface Nilai {
  value: number | null;
  /** true bila nilai dihitung di browser karena kolom realisasi database kosong. */
  derived: boolean;
}

export function nilaiRealisasi(r: Realisasi, s: Sasaran): Nilai {
  if (r.realisasiDb !== null) return { value: r.realisasiDb, derived: false };
  if (s.jenis === "indeks") return { value: r.nilaiIndeks, derived: r.nilaiIndeks !== null };
  if (r.pembilang !== null && r.penyebut !== null && r.penyebut > 0) {
    const pct = s.jenis === "persentase" || s.satuan.includes("%");
    return { value: pct ? (r.pembilang / r.penyebut) * 100 : r.pembilang / r.penyebut, derived: true };
  }
  return { value: null, derived: false };
}

export function rasioCapaian(value: number | null, s: Sasaran): number | null {
  if (value === null || s.target === null || s.target === 0) return null;
  if (s.arah === "turun") return value === 0 ? 200 : (s.target / value) * 100;
  return (value / s.target) * 100;
}

export function statusDariNilai(value: number | null, s: Sasaran): StatusCapaian {
  if (value === null) return "nodata";
  if (s.target === null) return "nodata";
  const met = s.arah === "turun" ? value <= s.target : value >= s.target;
  return met ? "memenuhi" : "dibawah";
}

export const isBelum = (st: StatusCapaian) => st === "mendekati" || st === "dibawah";

/** Laporan yang dihitung sebagai capaian: hanya terverifikasi, kecuali pengguna memilih menyertakan semuanya. */
export function countsForAchievement(r: Realisasi, includeUnverified: boolean) {
  // "dokumen" = nilai dokumen resmi PM.SMI.L3-01; ditampilkan dengan label sumber, bukan sebagai terverifikasi.
  if (r.status === "terverifikasi" || r.status === "dokumen") return true;
  return includeUnverified && (r.status === "diajukan" || r.status === "perlu_perbaikan" || r.status === "draft");
}

export interface UnitCell {
  unit: Unit;
  sasaran: Sasaran;
  applicable: boolean;
  report: Realisasi | null;
  value: number | null;
  derived: boolean;
  status: StatusCapaian;
  ratio: number | null;
}

export interface SasaranSummary {
  sasaran: Sasaran;
  units: Unit[];
  cells: UnitCell[];
  value: number | null;
  ratio: number | null;
  status: StatusCapaian;
  aggregation: "rasio-gabungan" | "rata-rata-unit" | "tunggal" | "kosong" | "agregat-dokumen";
  reportsInYear: Realisasi[];
  pendingCount: number;
  verifiedCount: number;
  buktiCount: number;
  latestReport: Realisasi | null;
}

export interface UnitSummary {
  unit: Unit;
  applicable: number;
  memenuhi: number;
  belum: number;
  nodata: number;
  pending: number;
  pct: number | null;
}

export interface MonthPoint {
  bulan: number;
  label: string;
  pct: number | null;
  memenuhi: number;
  belum: number;
  laporan: number;
}

export interface DashboardModel {
  sasaran: SasaranSummary[];
  units: UnitSummary[];
  visibleUnits: Unit[];
  monthly: MonthPoint[];
  kpi: {
    totalSasaran: number;
    totalUnit: number;
    memenuhi: number;
    belum: number;
    nodata: number;
    tidakdiukur: number;
    unitMelapor: number;
    pctTercapai: number | null;
    menungguVerifikasi: number;
    tindakLanjutTerbuka: number;
    tindakLanjutLewat: number;
    terverifikasi: number;
    draft: number;
    perluPerbaikan: number;
  };
  lastUpdated: string | null;
}

const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Laporan terakhir per pasangan sasaran–unit dalam tahun berjalan s.d. bulan terpilih. */
function latestByCell(reports: Realisasi[], tahun: number, bulan: number, include: boolean) {
  const map = new Map<string, Realisasi>();
  for (const r of reports) {
    if (r.tahun !== tahun || r.bulan > bulan || r.bulan < 1) continue;
    if (!countsForAchievement(r, include)) continue;
    const k = `${r.sasaranId}|${r.unitId}`;
    const prev = map.get(k);
    if (!prev || r.bulan > prev.bulan) map.set(k, r);
  }
  return map;
}

function aggregate(s: Sasaran, cells: UnitCell[]): Pick<SasaranSummary, "value" | "aggregation"> {
  const withData = cells.filter((c) => c.applicable && c.value !== null);
  if (withData.length === 0) return { value: null, aggregation: "kosong" };
  if (withData.length === 1) return { value: withData[0].value, aggregation: "tunggal" };
  const ratioOk = s.jenis !== "indeks" && withData.every(
    (c) => c.report && c.report.pembilang !== null && c.report.penyebut !== null && c.report.penyebut > 0,
  );
  if (ratioOk) {
    const num = withData.reduce((a, c) => a + (c.report!.pembilang as number), 0);
    const den = withData.reduce((a, c) => a + (c.report!.penyebut as number), 0);
    const pct = s.jenis === "persentase" || s.satuan.includes("%");
    return { value: pct ? (num / den) * 100 : num / den, aggregation: "rasio-gabungan" };
  }
  const avg = withData.reduce((a, c) => a + (c.value as number), 0) / withData.length;
  return { value: avg, aggregation: "rata-rata-unit" };
}

export function buildDashboard(data: Dataset, f: Filters): DashboardModel {
  const sasaranSorted = [...data.sasaran].sort((a, b) => a.nomor - b.nomor);
  const unitsSorted = [...data.units].sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama));
  const visibleUnits = f.unitId === "all" ? unitsSorted : unitsSorted.filter((u) => u.id === f.unitId);
  const visibleUnitIds = new Set(visibleUnits.map((u) => u.id));
  const applicable = new Set(data.kontribusi.map((k) => `${k.sasaranId}|${k.unitId}`));
  const latest = latestByCell(data.realisasi, f.tahun, f.bulan, f.includeUnverified);
  const buktiByReport = new Map<string, number>();
  for (const b of data.bukti) buktiByReport.set(b.realisasiId, (buktiByReport.get(b.realisasiId) ?? 0) + 1);

  const yearReports = data.realisasi.filter(
    (r) => r.tahun === f.tahun && r.bulan <= f.bulan && visibleUnitIds.has(r.unitId),
  );

  const sasaranSummaries: SasaranSummary[] = sasaranSorted
    .map((s) => {
      const cells: UnitCell[] = visibleUnits.map((u) => {
        const isApp = applicable.has(`${s.id}|${u.id}`);
        const report = isApp ? latest.get(`${s.id}|${u.id}`) ?? null : null;
        const n = report ? nilaiRealisasi(report, s) : { value: null, derived: false };
        return {
          unit: u, sasaran: s, applicable: isApp, report, value: n.value, derived: n.derived,
          status: !isApp ? "na" : !report && semuaNA(data.nilaiDokumen?.[`${s.id}|${u.id}`], f.bulan) ? "tidakdiukur" : statusDariNilai(n.value, s),
          ratio: rasioCapaian(n.value, s),
        };
      });
      const units = cells.filter((c) => c.applicable).map((c) => c.unit);
      let agg = aggregate(s, cells);
      // Nilai gabungan Badan pada dokumen dipakai bila sama atau lebih baru daripada laporan unit terakhir.
      const ag = f.unitId === "all" ? data.agregatDokumen?.[s.id] : undefined;
      if (ag) {
        let bAg = 0;
        ag.forEach((v, i) => { if (typeof v === "number" && i + 1 <= f.bulan) bAg = i + 1; });
        const bUnit = Math.max(0, ...cells.map((c) => c.report?.bulan ?? 0));
        if (bAg && bAg >= bUnit) agg = { value: ag[bAg - 1] as number, aggregation: "agregat-dokumen" };
      }
      const appCells = cells.filter((c) => c.applicable);
      const allTidak = appCells.length > 0 && appCells.every((c) => c.status === "tidakdiukur");
      const rep = yearReports.filter((r) => r.sasaranId === s.id);
      const latestReport = rep.slice().sort((a, b) => b.bulan - a.bulan || (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0] ?? null;
      return {
        sasaran: s,
        units,
        cells,
        value: agg.value,
        aggregation: agg.aggregation,
        ratio: rasioCapaian(agg.value, s),
        status: !units.length ? ("na" as StatusCapaian) : agg.value === null && allTidak ? ("tidakdiukur" as StatusCapaian) : statusDariNilai(agg.value, s),
        reportsInYear: rep,
        pendingCount: rep.filter((r) => r.status === "diajukan").length,
        verifiedCount: rep.filter((r) => r.status === "terverifikasi").length,
        buktiCount: rep.reduce((a, r) => a + (buktiByReport.get(r.id) ?? 0), 0),
        latestReport,
      };
    });

  const relevant = sasaranSummaries.filter((s) => s.status !== "na");

  const unitSummaries: UnitSummary[] = visibleUnits.map((u) => {
    const cells = sasaranSummaries.map((s) => s.cells.find((c) => c.unit.id === u.id)!).filter((c) => c && c.applicable);
    const memenuhi = cells.filter((c) => c.status === "memenuhi").length;
    const belum = cells.filter((c) => isBelum(c.status)).length;
    return {
      unit: u,
      applicable: cells.length,
      memenuhi,
      belum,
      nodata: cells.filter((c) => c.status === "nodata").length,
      pending: yearReports.filter((r) => r.unitId === u.id && r.status === "diajukan").length,
      pct: memenuhi + belum > 0 ? (memenuhi / (memenuhi + belum)) * 100 : null,
    };
  });

  const sasaranById = new Map(sasaranSorted.map((s) => [s.id, s]));
  const monthly: MonthPoint[] = BULAN_PENDEK.map((label, i) => {
    const bulan = i + 1;
    let memenuhi = 0, belum = 0, laporan = 0;
    if (bulan <= f.bulan) {
      for (const r of data.realisasi) {
        if (r.tahun !== f.tahun || r.bulan !== bulan || !visibleUnitIds.has(r.unitId)) continue;
        if (!applicable.has(`${r.sasaranId}|${r.unitId}`)) continue;
        if (!countsForAchievement(r, f.includeUnverified)) continue;
        const s = sasaranById.get(r.sasaranId);
        if (!s) continue;
        laporan++;
        const st = statusDariNilai(nilaiRealisasi(r, s).value, s);
        if (st === "memenuhi") memenuhi++;
        else if (isBelum(st)) belum++;
      }
    }
    return { bulan, label, memenuhi, belum, laporan, pct: memenuhi + belum ? (memenuhi / (memenuhi + belum)) * 100 : null };
  });

  const memenuhi = relevant.filter((s) => s.status === "memenuhi").length;
  const belum = relevant.filter((s) => isBelum(s.status)).length;
  const today = new Date().toISOString().slice(0, 10);
  const tlReports = yearReports.filter((r) => r.tindakLanjut.trim() !== "");
  const tlOpen = tlReports.filter((r) => r.statusTindakLanjut !== "selesai");

  const lastUpdated = data.realisasi.reduce<string | null>(
    (a, r) => (r.updatedAt && (!a || r.updatedAt > a) ? r.updatedAt : a), null,
  );

  return {
    sasaran: sasaranSummaries,
    units: unitSummaries,
    visibleUnits,
    monthly,
    kpi: {
      totalSasaran: f.unitId === "all" ? sasaranSorted.length : relevant.length,
      totalUnit: visibleUnits.length,
      memenuhi,
      belum,
      nodata: relevant.filter((s) => s.status === "nodata").length,
      tidakdiukur: relevant.filter((s) => s.status === "tidakdiukur").length,
      unitMelapor: new Set(yearReports.filter((r) => r.bulan <= f.bulan && countsForAchievement(r, f.includeUnverified)).map((r) => r.unitId)).size,
      pctTercapai: memenuhi + belum ? (memenuhi / (memenuhi + belum)) * 100 : null,
      menungguVerifikasi: yearReports.filter((r) => r.status === "diajukan").length,
      tindakLanjutTerbuka: tlOpen.length,
      tindakLanjutLewat: tlOpen.filter((r) => r.batasWaktu && r.batasWaktu < today).length,
      terverifikasi: yearReports.filter((r) => r.status === "terverifikasi").length,
      draft: yearReports.filter((r) => r.status === "draft").length,
      perluPerbaikan: yearReports.filter((r) => r.status === "perlu_perbaikan").length,
    },
    lastUpdated,
  };
}

/** Kalimat ringkasan otomatis untuk pimpinan, disusun dari data yang sama dengan grafik. */
export function narasiRingkas(m: DashboardModel, periode: string): string {
  const k = m.kpi;
  const terukur = k.memenuhi + k.belum;
  if (terukur === 0) {
    return `Belum ada capaian yang dapat dinilai untuk posisi s.d. ${periode}. ${k.menungguVerifikasi > 0 ? `${k.menungguVerifikasi} laporan sedang menunggu verifikasi.` : "Laporan realisasi belum diterima."}`;
  }
  const lemah = m.sasaran
    .filter((s) => isBelum(s.status))
    .sort((a, b) => (a.ratio ?? 0) - (b.ratio ?? 0))
    .slice(0, 2)
    .map((s) => `Sasaran ${s.sasaran.nomor}`);
  const parts = [
    `Posisi s.d. ${periode}: ${k.memenuhi} dari ${terukur} sasaran terukur telah memenuhi target (${Math.round(k.pctTercapai ?? 0)}%).`,
  ];
  if (k.nodata > 0) parts.push(`${k.nodata} sasaran belum memiliki data terverifikasi.`);
  if (lemah.length) parts.push(`Perhatian terbesar ada pada ${lemah.join(" dan ")}.`);
  if (k.tindakLanjutLewat > 0) parts.push(`${k.tindakLanjutLewat} tindak lanjut telah melewati batas waktu tanpa konfirmasi penyelesaian.`);
  return parts.join(" ");
}

export interface SeriesPoint {
  bulan: number;
  value: number | null;
  status: StatusCapaian;
  laporan: number;
}

/**
 * Deret bulanan satu sasaran (laporan pada bulan itu saja), diagregasi dengan aturan yang sama
 * seperti ringkasan sasaran. Bila unitId diisi, deret hanya untuk unit tersebut.
 */
export function seriesForSasaran(data: Dataset, s: Sasaran, f: Filters, unitId?: string): SeriesPoint[] {
  const applicable = new Set(data.kontribusi.filter((k) => k.sasaranId === s.id).map((k) => k.unitId));
  const unitScope = unitId ?? (f.unitId === "all" ? null : f.unitId);
  return Array.from({ length: 12 }, (_, i) => {
    const bulan = i + 1;
    if (bulan > f.bulan) return { bulan, value: null, status: "nodata" as StatusCapaian, laporan: 0 };
    const reps = data.realisasi.filter(
      (r) => r.sasaranId === s.id && r.tahun === f.tahun && r.bulan === bulan && applicable.has(r.unitId)
        && (!unitScope || r.unitId === unitScope) && countsForAchievement(r, f.includeUnverified),
    );
    const cells = reps.map((r) => {
      const n = nilaiRealisasi(r, s);
      return { applicable: true, report: r, value: n.value } as unknown as UnitCell;
    });
    let agg = aggregate(s, cells);
    const ag = !unitScope ? data.agregatDokumen?.[s.id]?.[bulan - 1] : undefined;
    if (typeof ag === "number") agg = { value: ag, aggregation: "agregat-dokumen" };
    return { bulan, value: agg.value, status: statusDariNilai(agg.value, s), laporan: reps.length };
  });
}
