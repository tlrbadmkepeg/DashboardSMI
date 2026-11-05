/**
 * KONTEN TETAP PORTAL
 *
 * Berkas ini hanya memuat:
 * (a) identitas dan ketentuan yang diberikan langsung oleh pemilik portal, dan
 * (b) penjelasan umum tentang konsep sistem manajemen ISO yang tidak spesifik BPSDMP.
 * Fakta khusus BPSDMP yang bersumber dari dokumen resmi PM.SMI ditranskripsi di src/content/resmi/.
 * Isi yang belum ada dokumennya (SOP, nama personel SK, temuan audit) dibaca dari basis data.
 */

export const PORTAL = {
  nama: "Portal Sistem Manajemen Integrasi BPSDMP",
  namaPendek: "Portal SMI BPSDMP",
  instansi: "Badan Pengembangan Sumber Daya Manusia Perdagangan",
  kementerian: "Kementerian Perdagangan Republik Indonesia",
  tagline: ["Mutu Layanan", "Integritas", "Pendidikan", "Perbaikan Berkelanjutan"],
  heroJudul: "Sistem Manajemen Integrasi BPSDMP",
  heroSub: "Membangun Tata Kelola yang Bermutu, Berintegritas, dan Berorientasi pada Perbaikan Berkelanjutan",
  heroNarasi:
    "SMI menyatukan tiga standar sistem manajemen dalam satu kerangka kerja: mutu layanan, pencegahan penyuapan, dan mutu penyelenggaraan pendidikan serta pelatihan. Portal ini menjadi rujukan bersama tentang kebijakan, sasaran mutu, dokumen, dan capaian penerapannya di seluruh unit kerja BPSDMP.",
};

export type PilarKey = "mutu" | "integritas" | "pendidikan";

export const PILAR: {
  key: PilarKey;
  standar: string;
  nama: string;
  fokus: string;
  ringkas: string;
  poin: string[];
  warna: string;
  soft: string;
}[] = [
  {
    key: "mutu",
    standar: "SNI ISO 9001:2015",
    nama: "Manajemen Mutu",
    fokus: "Mutu dan kepuasan pengguna layanan",
    ringkas: "Memastikan layanan diberikan secara konsisten, memenuhi persyaratan, dan terus ditingkatkan berdasarkan umpan balik pengguna.",
    poin: [
      "Fokus pada pengguna layanan dan pihak berkepentingan",
      "Pendekatan proses dan pemikiran berbasis risiko",
      "Pengukuran kepuasan dan kinerja layanan",
      "Pengendalian ketidaksesuaian dan tindakan korektif",
    ],
    warna: "#2563EB",
    soft: "#EFF4FF",
  },
  {
    key: "integritas",
    standar: "SNI ISO 37001:2025",
    nama: "Anti Penyuapan",
    fokus: "Integritas, kepatuhan, dan pencegahan penyuapan",
    ringkas: "Mencegah, mendeteksi, dan menangani penyuapan melalui kebijakan, pengendalian, uji tuntas, dan saluran pelaporan yang aman.",
    poin: [
      "Kebijakan anti penyuapan dan komitmen pimpinan",
      "Penilaian risiko penyuapan secara berkala",
      "Pengendalian gratifikasi dan benturan kepentingan",
      "Fungsi Kepatuhan Anti Penyuapan yang independen",
    ],
    warna: "#0F766E",
    soft: "#EBF7F5",
  },
  {
    key: "pendidikan",
    standar: "SNI ISO 21001:2025",
    nama: "Organisasi Pendidikan",
    fokus: "Mutu pendidikan, pelatihan, dan pembelajaran",
    ringkas: "Menyelaraskan penyelenggaraan pendidikan dan pelatihan dengan kebutuhan peserta didik dan pemangku kepentingan.",
    poin: [
      "Kebutuhan peserta didik sebagai pusat layanan",
      "Rancangan dan penyampaian pembelajaran yang efektif",
      "Aksesibilitas dan kesetaraan kesempatan belajar",
      "Penilaian hasil belajar dan kepuasan peserta",
    ],
    warna: "#142D4E",
    soft: "#EEF2F7",
  },
];

