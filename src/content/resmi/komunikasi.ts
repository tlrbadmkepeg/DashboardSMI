/** Matriks Komunikasi SMI — transkripsi PM.SMI.L12.2026 (Rev. 1/0, 22 Juni 2026). */

/** [kode, kategori, ketentuan] */
export const KLASIFIKASI_KOMUNIKASI: [string, string, string][] = [
  ["INT", "Internal", "Antarpegawai/antarunit di BPSDMP. Gunakan kanal resmi; penerima, tindak lanjut, dan eskalasi harus jelas."],
  ["I-E", "Internal ke eksternal", "Informasi BPSDMP kepada pengguna, mitra, regulator, publik, atau pihak eksternal lain. Substansi/publikasi disetujui sesuai kewenangan."],
  ["E-I", "Eksternal ke internal", "Informasi dari pihak eksternal dicatat, diverifikasi, didisposisi, dan ditindaklanjuti sesuai SLA/ketentuan."],
  ["PUB", "Publik", "Dapat disebarluaskan setelah verifikasi akurasi dan persetujuan pejabat/pengelola informasi."],
  ["TBT", "Terbatas", "Hanya untuk personel/unit terkait; distribusi dan hak akses dikendalikan."],
  ["RHS", "Rahasia/sensitif", "Data pribadi, laporan penyuapan, investigasi, soal/nilai, atau informasi sensitif lain menggunakan prinsip need-to-know dan kanal aman."],
];

export const CATATAN_BAHASA =
  "Bahasa, format, dan media komunikasi disesuaikan dengan penerima agar informasi dapat dipahami secara efektif dan aksesibel. Bahasa Indonesia digunakan sebagai bahasa utama, dan bahasa lain dapat digunakan apabila relevan.";

/** [id, materi, pengirim, penerima, media, waktu] */
export type KomRow = [string, string, string, string, string, string];

export const KOM_INTERNAL: KomRow[] = [
  ["INT-01", "Kebijakan SMI, ruang lingkup, komitmen pimpinan", "Kepala BPSDMP/Tim SMI BPSDMP", "Seluruh unit/personel terkait", "Rapat, sosialisasi, intranet/poster", "Saat ditetapkan/diubah; orientasi"],
  ["INT-02", "Sasaran SMI, kinerja, kebutuhan sumber daya dan prioritas", "Kepala BPSDMP/Pemilik sasaran/Sekretariat BPSDMP", "Pimpinan unit/pemilik proses", "Rapat kerja, dashboard, nota dinas", "Siklus perencanaan dan pemantauan"],
  ["INT-03", "Konteks, pemangku kepentingan, regulasi/standar dan perubahan", "Tim SMI/Sekretariat BPSDMP/FKAP sesuai isu", "Manajemen puncak/unit terdampak", "Rapat, register, repositori", "Saat perubahan dan review berkala"],
  ["INT-04", "Risiko, peluang, risiko penyuapan dan benturan kepentingan", "Pemilik risiko/Tim SMI/FKAP", "Pimpinan dan unit terkait", "Register, rapat risiko, eskalasi", "Sesuai siklus risiko/ketika berubah"],
  ["INT-05", "Dokumen SMI dan perubahan proses/layanan/kurikulum/sistem", "Pemilik proses/Pengendali dokumen/Sekretariat Tim SMI", "Pengguna dokumen/pihak terdampak", "SRIKANDI/TNDE, repositori, briefing", "Sebelum diberlakukan/ketika berubah"],
  ["INT-06", "Program dan hasil audit internal", "Ketua Tim Auditor Internal", "Auditee, Manajemen Puncak, FKAP sesuai lingkup", "Surat tugas, rapat, laporan", "Sesuai program audit"],
  ["INT-07", "Input, keputusan dan tindak lanjut Tinjauan Manajemen", "Tim SMI BPSDMP/Sekretariat Tim SMI", "Kepala BPSDMP, pimpinan unit, FKAP, pihak terkait", "Bahan rapat, risalah, nota dinas", "Sesuai agenda Tinjauan Manajemen"],
  ["INT-08", "Ketidaksesuaian, koreksi, akar penyebab dan tindakan korektif", "Pemilik proses/Auditor/verifikator", "Atasan dan unit terdampak", "Form NC, sistem tindak lanjut, rapat", "Segera setelah ditemukan"],
  ["INT-09", "Keluhan, pengaduan, keberatan/banding", "Pengelola pengaduan/Pemilik layanan", "Unit terkait/panel independen bila perlu", "Tiket, surat, rapat klarifikasi", "Saat diterima; sesuai SLA"],
  ["INT-10", "Kompetensi, kepedulian dan pelatihan SMI/anti penyuapan", "Pengelola SDM/Pimpinan unit/FKAP", "Pegawai, pengajar, auditor, fungsi berisiko", "TNA, LMS, briefing, coaching", "Sebelum penugasan/berkala/saat berubah"],
  ["INT-11", "Gangguan layanan, keadaan darurat, keselamatan, insiden data", "Pimpinan unit/Pengelola fasilitas/sistem/data", "Personel/peserta/pihak terdampak", "Pesan resmi, kanal insiden, telepon", "Segera sesuai tingkat kejadian"],
  ["INT-12", "Kinerja penyedia, praktik baik, inovasi dan pembelajaran organisasi", "PPK/Pemilik proses/Unit pemilik inovasi", "Penyedia/unit terkait/pimpinan", "Rapat, BA, forum pembelajaran, repositori", "Sesuai kontrak/setelah evaluasi"],
];

