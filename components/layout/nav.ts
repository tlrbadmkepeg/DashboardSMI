import {
  Home, BookOpen, ScrollText, Network, FolderOpen, Compass, ShieldAlert, BarChart3, ClipboardCheck, CalendarDays,
  PenSquare, ShieldCheck, RefreshCw, FolderLock, FileBarChart, Settings, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/config/roles";

export interface NavChild { label: string; path: string; desc?: string }
export interface NavItem { label: string; short?: string; path: string; icon: LucideIcon; children?: NavChild[]; match: string[] }

/** Sepuluh menu informasi publik. Seluruhnya terbuka tanpa login. */
export const NAV: NavItem[] = [
  { label: "Beranda", path: "/", icon: Home, match: [""] },
  { label: "Tentang SMI", path: "/tentang", icon: BookOpen, match: ["tentang"] },
  {
    label: "Kebijakan & Sasaran", short: "Kebijakan & Sasaran", path: "/kebijakan", icon: ScrollText, match: ["kebijakan", "sasaran"],
    children: [
      { label: "Kebijakan Mutu", path: "/kebijakan", desc: "Tujuh komitmen kebijakan PM.SMI.L2" },
      { label: "Sasaran Mutu", path: "/sasaran", desc: "18 sasaran, target, dan unit kontributor" },
    ],
  },
  {
    label: "Organisasi & Proses", short: "Organisasi & Proses", path: "/organisasi", icon: Network, match: ["organisasi", "unit"],
    children: [
      { label: "Struktur Organisasi BPSDMP", path: "/organisasi", desc: "Bagan resmi dan sepuluh unit kerja" },
      { label: "Tata Kelola SMI", path: "/organisasi/tim", desc: "Bagan tata kelola dan struktur Tim SMI" },
      { label: "Proses Bisnis & Interaksi Proses", path: "/organisasi/proses", desc: "Peta proses internal SMI" },
      { label: "Matriks Komunikasi", path: "/organisasi/komunikasi", desc: "Apa, kapan, kepada siapa, melalui apa" },
      { label: "Profil Unit Kerja", path: "/unit", desc: "10 unit kerja dan capaiannya" },
    ],
  },
  {
    label: "Dokumen & SOP", path: "/dokumen", icon: FolderOpen, match: ["dokumen"],
    children: [
      { label: "Daftar Dokumen SMI", path: "/dokumen", desc: "Dokumen terkendali PM.SMI" },
      { label: "Daftar SOP", path: "/dokumen/sop", desc: "Folder SOP Sekretariat SMI dan Sekretariat BPSDMP" },
    ],
  },
  {
    label: "Konteks Organisasi", short: "Konteks", path: "/konteks", icon: Compass, match: ["konteks"],
    children: [
      { label: "Isu Internal & Eksternal", path: "/konteks", desc: "Faktor yang memengaruhi SMI" },
      { label: "Pihak Berkepentingan", path: "/konteks?tab=pihak", desc: "Kebutuhan, harapan, prioritas" },
      { label: "Persyaratan & Kepatuhan", path: "/konteks?tab=kepatuhan", desc: "Register peraturan yang berlaku" },
      { label: "Ruang Lingkup SMI", path: "/konteks?tab=lingkup", desc: "Batas penerapan sistem" },
    ],
  },
  {
    label: "Risiko & Peluang", short: "Risiko & Peluang", path: "/risiko", icon: ShieldAlert, match: ["risiko"],
    children: [
      { label: "Matriks Risiko 2026", path: "/risiko", desc: "Dashboard level, peta panas, dan register" },
      { label: "Register Risiko & Peluang", path: "/risiko/register", desc: "Risiko strategis, penyuapan, peluang (PM.SMI.L10)" },
      { label: "Fungsi Kepatuhan Anti Penyuapan", path: "/risiko/fkap", desc: "FKAP, benturan kepentingan, rencana 2026" },
    ],
  },
  {
    label: "Monitoring Capaian", short: "Monitoring", path: "/monitoring", icon: BarChart3, match: ["monitoring"],
    children: [
      { label: "Dashboard Capaian", path: "/monitoring", desc: "Grafik, peta unit × sasaran, tabel" },
      { label: "Tren Kinerja", path: "/monitoring/tren", desc: "Perkembangan bulanan dan tahunan" },
      { label: "Capaian per Unit", path: "/unit", desc: "Monitoring 10 unit kerja" },
    ],
  },
  {
    label: "Audit & Tindak Lanjut", short: "Audit", path: "/audit", icon: ClipboardCheck, match: ["audit"],
    children: [
      { label: "Audit Internal", path: "/audit", desc: "Ringkasan OFI, minor, mayor" },
      { label: "Tindak Lanjut Temuan", path: "/audit/tindak-lanjut", desc: "Progres, batas waktu, dan register" },
    ],
  },
  { label: "Kegiatan & Informasi", short: "Kegiatan", path: "/kegiatan", icon: CalendarDays, match: ["kegiatan"] },
];

export interface StaffItem { label: string; path: string; icon: LucideIcon; roles: Role[]; desc: string }

/** Menu pengelolaan yang muncul setelah petugas login. */
export const STAFF_NAV: StaffItem[] = [
  { label: "Input Realisasi", path: "/kelola/input", icon: PenSquare, roles: ["pic_unit"], desc: "Isi capaian, unggah bukti, ajukan" },
  { label: "Verifikasi", path: "/kelola/verifikasi", icon: ShieldCheck, roles: ["verifikator"], desc: "Periksa dan putuskan laporan" },
  { label: "Kendala & Tindak Lanjut", path: "/monitoring/tindak-lanjut", icon: ClipboardCheck, roles: ["pic_unit", "verifikator", "admin"], desc: "Pantau tindak lanjut capaian" },
  { label: "Bukti Dukung", path: "/kelola/bukti", icon: FolderLock, roles: ["pic_unit", "verifikator", "admin"], desc: "Berkas privat sesuai kewenangan" },
  { label: "Laporan & Ekspor", path: "/kelola/laporan", icon: FileBarChart, roles: ["pic_unit", "verifikator", "admin"], desc: "Bahan rapat dan tinjauan" },
  { label: "Sinkronisasi Data", path: "/kelola/sinkronisasi", icon: RefreshCw, roles: ["admin"], desc: "Dokumen vs database, usulan perubahan" },
  { label: "Administrasi Portal", path: "/kelola/admin", icon: Settings, roles: ["admin", "pic_unit", "verifikator"], desc: "Profil, skema, dan konten" },
];

export const activeNav = (segments: string[]) => {
  const first = segments[0] ?? "";
  if (first === "unit") return NAV.find((n) => n.label === "Organisasi & Proses")!;
  return NAV.find((n) => n.match.includes(first)) ?? null;
};
