import { useEffect, useMemo, useRef, useState } from "react";
import { FilePlus2, Loader2, Lock, Save, Send, Upload, Calculator, AlertTriangle, PenLine } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldHint } from "@/components/ui/form";
import { CapaianBadge, LaporanBadge } from "@/components/common/status";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { BuktiList } from "@/components/common/BuktiList";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";
import { DataTable, type Column } from "@/components/common/DataTable";
import { useToast } from "@/components/ui/toast";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter } from "@/lib/router";
import { BULAN, BULAN_PENDEK, fmtNum, fmtValue, todayISO } from "@/lib/format";
import { rasioCapaian, statusDariNilai } from "@/domain/indicators";
import { toNum } from "@/services/normalize";
import type { Realisasi, Sasaran } from "@/types/domain";

const EDITABLE: Realisasi["status"][] = ["draft", "perlu_perbaikan"];
const MAX_FILE = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.docx,.doc";

interface FormState {
  sasaranId: string;
  tahun: number;
  bulan: number;
  pembilang: string;
  penyebut: string;
  nilaiIndeks: string;
  kendala: string;
  analisis: string;
  tindakLanjut: string;
  batasWaktu: string;
}

function emptyForm(tahun: number, bulan: number): FormState {
  return { sasaranId: "", tahun, bulan, pembilang: "", penyebut: "", nilaiIndeks: "", kendala: "", analisis: "", tindakLanjut: "", batasWaktu: "" };
}

/** Perkiraan nilai di browser untuk panduan pengisian. Nilai resmi dihitung oleh basis data. */
function estimate(s: Sasaran | undefined, f: FormState): number | null {
  if (!s) return null;
  if (s.jenis === "indeks") return toNum(f.nilaiIndeks);
  const p = toNum(f.pembilang), q = toNum(f.penyebut);
  if (p === null || q === null || q <= 0) return null;
  return s.jenis === "persentase" || s.satuan.includes("%") ? (p / q) * 100 : p / q;
}