export const KOM_EKSTERNAL: KomRow[] = [
  ["EXT-01", "Profil BPSDMP, ruang lingkup layanan, standar/persyaratan, biaya/tarif bila ada, SLA dan kanal resmi", "Pengelola informasi/Pemilik layanan", "Publik/pengguna/pemohon", "Portal, web, media sosial, surat", "Saat ditetapkan/berubah; sebelum layanan"],
  ["EXT-02", "Program pelatihan/pengembangan kompetensi: tujuan, hasil belajar, kurikulum, metode, jadwal dan persyaratan", "Penyelenggara/Pengembang program", "Calon peserta, instansi pengirim, mitra", "Katalog, undangan, LMS, sosialisasi", "Sebelum pendaftaran/penugasan"],
  ["EXT-03", "Penerimaan/seleksi peserta atau mahasiswa dan mekanisme keberatan", "Panitia/Unit pendidikan", "Calon peserta/mahasiswa/instansi pengirim", "Portal/surat/pengumuman resmi", "Sesuai tahapan seleksi"],
  ["EXT-04", "Jadwal, moda, tata tertib, aksesibilitas dan akomodasi layak", "Penyelenggara/Petugas layanan", "Peserta/mahasiswa/pengajar/unit pendukung", "LMS, surat, formulir aman", "Sebelum kegiatan; saat kebutuhan berubah"],
  ["EXT-05", "Kriteria penilaian/asesmen, integritas akademik, kelulusan, remedial/banding, serta penyampaian hasil sesuai kewenangan", "Pengelola akademik/asesmen", "Peserta/mahasiswa/penguji/instansi sesuai kewenangan", "Panduan, briefing, portal aman", "Sebelum asesmen; hasil sesuai SLA"],
  ["EXT-06", "RPL: persyaratan, bukti, proses, hasil dan keberatan", "Unit penyelenggara RPL/panel", "Pemohon/instansi terkait", "Panduan, portal, surat, konsultasi", "Sebelum pengajuan dan setiap tahapan"],
  ["EXT-07", "Layanan JF: uji kompetensi, rekomendasi formasi, kebijakan teknis/standar, konsultasi dan hasil", "Pusbin JF/Pemilik layanan", "Pejabat fungsional/instansi pengusul/penguji", "Portal, surat, konsultasi", "Sesuai tahapan layanan"],
  ["EXT-08", "Layanan akademik: status, yudisium, kelulusan, dokumen akademik dan dukungan mahasiswa", "Akmet/Pejabat akademik/Unit layanan", "Mahasiswa/lulusan/pihak berwenang", "Sistem akademik, portal, surat", "Sesuai kalender/standar akademik"],
  ["EXT-09", "Konsultasi, keluhan, pengaduan, keberatan/banding", "Pengelola layanan/pengaduan", "Pengguna/peserta/masyarakat", "Portal, hotline, surel, tatap muka/WBS bila relevan", "Setiap saat; sesuai SLA"],
  ["EXT-10", "Survei kepuasan, evaluasi pembelajaran, tracer study dan umpan balik dunia kerja", "Pemilik layanan/Penyelenggara/Akmet", "Pengguna, peserta, lulusan, pemberi kerja", "Kuesioner, FGD, survei/portal", "Setelah program/periode pemantauan"],
  ["EXT-11", "Kerja sama: ruang lingkup, peran, keluaran, data, HKI dan integritas", "Pemilik kerja sama/Pemilik program/FKAP sesuai risiko", "Mitra/lembaga/asosiasi/pihak terkait", "Perjanjian, rapat, korespondensi", "Sebelum dan selama kerja sama"],
  ["EXT-12", "Penyedia eksternal: mutu, kompetensi, integritas, keamanan dan pelaporan", "PPK/Pengelola pengadaan/Pemilik proses", "Penyedia, konsultan, narasumber, asesor eksternal", "KAK, kontrak, briefing", "Sebelum penugasan dan evaluasi"],
  ["EXT-13", "Informasi publik/media, pelaporan kepada regulator/pengawas, privasi dan HKI", "Pengelola komunikasi/PPID/Pemilik data", "Publik/media/regulator/pihak berwenang/pengguna", "Website, aplikasi resmi, surat, pemberitahuan", "Sesuai kewajiban/kebutuhan"],
  ["EXT-14", "Perubahan/penghentian layanan karena keadaan darurat atau gangguan", "Pimpinan unit/Penyelenggara", "Peserta, pegawai, mitra, pengguna", "Pesan massal, portal, telepon", "Segera setelah keputusan"],
];

