/**
 * Unit kerja, tata kelola, dan proses — transkripsi PM.SMI.L1, L5, L6, L7, L8, L10, L12 (Rev. 1/0, 22 Juni 2026).
 */

export interface UnitResmi {
  no: number;
  nama: string;
  singkatan: string;
  /** Kata kunci untuk mencocokkan dengan nama di tabel unit_kerja. */
  cocok: RegExp;
  jenis: "Sekretariat" | "Pusat" | "Balai" | "Akademi";
  pimpinan: string;
  mandat: string;
  peranSmi: string;
  lokasi: string;
  wilayah: string;
  proses: { dimiliki: string; peran: string; keluaran: string };
  konteks: { layanan: string; internal: string; eksternal: string; fokus: string; status: string };
  pemangku: { utama: string; kebutuhan: string; pemantauan: string };
  paparanSuap: { paparan: string; pj: string };
  komunikasi: { fokus: string; penerima: string; media: string; pj: string };
}

const BALAI_KONTEKS_CATATAN = "";

export const UNIT_RESMI: UnitResmi[] = [
  {
    no: 1, nama: "Sekretariat Badan Pengembangan Sumber Daya Manusia Perdagangan", singkatan: "Sekretariat", cocok: /sekretariat/i, jenis: "Sekretariat",
    pimpinan: "Sekretaris BPSDMP",
    mandat: "Koordinasi pelaksanaan tugas dan dukungan teknis/ administrasi BPSDMP: perencanaan, program dan anggaran, keuangan, hukum, kerja sama, informasi publik, data dan informasi, SDM, organisasi dan tata laksana, kinerja, reformasi birokrasi, kepatuhan internal, manajemen risiko, BMN, rumah tangga, persuratan, dan kearsipan.",
    peranSmi: "Sebagai unit organisasi BPSDMP, melaksanakan proses manajemen dan pendukung sesuai tugas dan fungsi serta mendukung koordinasi lintas unit, konsolidasi perencanaan, kinerja, risiko, sumber daya, informasi terdokumentasi, komunikasi, dan Tinjauan Manajemen sesuai kewenangan.",
    lokasi: "Jakarta", wilayah: "Sesuai kedudukan dan kewenangan BPSDMP.",
    proses: { dimiliki: "M1–M5 dalam fungsi koordinasi dan dukungan sesuai kewenangan; P1–P6 sesuai tugas dan fungsi", peran: "Melaksanakan proses manajemen dan pendukung sesuai tugas dan fungsi serta mendukung konsolidasi konteks, perencanaan, sasaran, risiko, sumber daya, informasi terdokumentasi, komunikasi, kinerja, audit, dan Tinjauan Manajemen.", keluaran: "Dokumen induk SMI; dukungan sumber daya; laporan konsolidasi; keputusan dan tindak lanjut." },
    konteks: { layanan: "Koordinasi, perencanaan, anggaran, kinerja, SDM, hukum, data, kepatuhan, BMN, administrasi", internal: "Jabatan belum terisi; organisasi baru; penyelarasan kompetensi dan penguatan SAKIP/tata kelola.", eksternal: "Reformasi birokrasi dan digitalisasi; perubahan regulasi kelembagaan, ASN, keuangan, pengadaan.", fokus: "Harmonisasi proses, akuntabilitas data, sumber daya, pengendalian dokumen, SPIP dan integritas.", status: "A" },
    pemangku: { utama: "Menteri/pimpinan; unit eselon I; pegawai; APIP/KPK; BSN/KAN/LS; penyedia; masyarakat/media.", kebutuhan: "Akuntabilitas, sumber daya, kepatuhan, pengadaan, data, komunikasi, koordinasi SMI, dan tindak lanjut.", pemantauan: "Laporan kinerja/SMI; audit; evaluasi penyedia; survei internal; pengaduan; tindak lanjut temuan." },
    paparanSuap: { paparan: "Pengadaan; pembayaran/pertanggungjawaban; kepegawaian; BMN/fasilitas; perjalanan dinas/kegiatan; konsolidasi data.", pj: "PPK/keuangan/SDM/pengelola BMN/Tim SMI; FKAP menelaah kontrol berisiko." },
    komunikasi: { fokus: "Kebijakan/sasaran SMI, perencanaan, SDM, keuangan, pengadaan, BMN, regulasi, pelaporan, publik, pengaduan, integritas.", penerima: "Seluruh unit, pimpinan, regulator, penyedia, publik", media: "SRIKANDI/TNDE, rapat, surat, portal, WBS", pj: "Sekretaris BPSDMP/Pemilik proses; Tim SMI/FKAP sesuai kewenangan" },
  },
  {
    no: 2, nama: "Pusat Pengembangan Kompetensi Aparatur Perdagangan", singkatan: "Pusbangkom", cocok: /kompetensi\s+aparatur\s+perdagangan|pusbangkom/i, jenis: "Pusat",
    pimpinan: "Kepala Pusat",
    mandat: "Penyusunan kebijakan teknis, rencana dan program; pengembangan kompetensi kepemimpinan dan manajerial; pengembangan kompetensi teknis; manajemen pengetahuan aparatur; serta dukungan tata usaha. Layanan operasional seperti RPL dicakup apabila ditetapkan melalui ketentuan/standar pelayanan yang sah.",
    peranSmi: "Pemilik/pelaksana pengembangan kompetensi aparatur, kompetensi kepemimpinan/manajerial dan teknis, manajemen pengetahuan, serta RPL apabila ditetapkan sesuai ketentuan.",
    lokasi: "Jakarta", wilayah: "Sesuai kedudukan dan kewenangan BPSDMP.",
    proses: { dimiliki: "U1-U7 untuk pengembangan kompetensi aparatur; U8C; pembinaan teknis aparatur", peran: "Menganalisis kebutuhan, merancang dan menyelenggarakan pengembangan kompetensi aparatur, manajemen pengetahuan, RPL apabila ditetapkan sesuai ketentuan, evaluasi, serta koordinasi teknis dengan Bapekomdag.", keluaran: "Program/kurikulum; sertifikat pelatihan; surat hasil RPL apabila berlaku; evaluasi efektivitas; rekomendasi peningkatan." },
    konteks: { layanan: "Pengembangan kompetensi aparatur, RPL, manajemen pengetahuan", internal: "Keahlian pengelolaan LMS belum merata; prosedur repository pengetahuan belum formal/seragam.", eksternal: "Efisiensi anggaran; pemahaman dan penerapan Trade CorpU belum merata.", fokus: "Mutu LMS/RPL, relevansi program, ketertelusuran sertifikat, repository dan evaluasi dampak.", status: "A" },
    pemangku: { utama: "Aparatur/peserta; instansi pengirim; unit teknis Kemendag; pengajar; mitra pendidikan.", kebutuhan: "Analisis kebutuhan, program relevan, RPL, LMS, asesmen, sertifikat tepat waktu, dampak kompetensi.", pemantauan: "Evaluasi pembelajaran; ketepatan sertifikat/RPL; kepuasan; evaluasi instansi; kinerja LMS." },
    paparanSuap: { paparan: "Seleksi peserta; RPL; penerbitan sertifikat; pemilihan pengajar/penyedia; evaluasi hasil pembelajaran.", pj: "Kepala Pusat/pemilik proses; FKAP sesuai tingkat risiko." },
    komunikasi: { fokus: "Program aparatur, RPL, kurikulum, pengajar, evaluasi dan sertifikat/dokumen hasil.", penerima: "Peserta ASN, unit pengirim, pengajar, mitra", media: "LMS, surat, rapat, portal", pj: "Kepala Pusat/Pemilik proses/PIC komunikasi" },
  },
  {
    no: 3, nama: "Pusat Pengembangan Sumber Daya Manusia Ekspor dan Jasa Perdagangan", singkatan: "PPEJP", cocok: /ekspor\s+dan\s+jasa|ppejp/i, jenis: "Pusat",
    pimpinan: "Kepala Pusat",
    mandat: "Penyusunan kebijakan teknis, rencana dan program; pengembangan SDM ekspor, metrologi legal, mutu, dan jasa perdagangan bagi dunia usaha dan masyarakat; promosi dan kerja sama; pembinaan lembaga pengembangan SDM; pendampingan pelaku usaha; serta dukungan tata usaha.",
    peranSmi: "Pemilik/pelaksana pengembangan SDM ekspor, metrologi, mutu, dan jasa perdagangan; pembinaan lembaga; pendampingan pelaku usaha; promosi dan kerja sama sesuai kewenangan.",
    lokasi: "Jakarta", wilayah: "Sesuai kedudukan dan kewenangan BPSDMP.",
    proses: { dimiliki: "U1-U7 untuk nonaparatur sesuai layanan; U8C; pembinaan teknis nonaparatur", peran: "Mengembangkan SDM ekspor, metrologi, mutu, dan jasa perdagangan bagi dunia usaha dan masyarakat; pembinaan lembaga; pendampingan; promosi; kerja sama; serta pembinaan teknis layanan nonaparatur.", keluaran: "Program; sertifikat pelatihan sesuai kewenangan; hasil pendampingan; kerja sama; evaluasi manfaat/dampak." },
    konteks: { layanan: "Pelatihan ekspor/jasa, sertifikasi profesi, pendampingan, pembinaan lembaga", internal: "Branding pusat keunggulan dan database pemangku kepentingan/mitra belum optimal.", eksternal: "Efisiensi anggaran; banyak penyelenggara pelatihan ekspor pemerintah/swasta.", fokus: "Diferensiasi layanan, stakeholder mapping, mutu sertifikasi, kemitraan, kepuasan dan dampak.", status: "A" },
    pemangku: { utama: "Pelaku usaha/UMKM; peserta; pemerintah daerah; asosiasi/mitra; pengajar; masyarakat.", kebutuhan: "Pelatihan/pendampingan praktis dan inklusif, jadwal jelas, hasil/sertifikat tepat waktu, dampak usaha.", pemantauan: "Kepuasan; ketepatan sertifikat; evaluasi hasil/dampak; keluhan; evaluasi mitra." },
    paparanSuap: { paparan: "Seleksi penerima manfaat; penerbitan sertifikat pelatihan; kerja sama/promosi/fasilitasi; event/narasumber; evaluasi peserta.", pj: "Kepala Pusat/pemilik proses/PPK; FKAP untuk kerja sama/mitra berisiko." },
    komunikasi: { fokus: "Pengembangan SDM ekspor, metrologi termasuk metrologi legal, mutu dan jasa perdagangan; program, peserta, evaluasi, pendampingan, promosi/kemitraan.", penerima: "Peserta/pelaku usaha/pengajar/mitra", media: "Katalog, LMS, surat, media sosial, forum", pj: "Kepala Pusat/Pemilik proses/PIC komunikasi" },
  },
  {
    no: 4, nama: "Pusat Pembinaan Jabatan Fungsional Perdagangan", singkatan: "Pusbin JF", cocok: /jabatan\s+fungsional|pusbin/i, jenis: "Pusat",
    pimpinan: "Kepala Pusat",
    mandat: "Penyusunan kebijakan teknis; rencana dan program; rencana pengembangan kompetensi fungsional; standar kompetensi jabatan fungsional dan pelaksana; rekomendasi formasi; akreditasi pelaksanaan uji kompetensi; penilaian kompetensi jabatan nonmanajerial; pertimbangan pengangkatan; pembinaan profesi; sistem dan layanan informasi; pemantauan, analisis, evaluasi dan pelaporan; serta dukungan tata usaha.",
    peranSmi: "Pemilik/pelaksana pembinaan jabatan fungsional; standar kompetensi; rekomendasi formasi; akreditasi pelaksanaan uji kompetensi; penilaian kompetensi nonmanajerial; pertimbangan pengangkatan; pembinaan profesi; dan layanan informasi.",
    lokasi: "Jakarta", wilayah: "Sesuai kedudukan dan kewenangan BPSDMP.",
    proses: { dimiliki: "U1, U2, U5-U7, U8A dan U8C sesuai relevansi", peran: "Mengelola kebijakan teknis, standar kompetensi, rekomendasi formasi, akreditasi pelaksanaan uji kompetensi, penilaian kompetensi nonmanajerial, pertimbangan pengangkatan, pembinaan profesi, konsultasi dan layanan informasi.", keluaran: "Kebijakan teknis; standar kompetensi; rekomendasi formasi; SKL/SPTL/hasil penilaian sesuai kewenangan; publikasi dan layanan informasi." },
    konteks: { layanan: "Kebijakan teknis, standar kompetensi, uji kompetensi, rekomendasi formasi, pembinaan profesi", internal: "Basis dokumen sebelumnya menunjukkan keterbatasan SDM, alat bantu/sistem, dan konsistensi prosedur; perlu validasi kondisi 2026.", eksternal: "Perubahan regulasi JF yang dinamis; perbedaan interpretasi; keterbatasan penguji dan data instansi pengguna.", fokus: "Ketepatan layanan, objektivitas asesmen, ketertelusuran, benturan kepentingan dan harmonisasi regulasi.", status: "A/V" },
    pemangku: { utama: "Pejabat/instansi pengguna JF; organisasi profesi; peserta uji; asesor/penguji; instansi pengusul.", kebutuhan: "Kebijakan teknis, standar kompetensi, dan ketentuan layanan yang jelas, uji objektif, rekomendasi formasi tepat waktu, konsultasi, pembinaan profesi, banding.", pemantauan: "Ketepatan SKL/SPTL dan rekomendasi; kepuasan; keluhan/banding; validasi hasil; forum profesi." },
    paparanSuap: { paparan: "Rekomendasi formasi; uji kompetensi/hasil; kebijakan/standar kompetensi; penunjukan penguji/asesor; konsultasi.", pj: "Kepala Pusat/pemilik layanan; FKAP untuk keputusan sensitif." },
    komunikasi: { fokus: "Uji kompetensi, rekomendasi formasi, kebijakan teknis/standar, pembinaan profesi, konsultasi dan hasil layanan.", penerima: "Pejabat fungsional, instansi pengusul, penguji, publik", media: "Portal, surat, konsultasi, rapat teknis", pj: "Kepala Pusat/Pemilik layanan/PIC komunikasi" },
  },
  ...(["Padang", "Yogyakarta", "Makassar"] as const).map((kota, i): UnitResmi => {
    const lok = { Padang: ["Padang, Sumatera Barat", "Sumatera, Kepulauan Bangka Belitung, dan Kepulauan Riau."], Yogyakarta: ["Yogyakarta, DI Yogyakarta", "Jawa, Kalimantan, Bali, dan Nusa Tenggara."], Makassar: ["Makassar, Sulawesi Selatan", "Sulawesi, Maluku, dan Papua."] }[kota];
    const konteks = {
      Padang: { layanan: "Pengembangan kompetensi aparatur/nonaparatur wilayah Sumatera dan kepulauan terkait", internal: "Kompetensi andragogi pengajar, kesiapan kurikulum/silabus, dan dukungan peserta perlu dipantau.", eksternal: "Peserta/instansi menghadapi keterbatasan anggaran; komitmen pada pelatihan daring; literasi LMS dan gangguan akses wilayah.", fokus: "Kualitas pembelajaran wilayah, pemerataan akses, kontinuitas, evaluasi pengajar, dan koordinasi instansi pengirim.", status: "A" },
      Yogyakarta: { layanan: "Pengembangan kompetensi aparatur/nonaparatur wilayah Jawa, Kalimantan, Bali, dan Nusa Tenggara", internal: "Fokus validasi sama dengan Balai wilayah: kompetensi pengajar, kesiapan kurikulum, sarana, dan konsistensi proses.", eksternal: "Keragaman kebutuhan wilayah, jadwal peserta, efisiensi anggaran, akses digital dan persaingan penyedia pelatihan.", fokus: "Standardisasi dengan adaptasi regional, pemanfaatan hybrid, evaluasi hasil dan dampak.", status: "V" },
      Makassar: { layanan: "Pengembangan kompetensi aparatur/nonaparatur wilayah Sulawesi, Maluku, dan Papua", internal: "Fokus validasi: kompetensi pengajar, kesiapan kurikulum, sarana, dukungan operasional dan dokumentasi.", eksternal: "Jarak dan transportasi, akses jaringan, cuaca ekstrem, biaya peserta, serta keragaman kebutuhan wilayah.", fokus: "Pemerataan akses, rencana kontinjensi, kemitraan lokal, platform ringan, dan mutu layanan regional.", status: "V" },
    }[kota];
    return {
      no: 5 + i, nama: `Balai Pengembangan Kompetensi Perdagangan ${kota}`, singkatan: `Bapekomdag ${kota}`, cocok: new RegExp(kota, "i"), jenis: "Balai",
      pimpinan: "Kepala Balai",
      mandat: kota === "Padang"
        ? "Pengembangan kompetensi aparatur dan nonaparatur perdagangan, termasuk perencanaan, penyelenggaraan, penyiapan bahan kurikulum/media/informasi, promosi dan kerja sama, pemantauan, evaluasi, pelaporan, serta tata usaha dan rumah tangga pada wilayah kerjanya."
        : "Pengembangan kompetensi aparatur dan nonaparatur perdagangan dengan cakupan fungsi yang sama sesuai wilayah kerja, kebutuhan peserta, dan program yang ditetapkan.",
      peranSmi: "Pelaksana pengembangan kompetensi aparatur dan nonaparatur perdagangan sesuai tugas, fungsi, dan wilayah kerja.",
      lokasi: lok[0], wilayah: lok[1],
      proses: { dimiliki: "U1-U7 di wilayah kerja; P1-P6 tingkat unit", peran: `Menyelenggarakan pengembangan kompetensi aparatur dan nonaparatur di seluruh wilayah ${lok[1].replace(/\.$/, "")}.`, keluaran: "Program wilayah; sertifikat pelatihan; evaluasi pembelajaran; data kebutuhan dan tindak lanjut." },
      konteks,
      pemangku: { utama: "Peserta aparatur/nonaparatur; pemerintah daerah; pelaku usaha; pengajar; penyedia lokal.", kebutuhan: "Program sesuai kebutuhan wilayah, akses, fasilitas, jadwal, LMS, pengajar kompeten, layanan inklusif.", pemantauan: "Kepuasan; hasil belajar; keterlaksanaan kurikulum; keluhan; evaluasi wilayah; sarana." },
      paparanSuap: { paparan: "Seleksi peserta; pengadaan lokal; evaluasi/sertifikat; kemitraan/kunjungan/pendampingan.", pj: "Kepala Balai/pemilik program/PPK." },
      komunikasi: { fokus: "Kebutuhan wilayah, program, peserta, pengajar, fasilitas, evaluasi, sertifikat pelatihan/dokumen hasil dan jejaring.", penerima: "Peserta, pemda, pelaku usaha, pengajar, mitra", media: "Surat, LMS, kanal resmi, media sosial/FGD", pj: "Kepala Balai/Pemilik proses/PIC komunikasi" },
    };
  }),
  {
    no: 8, nama: "Balai Pelatihan Aparatur Metrologi dan Mutu", singkatan: "BPAMM", cocok: /aparatur\s+metrologi|bpamm/i, jenis: "Balai",
    pimpinan: "Kepala Balai",
    mandat: "Pelatihan bagi SDM aparatur bidang metrologi dan mutu: perencanaan, penyelenggaraan pelatihan, penyiapan bahan kurikulum/media/informasi, promosi dan kerja sama, pemantauan, evaluasi, pelaporan, serta tata usaha dan rumah tangga.",
    peranSmi: "Pemilik/pelaksana pelatihan SDM aparatur bidang metrologi dan mutu, termasuk perencanaan, penyelenggaraan, evaluasi, pelaporan, promosi dan kerja sama.",
    lokasi: "Bandung Barat, Jawa Barat", wilayah: "Seluruh wilayah Indonesia.",
    proses: { dimiliki: "U1-U7 untuk aparatur bidang metrologi dan mutu; P1-P6 tingkat unit", peran: "Menyelenggarakan pelatihan aparatur bidang metrologi dan mutu, termasuk perencanaan, kurikulum/media, pelaksanaan, evaluasi hasil pembelajaran, promosi/kerja sama, pemantauan dan pelaporan.", keluaran: "Sertifikat pelatihan; hasil evaluasi pembelajaran; laporan pelaksanaan/evaluasi; rekomendasi peningkatan." },
    konteks: { layanan: "Pelatihan aparatur bidang metrologi dan mutu seluruh Indonesia", internal: "Bahan awal belum memuat isu spesifik; perlu validasi kecukupan pengajar teknis, laboratorium, alat praktik, kalibrasi, dan sistem asesmen.", eksternal: "Perubahan regulasi/metode metrologi dan mutu; kebutuhan nasional; ketersediaan peserta/pengajar dan teknologi peralatan.", fokus: "Keselamatan/praktik, kompetensi teknis, ketertelusuran alat, objektivitas asesmen, dan kontinuitas layanan.", status: "V" },
    pemangku: { utama: "Aparatur bidang metrologi/mutu; instansi pusat/daerah; pengajar/asesor; penyedia alat/fasilitas.", kebutuhan: "Kurikulum teknis relevan, laboratorium dan alat praktik layak, keselamatan, ketertelusuran, asesmen objektif.", pemantauan: "Hasil belajar; evaluasi pengajar; kondisi/ketertelusuran alat; kepuasan; insiden; ketepatan hasil." },
    paparanSuap: { paparan: "Seleksi peserta; pengadaan/kalibrasi alat praktik; penilaian/kelulusan; penerbitan sertifikat pelatihan.", pj: "Kepala Balai/pemilik program/PPK/tim teknis." },
    komunikasi: { fokus: "Pelatihan aparatur metrologi/mutu, sarana praktik, keselamatan, evaluasi dan sertifikat pelatihan.", penerima: "Peserta aparatur, instansi pengirim, pengajar, mitra teknis", media: "LMS, surat, briefing keselamatan, rapat", pj: "Kepala Balai/Pemilik proses/PIC komunikasi" },
  },
  {
    no: 9, nama: "Akademi Metrologi dan Instrumentasi", singkatan: "Akmet", cocok: /akademi|akmet/i, jenis: "Akademi",
    pimpinan: "Direktur",
    mandat: "Pendidikan vokasi bidang metrologi dan instrumentasi; penelitian dan pengabdian kepada masyarakat; penjaminan mutu pendidikan; perpustakaan, laboratorium dan workshop; pembinaan sivitas akademika dan alumni; kerja sama, pemagangan dan penempatan kerja; administrasi akademik dan kemahasiswaan; dukungan administrasi umum; evaluasi, pelaporan, dan pengawasan internal.",
    peranSmi: "Pemilik/pelaksana pendidikan vokasi metrologi dan instrumentasi; penelitian/pengabdian; penjaminan mutu; layanan akademik/kemahasiswaan; kerja sama, pemagangan, penempatan kerja, alumni, serta dukungan akademik/administrasi.",
    lokasi: "Kabupaten Sumedang, Jawa Barat", wilayah: "Sesuai kedudukan dan penyelenggaraan pendidikan vokasi.",
    proses: { dimiliki: "U1-U7 dan U8B/U8C; P1-P6 tingkat unit", peran: "Menyelenggarakan pendidikan vokasi metrologi dan instrumentasi; penelitian/pengabdian; penjaminan mutu; akademik/kemahasiswaan; pemagangan; kerja sama; penempatan kerja; alumni; dan dukungan akademik/administratif.", keluaran: "Lulusan; ijazah/transkrip/dokumen kelulusan; hasil penelitian/pengabdian; data tracer study; publikasi; laporan penjaminan mutu." },
    konteks: { layanan: "Pendidikan vokasi, penelitian, pengabdian, kelulusan, kerja sama, alumni", internal: "Beban dosen tinggi; keterampilan penulisan ilmiah perlu ditingkatkan.", eksternal: "Biaya publikasi relatif tinggi; lembaga mitra dan peluang kerja sama masih terbatas; kebutuhan pasar kerja berubah.", fokus: "Mutu akademik, tridharma, daya serap lulusan, integritas akademik, aksesibilitas dan kemitraan.", status: "A" },
    pemangku: { utama: "Mahasiswa; dosen/tenaga kependidikan; pengguna lulusan; alumni; perguruan tinggi/industri mitra.", kebutuhan: "Mutu akademik dan tridharma, fasilitas, asesmen objektif, dokumen kelulusan, daya serap, kerja sama dan karier.", pemantauan: "CPL; kelulusan; dokumen akademik; tracer study; survei pengguna; publikasi; kerja sama." },
    paparanSuap: { paparan: "Penerimaan mahasiswa; nilai/ujian/kelulusan; beasiswa/asrama/magang; penelitian/dana; pengadaan alat; penugasan dosen.", pj: "Direktur/pengelola akademik/PPK; FKAP sesuai tingkat risiko." },
    komunikasi: { fokus: "Penerimaan, kurikulum/perkuliahan, asesmen, layanan akademik, aksesibilitas, kelulusan, tracer, penelitian/pengabdian.", penerima: "Mahasiswa, dosen, alumni, pengguna lulusan, mitra", media: "Sistem akademik, LMS, surat, portal/forum", pj: "Pimpinan Akmet/Pemilik proses/PIC komunikasi" },
  },
  {
    no: 10, nama: "Balai Pelatihan Sumber Daya Manusia Metrologi, Mutu, dan Jasa Perdagangan", singkatan: "BPMJP", cocok: /metrologi,\s*mutu,?\s*dan\s+jasa|bpmjp|bpmmjp/i, jenis: "Balai",
    pimpinan: "Kepala Balai",
    mandat: "Pelatihan bagi SDM bidang metrologi, mutu, dan jasa perdagangan untuk dunia usaha dan masyarakat: perencanaan, penyelenggaraan, penyiapan bahan kurikulum/media/informasi, promosi dan kerja sama, pemantauan, evaluasi, pelaporan, serta tata usaha dan rumah tangga.",
    peranSmi: "Pemilik/pelaksana pelatihan SDM bidang metrologi, mutu, dan jasa perdagangan untuk dunia usaha/masyarakat, termasuk perencanaan, penyelenggaraan, evaluasi, pelaporan, promosi dan kerja sama.",
    lokasi: "Bandung Barat, Jawa Barat", wilayah: "Seluruh wilayah Indonesia.",
    proses: { dimiliki: "U1-U7 untuk nonaparatur bidang metrologi, mutu, dan jasa perdagangan; P1-P6 tingkat unit", peran: "Menyelenggarakan pelatihan bagi dunia usaha dan masyarakat, termasuk perencanaan, kurikulum/media, praktik/pembelajaran, evaluasi hasil pembelajaran, penerbitan sertifikat pelatihan sesuai ketentuan, promosi/kerja sama, pemantauan dan pelaporan.", keluaran: "Sertifikat pelatihan; hasil evaluasi pembelajaran; laporan pelaksanaan/evaluasi; evaluasi manfaat dan kepuasan." },
    konteks: { layanan: "Pelatihan nonaparatur dan sertifikasi profesi bidang metrologi, mutu, jasa perdagangan", internal: "Sarana pembelajaran terbatas; kompetensi dan jumlah SDM penyelenggara belum memadai.", eksternal: "Efisiensi anggaran; perubahan regulasi; perbedaan jadwal pengajar/penyelenggara/peserta; variasi kemampuan awal peserta.", fokus: "Sarana praktik, kompetensi SDM, penjadwalan, pre-assessment, mutu sertifikasi dan kerja sama pihak eksternal.", status: "A" },
    pemangku: { utama: "Peserta nonaparatur/pelatihan; pelaku usaha; pengajar; mitra; penyedia fasilitas.", kebutuhan: "Pelatihan yang relevan, fasilitas praktik yang memadai, evaluasi pembelajaran yang objektif, penerbitan sertifikat pelatihan tepat waktu sesuai ketentuan, integritas, dan aksesibilitas.", pemantauan: "Hasil evaluasi pembelajaran/kompetensi peserta; evaluasi pengajar; kepuasan; kesiapan sarana; ketepatan penerbitan sertifikat pelatihan; evaluasi mitra." },
    paparanSuap: { paparan: "Seleksi peserta; pengadaan alat/venue/jasa; konsultasi/pendampingan teknis; evaluasi pembelajaran; penerbitan sertifikat pelatihan.", pj: "Kepala Balai/pemilik layanan/PPK." },
    komunikasi: { fokus: "Pelatihan, peserta, pengajar, fasilitas praktik, evaluasi, sertifikat pelatihan, konsultasi/pendampingan dan mitra.", penerima: "Peserta, pelaku usaha/instansi, pengajar, mitra teknis", media: "LMS, surat, konsultasi, briefing, media sosial", pj: "Kepala Balai/Pemilik proses/PIC komunikasi" },
  },
];
void BALAI_KONTEKS_CATATAN;