export function InputPage() {
  const { data, loading, error, reload, filters } = useData();
  const { profile, source, mode } = useAuth();
  const { segments, navigate } = useRouter();
  const toast = useToast();
  const editId = segments[2];
  const unitId = profile?.unitId ?? "";
  const unit = data?.units.find((u) => u.id === unitId);

  const [form, setForm] = useState<FormState>(() => emptyForm(filters.tahun, filters.bulan));
  const [reportId, setReportId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [touched, setTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const contributions = useMemo(() => {
    if (!data) return [];
    const ids = new Set(data.kontribusi.filter((k) => k.unitId === unitId).map((k) => k.sasaranId));
    return data.sasaran.filter((s) => ids.has(s.id)).sort((a, b) => a.nomor - b.nomor);
  }, [data, unitId]);

  const myReports = useMemo(
    () => (data ? data.realisasi.filter((r) => r.unitId === unitId).sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan) : []),
    [data, unitId],
  );
  const existing = editId && editId !== "baru" ? myReports.find((r) => r.id === editId) : undefined;
  const locked = !!existing && !EDITABLE.includes(existing.status);

  useEffect(() => {
    if (existing) {
      setReportId(existing.id);
      setForm({
        sasaranId: existing.sasaranId, tahun: existing.tahun, bulan: existing.bulan,
        pembilang: existing.pembilang?.toString() ?? "", penyebut: existing.penyebut?.toString() ?? "",
        nilaiIndeks: existing.nilaiIndeks?.toString() ?? "",
        kendala: existing.kendala, analisis: existing.analisis, tindakLanjut: existing.tindakLanjut, batasWaktu: existing.batasWaktu ?? "",
      });
    } else if (editId === "baru") {
      setReportId(undefined);
      setForm(emptyForm(filters.tahun, filters.bulan));
    }
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, existing?.id]);

  const sasaran = contributions.find((s) => s.id === form.sasaranId);
  const est = estimate(sasaran, form);
  const estStatus = sasaran ? statusDariNilai(est, sasaran) : "nodata";
  const below = estStatus === "mendekati" || estStatus === "dibawah";
  const duplicate = !reportId && form.sasaranId
    ? myReports.find((r) => r.sasaranId === form.sasaranId && r.tahun === form.tahun && r.bulan === form.bulan)
    : undefined;
  const bukti = reportId && data ? data.bukti.filter((b) => b.realisasiId === reportId) : [];

  const errors: Record<string, string> = {};
  if (!form.sasaranId) errors.sasaranId = "Pilih sasaran mutu.";
  if (sasaran?.jenis === "indeks") {
    const v = toNum(form.nilaiIndeks);
    if (v === null) errors.nilaiIndeks = "Isi nilai indeks.";
    else if (/indeks|skala/i.test(sasaran.satuan + sasaran.targetLabel) && (v < 0 || v > 4)) errors.nilaiIndeks = "Nilai indeks berada pada skala 0–4.";
  } else if (sasaran) {
    const p = toNum(form.pembilang), q = toNum(form.penyebut);
    if (p === null) errors.pembilang = "Isi pembilang.";
    if (q === null) errors.penyebut = "Isi penyebut.";
    else if (q <= 0) errors.penyebut = "Penyebut harus lebih dari 0.";
    if (p !== null && p < 0) errors.pembilang = "Pembilang tidak boleh negatif.";
  }
  if (below && !form.tindakLanjut.trim()) errors.tindakLanjut = "Realisasi di bawah target. Isi rencana tindak lanjut.";
  if (form.tindakLanjut.trim() && !form.batasWaktu) errors.batasWaktu = "Tentukan batas waktu tindak lanjut.";
  if (duplicate) errors.sasaranId = "Laporan untuk sasaran dan periode ini sudah ada.";
  const valid = Object.keys(errors).length === 0;

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const save = async (silent = false): Promise<string | null> => {
    setTouched(true);
    if (!valid) {
      toast({ tone: "error", title: "Periksa kembali isian", message: Object.values(errors)[0] });
      return null;
    }
    setSaving(true);
    try {
      const id = await source.saveDraft({
        id: reportId, sasaranId: form.sasaranId, unitId, tahun: form.tahun, bulan: form.bulan,
        pembilang: sasaran?.jenis === "indeks" ? null : toNum(form.pembilang),
        penyebut: sasaran?.jenis === "indeks" ? null : toNum(form.penyebut),
        nilaiIndeks: sasaran?.jenis === "indeks" ? toNum(form.nilaiIndeks) : null,
        realisasiManual: null,
        kendala: form.kendala.trim(), analisis: form.analisis.trim(), tindakLanjut: form.tindakLanjut.trim(),
        batasWaktu: form.batasWaktu || null,
      });
      setReportId(id);
      await reload();
      if (!silent) toast({ tone: "success", title: "Draft tersimpan", message: "Anda dapat melampirkan bukti dukung lalu mengajukan verifikasi." });
      if (editId !== id) navigate(`/kelola/input/${id}`);
      return id;
    } catch (e: any) {
      toast({ tone: "error", title: "Draft belum tersimpan", message: e?.message });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    const id = await save(true);
    if (!id) return;
    try {
      await source.submit(id);
      toast({ tone: "success", title: "Laporan diajukan", message: "Laporan dikirim ke verifikator dan tidak dapat diubah sampai ada keputusan." });
      setConfirmSubmit(false);
      await reload();
    } catch (e: any) {
      toast({ tone: "error", title: "Pengajuan gagal", message: e?.message });
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length || !reportId) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE) throw new Error(`${file.name} melebihi 10 MB.`);
        await source.uploadBukti({ realisasiId: reportId, unitId, tahun: form.tahun, bulan: form.bulan, file });
      }
      toast({ tone: "success", title: "Bukti dukung terunggah" });
      await reload();
    } catch (e: any) {
      toast({ tone: "error", title: "Unggah gagal", message: e?.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (loading && !data) return <AppShell><PageSkeleton /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} onRetry={reload} /></AppShell>;
  if (!profile?.unitId) {
    return <AppShell><Card><EmptyState title="Unit kerja belum ditetapkan" description="Profil Anda belum terhubung ke unit kerja. Hubungi administrator agar kolom unit pada profil pengguna diisi." /></Card></AppShell>;
  }

  const listColumns: Column<Realisasi>[] = [
    { key: "periode", header: "Periode", sortValue: (r) => r.tahun * 100 + r.bulan, cell: (r) => <span className="whitespace-nowrap">{BULAN_PENDEK[r.bulan - 1]} {r.tahun}</span> },
    { key: "sasaran", header: "Sasaran", sortValue: (r) => data?.sasaran.find((s) => s.id === r.sasaranId)?.nomor ?? 0, cell: (r) => { const s = data?.sasaran.find((x) => x.id === r.sasaranId); return <span className="font-medium">{s?.nomor}. {s?.nama}</span>; } },
    { key: "nilai", header: "Realisasi", cell: (r) => { const s = data?.sasaran.find((x) => x.id === r.sasaranId); return <span className="tabular-nums">{s ? fmtValue(r.realisasiDb ?? r.nilaiIndeks, s.satuan) : "—"}</span>; } },
    { key: "status", header: "Status", sortValue: (r) => r.status, cell: (r) => <LaporanBadge status={r.status} raw={r.statusRaw} /> },
    {
      key: "aksi", header: "",
      cell: (r) => EDITABLE.includes(r.status)
        ? <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent"><PenLine className="size-3.5" /> Perbaiki</span>
        : <span className="inline-flex items-center gap-1 text-[13px] text-navy-400"><Lock className="size-3.5" /> Lihat</span>,
    },
  ];

  const showForm = !!editId;
  const err = (k: string) => (touched && errors[k] ? errors[k] : undefined);

  return (
    <AppShell crumbs={showForm ? [{ label: "Pengelolaan" }, { label: "Input Realisasi", to: "/kelola/input" }, { label: reportId ? "Ubah laporan" : "Laporan baru" }] : [{ label: "Pengelolaan" }, { label: "Input Realisasi" }]}>
      <PageHeader
        eyebrow="Alur kerja PIC"
        title={showForm ? (reportId ? "Perbarui laporan realisasi" : "Laporan realisasi baru") : "Input Realisasi"}
        description={`Unit kerja: ${unit?.nama ?? "—"}. Hanya sasaran yang menjadi kontribusi unit ini yang dapat dilaporkan.`}
        actions={!showForm && <Button onClick={() => navigate("/kelola/input/baru")}><FilePlus2 /> Laporan baru</Button>}
      />

      {mode === "preview" && (
        <div className="mb-5 rounded-2xl border border-warn/20 bg-warn-soft px-4 py-3 text-[13px] text-warn">
          Pada pratinjau desain, formulir dapat dicoba tetapi penyimpanan, pengajuan, dan unggah berkas tidak dijalankan.
        </div>
      )}

      {!showForm ? (
        <Card className="overflow-hidden">
          <CardHeader title="Laporan unit saya" description="Laporan berstatus Draft atau Perlu perbaikan dapat diperbaiki. Laporan lain hanya dapat dilihat." />
          <div className="mt-4">
            <DataTable
              rows={myReports}
              columns={listColumns}
              rowKey={(r) => r.id}
              searchText={(r) => `${data?.sasaran.find((s) => s.id === r.sasaranId)?.nama} ${BULAN[r.bulan - 1]} ${r.tahun} ${r.statusRaw}`}
              onRowClick={(r) => navigate(`/kelola/input/${r.id}`)}
              initialSort={{ key: "periode", dir: "desc" }}
              empty={<EmptyState title="Belum ada laporan" description="Mulai dengan membuat laporan realisasi untuk periode berjalan." action={<Button onClick={() => navigate("/kelola/input/baru")}><FilePlus2 /> Laporan baru</Button>} />}
            />
          </div>
        </Card>
      ) : editId !== "baru" && !existing ? (
        <Card><EmptyState title="Laporan tidak ditemukan" description="Laporan ini bukan milik unit Anda atau sudah tidak tersedia." action={<Button variant="outline" onClick={() => navigate("/kelola/input")}>Kembali ke daftar</Button>} /></Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="space-y-5 xl:col-span-2">
            {locked && existing && (
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-[13px] text-navy-500">
                <Lock className="size-4 text-navy-400" />
                Laporan berstatus <LaporanBadge status={existing.status} raw={existing.statusRaw} /> dan tidak dapat diubah.
              </div>
            )}
            {existing?.status === "perlu_perbaikan" && existing.catatanVerifikator && (
              <div className="rounded-2xl border border-warn/25 bg-warn-soft px-4 py-3 text-[13px] leading-5 text-navy">
                <div className="mb-1 font-semibold text-warn">Catatan verifikator</div>
                {existing.catatanVerifikator}
              </div>
            )}
            <Card>
              <CardHeader title="Sasaran dan periode" />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="f-unit">Unit kerja</Label>
                  <Input id="f-unit" value={unit?.nama ?? ""} disabled />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="f-sasaran">Sasaran mutu</Label>
                  <Select id="f-sasaran" value={form.sasaranId} disabled={locked || !!reportId} onChange={(e) => set({ sasaranId: e.target.value, pembilang: "", penyebut: "", nilaiIndeks: "" })}>
                    <option value="">Pilih sasaran…</option>
                    {contributions.map((s) => <option key={s.id} value={s.id}>{s.nomor}. {s.nama}</option>)}
                  </Select>
                  {err("sasaranId") ? <FieldHint tone="error">{err("sasaranId")}</FieldHint> : duplicate ? null : <FieldHint>{contributions.length} sasaran berlaku untuk unit ini.</FieldHint>}
                  {duplicate && (
                    <button className="mt-1.5 text-xs font-medium text-accent hover:underline" onClick={() => navigate(`/kelola/input/${duplicate.id}`)}>Buka laporan yang sudah ada</button>
                  )}
                </div>
                <div>
                  <Label htmlFor="f-tahun">Tahun</Label>
                  <Input id="f-tahun" type="number" min={2020} max={2100} value={form.tahun} disabled={locked || !!reportId} onChange={(e) => set({ tahun: Number(e.target.value) })} />
                </div>
                <div>
                  <Label htmlFor="f-bulan">Bulan</Label>
                  <Select id="f-bulan" value={form.bulan} disabled={locked || !!reportId} onChange={(e) => set({ bulan: Number(e.target.value) })}>
                    {BULAN.map((b, i) => <option key={b} value={i + 1}>{b}</option>)}
                  </Select>
                </div>
              </CardBody>
            </Card>

            {sasaran && (
              <Card>
                <CardHeader title="Data capaian" description={sasaran.rumus ? `Rumus: ${sasaran.rumus}` : undefined} />
                <CardBody className="grid gap-4 sm:grid-cols-2">
                  {sasaran.jenis === "indeks" ? (
                    <div className="sm:col-span-2">
                      <Label htmlFor="f-indeks">Nilai indeks</Label>
                      <Input id="f-indeks" inputMode="decimal" placeholder="Contoh: 3,42" value={form.nilaiIndeks} disabled={locked} onChange={(e) => set({ nilaiIndeks: e.target.value })} />
                      {err("nilaiIndeks") ? <FieldHint tone="error">{err("nilaiIndeks")}</FieldHint> : <FieldHint>Indikator indeks. Nilai disimpan apa adanya, tidak dikonversi ke persen.</FieldHint>}
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="f-pembilang">Pembilang</Label>
                        <Input id="f-pembilang" inputMode="decimal" value={form.pembilang} disabled={locked} onChange={(e) => set({ pembilang: e.target.value })} />
                        {err("pembilang") && <FieldHint tone="error">{err("pembilang")}</FieldHint>}
                      </div>
                      <div>
                        <Label htmlFor="f-penyebut">Penyebut</Label>
                        <Input id="f-penyebut" inputMode="decimal" value={form.penyebut} disabled={locked} onChange={(e) => set({ penyebut: e.target.value })} />
                        {err("penyebut") && <FieldHint tone="error">{err("penyebut")}</FieldHint>}
                      </div>
                    </>
                  )}
                  <div className="flex flex-wrap items-center gap-4 rounded-xl bg-canvas px-4 py-3 sm:col-span-2">
                    <Calculator className="size-5 text-navy-400" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-navy-400">Perkiraan realisasi · target {sasaran.targetLabel || fmtValue(sasaran.target, sasaran.satuan)}</div>
                      <div className="text-lg font-semibold tabular-nums text-navy">
                        {fmtValue(est, sasaran.satuan)}
                        {est !== null && <span className="ml-2 text-xs font-normal text-navy-400">{fmtNum(rasioCapaian(est, sasaran), 0)}% dari target</span>}
                      </div>
                    </div>
                    {est !== null && <CapaianBadge status={estStatus} />}
                    <p className="w-full text-[11.5px] text-navy-400">Nilai resmi dihitung oleh basis data saat disimpan.</p>
                  </div>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardHeader title="Kendala dan tindak lanjut" description={below ? "Realisasi diperkirakan di bawah target. Tindak lanjut dan batas waktu wajib diisi." : "Isi bila terdapat kendala pada periode ini."} />
              <CardBody className="grid gap-4">
                <div>
                  <Label htmlFor="f-kendala">Kendala</Label>
                  <Textarea id="f-kendala" value={form.kendala} disabled={locked} onChange={(e) => set({ kendala: e.target.value })} placeholder="Permasalahan yang dihadapi" />
                </div>
                <div>
                  <Label htmlFor="f-analisis">Analisis penyebab</Label>
                  <Textarea id="f-analisis" value={form.analisis} disabled={locked} onChange={(e) => set({ analisis: e.target.value })} placeholder="Akar penyebab permasalahan" />
                </div>
                <div>
                  <Label htmlFor="f-tl">Tindak lanjut</Label>
                  <Textarea id="f-tl" value={form.tindakLanjut} disabled={locked} onChange={(e) => set({ tindakLanjut: e.target.value })} placeholder="Langkah perbaikan yang akan dilakukan" />
                  {err("tindakLanjut") && <FieldHint tone="error">{err("tindakLanjut")}</FieldHint>}
                </div>
                <div className="sm:max-w-xs">
                  <Label htmlFor="f-batas">Batas waktu tindak lanjut</Label>
                  <Input id="f-batas" type="date" min={todayISO()} value={form.batasWaktu} disabled={locked} onChange={(e) => set({ batasWaktu: e.target.value })} />
                  {err("batasWaktu") && <FieldHint tone="error">{err("batasWaktu")}</FieldHint>}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="xl:sticky xl:top-24">
              <CardHeader title="Bukti dukung" description="Disimpan di penyimpanan privat. PDF, gambar, Excel, atau Word, maksimal 10 MB per berkas." />
              <CardBody className="space-y-4">
                <BuktiList items={bukti} compact />
                {!locked && (
                  <>
                    <input ref={fileRef} id="f-bukti" type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => upload(e.target.files)} />
                    <Button variant="outline" className="w-full" disabled={!reportId || uploading} onClick={() => fileRef.current?.click()}>
                      {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Unggah bukti dukung
                    </Button>
                    {!reportId && <FieldHint>Simpan draft terlebih dahulu untuk melampirkan bukti.</FieldHint>}
                  </>
                )}
              </CardBody>
              {!locked && (
                <div className="space-y-2 border-t border-line px-5 py-4 sm:px-6">
                  <Button variant="outline" className="w-full" disabled={saving} onClick={() => save()}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save />} Simpan draft
                  </Button>
                  <Button className="w-full" disabled={saving} onClick={() => { setTouched(true); if (valid) setConfirmSubmit(true); else toast({ tone: "error", title: "Periksa kembali isian", message: Object.values(errors)[0] }); }}>
                    <Send /> Ajukan verifikasi
                  </Button>
                  {bukti.length === 0 && reportId && (
                    <p className="flex gap-1.5 pt-1 text-xs leading-4 text-warn"><AlertTriangle className="size-3.5 shrink-0" /> Belum ada bukti dukung terlampir.</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        title="Ajukan laporan untuk verifikasi?"
        description="Setelah diajukan, laporan terkunci sampai verifikator memberi keputusan."
        confirmLabel="Ajukan sekarang"
        onConfirm={submit}
      >
        {sasaran && (
          <dl className="space-y-2 text-[13.5px]">
            <div className="flex justify-between gap-4"><dt className="text-navy-400">Sasaran</dt><dd className="text-right font-medium text-navy">{sasaran.nomor}. {sasaran.nama}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-navy-400">Periode</dt><dd className="text-navy">{BULAN[form.bulan - 1]} {form.tahun}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-navy-400">Perkiraan realisasi</dt><dd className="font-semibold text-navy">{fmtValue(est, sasaran.satuan)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-navy-400">Bukti dukung</dt><dd className="text-navy">{bukti.length} berkas</dd></div>
          </dl>
        )}
      </ConfirmDialog>
    </AppShell>
  );
}
