import type { Bukti, Dataset, DraftInput, Profil } from "@/types/domain";

/**
 * Kontrak sumber data. Implementasi produksi: supabaseSource. Implementasi pratinjau desain:
 * previewSource (data ilustrasi, tanpa penulisan). Komponen tampilan hanya mengenal kontrak ini.
 */
export interface DataSource {
  kind: "supabase" | "preview";
  /** Data untuk pengunjung tanpa login: definisi + capaian terverifikasi yang dipublikasikan. */
  loadPublicDataset(): Promise<Dataset>;
  /** Data untuk petugas yang login, dibatasi RLS. */
  loadDataset(): Promise<Dataset>;
  saveDraft(input: DraftInput): Promise<string>;
  submit(realisasiId: string): Promise<void>;
  verify(realisasiId: string, keputusan: "setuju" | "kembalikan", catatan: string): Promise<void>;
  uploadBukti(p: { realisasiId: string; unitId: string; tahun: number; bulan: number; file: File; keterangan?: string }): Promise<Bukti>;
  signedUrl(path: string): Promise<string>;
}

export interface AuthApi {
  signIn(email: string, password: string): Promise<Profil>;
  signOut(): Promise<void>;
  currentProfile(): Promise<Profil | null>;
  onChange(cb: () => void): () => void;
}

export class PreviewWriteError extends Error {
  constructor() {
    super("Fitur ini menyimpan data ke Supabase dan tidak dijalankan pada mode pratinjau desain.");
  }
}