/**
 * Tujuh pokok komitmen Kebijakan SMI sebagaimana diringkas oleh pemilik portal.
 * Ringkasan ini TIDAK menggantikan teks resmi PM_L2 Kebijakan Mutu, yang ditampilkan
 * utuh dari konten_portal (kunci: kebijakan_smi) setelah dimuat.
 */
export const KOMITMEN_KEBIJAKAN = [
  { judul: "Mutu layanan dan kepuasan pengguna", pilar: ["mutu"] as PilarKey[] },
  { judul: "Pemenuhan peraturan dan persyaratan yang relevan", pilar: ["mutu", "integritas", "pendidikan"] as PilarKey[] },
  { judul: "Pengembangan kompetensi, sertifikasi, pembinaan jabatan fungsional, dan pendidikan", pilar: ["pendidikan", "mutu"] as PilarKey[] },
  { judul: "Aksesibilitas dan kesetaraan pembelajaran", pilar: ["pendidikan"] as PilarKey[] },
  { judul: "Pencegahan penyuapan, gratifikasi yang tidak sesuai ketentuan, penyalahgunaan kewenangan, dan benturan kepentingan", pilar: ["integritas"] as PilarKey[] },
  { judul: "Mekanisme pelaporan, perlindungan pelapor, dan independensi Fungsi Kepatuhan Anti Penyuapan", pilar: ["integritas"] as PilarKey[] },
  { judul: "Peningkatan efektivitas SMI secara berkelanjutan dan penguatan nilai ASN BerAKHLAK", pilar: ["mutu", "integritas", "pendidikan"] as PilarKey[] },
];

export const ALUR_KEBIJAKAN = [
  { judul: "Kebijakan SMI", ket: "Arah dan komitmen pimpinan" },
  { judul: "18 Sasaran Mutu", ket: "Ukuran keberhasilan yang terukur" },
  { judul: "Pelaksanaan Unit Kerja", ket: "10 unit menjalankan proses" },
  { judul: "Pengukuran Capaian", ket: "Realisasi dilaporkan dan diverifikasi" },
  { judul: "Evaluasi", ket: "Audit internal dan tinjauan manajemen" },
  { judul: "Perbaikan Berkelanjutan", ket: "Tindakan korektif dan peningkatan" },
];

/**
 * Pembaruan redaksi sasaran yang ditetapkan pemilik portal. Dipakai untuk MEMBANDINGKAN
 * dengan tabel sasaran_smi. Bila berbeda, portal menampilkan catatan konfirmasi; data tidak diubah.
 */
export const REVISI_SASARAN: Record<number, { harus: string; tidakBoleh: RegExp[]; catatan: string }> = {
  3: {
    harus:
      "Persentase sertifikat pelatihan ekspor, metrologi, mutu dan jasa perdagangan yang diterbitkan tepat waktu sesuai standar pelayanan yang ditetapkan mencapai paling sedikit 75%.",
    tidakBoleh: [/jasa\s+dan\s+jasa\s+perdagangan/i],
    catatan: "Redaksi terbaru menghilangkan pengulangan kata \"jasa\".",
  },
  4: {
    harus: "Surat Rekomendasi Hasil Uji Kompetensi",
    tidakBoleh: [/surat\s+keterangan\s+lulus/i, /surat\s+pemberitahuan\s+tidak\s+lulus/i],
    catatan: "Nama terbaru memakai istilah \"Surat Rekomendasi Hasil Uji Kompetensi\".",
  },
};

