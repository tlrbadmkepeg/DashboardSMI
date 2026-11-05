import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dataset, Filters } from "@/types/domain";
import { useAuth } from "@/auth/AuthProvider";
import { buildDashboard, type DashboardModel } from "@/domain/indicators";
import { UNIT_SCOPED_ROLES, CAN_VIEW_UNVERIFIED } from "@/config/roles";
import { PREVIEW_PERIOD } from "@/services/previewSource";
import { gabungPencapaianDokumen } from "@/services/dokumenPencapaian";

interface DataValue {
  data: Dataset | null;
  loading: boolean;
  error: string | null;
  reload(): Promise<void>;
  filters: Filters;
  setFilters(patch: Partial<Filters>): void;
  model: DashboardModel | null;
  years: number[];
  unitLocked: boolean;
  canToggleUnverified: boolean;
}

const Ctx = createContext<DataValue | null>(null);

const STORE_KEY = "smi-filters";
const readStored = (): Partial<Filters> => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch { return {}; }
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { source, profile, mode, initializing } = useAuth();
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const initialPeriod = mode === "preview" ? PREVIEW_PERIOD : { tahun: now.getFullYear(), bulan: now.getMonth() + 1 };
  const [filters, setFiltersState] = useState<Filters>(() => ({
    tahun: initialPeriod.tahun,
    bulan: initialPeriod.bulan,
    unitId: "all",
    includeUnverified: false,
    ...(mode === "preview" ? {} : readStored()),
  }));

  const unitLocked = !!profile && UNIT_SCOPED_ROLES.includes(profile.peran) && !!profile.unitId;
  const canToggleUnverified = !!profile && CAN_VIEW_UNVERIFIED.includes(profile.peran);

  const effectiveFilters: Filters = useMemo(() => ({
    ...filters,
    unitId: unitLocked ? (profile!.unitId as string) : filters.unitId,
    includeUnverified: canToggleUnverified ? filters.includeUnverified : false,
  }), [filters, unitLocked, canToggleUnverified, profile]);

  const setFilters = useCallback((patch: Partial<Filters>) => {
    setFiltersState((f) => {
      const next = { ...f, ...patch };
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* abaikan */ }
      return next;
    });
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let d = await (profile ? source.loadDataset() : source.loadPublicDataset());
      d = gabungPencapaianDokumen(d);
      // Dokumen pencapaian adalah dokumen terkendali yang boleh dibaca publik.
      if (d.simulasi) d = { ...d, publikasiAktif: true };
      setData(d);
    } catch (e: any) {
      setError(e?.message ?? "Data tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, [source, profile]);

  // Pengunjung memuat data publik; petugas memuat data internal sesuai RLS.
  useEffect(() => { if (!initializing) reload(); }, [profile?.id, profile?.peran, initializing, reload]);

  const model = useMemo(() => (data ? buildDashboard(data, effectiveFilters) : null), [data, effectiveFilters]);

  const years = useMemo(() => {
    const ys = new Set<number>([initialPeriod.tahun, effectiveFilters.tahun]);
    data?.realisasi.forEach((r) => r.tahun && ys.add(r.tahun));
    return Array.from(ys).sort((a, b) => b - a);
  }, [data, effectiveFilters.tahun, initialPeriod.tahun]);

  const value: DataValue = {
    data, loading, error, reload, filters: effectiveFilters, setFilters, model, years, unitLocked, canToggleUnverified,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useData harus dipakai di dalam DataProvider");
  return c;
}