/** Cari profil resmi untuk unit dari basis data berdasarkan nama. */
export const unitResmiDari = (nama: string) => UNIT_RESMI.find((u) => u.cocok.test(nama)) ?? null;

/* ======================= PM.SMI.L5.2026 — TATA KELOLA ======================= */

export const TATA_KELOLA = {
  kode: "PM.SMI.L5.2026",
  prinsip:
    "Lampiran ini menetapkan hubungan tata kelola penerapan Sistem Manajemen Integrasi (SMI) BPSDMP agar peran, tanggung jawab, kewenangan, koordinasi, pelaporan, independensi, dan akuntabilitas jelas. Bagan ini merupakan bagan tata kelola SMI, bukan struktur organisasi, sehingga tidak mengubah kedudukan dan hubungan pembinaan yang ditetapkan dalam peraturan organisasi dan tata kerja. Penerapannya menekankan akuntabilitas Manajemen Puncak, tanggung jawab Pimpinan Unit dan Pemilik Proses, mutu dan efektivitas pendidikan/pembelajaran, independensi FKAP, objektivitas dan imparsialitas audit internal, serta peningkatan berkelanjutan.",
  catatanPersonel: "Nama personel dan rincian penugasan dalam tata kelola SMI ditetapkan melalui keputusan dan/atau surat penugasan yang berlaku.",
  unsur: [
    { id: "mp", nama: "Manajemen Puncak", komposisi: "Kepala BPSDMP", tanggungJawab: "Akuntabel atas efektivitas SMI; menetapkan ruang lingkup, kebijakan, sasaran, tata kelola dan sumber daya; memastikan integrasi persyaratan; memimpin Tinjauan Manajemen dan budaya mutu/integritas.", pelaporan: "Mengarahkan unsur SMI; menerima laporan kinerja, risiko, audit, tindakan korektif, dan FKAP; mempertanggungjawabkan kinerja sesuai tata kelola Kementerian." },
    { id: "tim", nama: "Tim SMI BPSDMP", komposisi: "Personel yang ditetapkan sebagai Tim SMI BPSDMP melalui Keputusan Kepala BPSDMP", tanggungJawab: "Mengoordinasikan penerapan, pemeliharaan, evaluasi, dan peningkatan SMI lintas unit; mengonsolidasikan sasaran, risiko dan peluang, informasi terdokumentasi, kompetensi, hasil pemantauan, tindakan korektif, serta bahan Tinjauan Manajemen; tanpa mengambil alih tanggung jawab Pimpinan Unit dan Pemilik Proses.", pelaporan: "Melapor kepada Kepala BPSDMP; berkoordinasi dengan Pimpinan Unit, FKAP, Auditor Internal, dan fungsi pendukung." },
    { id: "fkap", nama: "Fungsi Kepatuhan Anti Penyuapan (FKAP)", komposisi: "Personel Tim SMI BPSDMP yang ditetapkan untuk menjalankan Fungsi Kepatuhan Anti Penyuapan, dengan kompetensi, kewenangan, sumber daya, status, dan independensi yang memadai.", tanggungJawab: "Mengawasi desain dan penerapan Sistem Anti Penyuapan; memberi petunjuk; memastikan kesesuaian; menilai kecukupan/efektivitas; dan melaporkan kinerja. Keterlibatan investigasi hanya sesuai kewenangan dan bebas benturan kepentingan.", pelaporan: "Memiliki akses langsung kepada Kepala BPSDMP sebagai Manajemen Puncak dalam pelaksanaan dan pelaporan fungsi anti penyuapan; pelaporan tidak boleh dihambat oleh fungsi operasional yang diawasi." },
    { id: "sekr", nama: "Sekretariat Tim SMI", komposisi: "Personel pendukung yang ditetapkan", tanggungJawab: "Mengelola administrasi rapat, agenda, daftar induk dokumen SMI, distribusi, konsolidasi data, rekaman komunikasi, dokumentasi keputusan, dan dukungan administratif.", pelaporan: "Mendukung Tim SMI BPSDMP dalam pelaksanaan administrasi dan pengelolaan informasi terdokumentasi SMI; tidak mengambil alih kewenangan Manajemen Puncak, Pimpinan Unit, FKAP, Auditor Internal, atau Pemilik Proses." },
    { id: "pu", nama: "Pimpinan Unit", komposisi: "Sekretaris BPSDMP, Kepala Pusat, Kepala Balai, dan Direktur Akmet sesuai kedudukan masing-masing", tanggungJawab: "Memastikan SMI diterapkan pada proses unit; menyediakan sumber daya; mengelola sasaran, risiko, kompetensi, kepatuhan, evaluasi, peningkatan, dan tindak lanjut temuan.", pelaporan: "Melapor sesuai garis kedudukan OTK; data/informasi SMI disampaikan melalui mekanisme koordinasi yang ditetapkan." },
    { id: "pp", nama: "Pemilik Proses", komposisi: "Pejabat/personel yang diberi tanggung jawab atas proses utama atau pendukung", tanggungJawab: "Memastikan proses ditetapkan, dilaksanakan, dikendalikan, dipantau, diukur, didokumentasikan, dikelola risikonya, memenuhi persyaratan, dan ditingkatkan.", pelaporan: "Melapor kepada Pimpinan Unit; berkoordinasi dengan pihak lintas unit apabila proses bersifat lintas fungsi." },
    { id: "ai", nama: "Auditor Internal", komposisi: "Personel yang kompeten, objektif, dan bebas dari tanggung jawab atas pekerjaan yang diaudit", tanggungJawab: "Melaksanakan audit sesuai program; menilai kesesuaian/efektivitas; menyusun temuan/laporan; memverifikasi tindak lanjut. Auditor tidak melaksanakan tindakan korektif area yang diaudit.", pelaporan: "Menyampaikan hasil audit kepada pihak berwenang; menjaga objektivitas, imparsialitas, dan kerahasiaan." },
    { id: "per", nama: "Seluruh Personel", komposisi: "Pegawai dan pihak yang bekerja untuk/atas nama BPSDMP sesuai relevansi", tanggungJawab: "Menerapkan kebijakan/prosedur; menjaga mutu, integritas, kerahasiaan dan kepatuhan; mengelola risiko; melaporkan masalah/dugaan pelanggaran; berkontribusi pada perbaikan.", pelaporan: "Berkoordinasi melalui atasan/Pemilik Proses dan menggunakan saluran pelaporan yang ditetapkan, termasuk saluran anti penyuapan bila relevan." },
  ],
  alur: [
    ["Arah dan Penetapan", "Kepala BPSDMP sebagai Manajemen Puncak menetapkan arah, ruang lingkup, kebijakan, sasaran, tata kelola, serta sumber daya yang diperlukan untuk penerapan dan peningkatan SMI BPSDMP."],
    ["Koordinasi dan Konsolidasi", "Tim SMI BPSDMP mengoordinasikan penerapan, pemeliharaan, pemantauan, evaluasi, pelaporan, dan peningkatan SMI lintas unit dengan dukungan Sekretariat Tim SMI."],
    ["Pelaksanaan pada Unit", "Pimpinan Unit memastikan penerapan SMI pada unit masing-masing melalui Pemilik Proses dan seluruh personel sesuai tugas, fungsi, kewenangan, serta tanggung jawab yang ditetapkan."],
    ["Pengawasan Anti Penyuapan", "FKAP menjalankan fungsi pengawasan terhadap desain dan penerapan pengendalian anti penyuapan, memberikan saran dan panduan, memantau kesesuaian dan efektivitas sistem anti penyuapan, serta menyampaikan hasil tinjauan dan laporan secara langsung kepada Manajemen Puncak sesuai kewenangannya."],
    ["Audit Internal", "Auditor Internal melaksanakan audit secara objektif dan tidak mengaudit pekerjaan yang menjadi tanggung jawabnya sendiri. Temuan disampaikan melalui laporan audit dan ditindaklanjuti oleh Pemilik Proses/Pimpinan Unit."],
    ["Pelaporan dan Tinjauan", "Kinerja proses, pencapaian sasaran, kepuasan pengguna/peserta, hasil dan efektivitas pendidikan/pembelajaran, risiko dan peluang, risiko penyuapan, keluhan/pengaduan, hasil audit, tindakan korektif, serta hasil tinjauan FKAP dikonsolidasikan sebagai masukan Tinjauan Manajemen dan dasar pengambilan keputusan."],
    ["Peningkatan", "Keputusan dan hasil evaluasi ditindaklanjuti melalui koreksi, tindakan korektif, perubahan pengendalian, penyediaan sumber daya, pembaruan risiko/dokumen, inovasi, dan peningkatan berkelanjutan."],
  ] as [string, string][],
  peninjauan: "Struktur tata kelola SMI ditinjau apabila terjadi perubahan organisasi dan tata kerja, peraturan perundang-undangan, ruang lingkup SMI, standar yang diterapkan, penetapan personel/tim, hasil audit, Tinjauan Manajemen, risiko penyuapan, atau kondisi lain yang memengaruhi efektivitas, independensi, kewenangan, dan akuntabilitas. Perubahan ditetapkan melalui mekanisme pengendalian informasi terdokumentasi dan keputusan dan/atau surat penugasan yang berlaku.",
};