/** Konsep umum sistem manajemen (penjelasan generik standar ISO, bukan klaim BPSDMP). */
export const KONSEP = {
  pengertian:
    "Sistem Manajemen Integrasi adalah satu kerangka pengelolaan yang menggabungkan persyaratan beberapa standar sistem manajemen ke dalam kebijakan, proses, dokumen, dan evaluasi yang sama, sehingga organisasi tidak menjalankan sistem yang terpisah-pisah.",
  manfaat: [
    { judul: "Satu arah kebijakan", isi: "Komitmen mutu, integritas, dan pendidikan dirumuskan dalam satu kebijakan yang dipahami seluruh pegawai." },
    { judul: "Dokumen lebih ringkas", isi: "Prosedur, formulir, dan rekaman yang sama melayani beberapa standar sekaligus." },
    { judul: "Audit dan evaluasi terpadu", isi: "Audit internal dan tinjauan manajemen dilakukan sekali untuk ketiga standar." },
    { judul: "Risiko dikelola menyeluruh", isi: "Risiko mutu dan risiko penyuapan dinilai dengan metode yang selaras." },
    { judul: "Perbaikan terukur", isi: "Sasaran mutu, capaian, dan tindak lanjut dipantau dalam satu sistem." },
  ],
  pdca: [
    { fase: "Plan", nama: "Rencanakan", isi: "Menetapkan kebijakan, sasaran, proses, serta menilai risiko dan peluang." },
    { fase: "Do", nama: "Laksanakan", isi: "Menjalankan proses sesuai prosedur dan menyediakan sumber daya yang diperlukan." },
    { fase: "Check", nama: "Periksa", isi: "Memantau dan mengukur capaian, melakukan audit internal dan tinjauan manajemen." },
    { fase: "Act", nama: "Tindak lanjuti", isi: "Melakukan koreksi, tindakan korektif, dan peningkatan berkelanjutan." },
  ],
  pendekatanProses:
    "Kegiatan dikelola sebagai proses yang saling terkait: masukan, kegiatan, keluaran, pemilik proses, dan ukuran kinerja. Dengan begitu, hasil yang konsisten dicapai melalui proses yang dipahami, bukan bergantung pada individu.",
  berbasisRisiko:
    "Risiko dan peluang diidentifikasi sejak perencanaan. Pengendalian ditetapkan sebanding dengan tingkat risikonya, lalu efektivitasnya dipantau secara berkala. Untuk ISO 37001, penilaian khusus dilakukan terhadap risiko penyuapan.",
  perbaikan:
    "Setiap ketidaksesuaian, keluhan, temuan audit, dan sasaran yang belum tercapai menjadi masukan untuk tindakan korektif dan peningkatan, sehingga sistem terus menjadi lebih efektif.",
  peran: [
    { siapa: "Pimpinan", isi: "Menetapkan kebijakan dan sasaran, menyediakan sumber daya, memimpin tinjauan manajemen, serta menjadi teladan integritas." },
    { siapa: "Tim SMI", isi: "Mengoordinasikan penerapan, memelihara dokumen, menyelenggarakan audit internal, dan memantau tindak lanjut." },
    { siapa: "PIC unit kerja", isi: "Melaporkan realisasi sasaran mutu, mengelola bukti dukung, dan memastikan tindak lanjut berjalan." },
    { siapa: "Seluruh pegawai", isi: "Bekerja sesuai SOP, menjaga integritas, melaporkan ketidaksesuaian, dan berkontribusi pada perbaikan." },
  ],
};

/**
 * Tugas Fungsi Kepatuhan Anti Penyuapan menurut kerangka umum ISO 37001.
 * Rincian penetapan di BPSDMP (SK, personel, saluran pelaporan) dibaca dari konten_portal.
 */
export const FKAP_UMUM = [
  { judul: "Pengawasan sistem", isi: "Mengawasi rancangan dan penerapan sistem manajemen anti penyuapan." },
  { judul: "Pendampingan dan saran", isi: "Memberi saran dan panduan kepada pegawai tentang sistem anti penyuapan dan isu penyuapan." },
  { judul: "Kesesuaian dengan standar", isi: "Memastikan sistem anti penyuapan sesuai dengan persyaratan standar." },
  { judul: "Pelaporan kinerja", isi: "Melaporkan kinerja sistem anti penyuapan kepada pimpinan dan pengarah." },
];

