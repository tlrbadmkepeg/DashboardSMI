/**
 * Register risiko & peluang (PM.SMI.L10.2026), Matriks Benturan Kepentingan (PM.SMI.L11.2026),
 * dan Rencana Kegiatan Fungsi Anti Penyuapan 2026 (PM.SMI.L14.2026).
 * Seluruh penilaian K/D/residu pada dokumen sumber berstatus "BD" (Belum Dinilai).
 */

export const METODE_RISIKO: [string, string, string][] = [
  ["Jenis entri", "R = risiko umum/pendidikan/mutu/kepatuhan; RP = risiko penyuapan; OP = peluang.", "Kode membedakan karakter risiko tanpa memisahkan dokumen."],
  ["Kemungkinan (K)", "Skala mengikuti metodologi risiko BPSDMP yang disahkan.", "Untuk RP pertimbangkan paparan, frekuensi interaksi, nilai/manfaat, diskresi keputusan, pihak ketiga, lokasi, riwayat dan kemudahan modus."],
  ["Dampak (D)", "Gunakan dampak tertinggi yang relevan: layanan, pendidikan, kepatuhan, keuangan, keselamatan, data, reputasi, sasaran.", "Untuk RP juga pertimbangkan dampak hukum, integritas keputusan, sanksi, tanggung jawab organisasi, dan kepercayaan publik."],
  ["Level/Prioritas", "Mengikuti matriks risiko BPSDMP yang berlaku.", "Kriteria tingkat risiko penyuapan ditetapkan konsisten dengan kebijakan/sasaran dan digunakan untuk menentukan kontrol yang wajar serta proporsional."],
  ["Efektivitas kontrol", "Efektif / Parsial / Tidak Efektif / BD berdasarkan bukti.", "Untuk RP, efektivitas tidak cukup dinyatakan hanya dari adanya SOP/pakta; harus mempertimbangkan penerapan, pemisahan tugas, uji kelayakan, audit trail, pelaporan dan verifikasi."],
  ["Risiko residu", "Dinilai setelah pengendalian yang ada/tambahan diterapkan.", "RP residu menjadi dasar perlu/tidaknya due diligence lebih lanjut, kontrol tambahan, eskalasi atau review FKAP."],
  ["Status tindakan", "Rencana / Sedang Dilaksanakan / Tuntas / BD.", "Tuntas hanya setelah bukti tersedia dan efektivitas diverifikasi."],
  ["Evaluasi peluang", "Peluang dinilai berdasarkan manfaat yang diharapkan, relevansi terhadap sasaran SMI, urgensi, kelayakan, kebutuhan sumber daya, dan risiko penerapannya untuk menentukan prioritas tindak lanjut.", "—"],
];

export interface RisikoResmi {
  kode: string; jenis: "R" | "RP"; area: string; uraian: string; relevansi: string;
  pemilik: string; pengendalian: string; kerentanan?: string; penilaian: string; status: string;
}

const R = (kode: string, area: string, uraian: string, relevansi: string, pemilik: string, pengendalian: string): RisikoResmi =>
  ({ kode, jenis: "R", area, uraian, relevansi, pemilik, pengendalian, penilaian: "BD", status: "Rencana" });

