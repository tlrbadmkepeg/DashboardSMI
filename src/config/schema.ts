/**
 * PEMETAAN SKEMA SUPABASE — satu-satunya tempat nama tabel, kolom, dan fungsi RPC ditulis.
 *
 * Struktur kolom belum dapat dibaca langsung saat aplikasi ini disusun. Karena itu:
 * - Untuk MEMBACA data, setiap field punya daftar kandidat nama kolom. Kolom pertama yang ada dipakai.
 * - Untuk MENULIS data (insert/update draft), dipakai nama pertama dari daftar kandidat.
 *   Sesuaikan urutannya bila hasil "Pemeriksaan Skema" (menu Pengaturan) menunjukkan nama lain.
 * Aplikasi tidak membuat, mengubah, atau menghapus tabel maupun kebijakan RLS.
 */

export const TABLES = {
  unit: "unit_kerja",
  sasaran: "sasaran_smi",
  kontribusi: "kontribusi_unit",
  realisasi: "realisasi_bulanan",
  bukti: "bukti_dukung",
  profil: "profil_pengguna",
} as const;

export const STORAGE_BUCKET = "bukti-smi";

/** Lama berlaku tautan unduh bukti dukung (detik). Tautan dibuat lewat createSignedUrl, bukan public URL. */
export const SIGNED_URL_TTL = 300;

/** Pola jalur penyimpanan berkas. Samakan dengan kebijakan Storage yang berlaku. */
export const buildStoragePath = (p: { unitId: string; tahun: number; bulan: number; realisasiId: string; fileName: string }) => {
  const safe = p.fileName.normalize("NFKD").replace(/[^\w.\-]+/g, "_").slice(-120);
  return `${p.unitId}/${p.tahun}/${String(p.bulan).padStart(2, "0")}/${p.realisasiId}/${Date.now()}_${safe}`;
};

type Cols = Record<string, string[]>;

export const COLUMNS = {
  unit: {
    id: ["id", "unit_id", "kode_unit"],
    kode: ["kode", "kode_unit", "singkatan"],
    nama: ["nama_unit", "nama", "unit_kerja"],
    singkatan: ["singkatan", "nama_singkat", "alias"],
    urutan: ["urutan", "no_urut", "nomor"],
    aktif: ["aktif", "is_active"],
  },
  sasaran: {
    id: ["id", "sasaran_id"],
    nomor: ["nomor", "no_sasaran", "nomor_sasaran", "urutan", "kode"],
    nama: ["nama_sasaran", "sasaran", "nama", "uraian"],
    target: ["target", "nilai_target", "target_nilai"],
    targetLabel: ["target_teks", "keterangan_target", "target_label"],
    satuan: ["satuan", "satuan_target"],
    rumus: ["rumus", "rumus_pengukuran", "formula", "cara_ukur"],
    periode: ["periode_pengukuran", "periode", "frekuensi"],
    jenis: ["jenis_indikator", "tipe_indikator", "jenis_nilai", "tipe"],
    arah: ["arah_target", "polaritas", "arah", "operator_target"],
    standar: ["standar_iso", "standar", "acuan"],
    kelompok: ["kelompok", "tema", "kelompok_sasaran"],
    aktif: ["aktif", "is_active"],
  },
  kontribusi: {
    id: ["id"],
    sasaranId: ["sasaran_id", "id_sasaran"],
    unitId: ["unit_id", "unit_kerja_id", "id_unit"],
    aktif: ["aktif", "is_active", "berlaku"],
  },
  realisasi: {
    id: ["id"],
    sasaranId: ["sasaran_id", "id_sasaran"],
    unitId: ["unit_id", "unit_kerja_id", "id_unit"],
    tahun: ["tahun"],
    bulan: ["bulan"],
    pembilang: ["pembilang", "nilai_pembilang", "numerator"],
    penyebut: ["penyebut", "nilai_penyebut", "denominator"],
    nilaiIndeks: ["nilai_indeks", "indeks", "nilai_indeks_kepuasan"],
    realisasi: ["realisasi", "nilai_realisasi", "capaian"],
    status: ["status", "status_verifikasi", "status_laporan"],
    kendala: ["kendala", "permasalahan"],
    analisis: ["analisis_penyebab", "analisis", "akar_masalah"],
    tindakLanjut: ["tindak_lanjut", "rencana_tindak_lanjut"],
    batasWaktu: ["batas_waktu_tindak_lanjut", "batas_waktu", "tenggat_tindak_lanjut"],
    statusTindakLanjut: ["status_tindak_lanjut", "tindak_lanjut_selesai", "status_penyelesaian_tl"],
    catatanVerifikator: ["catatan_verifikator", "catatan_verifikasi", "catatan"],
    diajukanPada: ["diajukan_pada", "tanggal_pengajuan", "submitted_at"],
    diverifikasiPada: ["diverifikasi_pada", "tanggal_verifikasi", "verified_at"],
    verifikatorId: ["diverifikasi_oleh", "verifikator_id", "verified_by"],
    dibuatOleh: ["dibuat_oleh", "created_by", "pic_id", "user_id"],
    createdAt: ["created_at", "dibuat_pada"],
    updatedAt: ["updated_at", "diperbarui_pada"],
  },
  bukti: {
    id: ["id"],
    realisasiId: ["realisasi_id", "realisasi_bulanan_id", "id_realisasi"],
    namaFile: ["nama_file", "nama_berkas", "file_name"],
    path: ["path_file", "storage_path", "path", "file_path", "lokasi_file"],
    ukuran: ["ukuran_file", "ukuran", "size_bytes", "file_size"],
    tipe: ["tipe_file", "mime_type", "jenis_file", "content_type"],
    keterangan: ["keterangan", "deskripsi"],
    diunggahOleh: ["diunggah_oleh", "uploaded_by", "created_by"],
    createdAt: ["created_at", "diunggah_pada"],
  },
  profil: {
    id: ["id", "user_id", "auth_user_id"],
    nama: ["nama_lengkap", "nama", "full_name"],
    email: ["email"],
    peran: ["peran", "role"],
    unitId: ["unit_id", "unit_kerja_id", "id_unit"],
    aktif: ["aktif", "is_active", "status_aktif"],
    jabatan: ["jabatan"],
  },
} satisfies Record<string, Cols>;

