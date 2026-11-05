import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Profil } from "@/types/domain";
import type { AuthApi, DataSource } from "@/services/dataSource";
import { DESIGN_PREVIEW_ENABLED, isSupabaseConfigured } from "@/config/env";
import { previewAuth, previewSource } from "@/services/previewSource";
import { supabaseAuth, supabaseSource } from "@/services/supabaseSource";
import type { Role } from "@/config/roles";

export type AppMode = "supabase" | "preview" | "unconfigured";

export const APP_MODE: AppMode = DESIGN_PREVIEW_ENABLED ? "preview" : isSupabaseConfigured() ? "supabase" : "unconfigured";

/**
 * Portal terbuka untuk umum. Profil null berarti pengunjung (tanpa login).
 * Login hanya untuk petugas (PIC, verifikator, administrator) dan membuka menu pengelolaan.
 */
interface AuthValue {
  mode: AppMode;
  profile: Profil | null;
  isStaff: boolean;
  initializing: boolean;
  source: DataSource;
  loginOpen: boolean;
  openLogin(): void;
  closeLogin(): void;
  signIn(email: string, password: string): Promise<void>;
  signInPreview(role: Role): void;
  signOut(): Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const api: AuthApi | null = APP_MODE === "preview" ? previewAuth : APP_MODE === "supabase" ? supabaseAuth : null;
  const source: DataSource = APP_MODE === "preview" ? previewSource : supabaseSource;
  const [profile, setProfile] = useState<Profil | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!api) return setInitializing(false);
    try {
      setProfile(await api.currentProfile());
    } catch {
      setProfile(null);
    } finally {
      setInitializing(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
    if (!api) return;
    return api.onChange(() => { refresh(); });
  }, [api, refresh]);

  const value = useMemo<AuthValue>(() => ({
    mode: APP_MODE,
    profile,
    isStaff: !!profile,
    initializing,
    source,
    loginOpen,
    openLogin: () => setLoginOpen(true),
    closeLogin: () => setLoginOpen(false),
    async signIn(email, password) {
      if (!api) throw new Error("Koneksi Supabase belum dikonfigurasi.");
      setProfile(await api.signIn(email, password));
      setLoginOpen(false);
    },
    signInPreview(role) {
      setProfile(previewAuth.signInAs(role));
      setLoginOpen(false);
    },
    async signOut() {
      await api?.signOut();
      setProfile(null);
    },
  }), [api, profile, initializing, source, loginOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return c;
}