export const RISIKO_STRATEGIS: RisikoResmi[] = [
  R("R-01", "Tata kelola & integrasi SMI", "Pembagian peran, antarmuka, pemilik proses atau eskalasi belum jelas akibat konsolidasi 10 unit. Dampak: tumpang tindih/kekosongan kontrol, keterlambatan, temuan berulang.", "Mutu/AP/OP", "Kepala BPSDMP; Tim SMI; Sekretariat BPSDMP", "Peta proses, RACI, pemilik proses, forum koordinasi, SOP lintas unit, eskalasi."),
  R("R-02", "Konsistensi mutu antarunit/lokasi", "Standar, kompetensi, fasilitas dan praktik berbeda sehingga mutu layanan/pembelajaran/asesmen tidak seragam.", "Mutu/OP", "Pimpinan unit; Tim SMI", "Kriteria layanan seragam, audit silang, benchmarking, dashboard unit."),
  R("R-03", "Kompetensi, kapasitas & ketergantungan personel", "Kesenjangan kompetensi, beban tidak merata, mutasi/pensiun atau ketergantungan pada personel tertentu mengganggu proses.", "Mutu/AP/OP", "Sekretariat BPSDMP; pimpinan unit", "Matriks kompetensi, TNA, redistribusi, suksesi, dokumentasi pengetahuan."),
  R("R-04", "Data, sistem digital & informasi terdokumentasi", "Data kinerja/hasil, LMS/aplikasi, dokumen atau rekaman tidak lengkap, tidak aman, terlambat, berubah tanpa wewenang, hilang atau bocor.", "Mutu/AP/OP", "Pemilik data/proses; Sekretariat BPSDMP", "Kamus data, validasi, kontrol akses, audit trail, backup, retensi, uji pemulihan."),
  R("R-05", "Desain program, kurikulum & perubahan", "Analisis kebutuhan, validasi, pelibatan pengguna atau kendali perubahan tidak memadai sehingga program/kurikulum tidak relevan.", "Mutu/OP", "Pusat/UPT/Akmet pemilik program", "Analisis kebutuhan, desain berbasis kompetensi, validasi, kendali versi, review hasil."),
  R("R-06", "Objektivitas asesmen, ujian & keputusan layanan", "Kriteria, independensi, moderasi atau pengamanan instrumen tidak memadai sehingga hasil seleksi/asesmen/kelulusan tidak objektif.", "Mutu/AP/OP", "Unit penyelenggara; Pusbin JF; Akmet", "Kriteria kompetensi, pemisahan tugas, moderasi, deklarasi kepentingan, pengamanan soal, banding."),
  R("R-07", "Sarana, laboratorium, aksesibilitas & keselamatan", "Fasilitas, alat praktik, jaringan atau akomodasi tidak memadai/aman/aksesibel.", "Mutu/OP", "Sekretariat BPSDMP; UPT/Akmet", "Pemetaan kebutuhan, inspeksi, pemeliharaan/kalibrasi, alternatif fasilitas, akomodasi layak."),
  R("R-08", "Kepatuhan regulasi & persyaratan lain", "Perubahan regulasi, standar, kontrak atau persyaratan layanan tidak teridentifikasi/diterapkan tepat waktu.", "Mutu/AP/OP", "Sekretariat BPSDMP; pemilik kepatuhan", "Register persyaratan, pemantauan JDIH, analisis dampak, sosialisasi, evaluasi bukti."),
  R("R-09", "Penyedia eksternal & mitra", "Penyedia/mitra tidak memenuhi mutu, pendidikan, integritas, waktu, keamanan, HKI atau perlindungan data.", "Mutu/AP/OP", "PPK/pemilik kontrak/kerja sama", "Kriteria seleksi, SLA/kontrak, due diligence sesuai risiko, evaluasi, verifikasi hasil."),
  R("R-10", "Anggaran & perubahan prioritas", "Efisiensi/realokasi anggaran, biaya meningkat atau perubahan kebijakan menghambat program dan pengendalian SMI.", "Mutu/AP/OP", "Kepala BPSDMP; Sekretariat; pimpinan unit", "Prioritas berbasis risiko, alternatif metode, kolaborasi, pengendalian perubahan."),
  R("R-11", "Perubahan iklim, bencana & kesinambungan layanan", "Cuaca ekstrem, bencana, gangguan transportasi/lingkungan atau kedaruratan menghambat layanan dan keselamatan.", "Mutu/OP", "Sekretariat BPSDMP; pimpinan lokasi", "Business continuity, peringatan dini, alternatif daring/hybrid, prosedur darurat, pengamanan aset/data."),
  R("R-12", "Keluhan, audit & efektivitas perbaikan", "Keluhan/banding, temuan audit atau tindakan korektif terlambat, tidak objektif, atau berulang. Dampak: sengketa, temuan berulang dan reputasi turun.", "Mutu/AP/OP", "Tim SMI; auditor internal; unit layanan; FKAP sesuai isu", "Kanal terintegrasi, SLA, audit berbasis risiko, analisis akar masalah, verifikasi efektivitas dan eskalasi."),
];

