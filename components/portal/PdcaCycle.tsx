import { useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, PlayCircle, RefreshCw } from "lucide-react";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

/** Siklus PDCA SMI. Setiap butir menautkan ke halaman portal yang memuat informasinya. */
const TAHAP = [
  {
    id: "plan", kode: "P", nama: "PLAN", sub: "Perencanaan", warna: "#142D4E", soft: "#E8EEF7", icon: ClipboardList,
    item: [
      ["Konteks organisasi", "/konteks"], ["Pemangku kepentingan", "/konteks?tab=pihak"], ["Kebijakan SMI", "/kebijakan"],
      ["Sasaran mutu", "/sasaran"], ["Risiko dan peluang", "/risiko"],
    ],
  },
  {
    id: "do", kode: "D", nama: "DO", sub: "Pelaksanaan", warna: "#0F766E", soft: "#EBF7F5", icon: PlayCircle,
    item: [
      ["Proses bisnis", "/organisasi/proses"], ["Pelayanan", "/organisasi/proses"], ["Pengendalian operasional (SOP)", "/dokumen/sop"],
      ["Kompetensi dan komunikasi", "/organisasi/komunikasi"],
    ],
  },
  {
    id: "check", kode: "C", nama: "CHECK", sub: "Pemeriksaan", warna: "#2563EB", soft: "#EBF2FF", icon: CheckCircle2,
    item: [
      ["Monitoring sasaran", "/monitoring"], ["Evaluasi kinerja", "/monitoring/tren"], ["Audit internal", "/audit"],
      ["Tinjauan manajemen", "/kegiatan"],
    ],
  },
  {
    id: "act", kode: "A", nama: "ACT", sub: "Tindakan", warna: "#A97A20", soft: "#FBF4E4", icon: RefreshCw,
    item: [
      ["Tindakan korektif", "/audit/tindak-lanjut"], ["Tindak lanjut temuan", "/audit/tindak-lanjut"], ["Peningkatan berkelanjutan", "/monitoring"],
    ],
  },
] as const;

export function PdcaCycle() {
  const [aktif, setAktif] = useState<string>("plan");
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* Roda PDCA */}
      <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[340px]">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 rounded-full p-0">
          {[TAHAP[0], TAHAP[1], TAHAP[3], TAHAP[2]].map((t, i) => (
            <button
              key={t.id}
              onMouseEnter={() => setAktif(t.id)}
              onFocus={() => setAktif(t.id)}
              onClick={() => setAktif(t.id)}
              aria-pressed={aktif === t.id}
              className={cn(
                "group relative flex flex-col items-center justify-center text-white transition duration-300",
                ["rounded-tl-full", "rounded-tr-full", "rounded-bl-full", "rounded-br-full"][i],
                aktif === t.id ? "scale-[1.03] shadow-lift" : "opacity-90 hover:opacity-100",
              )}
              style={{ background: t.warna }}
            >
              <span className={cn("font-display text-[22px] font-extrabold leading-none sm:text-[30px]", i % 2 === 0 ? "-translate-x-1 sm:-translate-x-4" : "-translate-x-1 sm:translate-x-4", i < 2 ? "-translate-y-3" : "translate-y-3")}>{t.nama}</span>
              <span className={cn("mt-1 text-[9.5px] font-semibold uppercase tracking-[0.04em] text-white/80 sm:text-[11.5px]", i % 2 === 0 ? "-translate-x-1 sm:-translate-x-4" : "-translate-x-1 sm:translate-x-4", i < 2 ? "-translate-y-3" : "translate-y-3")}>{t.sub}</span>
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-[33%] grid place-items-center rounded-full bg-white text-center shadow-card ring-4 ring-white">
          <div>
            <RefreshCw className="mx-auto size-5 text-gold" />
            <div className="mt-1 font-display text-[13px] font-bold leading-4 text-navy">Siklus<br />SMI</div>
          </div>
        </div>
      </div>

      {/* Rincian tahap */}
      <div className="grid gap-3 sm:grid-cols-2">
        {TAHAP.map((t) => (
          <div
            key={t.id}
            onMouseEnter={() => setAktif(t.id)}
            className={cn("rounded-2xl border bg-white p-4 transition", aktif === t.id ? "border-transparent shadow-lift" : "border-line shadow-card")}
            style={aktif === t.id ? { boxShadow: `0 0 0 2px ${t.warna}, 0 18px 40px -24px rgba(20,45,78,.4)` } : undefined}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl text-white" style={{ background: t.warna }}><t.icon className="size-[18px]" /></span>
              <div>
                <div className="font-display text-[15px] font-bold text-navy">{t.nama} <span className="font-medium text-navy-400">· {t.sub}</span></div>
              </div>
            </div>
            <ul className="mt-3 space-y-1">
              {t.item.map(([l, to]) => (
                <li key={l}>
                  <Link to={to} className="group/i flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium text-navy-600 transition hover:bg-canvas hover:text-navy">
                    <span className="flex items-center gap-2"><span className="size-1.5 rounded-full" style={{ background: t.warna }} />{l}</span>
                    <ArrowRight className="size-3.5 text-navy-300 transition group-hover/i:translate-x-0.5 group-hover/i:text-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
