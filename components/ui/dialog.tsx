import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Dialog modal ringan (pola shadcn/ui) dengan Escape, klik latar, dan fokus awal. */
export function Dialog({
  open, onClose, title, description, children, footer, size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => panel.current?.focus(), 10);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-[2px] animate-fade-up" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-lift outline-none animate-fade-up sm:rounded-2xl",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-2xl",
          size === "xl" && "sm:max-w-4xl",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-navy">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-navy-400">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 text-navy-400 hover:bg-canvas hover:text-navy">
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-canvas/60 px-6 py-3.5 sm:rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}