const RP = (kode: string, area: string, uraian: string, kerentanan: string, pengendalian: string, pemilik: string): RisikoResmi =>
  ({ kode, jenis: "RP", area, uraian, relevansi: "AP", kerentanan, pengendalian, pemilik, penilaian: "BD", status: "BD" });

/** Skenario umum risiko penyuapan. Ditampilkan lengkap hanya untuk pengguna internal; publik melihat area saja. */
export const RISIKO_PENYUAPAN: RisikoResmi[] = [
  RP("RP-01", "Tata kelola & independensi FKAP", "Pengawasan anti penyuapan tidak memadai atau FKAP tidak memperoleh kompetensi, sumber daya, informasi dan akses langsung yang diperlukan.", "Peran/rangkap tugas tidak jelas; intervensi; akses data terbatas. Dampak: pengawasan tidak objektif, kelemahan kontrol tidak tertangani.", "Penetapan peran; akses langsung; asesmen kompetensi; deklarasi benturan; laporan FKAP; review sumber daya.", "Kepala BPSDMP/FKAP"),
  RP("RP-02", "Hadiah, gratifikasi & benturan kepentingan", "Personel meminta/menerima/menawarkan manfaat atau menyembunyikan hubungan untuk memengaruhi peserta, pegawai, penyedia, nilai, kelulusan, rekomendasi atau layanan.", "Budaya hadiah; deklarasi tidak rutin; aturan pengalihan kewenangan/penggantian pengambil keputusan lemah. Dampak: favoritisme, kolusi, keputusan tidak objektif, sanksi.", "Aturan hadiah/jamuan; register; deklarasi sebelum keputusan sensitif; verifikasi; pengalihan kewenangan; uji petik.", "Pimpinan unit/UPG/FKAP"),
  RP("RP-03", "Pelaporan kekhawatiran & investigasi", "Laporan dibocorkan/dihambat/dibalas atau dugaan penyuapan tidak diinvestigasi secara objektif, rahasia dan tepat waktu.", "Kanal/SLA tidak jelas; konflik penangan; pengamanan bukti lemah. Dampak: penyuapan tidak terdeteksi, bukti hilang, retaliasi.", "Kanal aman; pembatasan akses; anti-retaliasi; triase; penangan independen; pengamanan dan rantai penguasaan bukti (chain of custody); eskalasi.", "FKAP/pejabat berwenang/Inspektorat"),
  RP("RP-04", "Rekan bisnis, penyedia & kerja sama", "Penyedia, instruktur, asesor, konsultan, mitra atau perantara menawarkan/menerima suap untuk pemilihan, pembayaran, akses, promosi atau perlakuan khusus.", "Uji kelayakan tidak proporsional; klausul kontrak/pengawasan lemah. Dampak: kerugian, tanggung jawab organisasi, reputasi.", "Due diligence berbasis risiko; klausul anti penyuapan; hak audit; deklarasi manfaat; evaluasi berkala.", "PPK/pemilik kerja sama/FKAP"),
  RP("RP-05", "Keputusan sensitif & delegasi kewenangan", "Kewenangan pada seleksi, RPL, ujian, asesmen, kelulusan, sertifikat, formasi, beasiswa, pembayaran atau pengadaan disalahgunakan untuk manfaat pribadi/pihak lain.", "Diskresi tinggi; keputusan individual; maker-checker tidak memadai. Dampak: hasil tidak sah, kerugian, ketidakadilan.", "Peta keputusan sensitif; batas delegasi; pemisahan tugas; panel/moderasi; dual approval; rotasi; audit trail.", "Pimpinan unit/pemilik proses/FKAP"),
  RP("RP-06", "Data, dokumen & jejak audit", "Nilai, soal, hasil asesmen, sertifikat, rekomendasi, tagihan atau bukti diubah/dihilangkan untuk memberi keuntungan atau menutupi penyuapan.", "Hak akses berlebih; log/rekonsiliasi/retensi lemah. Dampak: bukti investigasi hilang, hasil tidak valid, kebocoran data.", "Role-based access; audit trail; rekonsiliasi; backup; dual approval; review log dan anomali.", "Pemilik data/proses; Sekretariat BPSDMP"),
  RP("RP-07", "Tekanan target & perubahan organisasi/sistem", "Tekanan kelulusan, kinerja, serapan anggaran atau perubahan struktur/digitalisasi membuka celah dan mendorong toleransi penyimpangan.", "Target tidak seimbang; kontrol lama tidak relevan; transfer pengetahuan lemah. Dampak: manipulasi dan celah kewenangan.", "Review risiko sasaran; indikator integritas; penilaian risiko sebelum perubahan; review akses; verifikasi pascaimplementasi.", "Kepala BPSDMP/Tim SMI/FKAP/pemilik perubahan"),
  RP("RP-08", "Sponsorship, sumbangan & manfaat serupa", "Sponsorship, bantuan, perjalanan, diskon atau dukungan kegiatan digunakan sebagai sarana memengaruhi keputusan atau memperoleh akses khusus.", "Kriteria penerimaan/pemberian, transparansi dan persetujuan belum jelas. Dampak: konflik kepentingan dan reputasi.", "Kebijakan/kriteria; due diligence; persetujuan; pembatasan; pencatatan/register; transparansi.", "Sekretariat BPSDMP/pemilik kegiatan/FKAP"),
];