/* ======================= PM.SMI.L6-2026 — PETA PROSES ======================= */

export interface ProsesResmi { kode: string; nama: string; kelompok: "manajemen" | "utama" | "pendukung"; tujuan: string; pemilik: string }

export const PROSES_RESMI: ProsesResmi[] = [
  { kode: "M1", kelompok: "manajemen", nama: "Konteks, kepemimpinan, kebijakan, dan ruang lingkup", tujuan: "Menetapkan konteks, pemangku kepentingan, ruang lingkup, kebijakan, arah, dan akuntabilitas SMI.", pemilik: "Kepala BPSDMP; Sekretariat BPSDMP; Pimpinan Unit" },
  { kode: "M2", kelompok: "manajemen", nama: "Perencanaan, sasaran, risiko, peluang, dan perubahan", tujuan: "Menetapkan sasaran, program, risiko dan peluang, risiko penyuapan, pengendalian, serta rencana perubahan.", pemilik: "Kepala BPSDMP; Pimpinan Unit; Pemilik Proses; FKAP sesuai kewenangan" },
  { kode: "M3", kelompok: "manajemen", nama: "Tata kelola SMI, sumber daya, kompetensi, komunikasi, dan informasi terdokumentasi", tujuan: "Mengintegrasikan persyaratan SMI; menyediakan sumber daya; memastikan kompetensi/kepedulian; mengendalikan komunikasi dan informasi terdokumentasi; serta koordinasi lintas unit.", pemilik: "Kepala BPSDMP; Tim SMI BPSDMP; Sekretariat BPSDMP; Pimpinan Unit; Sekretariat Tim SMI sebagai dukungan administratif" },
  { kode: "M4", kelompok: "manajemen", nama: "Pemantauan, pengukuran, audit internal, Tinjauan Manajemen, dan tinjauan FKAP", tujuan: "Menilai pencapaian sasaran, kinerja proses, kepuasan, efektivitas pendidikan/pembelajaran, kepatuhan, efektivitas pengendalian, dan kecukupan SMI.", pemilik: "Kepala BPSDMP dan Pimpinan Unit sesuai kewenangan; Auditor Internal, FKAP, Tim SMI BPSDMP, dan Pemilik Proses sebagai pihak terkait sesuai fungsi masing-masing." },
  { kode: "M5", kelompok: "manajemen", nama: "Ketidaksesuaian, tindakan korektif, inovasi, dan peningkatan", tujuan: "Menangani ketidaksesuaian, akar penyebab, efektivitas tindakan, peluang peningkatan, inovasi, dan pemutakhiran sistem/proses.", pemilik: "Kepala BPSDMP; Pimpinan Unit; Pemilik Proses; Tim SMI BPSDMP" },
  { kode: "U1", kelompok: "utama", nama: "Analisis kebutuhan", tujuan: "Mengidentifikasi kebutuhan kompetensi, pendidikan, layanan, pasar kerja, organisasi, wilayah, peserta, dan pemangku kepentingan sebagai dasar program/layanan.", pemilik: "Unit pemilik/penyelenggara layanan sesuai kewenangan" },
  { kode: "U2", kelompok: "utama", nama: "Desain dan pengembangan program, kurikulum/silabus, pembelajaran, dan asesmen", tujuan: "Menerjemahkan kebutuhan menjadi program, kurikulum/silabus, modul, metode, media, kriteria, serta sistem evaluasi/asesmen yang disetujui dan dikendalikan perubahannya.", pemilik: "Unit penyelenggara; tim akademik/kurikulum; Pemilik Proses" },
  { kode: "U3", kelompok: "utama", nama: "Persyaratan layanan, promosi, seleksi, dan registrasi", tujuan: "Menetapkan dan mengomunikasikan persyaratan layanan; memastikan proses promosi, penerimaan, seleksi, registrasi, dan perlindungan data dilakukan transparan dan sesuai ketentuan.", pemilik: "Unit penyelenggara dan fungsi layanan/informasi terkait" },
  { kode: "U4", kelompok: "utama", nama: "Penyelenggaraan pendidikan, pelatihan, pembelajaran, dan layanan", tujuan: "Melaksanakan pendidikan/pelatihan/pembelajaran dan layanan dalam kondisi terkendali, inklusif, aman, serta sesuai kurikulum, standar akademik, standar pelayanan, atau ketentuan program.", pemilik: "Unit penyelenggara sebagai pemilik proses; pengajar/widyaiswara/narasumber dan penyedia eksternal sebagai pelaksana terkendali" },
  { kode: "U5", kelompok: "utama", nama: "Ujian, asesmen, penilaian kompetensi, dan RPL", tujuan: "Melaksanakan evaluasi hasil pembelajaran/kompetensi secara valid, objektif, adil, aman, dapat ditelusuri, dan bebas benturan kepentingan; termasuk RPL apabila ditetapkan sesuai ketentuan.", pemilik: "Unit penyelenggara sesuai kewenangan; Pusbin JF/Pusbangkom/Akmet sesuai proses; asesor/penguji sebagai pelaksana terkendali" },
  { kode: "U6", kelompok: "utama", nama: "Verifikasi, pelepasan hasil, penerbitan sertifikat/dokumen hasil, dan kelulusan", tujuan: "Memastikan hasil memenuhi kriteria, diverifikasi, disahkan oleh pejabat berwenang, diterbitkan/ditetapkan tepat waktu, dan dikendalikan rekamannya.", pemilik: "Unit/pejabat berwenang sesuai produk dan layanan" },
  { kode: "U7", kelompok: "utama", nama: "Pascapelayanan, pembinaan, evaluasi efektivitas, alumni, manfaat dan dampak", tujuan: "Menindaklanjuti hasil layanan, memantau kepuasan, penerapan kompetensi, alumni/tracer study, manfaat, dampak, keluhan, dan rekomendasi peningkatan.", pemilik: "Unit penyelenggara dan Pemilik Proses" },
  { kode: "U8A", kelompok: "utama", nama: "Pembinaan Jabatan Fungsional dan layanan terkait", tujuan: "Mengelola kebijakan teknis, standar kompetensi, rekomendasi formasi, akreditasi pelaksanaan uji kompetensi, penilaian kompetensi nonmanajerial, pembinaan profesi, konsultasi dan layanan informasi sesuai kewenangan.", pemilik: "Pusat Pembinaan Jabatan Fungsional Perdagangan" },
  { kode: "U8B", kelompok: "utama", nama: "Pendidikan vokasi, penelitian, pengabdian kepada masyarakat, dan penjaminan mutu pendidikan", tujuan: "Mengelola penyelenggaraan pendidikan vokasi, penelitian/pengabdian, penjaminan mutu, layanan akademik/kemahasiswaan, pemagangan, kerja sama, alumni, dan dukungan akademik sesuai ketentuan.", pemilik: "Akademi Metrologi dan Instrumentasi" },
  { kode: "U8C", kelompok: "utama", nama: "Pendampingan, konsultasi, kerja sama, publikasi, dan layanan informasi", tujuan: "Mengelola layanan khusus lintas unit yang tidak selalu mengikuti urutan pembelajaran formal, tetapi tetap dikendalikan persyaratan, risiko, keluaran, evaluasi, dan rekamannya.", pemilik: "PPEJP, Pusbangkom, Bapekomdag, Pusbin JF, dan unit relevan sesuai kewenangan" },
  { kode: "P1", kelompok: "pendukung", nama: "Perencanaan, anggaran, keuangan, dan pelaporan", tujuan: "Menyediakan dukungan perencanaan, anggaran, pengelolaan keuangan, pemantauan realisasi, dan pelaporan untuk keberlangsungan proses SMI.", pemilik: "Sekretariat BPSDMP dan fungsi/unit terkait pada masing-masing unit kerja" },
  { kode: "P2", kelompok: "pendukung", nama: "SDM, kompetensi, penugasan, kepedulian, dan budaya organisasi", tujuan: "Memastikan kecukupan personel, kompetensi, penugasan, pengembangan, kepedulian SMI/anti penyuapan, dan budaya mutu/integritas.", pemilik: "Sekretariat BPSDMP dan fungsi SDM/unit terkait" },
  { kode: "P3", kelompok: "pendukung", nama: "Pengadaan, penyedia eksternal, uji kelayakan, dan kerja sama", tujuan: "Mengendalikan kebutuhan, pengadaan, penyedia eksternal/rekan bisnis, uji kelayakan bila relevan, komitmen anti penyuapan, kontrak/kerja sama, evaluasi, dan penerimaan hasil.", pemilik: "Fungsi pengadaan/kerja sama dan Pemilik Proses; FKAP memberi masukan sesuai risiko anti penyuapan" },
  { kode: "P4", kelompok: "pendukung", nama: "BMN, infrastruktur, lingkungan pembelajaran, laboratorium/workshop, dan keselamatan", tujuan: "Menyediakan dan memelihara sarana, prasarana, BMN, lingkungan belajar/kerja, laboratorium/workshop, peralatan, serta aspek keselamatan yang relevan.", pemilik: "Sekretariat BPSDMP dan unit pemilik sarana/fasilitas" },
  { kode: "P5", kelompok: "pendukung", nama: "TI/LMS, data, keamanan informasi, dokumen, dan arsip", tujuan: "Menjamin ketersediaan dan pengendalian sistem digital, LMS, data, akses, keamanan informasi, informasi terdokumentasi, retensi, dan kearsipan.", pemilik: "Sekretariat BPSDMP dan fungsi TI/data/kearsipan; unit pemilik sistem" },
  { kode: "P6", kelompok: "pendukung", nama: "Hukum, komunikasi publik, administrasi umum, SPIP, dan kepatuhan internal", tujuan: "Menyediakan dukungan hukum, komunikasi publik, administrasi, SPIP, kepatuhan internal, dan layanan kesekretariatan lainnya. FKAP tidak ditempatkan sebagai proses pendukung, melainkan fungsi pengendalian lintas proses.", pemilik: "Sekretariat BPSDMP dan fungsi/unit terkait" },
];