export const TOPIK_INTEGRITAS = [
  { judul: "Pencegahan penyuapan", isi: "Kebijakan, uji tuntas, dan pengendalian pada proses yang berisiko." },
  { judul: "Benturan kepentingan", isi: "Identifikasi, deklarasi, dan pengelolaan situasi benturan kepentingan." },
  { judul: "Pengendalian gratifikasi", isi: "Penolakan dan pelaporan gratifikasi sesuai ketentuan yang berlaku." },
  { judul: "Mekanisme pelaporan", isi: "Saluran pelaporan yang menjamin kerahasiaan dan perlindungan pelapor." },
  { judul: "Pemantauan dan evaluasi", isi: "Evaluasi berkala atas efektivitas pengendalian anti penyuapan." },
  { judul: "Tindak lanjut kepatuhan", isi: "Penanganan laporan dan perbaikan pengendalian yang lemah." },
];

export const KATEGORI_DOKUMEN = [
  "Panduan SMI", "Kebijakan SMI", "Sasaran Mutu", "Konteks Organisasi", "Isu Internal dan Eksternal",
  "Pihak Berkepentingan", "Ruang Lingkup SMI", "Struktur Organisasi", "Tata Kelola SMI", "SK Tim SMI", "Peta Proses Bisnis",
  "Persyaratan Peraturan dan Kepatuhan", "Register Risiko dan Peluang", "Register Risiko Penyuapan", "Benturan Kepentingan", "Fungsi Kepatuhan Anti Penyuapan", "Matriks Komunikasi", "Daftar Induk Dokumen", "SOP",
  "Formulir dan Rekaman", "Program Audit Internal", "Laporan Audit Internal", "Tinjauan Manajemen", "Tindakan Korektif dan Perbaikan",
];

export const KATEGORI_KEGIATAN = [
  "Kerja sama", "Sosialisasi SMI", "Pelatihan auditor internal", "Rapat koordinasi", "Pendampingan",
  "Audit internal", "Tinjauan manajemen", "Evaluasi", "Perbaikan",
];

export const KELOMPOK_TIM = [
  "Pengarah / penanggung jawab", "Ketua", "Sekretariat", "Tim pelaksana",
  "Fungsi Kepatuhan Anti Penyuapan", "Auditor internal", "PIC unit kerja",
];

export const KELOMPOK_PROSES = [
  { key: "manajemen", nama: "Proses Manajemen", isi: "Proses yang mengarahkan dan mengendalikan organisasi." },
  { key: "utama", nama: "Proses Utama", isi: "Proses yang langsung menghasilkan layanan bagi pengguna." },
  { key: "pendukung", nama: "Proses Pendukung", isi: "Proses yang menyediakan sumber daya dan dukungan." },
];

export const STATUS_TL_AUDIT = ["Belum dimulai", "Dalam proses", "Menunggu verifikasi", "Selesai", "Terlambat"];

export const PESAN_AUDIT_KOSONG = "Audit internal dan pemantauan tindak lanjut sedang dalam proses.";

/**
 * Pengelompokan tematik sasaran untuk navigasi. Dipakai kolom kelompok/tema pada sasaran_smi bila ada;
 * bila tidak ada, dipakai pencocokan kata kunci. Nomor dan definisi resmi tidak diubah.
 */
export const TEMA_SASARAN: { nama: string; kata: RegExp }[] = [
  { nama: "Integritas dan anti penyuapan", kata: /(suap|gratifikasi|integritas|benturan|kepatuhan|pengaduan|whistle)/i },
  { nama: "Pendidikan dan pembelajaran", kata: /(mahasiswa|akademi|pendidikan|lulusan|pembelajaran|kurikulum|dosen|taruna)/i },
  { nama: "Sertifikasi dan uji kompetensi", kata: /(sertifikat|sertifikasi|uji kompetensi|rekomendasi|asesmen|jabatan fungsional)/i },
  { nama: "Pelatihan dan pengembangan kompetensi", kata: /(pelatihan|diklat|kompetensi|peserta|widyaiswara)/i },
  { nama: "Layanan dan kepuasan pengguna", kata: /(kepuasan|indeks|layanan|pelayanan|keluhan|survei)/i },
];
export const TEMA_LAIN = "Tata kelola dan dukungan";