export const KOM_ANTI_PENYUAPAN: KomRow[] = [
  ["AP-01", "Kebijakan anti penyuapan, komitmen pimpinan dan larangan penyuapan", "Kepala BPSDMP/FKAP", "Personel dan pihak eksternal relevan", "Sosialisasi, orientasi, kontrak/website", "Saat ditetapkan/diubah; berkala"],
  ["AP-02", "Hadiah/jamuan/gratifikasi, donasi/sponsorship dan benturan kepentingan", "UPG/FKAP/Pengelola kepatuhan", "Pegawai, panitia, pengajar, penguji, mitra/penyedia", "Panduan, briefing, form deklarasi", "Sebelum keputusan/kegiatan berisiko; saat berubah"],
  ["AP-03", "Uji kelayakan berbasis risiko dan komitmen anti penyuapan", "Pemilik proses/PPK/Pengelola kerja sama/FKAP", "Pihak yang diperiksa/penyedia/mitra", "Checklist, verifikasi, kontrak/pakta", "Sebelum hubungan/transaksi; pembaruan sesuai risiko"],
  ["AP-04", "Kanal pelaporan, kerahasiaan, perlindungan pelapor dan larangan pembalasan", "UPG/FKAP/Pengelola WBS", "Pegawai dan pihak eksternal", "WBS, hotline, surel khusus, panduan", "Tersedia terus; saat laporan diterima"],
  ["AP-05", "Triase, eskalasi, investigasi dan penanganan dugaan penyuapan", "FKAP/Pejabat berwenang/Unit pengawasan", "Pihak berwenang sesuai need-to-know", "Kanal aman, rapat terbatas, nota rahasia", "Segera sesuai tingkat kasus"],
  ["AP-06", "Pelatihan/briefing anti penyuapan untuk fungsi dan keputusan berisiko", "FKAP/Pengelola SDM/Pimpinan proses", "Pegawai/pimpinan/fungsi berisiko/rekan bisnis terpilih", "Kelas, e-learning, briefing/checklist", "Sebelum penugasan; berkala; saat risiko berubah"],
  ["AP-07", "Red flags, ketidakcukupan kontrol dan keputusan menolak/menunda/mengakhiri hubungan", "Pemilik proses/FKAP/Pejabat berwenang", "Pihak internal/eksternal terkait", "Rapat terbatas, keputusan/notifikasi kontrak", "Saat red flag ditemukan"],
  ["AP-08", "Monitoring, audit dan tinjauan FKAP kepada Manajemen Puncak", "FKAP", "Kepala BPSDMP/Manajemen Puncak", "Laporan, presentasi, rapat tertutup", "Sesuai siklus review; segera bila kritis"],
  ["AP-09", "Hasil penanganan, tindakan korektif, konsekuensi dan lesson learned", "Pejabat berwenang/FKAP", "Manajemen Puncak/pihak terkait; organisasi secara agregat", "Laporan rahasia/komunikasi agregat", "Setelah penanganan"],
  ["AP-10", "Koordinasi dengan Inspektorat/KPK/aparat atau instansi berwenang", "Kepala BPSDMP/Pejabat berwenang/FKAP", "Instansi berwenang", "Surat resmi/kanal aman/pertemuan terbatas", "Sesuai ketentuan/kebutuhan kasus"],
];

