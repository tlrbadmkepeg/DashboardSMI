import { useState } from "react";
import { ExternalLink, FileText, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useToast } from "@/components/ui/toast";
import type { Bukti } from "@/types/domain";
import { fmtBytes, fmtDate } from "@/lib/format";

/**
 * Daftar bukti dukung. Berkas dibuka melalui tautan bertanda tangan berumur pendek
 * (createSignedUrl) yang hanya terbit bila kebijakan Storage mengizinkan pengguna ini.
 */
export function BuktiList({ items, compact }: { items: Bukti[]; compact?: boolean }) {
  const { source } = useAuth();
  const toast = useToast();
  const [opening, setOpening] = useState<string | null>(null);

  if (!items.length) return <p className="text-[13px] text-navy-400">Belum ada bukti dukung yang terlampir.</p>;

  const open = async (b: Bukti) => {
    setOpening(b.id);
    // Jendela dibuka lebih dulu agar tidak diblokir peramban, lalu diarahkan ke tautan bertanda tangan.
    const win = source.kind === "supabase" ? window.open("about:blank", "_blank") : null;
    try {
      const url = await source.signedUrl(b.path);
      if (win) win.location.href = url;
      else window.open(url, "_blank", "noopener");
    } catch (e: any) {
      win?.close();
      toast({ tone: "error", title: "Berkas tidak dapat dibuka", message: e?.message });
    } finally {
      setOpening(null);
    }
  };

  return (
    <ul className="space-y-2">
      {items.map((b) => (
        <li key={b.id} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><FileText className="size-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-navy" title={b.namaFile}>{b.namaFile}</span>
            {!compact && (
              <span className="text-xs text-navy-400">{fmtBytes(b.ukuran)} · {fmtDate(b.createdAt)}{b.keterangan ? ` · ${b.keterangan}` : ""}</span>
            )}
          </span>
          <button
            onClick={() => open(b)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-accent hover:bg-accent-soft"
            title="Buka melalui tautan privat berumur pendek"
          >
            {opening === b.id ? <Loader2 className="size-3.5 animate-spin" /> : <Lock className="size-3.5" />}
            Buka <ExternalLink className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