/** Interaksi antarproses: [dari, keluaran, kepada, kendali/rekaman]. */
export const INTERAKSI_PROSES: [string, string, string, string][] = [
  ["Masukan eksternal dan internal", "Mandat, regulasi, kebutuhan, data, isu, risiko dan peluang", "M1 - Konteks dan arah", "Analisis konteks; matriks pemangku kepentingan; register persyaratan"],
  ["M1 - Konteks dan arah", "Kebijakan, ruang lingkup, prioritas, kebutuhan/harapan, dan persyaratan relevan", "M2 - Perencanaan", "Kebijakan SMI; pernyataan ruang lingkup; keputusan pimpinan; data konteks"],
  ["M2 - Perencanaan", "Sasaran, program, rencana pengendalian, sumber daya, risiko, peluang, dan rencana perubahan", "M3, U1-U8C, P1-P6", "Dokumen sasaran; rencana kerja; register risiko/risiko penyuapan; rencana perubahan"],
  ["M3 - Tata kelola dan dukungan", "Sumber daya, kompetensi, komunikasi, informasi terdokumentasi, dan koordinasi", "U1-U8C, P1-P6", "Penugasan; matriks kompetensi; komunikasi; daftar induk dokumen; bukti sumber daya"],
  ["U1 - Analisis kebutuhan", "Peta kebutuhan dan rekomendasi program/layanan", "U2 - Desain", "Laporan analisis kebutuhan; data dasar; hasil validasi"],
  ["U2 - Desain", "Program, kurikulum/silabus, modul, metode, media, kriteria dan asesmen", "U3 dan U4", "Dokumen desain yang disahkan; rekaman perubahan; persetujuan"],
  ["U3 - Persyaratan/seleksi/registrasi", "Peserta/mahasiswa/pemohon terverifikasi dan informasi layanan yang telah dikomunikasikan", "U4 - Pelaksanaan", "Daftar peserta; bukti persyaratan; persetujuan; data registrasi"],
  ["P1-P6 - Pendukung", "SDM, anggaran, fasilitas, sistem, bahan, penyedia, dokumen dan dukungan lain", "M1-M5 dan U1-U8C", "Rencana sumber daya; kontrak/kerja sama; jadwal; bukti kompetensi; kesiapan sarana"],
  ["U4 - Pelaksanaan", "Bukti keikutsertaan, hasil proses belajar/layanan, tugas, dan data kinerja", "U5 - Penilaian", "Presensi; jurnal/log LMS; berita acara; portofolio; rekaman layanan"],
  ["U5 - Penilaian/RPL", "Nilai, hasil kompetensi, rekomendasi kelulusan, keputusan RPL atau hasil penilaian", "U6 - Verifikasi/pelepasan hasil", "Rekap nilai; lembar verifikasi; berita acara; keputusan penguji/asesor"],
  ["U6 - Verifikasi/pelepasan hasil", "Sertifikat pelatihan, surat hasil, SKL/SPTL, ijazah/transkrip, rekomendasi, atau dokumen resmi lainnya", "U7 dan penerima hasil", "Register penerbitan; bukti otorisasi; bukti penyerahan; arsip"],
  ["U7 - Pascapelayanan", "Data kepuasan, penerapan kompetensi, alumni/tracer, manfaat, dampak, keluhan dan rekomendasi", "M4 - Evaluasi", "Survei; tracer study; evaluasi pascapelatihan; laporan tindak lanjut"],
  ["U8A-U8C - Proses khusus", "Kebijakan teknis, rekomendasi, hasil penelitian/pengabdian, pendampingan, konsultasi, kerja sama, publikasi dan informasi", "U5-U7, M4, dan pemangku kepentingan sesuai relevansi", "Dokumen teknis; laporan; publikasi; berita acara; rekomendasi; rekaman layanan"],
  ["Seluruh proses", "KPI, keluhan, ketidaksesuaian, insiden, risiko/peluang, dugaan penyuapan, kinerja penyedia, dan data pendidikan/pembelajaran", "M4 - Evaluasi", "Dashboard/laporan kinerja; audit; pengaduan; register risiko/kepatuhan; evaluasi pembelajaran"],
  ["M4 - Evaluasi", "Temuan, tren, hasil audit, hasil tinjauan FKAP, hasil Tinjauan Manajemen, dan peluang peningkatan", "M5 - Peningkatan", "Laporan audit; notulen Tinjauan Manajemen; tinjauan FKAP; analisis data"],
  ["M5 - Peningkatan", "Koreksi, tindakan korektif, inovasi, perubahan dokumen/proses, dan pembelajaran organisasi", "M1-M3, U1-U8C, P1-P6 sesuai relevansi", "Rencana tindakan; bukti verifikasi efektivitas; dokumen revisi; praktik baik"],
  ["Pengguna/peserta/ penerima manfaat", "Umpan balik, pengaduan, banding, perubahan kebutuhan, kekhawatiran, dan informasi baru", "U1–U8C, M1, M4, dan FKAP sesuai relevansi", "Rekaman komunikasi; tindak lanjut pengaduan/banding; rekaman pelaporan kekhawatiran"],
];

