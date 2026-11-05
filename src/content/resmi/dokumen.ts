/**
 * DOKUMEN RESMI SMI BPSDMP — transkripsi dari dokumen terkendali di Project "DAshboard SMI".
 * Isi disalin apa adanya. Bila ada pembaruan dokumen, perbarui berkas ini atau muat ke tabel
 * konten_portal / dokumen_smi; data basis data selalu didahulukan.
 */

export interface MetaDokumen {
  kode: string;
  judul: string;
  kategori: string;
  revisi: string;
  tanggal: string; // ISO
  status: string;
  acuan: string;
  berkas: string;
  catatan?: string;
}

export const ACUAN_SMI = "SNI ISO 9001:2015; SNI ISO 37001:2025; SNI ISO 21001:2025";

/** Daftar dokumen PM.SMI yang tersedia. PM.SMI.L13 tidak termasuk dalam berkas yang diterima. */
export const DOKUMEN_RESMI: MetaDokumen[] = [
  { kode: "PM.SMI.L1.2026", judul: "Pernyataan Ruang Lingkup Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Ruang Lingkup SMI", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L1 Pernyataan Ruang Lingkup SMI BPSDMP.docx" },
  { kode: "PM.SMI.L2.2026", judul: "Kebijakan Sistem Manajemen Integrasi", kategori: "Kebijakan SMI", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L2 Kebijakan Mutu.docx" },
  { kode: "PM.SMI.L3.2026", judul: "Sasaran Mutu, Sasaran Anti Penyuapan, dan Sasaran Organisasi Pendidikan", kategori: "Sasaran Mutu", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L3 Sasaran Mutu (1).docx", catatan: "Versi dengan redaksi Sasaran 3 yang telah diperbaiki." },
  { kode: "PM.SMI.L3-01.2026", judul: "Pencapaian Sasaran Mutu BPSDMP Tahun 2026", kategori: "Sasaran Mutu", revisi: "—", tanggal: "", status: "Rekaman capaian", acuan: ACUAN_SMI, berkas: "PM_L3-01_Pencapaian docx", catatan: "Capaian bulanan per unit s.d. Oktober 2026; dipakai portal dengan label sumber dokumen, belum diverifikasi sistem." },
  { kode: "PM.SMI.L4.2026", judul: "Struktur Organisasi dan Unit Kerja dalam Lingkup SMI BPSDMP", kategori: "Struktur Organisasi", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L4 Struktur Organsiasi dan Unit Kerja  SMI BPSDMP.docx", catatan: "Bagan ditampilkan sebagai gambar asli pada halaman Struktur Organisasi BPSDMP." },
  { kode: "PM.SMI.L5.2026", judul: "Struktur dan Bagan Tata Kelola Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Tata Kelola SMI", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L5 Struktur dan Bagan Tata Kelola SMIBPSDMP.docx" },
  { kode: "PM.SMI.L6-2026", judul: "Peta Proses dan Interaksi Proses Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Peta Proses Bisnis", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L6 Peta Proses dan Interaksi Proses SMIBPSDMP.docx" },
  { kode: "PM.SMI.L7.2026", judul: "Matriks Konteks Organisasi Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Isu Internal dan Eksternal", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L7 Matriks Konteks Organisasi BPSDMP SMI BPSMDP.docx" },
  { kode: "PM.SMI.L8.2026", judul: "Matriks Pemangku Kepentingan Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Pihak Berkepentingan", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L8 Matriks Pemangku Kepentingan BPSDMP SMI BPSDMP.docx" },
  { kode: "PM.SMI.L9.2026", judul: "Matriks Persyaratan Peraturan dan Kepatuhan Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Persyaratan Peraturan dan Kepatuhan", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L9 Matriks Persyaratan Peraturan dan Kepatuhan SMI BPSDMP .docx" },
  { kode: "PM.SMI.L10.2026", judul: "Register Risiko, Peluang dan Risiko Penyuapan Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Register Risiko dan Peluang", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L10 Register Resiko, Peluang dan Resiko Penyuapan SMI BPSDMP.docx" },
  { kode: "Matriks Risiko SMI 2026", judul: "Matriks Risiko Sistem Manajemen Integrasi BPSDMP Tahun 2026", kategori: "Register Risiko dan Peluang", revisi: "—", tanggal: "", status: "Berkas kerja", acuan: ACUAN_SMI, berkas: "Matriks_Risiko_SMI_BPSDMP_2026.xlsx", catatan: "28 risiko pada 11 sasaran/tujuan; kolom residual belum diisi." },
  { kode: "PM.SMI.L11.2026", judul: "Matriks Benturan Kepentingan Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Benturan Kepentingan", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L11 Matriks Benturan Kepentingan SMI BPSDMP .docx" },
  { kode: "PM.SMI.L12.2026", judul: "Matriks Komunikasi Sistem Manajemen Integrasi (SMI) BPSDMP", kategori: "Matriks Komunikasi", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L12 Matriks Komunikasi SMI BPSDMP .docx" },
  { kode: "PM.SMI.L14.2026", judul: "Rencana Kegiatan Fungsi Anti Penyuapan BPSDMP Tahun 2026", kategori: "Fungsi Kepatuhan Anti Penyuapan", revisi: "1/0", tanggal: "2026-06-22", status: "Dokumen Terkendali", acuan: ACUAN_SMI, berkas: "PM_L14 Rencana Kegiatan Fungsi Anti Penyuapan BPSDMP 2026.docx" },
];

export const sumber = (kode: string) => {
  const d = DOKUMEN_RESMI.find((x) => x.kode === kode);
  return d ? `${d.kode} · Rev. ${d.revisi} · 22 Juni 2026` : kode;
};

/* ======================= PM.SMI.L2.2026 — KEBIJAKAN ======================= */

export const KEBIJAKAN = {
  kode: "PM.SMI.L2.2026",
  judul: "Kebijakan Sistem Manajemen Integrasi",
  revisi: "1/0",
  tanggal: "2026-06-22",
  status: "Dokumen Terkendali",
  penetap: "Kepala Badan Pengembangan Sumber Daya Manusia Perdagangan",
  namaPenetap: "Djatmiko Bris Witjaksono",
  tempatTanggal: "Jakarta, 29 Juni 2026",
  pembuka:
    "Badan Pengembangan Sumber Daya Manusia Perdagangan berkomitmen menerapkan Sistem Manajemen Integrasi secara konsisten, efektif, dan berkelanjutan, selaras dengan tugas, konteks organisasi, visi, misi, dan arah strategis BPSDMP, sebagai kerangka dalam menetapkan sasaran mutu, sasaran anti penyuapan, dan sasaran organisasi pendidikan serta memantau dan meninjau pencapaiannya guna meningkatkan mutu layanan pengembangan kompetensi aparatur dan non-aparatur, sertifikasi, pembinaan jabatan fungsional, pendidikan, serta layanan pendukung lainnya di lingkungan BPSDMP, dengan komitmen untuk:",
  komitmen: [
    "memberikan layanan yang bermutu, profesional, akuntabel, inklusif, dan berorientasi pada kepuasan pengguna layanan, peserta pembelajaran, mahasiswa, dan penerima manfaat, serta pada pemenuhan kebutuhan pemangku kepentingan;",
    "memenuhi ketentuan peraturan perundang-undangan, standar pelayanan, persyaratan pembelajaran, dan persyaratan lain yang relevan dengan penerapan Sistem Manajemen Integrasi;",
    "menyelenggarakan pengembangan kompetensi aparatur dan non-aparatur, sertifikasi, pembinaan jabatan fungsional, dan pendidikan secara efektif berdasarkan kebutuhan peserta dan organisasi untuk menghasilkan peserta dan lulusan yang memiliki kompetensi yang relevan dengan kebutuhan pemangku kepentingan;",
    "menjamin aksesibilitas dan kesetaraan dalam penyelenggaraan pendidikan dan pembelajaran sesuai ketentuan yang berlaku;",
    "melarang segala bentuk penyuapan dan gratifikasi yang tidak sesuai ketentuan, penyalahgunaan kewenangan, dan benturan kepentingan serta memastikan pengendalian risiko dan penanganan indikasi penyuapan dilakukan secara objektif dan efektif;",
    "menyediakan mekanisme pelaporan yang aman, memberikan perlindungan kepada pelapor, menjamin independensi dan kewenangan Fungsi Kepatuhan Anti Penyuapan serta menerapkan konsekuensi terhadap pelanggaran sesuai ketentuan; dan",
    "meningkatkan kesesuaian dan efektivitas Sistem Manajemen Integrasi secara berkelanjutan melalui penerapan standar mutu layanan, penguatan integritas dan kepatuhan, pengendalian gratifikasi, pencegahan penyuapan serta penguatan nilai dasar ASN BerAKHLAK.",
  ],
  penutup:
    "Kebijakan ini dikomunikasikan, dipahami dan diterapkan oleh seluruh pihak terkait dan tersedia bagi pemangku kepentingan yang relevan, serta ditinjau secara berkala untuk memastikan kesesuaian dan efektivitas penerapannya.",
};

export const teksKebijakanLengkap = () =>
  [KEBIJAKAN.pembuka, "", ...KEBIJAKAN.komitmen.map((k, i) => `${String.fromCharCode(97 + i)}. ${k}`), "", KEBIJAKAN.penutup].join("\n");

/* ======================= PM.SMI.L3.2026 — 18 SASARAN ======================= */

export interface SasaranResmi {
  nomor: number;
  nama: string;
  target: number;
  targetLabel: string;
  satuan: string;
  jenis: "persentase" | "indeks";
  kelompok: "Sasaran mutu" | "Sasaran anti penyuapan" | "Sasaran organisasi pendidikan";
}

/**
 * Redaksi resmi dari "PM_L3 Sasaran Mutu (1).docx" (redaksi Sasaran 3 telah diperbaiki).
 * Kelompok mengikuti judul dokumen; penempatan tiap butir dalam kelompok adalah penandaan
 * portal untuk navigasi (dokumen tidak membagi butir per kelompok) dan dapat dikoreksi Tim SMI.
 */
export const SASARAN_RESMI: SasaranResmi[] = [
  { nomor: 1, nama: "Persentase sertifikat pengembangan kompetensi aparatur yang diterbitkan tepat waktu sesuai standar pelayanan yang ditetapkan mencapai paling sedikit 85%.", target: 85, targetLabel: "≥ 85%", satuan: "%", jenis: "persentase", kelompok: "Sasaran mutu" },
  { nomor: 2, nama: "Persentase Surat Dinas Hasil Rekognisi Pembelajaran Lampau yang diselesaikan tepat waktu sesuai standar pelayanan yang ditetapkan mencapai paling sedikit 85%.", target: 85, targetLabel: "≥ 85%", satuan: "%", jenis: "persentase", kelompok: "Sasaran mutu" },
  { nomor: 3, nama: "Persentase sertifikat pelatihan ekspor, metrologi, mutu dan jasa perdagangan yang diterbitkan tepat waktu sesuai standar pelayanan yang ditetapkan mencapai paling sedikit 75%.", target: 75, targetLabel: "≥ 75%", satuan: "%", jenis: "persentase", kelompok: "Sasaran mutu" },
  { nomor: 4, nama: "Persentase Surat Rekomendasi Hasil Uji Kompetensi yang diterbitkan paling lama 15 hari kerja setelah pelaksanaan uji kompetensi mencapai 100%.", target: 100, targetLabel: "100%", satuan: "%", jenis: "persentase", kelompok: "Sasaran mutu" },
  { nomor: 5, nama: "Persentase rekomendasi formasi Jabatan Fungsional Bidang Perdagangan yang ditetapkan paling lama 13 hari kerja sejak dokumen permohonan diterima secara lengkap dan benar mencapai paling sedikit 80%.", target: 80, targetLabel: "≥ 80%", satuan: "%", jenis: "persentase", kelompok: "Sasaran mutu" },
  { nomor: 6, nama: "Persentase dokumen kelulusan yang diselesaikan tepat waktu sesuai standar pelayanan akademik yang ditetapkan mencapai paling sedikit 85%.", target: 85, targetLabel: "≥ 85%", satuan: "%", jenis: "persentase", kelompok: "Sasaran organisasi pendidikan" },
  { nomor: 7, nama: "Persentase lulusan yang terserap bekerja pada bidang metrologi, instrumentasi, dan perdagangan dalam periode pemantauan lulusan yang ditetapkan mencapai paling sedikit 65%.", target: 65, targetLabel: "≥ 65%", satuan: "%", jenis: "persentase", kelompok: "Sasaran organisasi pendidikan" },
  { nomor: 8, nama: "Persentase pengajar pelatihan yang memperoleh hasil evaluasi paling rendah kategori “Baik” mencapai paling sedikit 85%.", target: 85, targetLabel: "≥ 85%", satuan: "%", jenis: "persentase", kelompok: "Sasaran organisasi pendidikan" },
  { nomor: 9, nama: "Persentase peserta uji kompetensi yang dinyatakan kompeten berdasarkan hasil asesmen sesuai kriteria kompetensi yang ditetapkan mencapai paling sedikit 80%.", target: 80, targetLabel: "≥ 80%", satuan: "%", jenis: "persentase", kelompok: "Sasaran mutu" },
  { nomor: 10, nama: "Persentase peserta program pelatihan dan pengembangan kompetensi aparatur dan non-aparatur yang memenuhi kriteria evaluasi hasil pembelajaran sesuai ketentuan masing-masing program mencapai paling sedikit 75%.", target: 75, targetLabel: "≥ 75%", satuan: "%", jenis: "persentase", kelompok: "Sasaran organisasi pendidikan" },
  { nomor: 11, nama: "Persentase program pelatihan dan pengembangan kompetensi yang dilaksanakan sesuai kurikulum, silabus, serta persyaratan pembelajaran yang telah ditetapkan, termasuk setiap perubahan yang telah disahkan, mencapai 100%.", target: 100, targetLabel: "100%", satuan: "%", jenis: "persentase", kelompok: "Sasaran organisasi pendidikan" },
  { nomor: 12, nama: "Persentase rekomendasi hasil evaluasi penyelenggaraan pengembangan kompetensi aparatur dan non-aparatur yang ditindaklanjuti sesuai batas waktu yang ditetapkan mencapai paling sedikit 75%.", target: 75, targetLabel: "≥ 75%", satuan: "%", jenis: "persentase", kelompok: "Sasaran organisasi pendidikan" },
  { nomor: 13, nama: "Indeks kepuasan pengguna layanan terhadap layanan Badan Pengembangan Sumber Daya Manusia Perdagangan mencapai nilai paling sedikit 3,00 pada skala 4,00.", target: 3, targetLabel: "≥ 3,00 (skala 4,00)", satuan: "indeks", jenis: "indeks", kelompok: "Sasaran mutu" },
  { nomor: 14, nama: "Persentase laporan gratifikasi, deklarasi benturan kepentingan, serta laporan atau indikasi penyuapan yang diterima dan ditindaklanjuti tepat waktu sesuai standar penanganan mencapai 100%.", target: 100, targetLabel: "100%", satuan: "%", jenis: "persentase", kelompok: "Sasaran anti penyuapan" },
  { nomor: 15, nama: "Persentase pegawai dan pihak eksternal yang diwajibkan menandatangani pakta integritas sesuai ketentuan mencapai 100%.", target: 100, targetLabel: "100%", satuan: "%", jenis: "persentase", kelompok: "Sasaran anti penyuapan" },
  { nomor: 16, nama: "Persentase pegawai pada fungsi atau kegiatan yang memiliki risiko penyuapan dan telah mengikuti sosialisasi dan/atau pelatihan anti penyuapan sesuai ketentuan mencapai 100%.", target: 100, targetLabel: "100%", satuan: "%", jenis: "persentase", kelompok: "Sasaran anti penyuapan" },
  { nomor: 17, nama: "Persentase kebutuhan aksesibilitas dan akomodasi yang layak bagi peserta pembelajaran yang telah diidentifikasi sesuai ketentuan mencapai 75%.", target: 75, targetLabel: "75%", satuan: "%", jenis: "persentase", kelompok: "Sasaran organisasi pendidikan" },
  { nomor: 18, nama: "Persentase permohonan layanan konsultasi dan pengaduan pelayanan, selain laporan terkait gratifikasi, benturan kepentingan, dan indikasi penyuapan, yang ditindaklanjuti sesuai ketentuan dan standar waktu layanan yang ditetapkan mencapai paling sedikit 90%.", target: 90, targetLabel: "≥ 90%", satuan: "%", jenis: "persentase", kelompok: "Sasaran mutu" },
];

/* ======================= PM.SMI.L1.2026 — RUANG LINGKUP ======================= */

export const RUANG_LINGKUP = {
  kode: "PM.SMI.L1.2026",
  tujuan: [
    "Pernyataan ruang lingkup ini menetapkan batas organisasi, proses, produk dan layanan, lokasi dan media penerapan, serta keterkaitan persyaratan standar yang menjadi dasar Sistem Manajemen Integrasi (SMI) Badan Pengembangan Sumber Daya Manusia Perdagangan (BPSDMP). Penetapan ruang lingkup mempertimbangkan mandat dan kewenangan organisasi, isu internal dan eksternal, kebutuhan dan harapan pemangku kepentingan yang relevan, persyaratan peraturan perundang-undangan, risiko dan peluang, risiko penyuapan, karakteristik pendidikan dan pembelajaran, serta proses yang berada dalam kendali BPSDMP.",
    "Pernyataan ini merupakan informasi terdokumentasi yang digunakan sebagai acuan penerapan, audit internal, Tinjauan Manajemen, komunikasi ruang lingkup kepada pihak yang relevan, dan penetapan lingkup sertifikasi. Pernyataan ruang lingkup tidak menggantikan ketentuan organisasi dan tata kerja, standar teknis, statuta, standar pelayanan, atau ketentuan peraturan perundang-undangan yang berlaku.",
  ],
  pernyataan:
    "Penyelenggaraan pengembangan sumber daya manusia perdagangan yang mencakup pengembangan kompetensi aparatur dan nonaparatur; pengembangan sumber daya manusia ekspor, metrologi legal, mutu, dan jasa perdagangan bagi dunia usaha dan masyarakat; pembinaan jabatan fungsional perdagangan dan penilaian kompetensi; pendidikan vokasi di bidang metrologi dan instrumentasi; serta proses manajemen, administrasi, dukungan, evaluasi, peningkatan, dan pengendalian anti penyuapan yang terkait pada seluruh unit kerja BPSDMP.",
  catatanPernyataan:
    "Pernyataan di atas merupakan ruang lingkup internal SMI BPSDMP. Redaksi pada sertifikat dapat diringkas atau disesuaikan untuk masing-masing standar berdasarkan hasil audit dan keputusan lembaga sertifikasi, tetapi tidak boleh memperluas atau mengurangi batas organisasi, proses, produk dan layanan tanpa persetujuan BPSDMP melalui pengendalian perubahan yang berlaku.",
  batasOrganisasi:
    "Batas organisasi SMI mencakup sepuluh unit kerja. Personel, proses, fasilitas, informasi terdokumentasi, transaksi, dan kerja sama yang berada dalam kewenangan unit termasuk dalam pengendalian SMI sesuai relevansinya. Penyedia eksternal dan rekan bisnis tidak menjadi bagian dari batas organisasi BPSDMP; namun proses, produk, atau jasa yang mereka sediakan dan dapat memengaruhi kesesuaian layanan, integritas, atau hasil pendidikan dikendalikan oleh BPSDMP secara proporsional berdasarkan persyaratan dan risiko.",
  kelompokProses: [
    ["Manajemen dan tata kelola", "Penetapan konteks, arah, kebijakan dan sasaran; perencanaan; manajemen risiko dan peluang; penilaian risiko penyuapan; kepatuhan; pengendalian perubahan; pengelolaan sumber daya; komunikasi; pemantauan kinerja; audit internal; Tinjauan Manajemen; tindakan korektif; dan peningkatan."],
    ["Pengembangan kompetensi aparatur", "Kebijakan teknis, perencanaan program, pengembangan kompetensi kepemimpinan/manajerial dan teknis, manajemen pengetahuan, pelatihan aparatur, pembelajaran tatap muka/daring/bauran, asesmen/evaluasi, dan penerbitan bukti hasil layanan sesuai ketentuan."],
    ["Pengembangan SDM dunia usaha dan masyarakat", "Pengembangan SDM ekspor, metrologi legal, mutu, dan jasa perdagangan; pelatihan/pengembangan kompetensi nonaparatur; promosi, kerja sama, pembinaan lembaga, pendampingan pelaku usaha, evaluasi, dan penerbitan bukti hasil layanan sesuai ketentuan."],
    ["Pembinaan jabatan fungsional dan penilaian kompetensi", "Kebijakan teknis, standar kompetensi, rencana pengembangan kompetensi fungsional, rekomendasi formasi, akreditasi pelaksanaan uji kompetensi, penilaian kompetensi jabatan nonmanajerial, pertimbangan pengangkatan, pembinaan profesi, fasilitasi tugas jabatan fungsional, konsultasi dan layanan informasi."],
    ["Pendidikan vokasi", "Perencanaan dan pelaksanaan pendidikan vokasi; pengembangan kurikulum/pembelajaran; asesmen dan dokumen akademik; penelitian dan pengabdian kepada masyarakat; penjaminan mutu; layanan kemahasiswaan; perpustakaan/laboratorium/workshop; kerja sama, pemagangan, penempatan kerja, dan hubungan alumni."],
    ["Proses pendukung", "Perencanaan dan anggaran, keuangan, SDM, organisasi dan tata laksana, hukum, data dan informasi, teknologi informasi, BMN, pengadaan, sarana/prasarana, persuratan, kearsipan, komunikasi, keamanan informasi, kerja sama, layanan umum, dan dukungan lain sesuai kewenangan."],
    ["Evaluasi dan peningkatan", "Pemantauan sasaran dan proses; kepuasan pengguna/peserta; evaluasi pembelajaran dan dampak; evaluasi penyedia eksternal; audit; Tinjauan Manajemen; keluhan/pengaduan/banding sesuai relevansi; ketidaksesuaian, tindakan korektif, inovasi, dan peningkatan berkelanjutan."],
    ["Pengendalian anti penyuapan", "Penilaian risiko penyuapan; uji kelayakan sesuai kebutuhan; pengendalian keuangan dan nonkeuangan; benturan kepentingan; hadiah, jamuan, donasi/sponsorship dan manfaat serupa; komitmen anti penyuapan pihak terkait; mekanisme pelaporan; perlindungan pelapor; investigasi dan penanganan dugaan penyuapan."],
  ] as [string, string][],
  produk: [
    "program, kurikulum, silabus, modul, bahan ajar, media, sumber belajar, dan informasi program;",
    "pelatihan, pengembangan kompetensi aparatur dan nonaparatur, pendidikan vokasi, pembelajaran daring/bauran, pendampingan, konsultasi, pemagangan, dan layanan pembelajaran lain sesuai kewenangan;",
    "hasil asesmen/evaluasi, sertifikat pelatihan atau pengembangan kompetensi, Surat Keterangan Lulus/Surat Pemberitahuan Tidak Lulus, dokumen kelulusan dan dokumen akademik, serta hasil RPL apabila diterapkan sesuai ketentuan;",
    "kebijakan teknis, standar kompetensi, rekomendasi formasi, hasil penilaian kompetensi, akreditasi pelaksanaan uji kompetensi, informasi dan layanan pembinaan jabatan fungsional;",
    "penelitian, publikasi, pengabdian kepada masyarakat, kerja sama pendidikan/industri, layanan kemahasiswaan, alumni, pemagangan, dan penempatan kerja;",
    "layanan administrasi dan dukungan: perencanaan, anggaran, keuangan, SDM, organisasi, hukum, data/informasi, teknologi informasi, BMN, pengadaan, persuratan, kearsipan, kepatuhan, manajemen risiko, dan layanan umum; serta",
    "produk atau layanan lain yang menjadi kewenangan BPSDMP dan ditetapkan melalui peraturan, keputusan pimpinan, standar pelayanan, perjanjian, atau informasi terdokumentasi yang dikendalikan.",
  ],
  penerimaManfaat:
    "Penerima manfaat dan pengguna layanan meliputi, sesuai relevansi: aparatur Kementerian Perdagangan dan instansi lain; pejabat/calon pejabat fungsional; peserta pelatihan/pengembangan kompetensi aparatur dan nonaparatur; mahasiswa dan calon mahasiswa; pelaku usaha, UMKM, eksportir dan calon eksportir; pemerintah pusat/daerah; lembaga pendidikan dan pelatihan; organisasi profesi/asosiasi; mitra akademik dan industri; orang tua/wali jika relevan; alumni; pengguna lulusan; unit internal; serta pemangku kepentingan lain yang relevan.",
  lokasi: [
    ["Sekretariat BPSDMP dan 3 Pusat", "Jakarta", "Sesuai kedudukan dan kewenangan BPSDMP."],
    ["Balai Pengembangan Kompetensi Perdagangan Padang", "Padang, Sumatera Barat", "Sumatera, Kepulauan Bangka Belitung, dan Kepulauan Riau."],
    ["Balai Pengembangan Kompetensi Perdagangan Yogyakarta", "Yogyakarta, DI Yogyakarta", "Jawa, Kalimantan, Bali, dan Nusa Tenggara."],
    ["Balai Pengembangan Kompetensi Perdagangan Makassar", "Makassar, Sulawesi Selatan", "Sulawesi, Maluku, dan Papua."],
    ["Balai Pelatihan Aparatur Metrologi dan Mutu", "Bandung Barat, Jawa Barat", "Seluruh wilayah Indonesia."],
    ["Balai Pelatihan SDM Metrologi, Mutu, dan Jasa Perdagangan", "Bandung Barat, Jawa Barat", "Seluruh wilayah Indonesia."],
    ["Akademi Metrologi dan Instrumentasi", "Kabupaten Sumedang, Jawa Barat", "Sesuai kedudukan dan penyelenggaraan pendidikan vokasi."],
  ] as [string, string, string][],
  media:
    "SMI juga berlaku pada fasilitas dan media resmi yang digunakan untuk pelaksanaan proses, termasuk ruang pelayanan, ruang kelas, asrama apabila digunakan, perpustakaan, laboratorium, workshop, ruang asesmen, sarana praktik, lokasi kegiatan sementara atau pemagangan yang dikendalikan melalui ketentuan/perjanjian, serta sistem digital seperti LMS, aplikasi, situs web, sistem akademik, sistem asesmen, basis data, dan media komunikasi resmi. Metode layanan dapat berupa tatap muka, daring, bauran, sinkron, asinkron, praktik, berbasis tempat kerja, pemagangan, pendampingan, atau konsultasi sesuai karakter layanan.",
  penerapanStandar: [
    ["SNI ISO 9001:2015 dan SNI ISO 9001:2015 Amd.1:2024", "Diterapkan pada seluruh sepuluh unit kerja dan proses yang memengaruhi kemampuan BPSDMP menyediakan produk dan layanan secara konsisten sesuai persyaratan serta meningkatkan kepuasan pengguna. Persyaratan desain dan pengembangan diterapkan pada proses yang merancang atau mengubah program, kurikulum, asesmen, produk, layanan, metode, atau sistem."],
    ["SNI ISO 37001:2025", "Diterapkan pada seluruh sepuluh unit kerja dan aktivitas dalam batas organisasi, termasuk keputusan, transaksi, pengadaan, pembayaran, asesmen, kerja sama, penggunaan fasilitas, serta hubungan dengan rekan bisnis yang relevan dengan aktivitas dalam ruang lingkup. Bentuk dan tingkat pengendalian ditetapkan secara wajar dan proporsional berdasarkan penilaian risiko penyuapan."],
    ["SNI ISO 21001:2025", "Diterapkan pada proses pendidikan dan pembelajaran serta proses manajemen dan pendukung yang memengaruhi mutu, efektivitas, aksesibilitas, pemenuhan kebutuhan peserta/pembelajar, dan hasil pendidikan. Sekretariat dan unit pendukung termasuk sejauh prosesnya mendukung atau memengaruhi penyelenggaraan pendidikan/pembelajaran dalam ruang lingkup."],
  ] as [string, string][],
  penyediaEksternal: [
    "Proses yang disediakan oleh pihak eksternal tidak mengalihkan tanggung jawab BPSDMP atas kesesuaian produk dan layanan. Narasumber, pengajar, asesor, penguji, mitra pendidikan, penyedia platform, penyedia sarana/fasilitas, penyedia barang/jasa, lokasi pemagangan, lembaga sertifikasi, dan pihak eksternal lain dikendalikan sesuai relevansi berdasarkan persyaratan layanan, kompetensi, kinerja, kontrak/perjanjian, keamanan dan kerahasiaan informasi, integritas, konflik kepentingan, serta risiko mutu, pendidikan, kepatuhan, dan penyuapan.",
    "Antarmuka dengan unit lain di Kementerian Perdagangan, kementerian/lembaga, pemerintah daerah, organisasi profesi, lembaga pendidikan, dunia usaha, asosiasi, dan mitra lainnya dikelola melalui proses bisnis, SOP, perjanjian, penugasan, atau informasi terdokumentasi yang dikendalikan. Batas tanggung jawab, masukan, keluaran, kewenangan, komunikasi, dan rekaman harus dapat ditelusuri.",
  ],
  ketidakberlakuan: [
    "Pada saat pernyataan ruang lingkup ini ditetapkan, BPSDMP tidak menetapkan pengecualian umum yang mengurangi kemampuan atau tanggung jawab organisasi untuk memastikan kesesuaian produk dan layanan, efektivitas pendidikan dan pembelajaran, kepatuhan, serta pencegahan penyuapan. Perbedaan karakter layanan antarunit diakomodasi melalui tingkat penerapan dan pengendalian yang relevan pada masing-masing proses.",
    "Apabila suatu persyaratan dinilai tidak berlaku pada ruang lingkup tertentu, penetapan hanya dilakukan apabila diperbolehkan oleh standar yang bersangkutan, memiliki justifikasi terdokumentasi, tidak memengaruhi hasil yang dimaksudkan dari sistem, dan disetujui oleh pihak berwenang. Penilaian tersebut ditinjau kembali apabila terdapat perubahan organisasi, proses, produk/layanan, lokasi, teknologi, pemangku kepentingan, risiko, atau standar.",
    "Rendahnya risiko penyuapan bukan dasar untuk mengeluarkan aktivitas dari penerapan SNI ISO 37001:2025; pengendalian tetap ditetapkan secara proporsional berdasarkan penilaian risiko.",
    "Belum adanya peserta yang membutuhkan akomodasi tertentu pada suatu periode bukan dasar untuk menghilangkan mekanisme identifikasi kebutuhan aksesibilitas dan pemberian akomodasi yang layak.",
    "Persyaratan desain dan pengembangan tetap diterapkan pada proses yang merancang, mengadaptasi, atau mengubah program, kurikulum, asesmen, produk, layanan, metode, atau sistem.",
  ],
  peninjauan:
    "Ruang lingkup ditinjau sebagai bagian dari Tinjauan Manajemen dan setiap terjadi perubahan yang dapat memengaruhi batas atau penerapan SMI, antara lain perubahan organisasi dan tata kerja, tugas/fungsi, lokasi atau wilayah kerja, produk/layanan, kelompok peserta, teknologi, metode pembelajaran, penyedia eksternal utama, kebutuhan dan harapan pemangku kepentingan, hasil penilaian risiko penyuapan, atau standar yang digunakan. Perubahan ruang lingkup harus melalui analisis dampak, persetujuan Manajemen Puncak, pemutakhiran informasi terdokumentasi terkait, dan komunikasi kepada pihak yang relevan.",
};
