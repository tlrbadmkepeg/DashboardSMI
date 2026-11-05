/**
 * Folder Google Drive SOP yang diberikan pengguna (PROMPT FINAL, 2026).
 * Portal hanya menautkan folder yang ada; tidak menghitung jumlah SOP dan tidak membuat folder baru.
 * Izin berbagi tiap folder diatur di Google Drive oleh pemiliknya — portal tidak mengubahnya.
 */
export interface FolderSop { id: string; huruf: string; nama: string; url: string; deskripsi?: string }
export interface KelompokSop { id: "smi" | "bpsdmp"; judul: string; ringkas: string; folder: FolderSop[] }

const d = (id: string) => `https://drive.google.com/drive/folders/${id}?usp=drive_link`;

export const KELOMPOK_SOP: KelompokSop[] = [
  {
    id: "smi", judul: "SOP Sekretariat SMI", ringkas: "Prosedur pengelolaan Sistem Manajemen Integrasi",
    folder: [
      { id: "smi-a", huruf: "A", nama: "Tata Kelola dan Perencanaan SMI", url: d("1uCufiSCzDchke5JH4WsdV8K6X_KZ4smV") },
      { id: "smi-b", huruf: "B", nama: "Dokumentasi, Kompetensi, dan Komunikasi", url: d("1RB_i5PHDLKpuKcRRXaexZqD0L32xlkqF") },
      { id: "smi-c", huruf: "C", nama: "Pengendalian Anti Penyuapan", url: d("1a_qUOYYrTS8sLcPVmVKFY-coZ1UOE6qv") },
      { id: "smi-d", huruf: "D", nama: "Pengendalian Layanan dan Penyedia Eksternal", url: d("1C8X-r6WF2O0G-yvDZLHquuVnDDvLehD1") },
      { id: "smi-e", huruf: "E", nama: "Evaluasi dan Peningkatan SMI", url: d("1dNGYlbIpHomtZnnsB9BxbH4YXNq3NsDO") },
    ],
  },
  {
    id: "bpsdmp", judul: "SOP Sekretariat BPSDMP", ringkas: "Prosedur layanan dan dukungan manajemen Sekretariat BPSDMP",
    folder: [
      { id: "bp-a", huruf: "A", nama: "Perencanaan, Evaluasi, dan Pelaporan", url: d("14JoPbl8KLQqDzdCwD8oDPXenC5x7H3VD") },
      { id: "bp-b", huruf: "B", nama: "Keuangan", url: d("15L7SEAaLez-OEwg_ob6CZinDxfZxI99r") },
      { id: "bp-c", huruf: "C", nama: "Kepegawaian dan Pengembangan Kompetensi", url: d("1oY1fdleKAmd9dJo3aDkWSuJAJFZjAzYl") },
      { id: "bp-d", huruf: "D", nama: "Organisasi, Tata Laksana, dan Reformasi Birokrasi", url: d("13XPkoRbMXLKwh3PqWiKuw-x0mdJ4kL12") },
      { id: "bp-e", huruf: "E", nama: "Hukum dan Kerja Sama", url: d("1uyLs7iPX1wylPwgqfRzI9cL4R8nemOeE") },
      { id: "bp-f", huruf: "F", nama: "Manajemen Risiko dan Kepatuhan Internal", url: d("1d8wJSfU9q6f1JSIo891othpj7pEj7cHw") },
      { id: "bp-g", huruf: "G", nama: "Pengadaan, BMN, dan Rumah Tangga", url: d("1W_71d2RaUMi9BumeDWi_34EBhE-j9Wus") },
      { id: "bp-h", huruf: "H", nama: "Tata Usaha, Persuratan, dan Kearsipan", url: d("1uUC8fjhk_-_hDr-vBgvU8PZWeWBZuT5H") },
      { id: "bp-i", huruf: "I", nama: "Layanan, Data, Informasi, Konsultasi, dan Pengaduan", url: d("1293dHsMM3iMXYdvzFHkLqzV_G22YjCC-") },
    ],
  },
];
