import { COLUMNS } from "@/config/schema";
import { normalizeRole } from "@/config/roles";
import type {
  ArahTarget, Bukti, JenisIndikator, Kontribusi, Profil, Realisasi, Sasaran, StatusLaporan, Unit,
} from "@/types/domain";

type Row = Record<string, any>;

/** Ambil nilai kolom pertama yang tersedia dari daftar kandidat. */
export function pick(row: Row, candidates: string[]): any {
  for (const c of candidates) if (row && Object.prototype.hasOwnProperty.call(row, c)) return row[c];
  return undefined;
}

/** Nama kolom pertama yang benar-benar ada pada baris. */
export function resolveKey(row: Row | undefined, candidates: string[]): string | null {
  if (!row) return null;
  for (const c of candidates) if (Object.prototype.hasOwnProperty.call(row, c)) return c;
  return null;
}

export const toNum = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const m = String(v).replace(/\s/g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};

const toStr = (v: any) => (v === null || v === undefined ? "" : String(v));
const toBool = (v: any, dflt = true) => {
  if (v === undefined || v === null) return dflt;
  if (typeof v === "boolean") return v;
  return ["true", "1", "ya", "aktif", "active", "y"].includes(String(v).toLowerCase());
};

export function normalizeStatus(v: any): StatusLaporan {
  const s = toStr(v).toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (!s || s === "draf" || s === "draft") return "draft";
  if (["diajukan", "submitted", "menunggu_verifikasi", "pengajuan"].includes(s)) return "diajukan";
  if (["perlu_perbaikan", "dikembalikan", "revisi", "ditolak", "returned"].includes(s)) return "perlu_perbaikan";
  if (["terverifikasi", "disetujui", "diverifikasi", "verified", "approved"].includes(s)) return "terverifikasi";
  return "lainnya";
}

export function mapUnit(r: Row): Unit {
  const c = COLUMNS.unit;
  const nama = toStr(pick(r, c.nama));
  return {
    id: toStr(pick(r, c.id)),
    kode: toStr(pick(r, c.kode)),
    nama,
    singkatan: toStr(pick(r, c.singkatan)) || shortUnitName(nama),
    urutan: toNum(pick(r, c.urutan)) ?? 999,
  };
}

/** Nama ringkas untuk label grafik, diambil dari singkatan dalam kurung atau nama kota balai. */
export function shortUnitName(nama: string) {
  const inParen = nama.match(/\(([^)]+)\)/);
  if (inParen) return inParen[1];
  const kota = nama.match(/(Padang|Yogyakarta|Makassar)\s*$/i);
  if (kota) return `Bapekomdag ${kota[1]}`;
  if (/^Sekretariat/i.test(nama)) return "Sekretariat";
  return nama.length > 22 ? nama.slice(0, 20) + "…" : nama;
}

function inferJenis(raw: any, satuan: string): JenisIndikator {
  const s = toStr(raw).toLowerCase();
  if (s.includes("indeks") || s.includes("index") || s.includes("skala")) return "indeks";
  if (s.includes("persen") || s === "%" || s.includes("rasio")) return "persentase";
  if (s) return "nilai";
  const sat = satuan.toLowerCase();
  if (sat.includes("indeks") || sat.includes("skala")) return "indeks";
  if (sat === "%" || sat.includes("persen")) return "persentase";
  return "nilai";
}

function inferArah(raw: any, targetText: string): ArahTarget {
  const s = `${toStr(raw)} ${targetText}`.toLowerCase();
  if (/(turun|minimal_lebih_kecil|lower|≤|<=|<|maks|paling\s*banyak|maksimal)/.test(s)) return "turun";
  return "naik";
}

