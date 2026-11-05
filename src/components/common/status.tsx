import { Badge } from "@/components/ui/badge";
import type { StatusCapaian, StatusLaporan } from "@/types/domain";

export const CAPAIAN_META: Record<StatusCapaian, { label: string; tone: "ok" | "warn" | "bad" | "muted" | "navy"; color: string; soft: string }> = {
  memenuhi: { label: "Memenuhi target", tone: "ok", color: "#16A34A", soft: "#DCF5E7" },
  // "mendekati" tidak lagi dihasilkan; dipertahankan sebagai alias "belum memenuhi target".
  mendekati: { label: "Belum memenuhi target", tone: "warn", color: "#E59E1F", soft: "#FDEBC8" },
  dibawah: { label: "Belum memenuhi target", tone: "warn", color: "#E59E1F", soft: "#FDEBC8" },
  nodata: { label: "Belum dilaporkan", tone: "muted", color: "#CBD5E1", soft: "#EEF2F6" },
  na: { label: "Tidak berlaku", tone: "navy", color: "#FFFFFF", soft: "#FFFFFF" },
  tidakdiukur: { label: "N/A (tidak ada pengukuran)", tone: "muted", color: "#94A3B8", soft: "#F1F5F9" },
};

export const LAPORAN_META: Record<StatusLaporan, { label: string; tone: "ok" | "warn" | "bad" | "muted" | "accent" }> = {
  draft: { label: "Draft", tone: "muted" },
  diajukan: { label: "Diajukan", tone: "accent" },
  perlu_perbaikan: { label: "Perlu perbaikan", tone: "warn" },
  terverifikasi: { label: "Terverifikasi", tone: "ok" },
  dokumen: { label: "Data dokumen (belum diverifikasi sistem)", tone: "accent" },
  lainnya: { label: "Status lain", tone: "muted" },
};

export function CapaianBadge({ status }: { status: StatusCapaian }) {
  const m = CAPAIAN_META[status];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}

export function LaporanBadge({ status, raw }: { status: StatusLaporan; raw?: string }) {
  const m = LAPORAN_META[status];
  return <Badge tone={m.tone}>{status === "lainnya" && raw ? raw : m.label}</Badge>;
}
