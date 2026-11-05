import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, type AnchorHTMLAttributes } from "react";

/**
 * Router berbasis hash (#/sasaran/12). Dipilih agar website dapat di-hosting statis
 * (GitHub Pages, Netlify, Vercel, server instansi) tanpa aturan rewrite.
 */
interface RouterValue {
  path: string;
  segments: string[];
  query: URLSearchParams;
  navigate: (to: string) => void;
}

const RouterCtx = createContext<RouterValue | null>(null);

const readHash = () => {
  try {
    const h = window.location.hash.replace(/^#/, "");
    return h.startsWith("/") ? h : "/";
  } catch {
    return "/";
  }
};

export function RouterProvider({ children }: { children: ReactNode }) {
  const [full, setFull] = useState<string>(readHash);

  useEffect(() => {
    const onHash = () => setFull(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    setFull(to);
    try {
      if (readHash() !== to) window.location.hash = to;
    } catch {
      /* lingkungan tanpa akses hash: navigasi tetap berjalan di memori */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const value = useMemo<RouterValue>(() => {
    const [p, q = ""] = full.split("?");
    return { path: p, segments: p.split("/").filter(Boolean), query: new URLSearchParams(q), navigate };
  }, [full, navigate]);

  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterCtx);
  if (!ctx) throw new Error("useRouter harus dipakai di dalam RouterProvider");
  return ctx;
}

export function Link({ to, className, children, ...rest }: { to: string; className?: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
