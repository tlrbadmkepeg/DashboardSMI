import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Konfirmasi wajib sebelum pengajuan dan verifikasi. */
export function ConfirmDialog({
  open, onClose, title, description, confirmLabel, tone = "default", onConfirm, children, disabled,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  tone?: "default" | "success" | "danger";
  onConfirm: () => Promise<void> | void;
  children?: ReactNode;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>Batal</Button>
          <Button
            variant={tone === "success" ? "success" : tone === "danger" ? "danger" : "default"}
            disabled={busy || disabled}
            onClick={async () => {
              setBusy(true);
              try { await onConfirm(); } finally { setBusy(false); }
            }}
          >
            {busy && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