/** [kode, peluang, dasar/manfaat, rencana, pemilik, indikator, target] */
export const PELUANG: [string, string, string, string, string, string, string][] = [
  ["OP-01", "Integrasi & penyederhanaan proses", "Konsolidasi 10 unit dapat mengurangi duplikasi dan memperjelas antarmuka.", "Peta proses, RACI, SOP lintas unit, forum pemilik proses, satu dashboard.", "Kepala BPSDMP; Tim SMI; Sekretariat BPSDMP", "Proses/SOP terintegrasi; waktu siklus; duplikasi menurun", "Des 2026"],
  ["OP-02", "Pemerataan akses melalui jaringan wilayah & hybrid", "Tiga Bapekomdag dan sarana daring memperluas jangkauan dan efisiensi.", "Kalender bersama, kelas hybrid, pemanfaatan fasilitas lintas unit, standar mutu seragam.", "Bapekomdag; pusat teknis", "Cakupan wilayah/peserta; utilisasi hybrid; kesenjangan mutu", "Des 2026"],
  ["OP-03", "Standardisasi kompetensi pengajar/asesor/penguji/personel SMI", "Mengurangi ketergantungan dan meningkatkan konsistensi.", "Matriks kompetensi, workshop, komunitas praktik, moderasi, coaching, personel cadangan.", "Sekretariat BPSDMP; seluruh unit; Pusbin JF", "Kompetensi terpenuhi; evaluasi pengajar/asesor; cadangan tersedia", "Des 2026"],
  ["OP-04", "Dashboard kinerja, risiko & kepatuhan terpadu", "Integrasi data mempercepat keputusan berbasis bukti.", "Kamus data, integrasi sumber, validasi, dashboard dan rapat tren.", "Sekretariat BPSDMP; pemilik data", "Ketepatan/kelengkapan data; penggunaan dashboard; waktu tindak lanjut", "Des 2026"],
  ["OP-05", "Digitalisasi & personalisasi pembelajaran", "LMS, konten digital dan analitik dapat meningkatkan skala/pengalaman belajar.", "Penguatan LMS, konten aksesibel, analitik belajar, backup, evaluasi efektivitas.", "Unit penyelenggara; PDSI sesuai kewenangan", "Utilisasi LMS; penyelesaian; kepuasan; insiden layanan/data", "Des 2026"],
  ["OP-06", "Pemanfaatan bersama laboratorium/fasilitas/alat", "Koordinasi lintas unit dan mitra dapat menutup kesenjangan fasilitas.", "Inventaris kapasitas, kalender pemanfaatan, kerja sama, pemeliharaan/kalibrasi bersama.", "UPT/Akmet; Sekretariat BPSDMP", "Jam pemanfaatan; ketersediaan alat; hasil evaluasi praktik", "Des 2026"],
  ["OP-07", "Pembaruan kurikulum/program berbasis kebutuhan dunia kerja", "Kebutuhan pengguna dan perubahan kompetensi membuka program baru dan peningkatan relevansi.", "Tracer study, analisis kebutuhan, review kurikulum, program baru, kemitraan industri.", "Pusat teknis; Akmet; UPT", "Program diperbarui; daya serap; kepuasan pengguna; hasil belajar", "Des 2026"],
  ["OP-08", "Budaya integritas, transparansi & kepercayaan", "Penerapan ISO 37001:2025 dapat memperkuat objektivitas layanan dan kepercayaan.", "Penilaian risiko penyuapan, deklarasi, due diligence, pelatihan, kanal pelaporan, review FKAP.", "Kepala BPSDMP; FKAP; pimpinan unit", "Cakupan pelatihan; laporan ditindaklanjuti; efektivitas kontrol; survei integritas", "Des 2026"],
];