/** Kolom yang dicoba untuk mencocokkan profil dengan auth.uid(). */
export const PROFIL_AUTH_KEYS = ["id", "user_id", "auth_user_id"];

/** Nilai status laporan yang dikenali. Nilai lain dinormalisasi lewat normalizeStatus(). */
export const STATUS_VALUES = {
  draft: "draft",
  diajukan: "diajukan",
  perlu_perbaikan: "perlu_perbaikan",
  terverifikasi: "terverifikasi",
} as const;

/** Saat membuat draft baru, kirim status 'draft' (bukan mengubah status pengajuan/verifikasi). */
export const SEND_DRAFT_STATUS_ON_INSERT = true;

/**
 * Kolom realisasi dihitung oleh database (trigger/generated column). Frontend hanya
 * menampilkan perkiraan dan TIDAK mengirim nilai realisasi bila opsi ini true.
 */
export const REALISASI_COMPUTED_BY_DB = true;

/**
 * Fungsi RPC alur kerja. Sesuaikan nama parameter dengan definisi fungsi di database.
 * Pengajuan dan verifikasi hanya melalui fungsi ini, tidak pernah lewat UPDATE kolom status.
 */
export const RPC = {
  ajukan: {
    name: "ajukan_realisasi_smi",
    args: (realisasiId: string) => ({ p_realisasi_id: realisasiId }),
  },
  verifikasi: {
    name: "verifikasi_realisasi_smi",
    keputusanSetuju: "terverifikasi",
    keputusanKembalikan: "perlu_perbaikan",
    args: (realisasiId: string, keputusan: string, catatan: string) => ({
      p_realisasi_id: realisasiId,
      p_keputusan: keputusan,
      p_catatan: catatan,
    }),
  },
};

/**
 * Tabel riwayat verifikasi. Belum tercantum dalam daftar tabel yang tersedia,
 * sehingga diset null: aplikasi tidak menampilkan riwayat fiktif.
 */
export const RIWAYAT_VERIFIKASI_TABLE: string | null = null;

/* ======================================================================
 * PUBLIKASI UNTUK PENGUNJUNG TANPA LOGIN
 * Pengunjung anonim TIDAK membaca tabel operasional. Capaian publik dibaca dari view
 * khusus yang hanya memuat laporan terverifikasi tanpa kendala, catatan, dan bukti.
 * Definisi view diusulkan di supabase/usulan_migrasi_portal.sql (belum dijalankan).
 * ====================================================================== */
export const PUBLIC_SOURCES = {
  /** Definisi sasaran, unit, dan kontribusi: dibaca dari tabel bila kebijakan SELECT anon diizinkan. */
  unit: "unit_kerja",
  sasaran: "sasaran_smi",
  kontribusi: "kontribusi_unit",
  /** View berisi realisasi terverifikasi saja. */
  realisasi: "publik_realisasi_smi",
} as const;

/* ======================================================================
 * TABEL KONTEN PORTAL (USULAN)
 * Belum tersedia di database. Aplikasi membacanya bila sudah dibuat; bila belum,
 * halaman menampilkan status "menunggu dokumen resmi". Tidak ada isi yang dikarang.
 * ====================================================================== */
export const PORTAL_TABLES = {
  konten: "konten_portal",
  dokumen: "dokumen_smi",
  struktur: "struktur_organisasi",
  timSmi: "tim_smi",
  proses: "proses_bisnis",
  isu: "isu_konteks",
  pihak: "pihak_berkepentingan",
  risiko: "risiko_peluang",
  komunikasi: "matriks_komunikasi",
  kegiatan: "kegiatan_smi",
  auditRingkasan: "publik_ringkasan_audit",
  temuan: "temuan_audit",
} as const;

/** Kunci baris pada tabel konten_portal. */
export const KONTEN_KEYS = {
  kebijakan: "kebijakan_smi",
  latarBelakang: "latar_belakang_smi",
  ruangLingkup: "ruang_lingkup_smi",
  metodeRisiko: "metode_penilaian_risiko",
  fkap: "fungsi_kepatuhan_anti_penyuapan",
  pelaporan: "mekanisme_pelaporan",
} as const;

/** Bucket publik untuk dokumen yang telah disetujui publikasi dan foto kegiatan (usulan). */
export const PUBLIC_DOC_BUCKET = "dokumen-publik-smi";