export function mapSasaran(r: Row): Sasaran {
  const c = COLUMNS.sasaran;
  const satuan = toStr(pick(r, c.satuan));
  const targetRaw = pick(r, c.target);
  const targetLabel = toStr(pick(r, c.targetLabel)) || toStr(targetRaw);
  return {
    id: toStr(pick(r, c.id)),
    nomor: toNum(pick(r, c.nomor)) ?? 0,
    nama: toStr(pick(r, c.nama)),
    target: toNum(targetRaw),
    targetLabel,
    satuan,
    rumus: toStr(pick(r, c.rumus)),
    periode: toStr(pick(r, c.periode)),
    jenis: inferJenis(pick(r, c.jenis), satuan),
    arah: inferArah(pick(r, c.arah), toStr(targetRaw)),
    standar: toStr(pick(r, c.standar)),
    kelompok: toStr(pick(r, c.kelompok)),
  };
}

export function mapKontribusi(r: Row): Kontribusi | null {
  const c = COLUMNS.kontribusi;
  if (!toBool(pick(r, c.aktif), true)) return null;
  return { sasaranId: toStr(pick(r, c.sasaranId)), unitId: toStr(pick(r, c.unitId)) };
}

function normalizeTL(v: any): "selesai" | "belum" | null {
  if (v === undefined) return null;
  if (typeof v === "boolean") return v ? "selesai" : "belum";
  const s = toStr(v).toLowerCase();
  if (!s) return "belum";
  return /(selesai|done|tuntas|closed|true)/.test(s) ? "selesai" : "belum";
}

export function mapRealisasi(r: Row): Realisasi {
  const c = COLUMNS.realisasi;
  const statusRaw = toStr(pick(r, c.status));
  const bt = pick(r, c.batasWaktu);
  return {
    id: toStr(pick(r, c.id)),
    sasaranId: toStr(pick(r, c.sasaranId)),
    unitId: toStr(pick(r, c.unitId)),
    tahun: toNum(pick(r, c.tahun)) ?? 0,
    bulan: toNum(pick(r, c.bulan)) ?? 0,
    pembilang: toNum(pick(r, c.pembilang)),
    penyebut: toNum(pick(r, c.penyebut)),
    nilaiIndeks: toNum(pick(r, c.nilaiIndeks)),
    realisasiDb: toNum(pick(r, c.realisasi)),
    status: normalizeStatus(statusRaw),
    statusRaw,
    kendala: toStr(pick(r, c.kendala)),
    analisis: toStr(pick(r, c.analisis)),
    tindakLanjut: toStr(pick(r, c.tindakLanjut)),
    batasWaktu: bt ? toStr(bt).slice(0, 10) : null,
    statusTindakLanjut: normalizeTL(pick(r, c.statusTindakLanjut)),
    catatanVerifikator: toStr(pick(r, c.catatanVerifikator)),
    diajukanPada: toStr(pick(r, c.diajukanPada)) || null,
    diverifikasiPada: toStr(pick(r, c.diverifikasiPada)) || null,
    updatedAt: toStr(pick(r, c.updatedAt)) || toStr(pick(r, c.createdAt)) || null,
  };
}

export function mapBukti(r: Row): Bukti {
  const c = COLUMNS.bukti;
  const path = toStr(pick(r, c.path));
  return {
    id: toStr(pick(r, c.id)),
    realisasiId: toStr(pick(r, c.realisasiId)),
    namaFile: toStr(pick(r, c.namaFile)) || path.split("/").pop() || "Berkas",
    path,
    ukuran: toNum(pick(r, c.ukuran)),
    tipe: toStr(pick(r, c.tipe)),
    keterangan: toStr(pick(r, c.keterangan)),
    createdAt: toStr(pick(r, c.createdAt)) || null,
  };
}

export function mapProfil(r: Row): Profil | null {
  const c = COLUMNS.profil;
  const peran = normalizeRole(pick(r, c.peran));
  if (!peran) return null;
  const unit = pick(r, c.unitId);
  return {
    id: toStr(pick(r, c.id)),
    nama: toStr(pick(r, c.nama)) || toStr(pick(r, c.email)),
    email: toStr(pick(r, c.email)),
    peran,
    unitId: unit === null || unit === undefined || unit === "" ? null : toStr(unit),
    aktif: toBool(pick(r, c.aktif), false),
    jabatan: toStr(pick(r, c.jabatan)),
  };
}
