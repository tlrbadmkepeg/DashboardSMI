import type { Kegiatan } from "@/types/portal";

/**
 * Kegiatan SMI yang dicatat langsung oleh pemilik portal. Ringkasan disusun ulang dengan kata-kata sendiri.
 * Foto belum tersedia: unggah dokumentasi milik BPSDMP lalu isi fotoUrl (atau kolom foto_url di tabel kegiatan_smi).
 */
export const KEGIATAN_RESMI: Kegiatan[] = [
  {
    id: "resmi-2026-10-16-bsn",
    judul: "BPSDMP dan BSN menandatangani kesepakatan bersama penguatan mutu dan kompetensi SDM",
    kategori: "Kerja sama",
    tanggal: "2026-10-16",
    ringkasan:
      "Kementerian Perdagangan melalui BPSDMP dan Badan Standardisasi Nasional (BSN) menandatangani kesepakatan bersama di Tangerang, Banten, disaksikan Menteri Perdagangan Budi Santoso dan dihadiri Kepala BSN Donny Purnomo Januardhi Effyandono serta Kepala BPSDMP Djatmiko Bris Witjaksono. Melalui kerja sama ini, BSN mendukung BPSDMP lewat berbagi pengalaman, konsultasi, advokasi, dan pendampingan menuju penerapan Sistem Manajemen Integrasi (ISO 9001, ISO 21001, dan ISO 37001), sekaligus meningkatkan mutu layanan dan kompetensi sumber daya manusia perdagangan.",
    fotoUrl: null,
    dokumentasiUrl: null,
  },
];
