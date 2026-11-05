/**
 * SUMBER DATA PRATINJAU DESAIN — dipakai tanpa koneksi Supabase.
 * Definisi sasaran mengikuti PM.SMI.L3.2026; pemetaan dan pencapaian mengikuti dokumen PM.SMI.L3-01.2026.
 * Tidak ada angka simulasi.
 * Mode ini hanya aktif bila VITE_ENABLE_DESIGN_PREVIEW=true dan tidak dapat menulis data.
 */
import type { AuthApi, DataSource } from "./dataSource";
import { PreviewWriteError } from "./dataSource";
import type { Bukti, Dataset, Kontribusi, Profil, Realisasi, Sasaran, Unit } from "@/types/domain";
import type { Role } from "@/config/roles";
import { shortUnitName } from "./normalize";
import { SASARAN_RESMI } from "@/content/resmi/dokumen";

/** Nama dan kode unit pratinjau. Kode Sekretariat di basis data dapat berbeda. */
const UNITS: [string, string][] = [
  ["SEKRETARIAT", "Sekretariat BPSDMP"],
  ["PUS01", "Pusat Pengembangan Kompetensi Aparatur Perdagangan (Pusbangkom)"],
  ["PUS02", "Pusat Pembinaan Jabatan Fungsional Perdagangan (Pusbin)"],
  ["PUS03", "Pusat Pengembangan SDM Ekspor dan Jasa Perdagangan (PPEJP)"],
  ["BAL01", "Balai Pengembangan Kompetensi Perdagangan Padang"],
  ["BAL02", "Balai Pengembangan Kompetensi Perdagangan Yogyakarta"],
  ["BAL03", "Balai Pengembangan Kompetensi Perdagangan Makassar"],
  ["BAL04", "Balai Pelatihan Aparatur Metrologi dan Mutu (BPAMM)"],
  ["BAL05", "Balai Pelatihan Sumber Daya Manusia Metrologi, Mutu, dan Jasa Perdagangan (BPMJP)"],
  ["AKMET", "Akademi Metrologi dan Instrumentasi (Akmet)"],
];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const PREVIEW_YEAR = 2026;

const STANDAR_KELOMPOK: Record<string, string> = {
  "Sasaran mutu": "SNI ISO 9001:2015",
  "Sasaran anti penyuapan": "SNI ISO 37001:2025",
  "Sasaran organisasi pendidikan": "SNI ISO 21001:2025",
};
const PREVIEW_LAST_MONTH = 9;

function build(): Dataset {
  const units: Unit[] = UNITS.map(([kode, nama], i) => ({
    id: `u${i + 1}`, kode, nama, singkatan: shortUnitName(nama), urutan: i + 1,
  }));
  const sasaran: Sasaran[] = SASARAN_RESMI.map((r, i) => {
    const indeks = r.jenis === "indeks";
    return {
      id: `s${i + 1}`, nomor: r.nomor, nama: r.nama, target: r.target, targetLabel: r.targetLabel,
      satuan: indeks ? "indeks" : "%",
      // PM.SMI.L3.2026 tidak memuat rumus dan periode; keduanya dibaca dari sasaran_smi pada website mandiri.
      rumus: "", periode: "",
      jenis: indeks ? "indeks" : "persentase", arah: "naik", standar: STANDAR_KELOMPOK[r.kelompok] ?? "", kelompok: "",
    };
  });
  // Kontribusi dan realisasi diisi dari dokumen PM.SMI.L3-01.2026 (lihat services/dokumenPencapaian.ts).
  const kontribusi: Kontribusi[] = [];
  const realisasi: Realisasi[] = [];
  const bukti: Bukti[] = [];
  return { units, sasaran, kontribusi, realisasi, bukti, hasStatusTindakLanjut: false, loadedAt: new Date().toISOString(), scope: "internal", publikasiAktif: true };
}

let cache: Dataset | null = null;

function withSample(d: Dataset): Dataset { return d; }

export const previewSource: DataSource = {
  kind: "preview",
  async loadDataset() {
    await new Promise((r) => setTimeout(r, 350));
    cache ??= build();
    return withSample(cache);
  },
  async loadPublicDataset() {
    await new Promise((r) => setTimeout(r, 350));
    cache ??= build();
    const d = withSample(cache);
    return {
      ...d,
      scope: "publik",
      bukti: [],
      realisasi: d.realisasi
        .filter((r) => r.status === "terverifikasi" || r.status === "dokumen")
        .map((r) => ({ ...r, kendala: "", analisis: "", tindakLanjut: "", catatanVerifikator: "", batasWaktu: null })),
    };
  },
  async saveDraft() { throw new PreviewWriteError(); },
  async submit() { throw new PreviewWriteError(); },
  async verify() { throw new PreviewWriteError(); },
  async uploadBukti() { throw new PreviewWriteError(); },
  async signedUrl() { throw new Error("Berkas ilustrasi tidak memiliki isi. Pada website mandiri, tautan dibuat dari penyimpanan privat Supabase."); },
};

export const PREVIEW_PERIOD = { tahun: PREVIEW_YEAR, bulan: 10 };

let previewProfile: Profil | null = null;
const listeners = new Set<() => void>();

export const previewAuth: AuthApi & { signInAs(role: Role): Profil } = {
  signInAs(role) {
    previewProfile = {
      id: "preview",
      nama: role === "pic_unit" ? "PIC Unit (simulasi)" : role === "verifikator" ? "Verifikator (simulasi)" : "Administrator (simulasi)",
      email: "pratinjau@contoh.go.id",
      peran: role,
      unitId: role === "pic_unit" || role === "pimpinan_unit" ? "u5" : null,
      aktif: true,
      jabatan: "",
    };
    listeners.forEach((l) => l());
    return previewProfile;
  },
  async signIn() { throw new Error("Pada mode pratinjau desain, gunakan akun uji pratinjau."); },
  async signOut() { previewProfile = null; listeners.forEach((l) => l()); },
  async currentProfile() { return previewProfile; },
  onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
};
