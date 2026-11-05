import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import { usePortal } from "@/hooks/usePortal";
import { NAV } from "./nav";
import { PILAR, KOMITMEN_KEBIJAKAN } from "@/content/portal";
import { DOKUMEN_RESMI, KEBIJAKAN } from "@/content/resmi/dokumen";
import { ISU_EKSTERNAL, ISU_INTERNAL, PEMANGKU, REGULASI } from "@/content/resmi/konteks";
import { PROSES_RESMI, UNIT_RESMI } from "@/content/resmi/organisasi";
import { MATRIKS_BK, PELUANG, RISIKO_STRATEGIS } from "@/content/resmi/risiko";
import { KEGIATAN_RESMI } from "@/content/resmi/kegiatan";
import { MATRIKS_RISIKO_2026, isRisikoSensitif } from "@/content/resmi/matriksRisiko";
import { KELOMPOK_SOP } from "@/content/resmi/sop";

export interface SearchItem { title: string; subtitle: string; path: string; group: string; text: string }

/** Indeks pencarian dari halaman, sasaran, unit, dokumen, SOP, dan kegiatan yang dapat dilihat pengguna. */
export function useSearchIndex(): SearchItem[] {
  const { data } = useData();
  const { content } = usePortal();
  return useMemo(() => {
    const items: SearchItem[] = [];
    for (const n of NAV) {
      items.push({ title: n.label, subtitle: "Halaman", path: n.path, group: "Halaman", text: n.label });
      n.children?.forEach((c) => items.push({ title: c.label, subtitle: c.desc ?? n.label, path: c.path, group: "Halaman", text: `${c.label} ${c.desc ?? ""}` }));
    }
    PILAR.forEach((p) => items.push({ title: `${p.nama} — ${p.standar}`, subtitle: p.fokus, path: `/tentang?bagian=${p.key}`, group: "Standar", text: `${p.nama} ${p.standar} ${p.fokus} ${p.ringkas}` }));
    KOMITMEN_KEBIJAKAN.forEach((k, i) => items.push({ title: `Komitmen ${i + 1}: ${k.judul}`, subtitle: "Kebijakan SMI", path: "/kebijakan", group: "Kebijakan", text: `${k.judul} ${KEBIJAKAN.komitmen[i]}` }));
    DOKUMEN_RESMI.forEach((d) => items.push({ title: d.judul, subtitle: `${d.kode} · Rev. ${d.revisi}`, path: `/dokumen?q=${encodeURIComponent(d.kode)}`, group: "Dokumen", text: `${d.kode} ${d.judul} ${d.kategori}` }));
    [...ISU_INTERNAL, ...ISU_EKSTERNAL].forEach((r) => items.push({ title: `${r[0]} · ${r[1]}`, subtitle: r[0].startsWith("I") ? "Isu internal" : "Isu eksternal", path: "/konteks", group: "Konteks", text: `${r[1]} ${r[2]}` }));
    PEMANGKU.forEach((p) => items.push({ title: p.nama, subtitle: `Pemangku kepentingan · Prioritas ${p.prioritas}`, path: "/konteks?tab=pihak", group: "Konteks", text: `${p.nama} ${p.kebutuhan}` }));
    REGULASI.forEach((r) => items.push({ title: r[1], subtitle: "Persyaratan peraturan", path: "/konteks?tab=kepatuhan", group: "Kepatuhan", text: `${r[1]} ${r[3]}` }));
    PROSES_RESMI.forEach((p) => items.push({ title: `${p.kode} · ${p.nama}`, subtitle: "Peta proses SMI", path: "/organisasi/proses", group: "Proses", text: `${p.nama} ${p.tujuan} ${p.pemilik}` }));
    RISIKO_STRATEGIS.forEach((r) => items.push({ title: `${r.kode} · ${r.area}`, subtitle: "Register risiko", path: "/risiko/register", group: "Risiko", text: `${r.area} ${r.uraian}` }));
    MATRIKS_RISIKO_2026.filter((r) => !isRisikoSensitif(r)).forEach((r) => items.push({ title: `${r.id} · ${r.proses}`, subtitle: `Matriks Risiko 2026 · ${r.level}`, path: "/risiko", group: "Risiko", text: `${r.proses} ${r.level}` }));
    KELOMPOK_SOP.forEach((g) => g.folder.forEach((f) => items.push({ title: `SOP ${f.huruf} · ${f.nama}`, subtitle: g.judul, path: "/dokumen/sop", group: "SOP", text: `${f.nama} ${g.judul} SOP` })));
    PELUANG.forEach((o) => items.push({ title: `${o[0]} · ${o[1]}`, subtitle: "Peluang peningkatan", path: "/risiko/register", group: "Risiko", text: `${o[1]} ${o[2]}` }));
    MATRIKS_BK.forEach((r) => items.push({ title: `${r[0]} · ${r[1]}`, subtitle: "Benturan kepentingan", path: "/risiko/fkap", group: "Integritas", text: `${r[1]} ${r[3]}` }));
    data?.sasaran.forEach((s) => items.push({ title: `Sasaran ${s.nomor}: ${s.nama}`, subtitle: `Target ${s.targetLabel || s.target}`, path: `/sasaran/${s.id}`, group: "Sasaran mutu", text: `${s.nomor} ${s.nama} ${s.rumus}` }));
    data?.units.forEach((u) => {
      const r = UNIT_RESMI.find((x) => x.cocok.test(u.nama));
      items.push({ title: u.nama, subtitle: "Profil unit kerja", path: `/unit/${u.id}`, group: "Unit kerja", text: `${u.nama} ${u.singkatan} ${r ? `${r.singkatan} ${r.lokasi} ${r.mandat}` : ""}` });
    });
    if (content.dokumen.status === "ok") {
      content.dokumen.rows.forEach((d) => items.push({
        title: d.nama, subtitle: [d.kode, d.kategori].filter(Boolean).join(" · "),
        path: /sop/i.test(d.kategori) ? `/dokumen/sop?q=${encodeURIComponent(d.kode || d.nama)}` : `/dokumen?q=${encodeURIComponent(d.kode || d.nama)}`,
        group: /sop/i.test(d.kategori) ? "SOP" : "Dokumen", text: `${d.kode} ${d.nama} ${d.kategori} ${d.unitPemilik} ${d.proses}`,
      }));
    }
    const keg = [...(content.kegiatan.status === "ok" ? content.kegiatan.rows : []), ...KEGIATAN_RESMI];
    keg.forEach((k) => items.push({ title: k.judul, subtitle: k.kategori, path: "/kegiatan", group: "Kegiatan", text: `${k.judul} ${k.kategori} ${k.ringkasan}` }));
    return items;
  }, [data, content.dokumen, content.kegiatan]);
}

export function searchItems(items: SearchItem[], q: string, limit = 40) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return items
    .map((it) => {
      const hay = `${it.title} ${it.text}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return null;
      const score = (it.title.toLowerCase().includes(terms[0]) ? 2 : 0) + (it.group === "Halaman" ? 1 : 0);
      return { it, score };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, limit)
    .map((x) => x!.it);
}
