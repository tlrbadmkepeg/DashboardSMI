import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Konten, PortalContent } from "@/types/portal";
import { useAuth } from "@/auth/AuthProvider";
import { loadPortalPreview, loadPortalSupabase } from "@/services/portalSource";
import { KONTEN_KEYS } from "@/config/schema";
import { KEBIJAKAN, RUANG_LINGKUP, teksKebijakanLengkap } from "@/content/resmi/dokumen";

/** Isi cadangan dari dokumen resmi PM.SMI bila baris konten_portal belum tersedia. */
const KONTEN_RESMI: Record<string, Konten> = {
  [KONTEN_KEYS.kebijakan]: {
    kunci: KONTEN_KEYS.kebijakan, judul: KEBIJAKAN.judul, isi: teksKebijakanLengkap(), kodeDokumen: KEBIJAKAN.kode,
    revisi: KEBIJAKAN.revisi, tanggalBerlaku: KEBIJAKAN.tanggal, pejabatPenetap: `${KEBIJAKAN.penetap} (${KEBIJAKAN.namaPenetap})`,
    fileUrl: "dokumen/kebijakan-smi-pm-smi-l2-2026.pdf", bolehUnduh: true, resmi: true,
  },
  [KONTEN_KEYS.ruangLingkup]: {
    kunci: KONTEN_KEYS.ruangLingkup, judul: "Pernyataan Ruang Lingkup SMI BPSDMP", isi: RUANG_LINGKUP.pernyataan, kodeDokumen: RUANG_LINGKUP.kode,
    revisi: "1/0", tanggalBerlaku: "2026-06-22", pejabatPenetap: "", fileUrl: null, bolehUnduh: false, resmi: true,
  },
};

const LOADING = { status: "loading" } as const;
const INITIAL: PortalContent = {
  konten: LOADING, dokumen: LOADING, struktur: LOADING, timSmi: LOADING, proses: LOADING, isu: LOADING,
  pihak: LOADING, risiko: LOADING, kegiatan: LOADING, auditRingkasan: LOADING, temuan: LOADING,
};

interface PortalValue {
  content: PortalContent;
  reload(): Promise<void>;
  konten(kunci: string): Konten | null;
}

const Ctx = createContext<PortalValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const { mode, profile, initializing } = useAuth();
  const [content, setContent] = useState<PortalContent>(INITIAL);

  const reload = useCallback(async () => {
    if (mode === "unconfigured") {
      const none = { status: "unavailable", kind: "galat", reason: "Koneksi Supabase belum dikonfigurasi." } as const;
      setContent(Object.fromEntries(Object.keys(INITIAL).map((k) => [k, none])) as any);
      return;
    }
    setContent(mode === "preview" ? await loadPortalPreview(!!profile) : await loadPortalSupabase(!!profile));
  }, [mode, profile]);

  useEffect(() => { if (!initializing) reload(); }, [initializing, profile?.id, reload]);

  const konten = (kunci: string) =>
    (content.konten.status === "ok" ? content.konten.rows.find((k) => k.kunci === kunci && k.isi) : null) ?? KONTEN_RESMI[kunci] ?? null;

  return <Ctx.Provider value={{ content, reload, konten }}>{children}</Ctx.Provider>;
}

export function usePortal() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal harus dipakai di dalam PortalProvider");
  return c;
}