/** [tahap, ketentuan, penanggung jawab] */
export const PERSETUJUAN_KOMUNIKASI: [string, string, string][] = [
  ["Perencanaan", "Tetapkan materi, tujuan, penerima, PIC, media, waktu, klasifikasi dan bukti.", "Pemilik proses/PIC komunikasi"],
  ["Verifikasi & persetujuan", "Pastikan substansi benar, mutakhir, sesuai dokumen yang disahkan; publikasi/sensitif disetujui pejabat berwenang.", "Pemilik substansi/atasan/pengelola komunikasi/hukum sesuai materi"],
  ["Distribusi & penerimaan", "Gunakan penerima dan kanal yang tepat; untuk informasi kritis konfirmasi penerimaan/pemahaman.", "PIC komunikasi/pengelola sistem"],
  ["Kerahasiaan & keamanan", "Terapkan klasifikasi PUB/TBT/RHS, need-to-know, pembatasan akses dan kanal aman sesuai risiko.", "Pemilik informasi/pengelola sistem"],
  ["Eskalasi", "Informasi salah/terlambat, ketidakpahaman, pengaduan kritis, insiden data atau indikasi penyuapan segera dieskalasikan.", "PIC kepada atasan/FKAP/pejabat berwenang"],
  ["Retensi & perubahan", "Rekaman disimpan/dimusnahkan sesuai retensi; perubahan matriks/dokumen dikendalikan sebelum berlaku.", "Pengelola arsip/Pengendali dokumen/Pemilik rekaman"],
];

/** [id, indikator, metode, target] */
export const INDIKATOR_KOMUNIKASI: [string, string, string, string][] = [
  ["IK-01", "Ketepatan komunikasi wajib", "Komunikasi tepat waktu ÷ seluruh komunikasi wajib × 100%", "Mengacu SLA/ketentuan yang berlaku"],
  ["IK-02", "Cakupan penerima informasi kritis", "Penerima terkonfirmasi ÷ penerima wajib × 100%", "100% untuk informasi kritis"],
  ["IK-03", "Respons konsultasi/pengaduan layanan", "Ditindaklanjuti sesuai SLA ÷ total permohonan × 100%", "≥ 90%"],
  ["IK-04", "Respons gratifikasi, benturan kepentingan dan indikasi penyuapan", "Laporan ditindaklanjuti sesuai standar ÷ total laporan × 100%", "100%"],
  ["IK-05", "Cakupan komunikasi/pelatihan anti penyuapan fungsi berisiko", "Personel wajib yang menerima briefing/pelatihan ÷ total wajib × 100%", "100% sesuai Sasaran SMI"],
  ["IK-06", "Kejelasan informasi bagi pengguna/penerima", "Skor survei kejelasan, kelengkapan dan kemudahan akses", "Mengacu sasaran kepuasan SMI (≥3,00 skala 4,00)"],
];
