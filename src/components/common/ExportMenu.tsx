import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/auth/AuthProvider";
import { CAN_EXPORT } from "@/config/roles";

/** Tombol ekspor Excel/PDF. Hanya tampil bagi peran yang berwenang mengekspor. */
export function ExportButtons({ onExcel, onPdf, disabled }: { onExcel?: () => Promise<void>; onPdf?: () => Promise<void>; disabled?: boolean }) {
  const { profile, mode } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState<"x" | "p" | null>(null);
  if (!profile || !CAN_EXPORT.includes(profile.peran)) return null;

  const run = async (kind: "x" | "p", fn?: () => Promise<void>) => {
    if (!fn) return;
    if (mode === "preview") {
      toast({ tone: "info", title: "Ekspor tersedia di website mandiri", message: "Pratinjau desain tidak diizinkan mengunduh berkas. Pada website mandiri, tombol ini menghasilkan berkas Excel atau PDF." });
      return;
    }
    setBusy(kind);
    try {
      await fn();
      toast({ tone: "success", title: kind === "x" ? "Berkas Excel dibuat" : "Berkas PDF dibuat" });
    } catch (e: any) {
      toast({ tone: "error", title: "Ekspor gagal", message: e?.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {onExcel && (
        <Button variant="outline" size="sm" disabled={disabled || !!busy} onClick={() => run("x", onExcel)}>
          {busy === "x" ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />} Excel
        </Button>
      )}
      {onPdf && (
        <Button variant="outline" size="sm" disabled={disabled || !!busy} onClick={() => run("p", onPdf)}>
          {busy === "p" ? <Loader2 className="animate-spin" /> : <FileText />} PDF
        </Button>
      )}
    </div>
  );
}
