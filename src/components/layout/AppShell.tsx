import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  ChevronDown, ChevronRight, FlaskConical, Lock, LogOut, Menu, Search, X, Briefcase, UserRound, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useData } from "@/hooks/useData";
import { Link, useRouter } from "@/lib/router";
import { ROLE_LABEL } from "@/config/roles";
import { NAV, STAFF_NAV, activeNav } from "./nav";
import { BrandMark } from "./BrandMark";
import { LoginDialog } from "./LoginDialog";
import { SearchDialog } from "./SearchDialog";
import { PORTAL, PILAR } from "@/content/portal";
import { cn } from "@/lib/utils";

export interface Crumb { label: string; to?: string }

function useOutside(ref: RefObject<HTMLElement>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOut(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

function PreviewBanner() {
  const { mode } = useAuth();
  const { data } = useData();
  if (mode !== "preview" && !data?.simulasi) return null;
  return (
    <div className="border-b border-teal/20 bg-teal-soft">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-[12.5px] text-navy-700 sm:px-6">
        <FlaskConical className="size-4 shrink-0 text-teal" />
        {mode === "preview" && <span className="font-semibold">Pratinjau tanpa koneksi Supabase.</span>}
        <span>Capaian bersumber dari dokumen <b className="font-semibold">PM.SMI.L3-01.2026</b> (data s.d. Oktober 2026) dan belum melalui verifikasi sistem.</span>
      </div>
    </div>
  );
}

function DesktopNav() {
  const { segments, navigate } = useRouter();
  const active = activeNav(segments);
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  useOutside(ref as any, () => setOpen(null));
  useEffect(() => setOpen(null), [segments.join("/")]);

  return (
    <nav ref={ref} className="mx-auto hidden max-w-[1320px] px-4 sm:px-6 xl:block" aria-label="Navigasi utama">
      <ul className="-mx-3 flex items-center gap-0.5 py-1.5">
        {NAV.map((n) => {
          const isActive = active?.label === n.label;
          if (!n.children) {
            return (
              <li key={n.label}>
                <Link to={n.path} className={cn("relative block rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors", isActive ? "bg-white/[0.12] text-white" : "text-white/75 hover:bg-white/[0.08] hover:text-white")}>
                  {n.short ?? n.label}
                  {isActive && <span className="absolute inset-x-3 -bottom-[6px] h-[3px] rounded-full bg-gold" />}
                </Link>
              </li>
            );
          }
          return (
            <li key={n.label} className="relative" onMouseEnter={() => setOpen(n.label)} onMouseLeave={() => setOpen(null)}>
              <button
                onClick={() => (open === n.label ? navigate(n.path) : setOpen(n.label))}
                aria-expanded={open === n.label}
                className={cn("relative flex items-center gap-1 rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors", isActive ? "bg-white/[0.12] text-white" : "text-white/75 hover:bg-white/[0.08] hover:text-white")}
              >
                {n.short ?? n.label}
                <ChevronDown className={cn("size-3.5 transition-transform", open === n.label && "rotate-180")} />
                {isActive && <span className="absolute inset-x-3 -bottom-[6px] h-[3px] rounded-full bg-gold" />}
              </button>
              {open === n.label && (
                <div className="absolute left-0 top-full z-40 pt-2">
                  <div className="w-[300px] rounded-2xl border border-line bg-white p-2 shadow-lift animate-fade-up">
                    {n.children.map((c) => (
                      <Link key={c.path} to={c.path} className="group flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-canvas">
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent group-hover:bg-accent group-hover:text-white"><n.icon className="size-3.5" /></span>
                        <span>
                          <span className="block text-[13.5px] font-medium text-navy">{c.label}</span>
                          {c.desc && <span className="block text-xs text-navy-400">{c.desc}</span>}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function StaffMenu() {
  const { profile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref as any, () => setOpen(false));
  if (!profile) return null;
  const items = STAFF_NAV.filter((s) => s.roles.includes(profile.peran));
  const initials = profile.nama.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-2.5 text-[12.5px] font-medium text-navy hover:border-navy-300" aria-expanded={open}>
        <span className="grid size-7 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">{initials}</span>
        <span className="hidden sm:inline">Pengelolaan</span>
        <ChevronDown className="size-3.5 text-navy-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[290px] rounded-2xl border border-line bg-white p-2 shadow-lift animate-fade-up">
          <div className="border-b border-line px-3 pb-3 pt-2">
            <div className="truncate text-[13.5px] font-semibold text-navy">{profile.nama}</div>
            <div className="text-xs text-navy-400">{ROLE_LABEL[profile.peran]}</div>
          </div>
          <div className="py-1.5">
            {items.map((s) => (
              <button key={s.path} onClick={() => { setOpen(false); navigate(s.path); }} className="group flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-canvas">
                <s.icon className="mt-0.5 size-4 text-navy-300 group-hover:text-accent" />
                <span><span className="block text-[13px] font-medium text-navy">{s.label}</span><span className="block text-[11.5px] text-navy-400">{s.desc}</span></span>
              </button>
            ))}
          </div>
          <button onClick={() => { setOpen(false); signOut(); }} className="flex w-full items-center gap-3 rounded-xl border-t border-line px-3 py-2.5 text-[13px] font-medium text-bad hover:bg-bad-soft">
            <LogOut className="size-4" /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const go = (p: string) => { onClose(); navigate(p); };
  const staff = profile ? STAFF_NAV.filter((s) => s.roles.includes(profile.peran)) : [];
  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <div className="absolute inset-0 bg-navy/30" onClick={onClose} />
      <aside className="absolute bottom-0 right-0 top-0 flex w-[330px] max-w-[88vw] flex-col bg-white shadow-lift animate-fade-up">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <span className="text-[14px] font-semibold text-navy">Menu</span>
          <button onClick={onClose} className="rounded-lg p-1.5 text-navy-400 hover:bg-canvas" aria-label="Tutup menu"><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {NAV.map((n) => (
            <div key={n.label} className="mb-1">
              <button onClick={() => go(n.path)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-navy hover:bg-canvas">
                <n.icon className="size-[18px] text-navy-300" /> {n.label}
              </button>
              {n.children && (
                <div className="ml-10 border-l border-line pl-2">
                  {n.children.map((c) => (
                    <button key={c.path} onClick={() => go(c.path)} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] text-navy-500 hover:bg-canvas hover:text-navy">{c.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {staff.length > 0 && (
            <div className="mt-3 border-t border-line pt-3">
              <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-navy-300">Pengelolaan</div>
              {staff.map((s) => (
                <button key={s.path} onClick={() => go(s.path)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-navy hover:bg-canvas">
                  <s.icon className="size-[18px] text-navy-300" /> {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Footer({ flush }: { flush?: boolean }) {
  const { openLogin, profile } = useAuth();
  return (
    <footer className={cn("border-t-[3px] border-gold bg-navy text-white", !flush && "mt-16")}>
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark variant="putih" />
            <div>
              <div className="text-[14.5px] font-semibold">{PORTAL.instansi}</div>
              <div className="text-[12.5px] text-white/60">{PORTAL.kementerian}</div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-[13px] leading-6 text-white/65">{PORTAL.nama}. Pusat informasi, dokumentasi, dan pemantauan penerapan Sistem Manajemen Integrasi.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {PORTAL.tagline.map((t) => <span key={t} className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[11.5px] text-white/75 ring-1 ring-white/10">{t}</span>)}
          </div>
        </div>
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/45">Standar acuan</div>
          <ul className="mt-3 space-y-2.5">
            {PILAR.map((p) => (
              <li key={p.key}><Link to={`/tentang?bagian=${p.key}`} className="text-[13px] text-white/80 hover:text-white">{p.standar}<span className="block text-[12px] text-white/45">{p.nama}</span></Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/45">Tautan</div>
          <ul className="mt-3 grid gap-2 text-[13px]">
            {[["Kebijakan SMI", "/kebijakan"], ["Sasaran Mutu", "/sasaran"], ["Pusat Dokumen", "/dokumen"], ["Monitoring Capaian", "/monitoring"], ["Audit & Tindak Lanjut", "/audit"]].map(([l, p]) => (
              <li key={p}><Link to={p} className="text-white/80 hover:text-white">{l}</Link></li>
            ))}
            {!profile && <li><button onClick={openLogin} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white"><Lock className="size-3.5" /> Login petugas</button></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-2 px-4 py-4 text-[11.5px] text-white/45 sm:px-6">
          <span>© {new Date().getFullYear()} {PORTAL.instansi}</span>
          <span>Informasi yang tampil adalah informasi yang telah disetujui untuk publikasi.</span>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children, crumbs, bare }: { children: ReactNode; crumbs?: Crumb[]; bare?: boolean }) {
  const { profile, openLogin } = useAuth();
  const { segments } = useRouter();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const active = activeNav(segments);
  const isHome = segments.length === 0;
  const trail: Crumb[] = crumbs ?? (active && !isHome ? [{ label: active.label }] : []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <PreviewBanner />
      <header className="sticky top-0 z-30 shadow-[0_6px_24px_-18px_rgba(20,45,78,0.45)]">
        <div className="border-t-4 border-navy bg-white">
          <div className="mx-auto flex h-[74px] max-w-[1320px] items-center gap-4 px-4 sm:px-6">
            <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Beranda Portal SMI BPSDMP">
              <BrandMark variant="simbol" className="h-11 md:hidden" />
              <BrandMark className="hidden h-12 md:block" />
              <span aria-hidden className="hidden h-10 w-px bg-line md:block" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[10.5px] font-bold uppercase tracking-[0.1em] text-navy-500 md:hidden">Kementerian Perdagangan RI</span>
                <span className="hidden font-display text-[13px] font-extrabold uppercase leading-[1.25] tracking-[0.02em] text-navy lg:block">Badan Pengembangan Sumber Daya<br />Manusia Perdagangan</span>
                <span className="block truncate font-display text-[13.5px] font-extrabold uppercase text-navy lg:hidden">BPSDMP</span>
                <span className="block truncate text-[11.5px] font-semibold text-teal">Portal Sistem Manajemen Terintegrasi</span>
              </span>
            </Link>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <button onClick={() => setSearch(true)} className="flex h-9 items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 text-[13px] text-navy-500 transition hover:border-navy-300 hover:text-navy" aria-label="Cari informasi dan dokumen">
                <Search className="size-[17px]" />
                <span className="hidden lg:inline">Cari informasi & dokumen</span>
                <kbd className="ml-1 hidden rounded border border-line bg-white px-1.5 text-[10.5px] text-navy-300 xl:inline">Ctrl K</kbd>
              </button>
              {profile ? (
                <StaffMenu />
              ) : (
                <button onClick={openLogin} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-navy/20 px-2.5 text-[12.5px] font-semibold text-navy transition hover:border-navy hover:bg-navy hover:text-white">
                  <UserRound className="size-3.5" /> Login
                </button>
              )}
              <button onClick={() => setMobile(true)} className="rounded-lg p-2 text-navy hover:bg-canvas xl:hidden" aria-label="Buka menu"><Menu className="size-5" /></button>
            </div>
          </div>
        </div>
        <div className="hidden border-b-2 border-gold bg-navy xl:block"><DesktopNav /></div>
      </header>

      {profile && (segments[0] === "kelola" || segments.join("/") === "monitoring/tindak-lanjut") && (
        <div className="border-b border-accent/10 bg-accent-soft/60">
          <div className="mx-auto flex max-w-[1320px] items-center gap-2 px-4 py-2 text-[12.5px] text-navy-500 sm:px-6">
            <Briefcase className="size-3.5 text-accent" /> Area pengelolaan · {ROLE_LABEL[profile.peran]}
          </div>
        </div>
      )}

      {trail.length > 0 && (
        <div className="mx-auto max-w-[1320px] px-4 pt-5 sm:px-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px]" aria-label="Breadcrumb">
            <li><Link to="/" className="text-navy-400 hover:text-accent">Beranda</Link></li>
            {trail.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 text-navy-300" />
                {c.to ? <Link to={c.to} className="text-navy-400 hover:text-accent">{c.label}</Link> : <span className="font-medium text-navy">{c.label}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}

      <main className={cn(!bare && "mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8")}>{children}</main>
      <Footer flush={bare} />
      {mobile && <MobileDrawer onClose={() => setMobile(false)} />}
      <LoginDialog />
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </div>
  );
}

/** Tautan teks dengan panah, dipakai di banyak bagian. */
export function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
      {children} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