/** [kegiatan, pelaksana, frekuensi, keluaran] */
export const PEMANTAUAN_RISIKO: [string, string, string, string][] = [
  ["Review register unit", "Pemilik risiko/pimpinan unit", "Sekurang-kurangnya triwulanan dan saat terdapat perubahan signifikan, insiden, atau sesuai kebutuhan siklus proses.", "Status tindakan, bukti kontrol, nilai residu, kebutuhan sumber daya"],
  ["Konsolidasi tingkat Badan", "Tim SMI BPSDMP", "Sekurang-kurangnya semesteran", "Profil risiko lintas SMI, tren, prioritas dan rekomendasi"],
  ["Review risiko penyuapan", "FKAP bersama pemilik risiko", "Berkala sesuai metodologi dan pada perubahan signifikan", "Profil risiko penyuapan, efektivitas kontrol, kebutuhan due diligence/kontrol tambahan"],
  ["Audit/Verifikasi", "Auditor Internal/FKAP sesuai kewenangan", "Sesuai program audit dan berbasis risiko", "Bukti efektivitas, temuan, tindakan korektif"],
  ["Tinjauan Manajemen", "Kepala BPSDMP dan pimpinan terkait", "Sekurang-kurangnya tahunan", "Keputusan risiko, sumber daya, sasaran, pengendalian dan peningkatan"],
];

/* ======================= PM.SMI.L11.2026 — BENTURAN KEPENTINGAN ======================= */

/** [komponen, kategori, makna, pengendalian] */
export const JENIS_BK: [string, string, string, string][] = [
  ["Jenis", "Aktual", "Kepentingan pribadi berhadapan langsung dengan keputusan/tindakan yang akan atau sedang dilakukan.", "Deklarasi; hentikan sementara keterlibatan; keputusan atasan; pengalihan/pembatasan."],
  ["Jenis", "Potensial", "Kepentingan pribadi dapat memengaruhi tugas/keputusan tertentu.", "Pencatatan kepentingan; analisis tugas; pembatasan preventif."],
  ["Sumber", "Bisnis/finansial", "Saham, aset, investasi, pemilik manfaat, pekerjaan/usaha atau manfaat ekonomi.", "Deklarasi; pengalihan kewenangan; pelepasan kepentingan bila perlu; uji kelayakan sesuai risiko."],
  ["Sumber", "Keluarga/kerabat", "Hubungan keluarga/kerabat yang dapat memengaruhi objektivitas.", "Deklarasi; penggantian penilai/penguji; panel; pengawasan tambahan."],
  ["Sumber", "Afiliasi", "Mantan atasan/bawahan/rekan, hubungan istimewa, organisasi/yayasan/lembaga.", "Deklarasi; pembatasan akses; peer review; keputusan kolegial."],
  ["Sumber", "Pekerjaan luar/rangkap jabatan", "Kegiatan/jabatan lain yang berbenturan dengan tugas, waktu, informasi atau keputusan.", "Izin; analisis kompatibilitas; pembatasan tugas/akses; penghentian bila tidak dapat dikelola."],
  ["Sumber", "Revolving door", "Relasi jabatan lama/mantan pejabat yang berpotensi memengaruhi keputusan.", "Masa tunggu apabila dipersyaratkan ketentuan; larangan perlakuan istimewa; uji kelayakan; alih kewenangan."],
  ["Sumber", "Hadiah/gratifikasi", "Pemberian/manfaat yang dapat memengaruhi netralitas keputusan.", "Tolak/kembalikan/laporkan; deklarasi benturan kepentingan; alihkan keputusan."],
];

