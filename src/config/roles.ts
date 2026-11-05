export type Role =
  | "admin"
  | "pimpinan_bpsdmp"
  | "sekretaris_bpsdmp"
  | "pimpinan_unit"
  | "pic_unit"
  | "verifikator"
  | "pegawai";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  pimpinan_bpsdmp: "Pimpinan BPSDMP",
  sekretaris_bpsdmp: "Sekretaris BPSDMP",
  pimpinan_unit: "Pimpinan Unit",
  pic_unit: "PIC Unit",
  verifikator: "Verifikator",
  pegawai: "Pegawai",
};

export const ALL_ROLES = Object.keys(ROLE_LABEL) as Role[];

export const normalizeRole = (v: unknown): Role | null => {
  const s = String(v ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return (ALL_ROLES as string[]).includes(s) ? (s as Role) : null;
};

/** Peran yang dapat login ke portal (petugas). Pengunjung lain membaca portal tanpa login. */
export const LOGIN_ROLES: Role[] = ["pic_unit", "verifikator", "admin"];

export type MenuKey =
  | "beranda" | "sasaran" | "unit" | "tren" | "tindak-lanjut"
  | "input" | "verifikasi" | "bukti" | "laporan" | "pengaturan";

/**
 * Menu yang ditampilkan per peran. Ini hanya pengaturan tampilan; batas akses data
 * tetap ditegakkan oleh RLS di Supabase.
 */
export const MENU_ACCESS: Record<MenuKey, Role[] | "publik"> = {
  beranda: "publik",
  sasaran: "publik",
  unit: "publik",
  tren: "publik",
  "tindak-lanjut": ["admin", "pic_unit", "verifikator"],
  input: ["pic_unit"],
  verifikasi: ["verifikator"],
  bukti: ["admin", "pic_unit", "verifikator"],
  laporan: ["admin", "pic_unit", "verifikator"],
  pengaturan: ["admin", "pic_unit", "verifikator"],
};

export const canSee = (role: Role | undefined, key: MenuKey) => {
  const a = MENU_ACCESS[key];
  return a === "publik" || (!!role && a.includes(role));
};

/** Peran yang tampilannya dikunci ke unit kerja sendiri. */
export const UNIT_SCOPED_ROLES: Role[] = ["pic_unit", "pimpinan_unit"];

/** Peran yang boleh menyertakan laporan yang belum terverifikasi dalam perhitungan (sebagai pantauan internal). */
export const CAN_VIEW_UNVERIFIED: Role[] = ["admin", "pimpinan_bpsdmp", "sekretaris_bpsdmp", "pimpinan_unit", "pic_unit", "verifikator"];

export const CAN_EXPORT: Role[] = ["admin", "pimpinan_bpsdmp", "sekretaris_bpsdmp", "pimpinan_unit", "pic_unit", "verifikator"];