export const KETENTUAN_INTERAKSI = [
  "Setiap proses memiliki Pemilik Proses yang bertanggung jawab atas pencapaian tujuan proses, pemenuhan persyaratan, pengendalian risiko dan peluang, pemantauan kinerja, informasi terdokumentasi, serta peningkatan proses.",
  "Interaksi dan serah terima antarproses maupun antarunit dilaksanakan dengan memastikan kejelasan input, keluaran, kriteria penerimaan, tanggung jawab, batas waktu, media/sistem yang digunakan, dan bukti pelaksanaannya.",
  "Proses yang melibatkan keputusan berisiko atau sensitif, antara lain seleksi, ujian, asesmen, kelulusan, penerbitan sertifikat atau dokumen hasil, rekomendasi, pengadaan, pembayaran, dan kerja sama, menerapkan pemisahan fungsi, verifikasi, pengelolaan benturan kepentingan, dan pengendalian anti penyuapan yang proporsional.",
  "Fungsi Kepatuhan Anti Penyuapan (FKAP) menjalankan fungsi pengendalian lintas proses sesuai kewenangannya dan tidak diposisikan sebagai pemilik proses pendukung P1–P6.",
  "Proses yang dilaksanakan oleh penyedia eksternal tetap berada dalam pengendalian BPSDMP melalui penetapan persyaratan, evaluasi penyedia, uji kelayakan apabila relevan, pemantauan kinerja, verifikasi hasil, serta pengendalian risiko dan anti penyuapan sesuai tingkat risikonya.",
  "Perubahan suatu proses harus mempertimbangkan dampaknya terhadap proses lain, pengguna/peserta, sumber daya, risiko dan peluang, risiko penyuapan, informasi terdokumentasi, sistem digital, sasaran SMI, serta persyaratan pendidikan dan pembelajaran. Peta proses dan interaksi proses ditinjau secara berkala dan diperbarui apabila terdapat perubahan yang memengaruhi kesesuaian atau efektivitas SMI.",
];

export const PETA_PROSES_KETERANGAN =
  "Peta ini merupakan peta proses internal SMI dan tidak menggantikan Peta Proses Bisnis Instansi Pemerintah yang ditetapkan sesuai ketentuan peraturan perundang-undangan.";