/** [kode, proses, sumber, situasi, keputusan berisiko, pengendalian, pemilik] */
export const MATRIKS_BK: [string, string, string, string, string, string, string][] = [
  ["KK-01", "Perumusan kebijakan/keputusan strategis", "Bisnis/finansial; afiliasi", "Pejabat memiliki kepentingan pada pihak yang memperoleh manfaat.", "Prioritas program, alokasi sumber daya, penerima manfaat.", "Deklarasi; keluarkan dari pembahasan/akses; alihkan kewenangan atau keputusan kolegial; risalah/keputusan.", "Kepala BPSDMP/atasan"],
  ["KK-02", "Penunjukan tim/panitia/asesor/penguji/pengajar/narasumber", "Keluarga/kerabat; afiliasi", "Pejabat menunjuk/menilai pihak yang memiliki hubungan pribadi/kerja.", "Penunjukan, honor, penilaian, perpanjangan tugas.", "Deklarasi; verifikasi hubungan; panel; ganti penilai/pejabat; berita acara/SK.", "Pimpinan unit/atasan"],
  ["KK-03", "Pengadaan barang/jasa dan penyedia", "Bisnis/finansial; keluarga; afiliasi; hadiah", "Personel pengadaan memiliki hubungan/manfaat dari penyedia.", "Spesifikasi, pemilihan, evaluasi, penerimaan, pembayaran, sanksi.", "Deklarasi per paket; ganti personel; evaluasi kolegial; pembatasan akses; pengawasan; dokumen pemilihan/BA.", "PPK/pejabat pengadaan"],
  ["KK-04", "Keuangan, perjalanan dinas, honorarium, pembayaran", "Bisnis/finansial; keluarga/afiliasi", "Pejabat memproses/menyetujui transaksi yang menguntungkan dirinya/pihak terkait.", "Persetujuan, verifikasi, pembayaran, pertanggungjawaban.", "Alihkan persetujuan; verifikasi independen; uji transaksi; log/checklist sebelum pencairan.", "KPA/PPK/atasan"],
  ["KK-05", "Kepegawaian dan pengembangan karier", "Keluarga/kerabat; afiliasi; pekerjaan luar", "Pejabat menangani seleksi, penilaian, promosi, mutasi/disiplin pihak terkait.", "Nilai, rekomendasi, promosi, mutasi, pelatihan.", "Deklarasi; ganti penilai; panel independen; review; berita acara sebelum keputusan.", "Pimpinan/pengelola SDM"],
  ["KK-06", "Kerja sama, kemitraan, hibah, sponsor", "Afiliasi; bisnis/finansial; hadiah", "Pejabat memiliki hubungan dengan mitra/sponsor/penerima kerja sama.", "Pemilihan mitra, ruang lingkup, kontribusi/manfaat.", "Uji kelayakan (due diligence) sesuai tingkat risiko penyuapan; deklarasi; review hukum/keuangan; persetujuan independen; perjanjian.", "Pemilik kerja sama/atasan"],
  ["KK-07", "Data, informasi, soal, nilai, hasil layanan", "Afiliasi; finansial; penggunaan informasi", "Personel memanfaatkan akses untuk diri/pihak terkait.", "Akses, perubahan data, pelepasan hasil/informasi.", "Role-based access; deklarasi; dual control; audit log; investigasi anomali.", "Pemilik sistem/proses"],
  ["KK-08", "Aset, fasilitas, kendaraan, sumber daya", "Kepentingan pribadi; afiliasi", "Penggunaan aset/sumber daya untuk kepentingan pribadi/afiliasi.", "Izin penggunaan, peminjaman, penjadwalan, biaya.", "Tolak penggunaan di luar tugas; alih persetujuan; catat insiden; log BMN/BA.", "Pengelola BMN/atasan"],
  ["KK-09", "Hadiah, jamuan, fasilitas, gratifikasi", "Hadiah/gratifikasi", "Manfaat dapat memengaruhi netralitas keputusan.", "Penilaian, pemilihan, pembayaran, akses.", "Tolak/kembalikan/laporkan; deklarasi benturan kepentingan; alihkan keputusan; register.", "UPG/FKAP/atasan"],
  ["KK-10", "Pekerjaan di luar pekerjaan pokok/rangkap jabatan", "Pekerjaan luar/rangkap jabatan", "Kegiatan/jabatan lain berbenturan dengan tugas, waktu, informasi atau keputusan.", "Izin, pengadaan, kerja sama, penilaian, akses informasi.", "Daftar kepentingan; analisis kompatibilitas; batasi tugas/akses; alihkan keputusan; keputusan atasan.", "Atasan/pengelola SDM"],
  ["KK-11", "Hubungan dengan mantan pejabat/relasi jabatan lama", "Revolving door; afiliasi", "Relasi lama memperoleh akses/perlakuan khusus.", "Pengadaan, konsultasi, kerja sama, akses/informasi.", "Masa tunggu apabila dipersyaratkan ketentuan; deklarasi; larangan perlakuan istimewa; alih keputusan; uji kelayakan.", "Pimpinan/PPK/pemilik kerja sama"],
  ["KK-12", "Audit, evaluasi, pengaduan, investigasi", "Keluarga/afiliasi; kepentingan pribadi/jabatan", "Auditor/penelaah memiliki hubungan dengan objek/pihak yang diperiksa.", "Ruang lingkup, bukti, temuan, kesimpulan, sanksi.", "Deklarasi sebelum tugas; ganti personel; peer review; pembatasan akses; eskalasi.", "Ketua audit/atasan/Inspektorat"],
];

