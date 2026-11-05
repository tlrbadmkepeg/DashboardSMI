import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/portal/ContentState";
import { searchItems, useSearchIndex } from "@/components/layout/searchIndex";
import { useRouter, Link } from "@/lib/router";

export function CariPage() {
  const { query, navigate } = useRouter();
  const q0 = query.get("q") ?? "";
  const [q, setQ] = useState(q0);
  const index = useSearchIndex();
  const results = searchItems(index, q0, 200);
  const groups = Array.from(new Set(results.map((r) => r.group)));

  return (
    <AppShell crumbs={[{ label: "Pencarian" }]}>
      <SectionHeading eyebrow="Pencarian" title={q0 ? `Hasil untuk "${q0}"` : "Cari informasi dan dokumen"} description={q0 ? `${results.length} hasil ditemukan.` : undefined} />
      <form onSubmit={(e) => { e.preventDefault(); navigate(`/cari?q=${encodeURIComponent(q.trim())}`); }} className="relative mb-8 max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-navy-300" />
        <input id="cari-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kebijakan, sasaran, unit, dokumen, SOP…" className="h-12 w-full rounded-2xl border border-line bg-white pl-12 pr-4 text-[15px] text-navy focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10" />
      </form>
      {q0 && results.length === 0 && <p className="text-[14px] text-navy-500">Tidak ada hasil. Coba kata kunci lain atau telusuri melalui menu.</p>}
      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-navy-400">{g}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {results.filter((r) => r.group === g).map((r, i) => (
                <li key={i}><Link to={r.path} className="block px-5 py-3.5 hover:bg-canvas"><span className="block text-[14px] font-medium text-navy">{r.title}</span><span className="block text-[12.5px] text-navy-400">{r.subtitle}</span></Link></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
