import type { ComponentType } from "react";
import { Loader2, Lock } from "lucide-react";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { DataProvider } from "@/hooks/useData";
import { PortalProvider } from "@/hooks/usePortal";
import { RouterProvider, useRouter } from "@/lib/router";
import { ToastProvider } from "@/components/ui/toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/states";
import type { Role } from "@/config/roles";
import { BerandaPage } from "@/pages/BerandaPage";
import { TentangPage } from "@/pages/TentangPage";
import { KebijakanPage } from "@/pages/KebijakanPage";
import { SasaranPage } from "@/pages/SasaranPage";
import { SasaranDetailPage } from "@/pages/SasaranDetailPage";
import { OrganisasiPage } from "@/pages/OrganisasiPage";
import { UnitPage } from "@/pages/UnitPage";
import { UnitDetailPage } from "@/pages/UnitDetailPage";
import { DokumenPage } from "@/pages/DokumenPage";
import { KonteksPage } from "@/pages/KonteksPage";
import { RisikoPage } from "@/pages/RisikoPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { TrenPage } from "@/pages/TrenPage";
import { TindakLanjutPage } from "@/pages/TindakLanjutPage";
import { AuditPage } from "@/pages/AuditPage";
import { KegiatanPage } from "@/pages/KegiatanPage";
import { CariPage } from "@/pages/CariPage";
import { InputPage } from "@/pages/InputPage";
import { VerifikasiPage } from "@/pages/VerifikasiPage";
import { BuktiPage } from "@/pages/BuktiPage";
import { LaporanPage } from "@/pages/LaporanPage";
import { PengaturanPage } from "@/pages/PengaturanPage";
import { SinkronisasiPage } from "@/pages/SinkronisasiPage";

type Page = ComponentType;
interface Route { match: (s: string[]) => boolean; page: Page; roles?: Role[] }

const STAFF: Role[] = ["admin", "pic_unit", "verifikator"];

/** Halaman informasi terbuka tanpa login; halaman /kelola dan tindak lanjut khusus petugas. */
const ROUTES: Route[] = [
  { match: (s) => s.length === 0, page: BerandaPage },
  { match: (s) => s[0] === "tentang", page: TentangPage },
  { match: (s) => s[0] === "kebijakan", page: KebijakanPage },
  { match: (s) => s[0] === "sasaran" && s.length === 1, page: SasaranPage },
  { match: (s) => s[0] === "sasaran" && s.length > 1, page: SasaranDetailPage },
  { match: (s) => s[0] === "organisasi", page: OrganisasiPage },
  { match: (s) => s[0] === "unit" && s.length === 1, page: UnitPage },
  { match: (s) => s[0] === "unit" && s.length > 1, page: UnitDetailPage },
  { match: (s) => s[0] === "dokumen", page: DokumenPage },
  { match: (s) => s[0] === "konteks", page: KonteksPage },
  { match: (s) => s[0] === "risiko", page: RisikoPage },
  { match: (s) => s[0] === "monitoring" && s[1] === "tren", page: TrenPage },
  { match: (s) => s[0] === "monitoring" && s[1] === "tindak-lanjut", page: TindakLanjutPage, roles: STAFF },
  { match: (s) => s[0] === "monitoring", page: OverviewPage },
  { match: (s) => s[0] === "audit", page: AuditPage },
  { match: (s) => s[0] === "kegiatan", page: KegiatanPage },
  { match: (s) => s[0] === "cari", page: CariPage },
  { match: (s) => s[0] === "kelola" && s[1] === "input", page: InputPage, roles: ["pic_unit"] },
  { match: (s) => s[0] === "kelola" && s[1] === "verifikasi", page: VerifikasiPage, roles: ["verifikator"] },
  { match: (s) => s[0] === "kelola" && s[1] === "bukti", page: BuktiPage, roles: STAFF },
  { match: (s) => s[0] === "kelola" && s[1] === "laporan", page: LaporanPage, roles: STAFF },
  { match: (s) => s[0] === "kelola" && s[1] === "admin", page: PengaturanPage, roles: STAFF },
  { match: (s) => s[0] === "kelola" && s[1] === "sinkronisasi", page: SinkronisasiPage, roles: ["admin"] },
];

function Routes() {
  const { profile, initializing, openLogin } = useAuth();
  const { segments, navigate } = useRouter();

  if (initializing) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <div className="flex items-center gap-3 text-sm text-navy-400"><Loader2 className="size-5 animate-spin text-accent" /> Memuat portal…</div>
      </div>
    );
  }

  const route = ROUTES.find((r) => r.match(segments));
  if (!route) {
    return <AppShell><Card><EmptyState title="Halaman tidak ditemukan" action={<Button variant="outline" onClick={() => navigate("/")}>Ke Beranda</Button>} /></Card></AppShell>;
  }
  if (route.roles && !(profile && route.roles.includes(profile.peran))) {
    return (
      <AppShell>
        <Card>
          <EmptyState
            icon={<Lock />}
            title={profile ? "Halaman ini di luar kewenangan peran Anda" : "Halaman khusus petugas"}
            description={profile ? "Hubungi administrator bila Anda memerlukan akses." : "Halaman pengelolaan hanya untuk PIC unit kerja, verifikator, dan administrator. Informasi portal lainnya dapat dibaca tanpa login."}
            action={profile ? <Button variant="outline" onClick={() => navigate("/")}>Ke Beranda</Button> : <Button onClick={openLogin}>Login petugas</Button>}
          />
        </Card>
      </AppShell>
    );
  }
  const Page = route.page;
  return <Page />;
}

export default function App() {
  return (
    <RouterProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <PortalProvider>
              <Routes />
            </PortalProvider>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </RouterProvider>
  );
}