/** [tahap, pelaksana, tindakan, batas waktu, keluaran] */
export const ALUR_DEKLARASI: [string, string, string, string, string][] = [
  ["1", "Pejabat/pegawai", "Identifikasi dan hentikan sementara keterlibatan pada keputusan/tindakan yang terpengaruh.", "Segera", "Catatan awal/pengamanan akses."],
  ["2", "Pejabat/pegawai", "Sampaikan deklarasi kepada atasan dan usulkan pengendalian.", "Sebelum keputusan dilanjutkan", "Form deklarasi."],
  ["3", "Atasan pejabat", "Klarifikasi, nilai dampak, dan tetapkan pengendalian/pengganti; dapat meminta dukungan fungsi terkait.", "Maks. 7 hari kerja", "Analisis benturan kepentingan dan keputusan tertulis."],
  ["4", "Pemilik proses/pejabat pengganti", "Laksanakan pengalihan/pembatasan/panel atau pengendalian lain dan lanjutkan proses secara objektif.", "Sesuai keputusan", "Bukti pengalihan, risalah, log akses/keputusan."],
  ["5", "Atasan/FKAP/unit pengawasan", "Verifikasi efektivitas, rekam kasus dan eskalasi isu material/dugaan pelanggaran sesuai kewenangan.", "Setelah tindakan/monitoring berkala", "Hasil verifikasi dan pembaruan register."],
];

