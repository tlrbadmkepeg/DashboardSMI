import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";
interface Toast { id: number; tone: Tone; title: string; message?: string }

const Ctx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { ...t, id }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), t.tone === "error" ? 8000 : 4500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2" aria-live="polite">
        {items.map((t) => {
          const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? AlertCircle : Info;
          return (
            <div key={t.id} className="pointer-events-auto flex gap-3 rounded-xl border border-line bg-white p-3.5 shadow-lift animate-fade-up">
              <Icon className={cn("mt-0.5 size-5 shrink-0", t.tone === "success" ? "text-ok" : t.tone === "error" ? "text-bad" : "text-accent")} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy">{t.title}</p>
                {t.message && <p className="mt-0.5 text-[13px] leading-5 text-navy-400">{t.message}</p>}
              </div>
              <button className="text-navy-300 hover:text-navy" onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))} aria-label="Tutup notifikasi">
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
