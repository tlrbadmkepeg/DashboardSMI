import type { Role } from "@/config/roles";

/** "dokumen" = nilai dari dokumen pencapaian resmi (PM.SMI.L3-01), belum melalui verifikasi sistem. */
export type StatusLaporan = "draft" | "diajukan" | "perlu_perbaikan" | "terverifikasi" | "dokumen" | "lainnya";

/** Status ketercapaian sebuah nilai terhadap target. */
/** "tidakdiukur" = sumber mencatat N/A (tidak ada pengukuran) untuk seluruh bulan; berbeda dari belum dilaporkan. */
export type StatusCapaian = "memenuhi" | "mendekati" | "dibawah" | "nodata" | "na" | "tidakdiukur";

export type JenisIndikator = "persentase" | "indeks" | "nilai";
export type ArahTarget = "naik" | "turun";

export interface Unit {
  id: string;
  kode: string;
  nama: string;
  singkatan: string;
  urutan: number;
}

export interface Sasaran {
  id: string;
  nomor: number;
  nama: string;
  target: number | null;
  targetLabel: string;
  satuan: string;
  rumus: string;
  periode: string;
  jenis: JenisIndikator;
  arah: ArahTarget;
  standar: string;
  /** Kelompok tematik resmi bila tersedia di basis data. */
  kelompok: string;
}

export interface Kontribusi {
  sasaranId: string;
  unitId: string;
}

export interface Realisasi {
  id: string;
  sasaranId: string;
  unitId: string;
  tahun: number;
  bulan: number;
  pembilang: number | null;
  penyebut: number | null;
  nilaiIndeks: number | null;
  realisasiDb: number | null;
  status: StatusLaporan;
  statusRaw: string;
  kendala: string;
  analisis: string;
  tindakLanjut: string;
  batasWaktu: string | null;
  /** null = kolom status penyelesaian tidak tersedia di basis data. */
  statusTindakLanjut: "selesai" | "belum" | null;
  catatanVerifikator: string;
  diajukanPada: string | null;
  diverifikasiPada: string | null;
  updatedAt: string | null;
}

export interface Bukti {
  id: string;
  realisasiId: string;
  namaFile: string;
  path: string;
  ukuran: number | null;
  tipe: string;
  keterangan: string;
  createdAt: string | null;
}

export interface Profil {
  id: string;
  nama: string;
  email: string;
  peran: Role;
  unitId: string | null;
  aktif: boolean;
  jabatan: string;
}

export interface Dataset {
  units: Unit[];
  sasaran: Sasaran[];
  kontribusi: Kontribusi[];
  realisasi: Realisasi[];
  bukti: Bukti[];
  /** true bila kolom status penyelesaian tindak lanjut ditemukan. */
  hasStatusTindakLanjut: boolean;
  loadedAt: string;
  /** "publik" = dibaca pengunjung tanpa login (hanya data terverifikasi yang dipublikasikan). */
  scope: "publik" | "internal";
  /** false bila view publikasi capaian belum tersedia atau tidak dapat dibaca. */
  publikasiAktif: boolean;
  pesanPublikasi?: string;
  /** true bila capaian bersumber dari dokumen PM.SMI.L3-01 (belum melalui verifikasi sistem). */
  simulasi?: boolean;
  /** Nilai mentah dokumen per pasangan `${sasaranId}|${unitId}` (12 bulan; "NA" / null dipertahankan). */
  nilaiDokumen?: Record<string, (number | "NA" | null)[]>;
  /** Nilai gabungan Badan pada dokumen (baris "BPSDMP"), per sasaranId. */
  agregatDokumen?: Record<string, (number | "NA" | null)[]>;
  /** Tautan bukti dukung dokumen per `${sasaranId}|${unitId}` (khusus petugas). */
  buktiTautan?: Record<string, string>;
  /** Isi asli tabel kontribusi_unit sebelum digabung dengan dokumen. */
  kontribusiDb?: Kontribusi[];
  /** Pemetaan unit × sasaran menurut dokumen PM.SMI.L3-01. */
  kontribusiDokumen?: Kontribusi[];
}

export interface Filters {
  tahun: number;
  /** 1–12. Data dibaca sebagai posisi s.d. bulan ini. */
  bulan: number;
  unitId: string | "all";
  includeUnverified: boolean;
}

export interface DraftInput {
  id?: string;
  sasaranId: string;
  unitId: string;
  tahun: number;
  bulan: number;
  pembilang: number | null;
  penyebut: number | null;
  nilaiIndeks: number | null;
  realisasiManual: number | null;
  kendala: string;
  analisis: string;
  tindakLanjut: string;
  batasWaktu: string | null;
}