/** [indikator, target, frekuensi] */
export const MONEV_BK: [string, string, string][] = [
  ["Kebijakan/petunjuk dan penugasan pengelola tersedia dan mutakhir.", "Tersedia/mutakhir", "Tahunan/perubahan"],
  ["Proses sensitif dan skenario benturan kepentingan terpetakan.", "100% proses sensitif", "Tahunan/perubahan proses"],
  ["Kepatuhan daftar kepentingan dan deklarasi aktual.", "100% pihak yang diwajibkan; 100% deklarasi ditindaklanjuti", "Tahunan/setiap kasus"],
  ["Pelatihan/sosialisasi/konsultasi dilaksanakan sesuai risiko.", "Sesuai kelompok sasaran", "Tahunan/pegawai baru"],
  ["Pengaduan/dugaan pelanggaran ditangani aman, rahasia, sesuai SLA.", "100% sesuai ketentuan/SLA", "Setiap kasus"],
  ["Efektivitas pengendalian dan tren kasus dievaluasi serta dilaporkan.", "Kontrol efektif; laporan minimal tahunan", "Semester/tahunan"],
];

/** [unsur, peran, batas kewenangan] */
export const PERAN_BK: [string, string, string][] = [
  ["Kepala BPSDMP/Pimpinan Unit", "Memastikan komitmen, sumber daya, penerapan dan tindak lanjut isu material.", "Tidak menangani kasus yang melibatkan dirinya; eskalasi ke pejabat berwenang."],
  ["Atasan Pejabat", "Menerima deklarasi, menganalisis dan menetapkan pengendalian; untuk pengendalian internal ditetapkan paling lama 7 hari kerja.", "Keputusan objektif, terdokumentasi dan bebas benturan kepentingan."],
  ["Pejabat/Pegawai", "Mencatat kepentingan, mendeklarasikan benturan aktual, menghentikan keterlibatan dan mematuhi pengendalian.", "Tidak memengaruhi proses setelah kewenangan dialihkan/dibatasi."],
  ["Unit Pengawasan Internal/Pejabat Pengelola", "Mendukung pencatatan, pengawasan, pengaduan, konsultasi dan monev sesuai mandat.", "Menjaga kerahasiaan, objektivitas dan independensi."],
  ["FKAP BPSDMP", "Mendukung koordinasi, edukasi, pemetaan risiko penyuapan, konsultasi SMI dan eskalasi isu anti penyuapan.", "Tidak menggantikan kewenangan atasan, APIP, UPG, pemeriksa disiplin atau penegak hukum."],
  ["Pemilik Proses", "Memastikan kontrol preventif, pemisahan tugas, panel, log dan bukti diterapkan.", "Tidak menetapkan sendiri penyelesaian kasus yang melibatkan dirinya."],
];

/* ======================= PM.SMI.L14.2026 — RENCANA KEGIATAN FKAP ======================= */

export const PENGANTAR_FKAP_2026 =
  "Bidang Kepatuhan, Integritas, dan Anti Penyuapan pada Tim SMI BPSDMP melaksanakan kegiatan berikut untuk memastikan sistem anti penyuapan diterapkan dan dievaluasi secara berkala.";

/** [no, rencana kegiatan, waktu, hasil] */
export const RENCANA_FKAP_2026: [number, string, string, string][] = [
  [1, "Menelaah risiko penyuapan dan pengendaliannya bersama unit kerja.", "Oktober", "Matriks risiko dan rekomendasi pengendalian."],
  [2, "Melakukan sosialisasi serta memberi konsultasi mengenai gratifikasi, benturan kepentingan, dan pelaporan indikasi penyuapan.", "Oktober–November", "Materi, daftar hadir, dan catatan konsultasi."],
  [3, "Memantau laporan gratifikasi, benturan kepentingan, indikasi penyuapan, serta tindak lanjutnya sesuai kewenangan dan mekanisme yang berlaku.", "Setiap bulan", "Rekap laporan dan status tindak lanjut."],
  [4, "Memantau pelaksanaan pengendalian dan penyelesaian temuan atau rekomendasi terkait anti penyuapan.", "November–Desember", "Catatan pemantauan dan bukti penyelesaian."],
  [5, "Menyusun hasil evaluasi penerapan sistem anti penyuapan dan menyampaikannya kepada pimpinan.", "Desember", "Laporan fungsi anti penyuapan dan usulan perbaikan."],
];
