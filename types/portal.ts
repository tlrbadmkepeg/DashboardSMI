/** Tipe data konten portal. Seluruhnya dibaca dari tabel usulan (lihat supabase/usulan_migrasi_portal.sql). */

export type LoadState<T> =
  | { status: "loading" }
  | { status: "ok"; rows: T[] }
  | { status: "unavailable"; kind: "belum-tersedia" | "tidak-berwenang" | "galat"; reason: string };

export interface Konten {
  kunci: string;
  judul: string;
  isi: string;
  kodeDokumen: string;
  revisi: string;
  tanggalBerlaku: string | null;
  pejabatPenetap: string;
  fileUrl: string | null;
  bolehUnduh: boolean;
  /** true bila isi diambil dari transkripsi dokumen resmi di aplikasi, bukan dari basis data. */
  resmi?: boolean;
}

export interface Dokumen {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  jenis: string;
  unitPemilik: string;
  proses: string;
  revisi: string;
  tanggalBerlaku: string | null;
  status: string;
  fileUrl: string | null;
  bolehUnduh: boolean;
}

export interface StrukturNode {
  id: string;
  parentId: string | null;
  nama: string;
  jenis: string;
  tugasFungsi: string;
  unitId: string | null;
  urutan: number;
}

export interface AnggotaTim {
  id: string;
  kelompok: string;
  jabatanTim: string;
  nama: string;
  jabatanDinas: string;
  unit: string;
  urutan: number;
}

export interface Proses {
  id: string;
  kode: string;
  nama: string;
  kelompok: "manajemen" | "utama" | "pendukung" | string;
  deskripsi: string;
  unitTerkait: string[];
  sopTerkait: string[];
  sasaranTerkait: number[];
  risikoTerkait: string[];
  dokumenTerkait: string[];
  urutan: number;
}

export interface Isu {
  id: string;
  jenis: "internal" | "eksternal" | string;
  isu: string;
  kategori: string;
  dampak: string;
  unitTerkait: string;
  risikoPeluang: string;
  respons: string;
  statusTinjau: string;
}

export interface Pihak {
  id: string;
  pihak: string;
  kebutuhan: string;
  harapan: string;
  persyaratan: string;
  proses: string;
}

export interface Risiko {
  id: string;
  kode: string;
  jenis: "mutu" | "penyuapan" | "peluang" | string;
  uraian: string;
  kategori: string;
  unit: string;
  kemungkinan: number | null;
  dampak: number | null;
  tingkat: string;
  pengendalian: string;
  mitigasi: string;
  statusPantau: string;
}

export interface Kegiatan {
  id: string;
  judul: string;
  kategori: string;
  tanggal: string | null;
  ringkasan: string;
  fotoUrl: string | null;
  dokumentasiUrl: string | null;
}

export interface RingkasanAudit {
  periode: string;
  standar: string;
  unitDiaudit: number | null;
  statusPelaksanaan: string;
  ofi: number | null;
  minor: number | null;
  mayor: number | null;
  tindakLanjut: number | null;
  belumDimulai: number | null;
  dalamProses: number | null;
  menungguVerifikasi: number | null;
  selesai: number | null;
  belumSelesai: number | null;
  terlambat: number | null;
  diperbarui: string | null;
}

export interface Temuan {
  id: string;
  nomor: string;
  tanggalAudit: string | null;
  unit: string;
  standar: string;
  klausul: string;
  uraian: string;
  buktiObjektif: string;
  kategori: string;
  akarPenyebab: string;
  koreksi: string;
  tindakanKorektif: string;
  pic: string;
  targetSelesai: string | null;
  realisasiSelesai: string | null;
  status: string;
  verifikasiEfektivitas: string;
  catatanAuditor: string;
}

export interface PortalContent {
  konten: LoadState<Konten>;
  dokumen: LoadState<Dokumen>;
  struktur: LoadState<StrukturNode>;
  timSmi: LoadState<AnggotaTim>;
  proses: LoadState<Proses>;
  isu: LoadState<Isu>;
  pihak: LoadState<Pihak>;
  risiko: LoadState<Risiko>;
  kegiatan: LoadState<Kegiatan>;
  auditRingkasan: LoadState<RingkasanAudit>;
  temuan: LoadState<Temuan>;
}
