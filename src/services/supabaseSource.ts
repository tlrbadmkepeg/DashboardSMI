import { getSupabase } from "@/lib/supabase";
import {
  PUBLIC_SOURCES, COLUMNS, PROFIL_AUTH_KEYS, REALISASI_COMPUTED_BY_DB, RPC, SEND_DRAFT_STATUS_ON_INSERT,
  STATUS_VALUES, STORAGE_BUCKET, SIGNED_URL_TTL, TABLES, buildStoragePath,
} from "@/config/schema";
import type { AuthApi, DataSource } from "./dataSource";
import { LOGIN_ROLES } from "@/config/roles";
import {
  mapBukti, mapKontribusi, mapProfil, mapRealisasi, mapSasaran, mapUnit, resolveKey,
} from "./normalize";
import type { Dataset, DraftInput, Kontribusi, Profil } from "@/types/domain";

const PAGE = 1000;

/** Membaca seluruh baris (melewati batas 1.000 baris per permintaan). RLS tetap berlaku. */
async function fetchAll(table: string): Promise<Record<string, any>[]> {
  const sb = getSupabase();
  const out: Record<string, any>[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from(table).select("*").range(from, from + PAGE - 1);
    if (error) throw new Error(`Gagal membaca tabel ${table}: ${error.message}`);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

/** Kolom tulis = nama kolom yang benar-benar ada (dari sampel baris) atau kandidat pertama. */
let realisasiSample: Record<string, any> | undefined;
const col = (key: keyof typeof COLUMNS.realisasi) =>
  resolveKey(realisasiSample, COLUMNS.realisasi[key]) ?? COLUMNS.realisasi[key][0];
const buktiCol = (key: keyof typeof COLUMNS.bukti, sample?: Record<string, any>) =>
  resolveKey(sample, COLUMNS.bukti[key]) ?? COLUMNS.bukti[key][0];
let buktiSample: Record<string, any> | undefined;

function rpcError(name: string, message: string) {
  return new Error(`Fungsi ${name} menolak permintaan: ${message}`);
}

export const supabaseSource: DataSource = {
  kind: "supabase",

  async loadDataset(): Promise<Dataset> {
    const [u, s, k, r, b] = await Promise.all([
      fetchAll(TABLES.unit),
      fetchAll(TABLES.sasaran),
      fetchAll(TABLES.kontribusi),
      fetchAll(TABLES.realisasi),
      fetchAll(TABLES.bukti).catch(() => [] as Record<string, any>[]),
    ]);
    realisasiSample = r[0] ?? realisasiSample;
    buktiSample = b[0] ?? buktiSample;
    return {
      units: u.map(mapUnit),
      sasaran: s.map(mapSasaran).filter((x) => x.id),
      kontribusi: k.map(mapKontribusi).filter(Boolean) as Kontribusi[],
      realisasi: r.map(mapRealisasi),
      bukti: b.map(mapBukti),
      hasStatusTindakLanjut: !!resolveKey(r[0], COLUMNS.realisasi.statusTindakLanjut),
      loadedAt: new Date().toISOString(),
      scope: "internal",
      publikasiAktif: true,
    };
  },

  async loadPublicDataset(): Promise<Dataset> {
    const [u, s, k] = await Promise.all([
      fetchAll(PUBLIC_SOURCES.unit),
      fetchAll(PUBLIC_SOURCES.sasaran),
      fetchAll(PUBLIC_SOURCES.kontribusi),
    ]);
    let r: Record<string, any>[] = [];
    let publikasiAktif = true;
    let pesanPublikasi: string | undefined;
    try {
      r = await fetchAll(PUBLIC_SOURCES.realisasi);
    } catch (e: any) {
      publikasiAktif = false;
      pesanPublikasi = /does not exist|schema cache|PGRST/i.test(e?.message ?? "")
        ? "Publikasi capaian untuk pengunjung belum diaktifkan."
        : "Capaian yang dipublikasikan belum dapat dibaca.";
    }
    // Lapisan pengaman tambahan: hanya laporan terverifikasi, tanpa teks internal.
    const realisasi = r.map(mapRealisasi)
      .filter((x) => x.status === "terverifikasi" || x.status === "dokumen" || x.statusRaw === "")
      .map((x) => ({ ...x, status: "terverifikasi" as const, kendala: "", analisis: "", tindakLanjut: "", catatanVerifikator: "", batasWaktu: null }));
    return {
      units: u.map(mapUnit),
      sasaran: s.map(mapSasaran).filter((x) => x.id),
      kontribusi: k.map(mapKontribusi).filter(Boolean) as Kontribusi[],
      realisasi,
      bukti: [],
      hasStatusTindakLanjut: false,
      loadedAt: new Date().toISOString(),
      scope: "publik",
      publikasiAktif,
      pesanPublikasi,
    };
  },

  async saveDraft(input: DraftInput): Promise<string> {
    const sb = getSupabase();
    const payload: Record<string, any> = {
      [col("sasaranId")]: input.sasaranId,
      [col("unitId")]: input.unitId,
      [col("tahun")]: input.tahun,
      [col("bulan")]: input.bulan,
      [col("pembilang")]: input.pembilang,
      [col("penyebut")]: input.penyebut,
      [col("kendala")]: input.kendala || null,
      [col("analisis")]: input.analisis || null,
      [col("tindakLanjut")]: input.tindakLanjut || null,
      [col("batasWaktu")]: input.batasWaktu || null,
    };
    if (input.nilaiIndeks !== null) payload[col("nilaiIndeks")] = input.nilaiIndeks;
    if (!REALISASI_COMPUTED_BY_DB && input.realisasiManual !== null) payload[col("realisasi")] = input.realisasiManual;

    if (input.id) {
      const { error } = await sb.from(TABLES.realisasi).update(payload).eq(col("id"), input.id);
      if (error) throw new Error(`Draft tidak tersimpan: ${error.message}`);
      return input.id;
    }
    if (SEND_DRAFT_STATUS_ON_INSERT) payload[col("status")] = STATUS_VALUES.draft;
    const { data, error } = await sb.from(TABLES.realisasi).insert(payload).select().single();
    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new Error("Laporan untuk sasaran, unit, dan periode ini sudah ada. Buka laporan tersebut dari daftar untuk memperbaikinya.");
      }
      throw new Error(`Draft tidak tersimpan: ${error.message}`);
    }
    realisasiSample = data ?? realisasiSample;
    return String((data as any)?.[col("id")] ?? "");
  },

  async submit(realisasiId: string) {
    const { error } = await getSupabase().rpc(RPC.ajukan.name, RPC.ajukan.args(realisasiId));
    if (error) throw rpcError(RPC.ajukan.name, error.message);
  },

  async verify(realisasiId, keputusan, catatan) {
    const k = keputusan === "setuju" ? RPC.verifikasi.keputusanSetuju : RPC.verifikasi.keputusanKembalikan;
    const { error } = await getSupabase().rpc(RPC.verifikasi.name, RPC.verifikasi.args(realisasiId, k, catatan));
    if (error) throw rpcError(RPC.verifikasi.name, error.message);
  },

  async uploadBukti({ realisasiId, unitId, tahun, bulan, file, keterangan }) {
    const sb = getSupabase();
    const path = buildStoragePath({ unitId, tahun, bulan, realisasiId, fileName: file.name });
    const up = await sb.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (up.error) throw new Error(`Berkas tidak terunggah: ${up.error.message}`);
    const row: Record<string, any> = {
      [buktiCol("realisasiId", buktiSample)]: realisasiId,
      [buktiCol("namaFile", buktiSample)]: file.name,
      [buktiCol("path", buktiSample)]: path,
      [buktiCol("ukuran", buktiSample)]: file.size,
      [buktiCol("tipe", buktiSample)]: file.type || null,
    };
    if (keterangan) row[buktiCol("keterangan", buktiSample)] = keterangan;
    const { data, error } = await sb.from(TABLES.bukti).insert(row).select().single();
    if (error) {
      // Berkas sudah terunggah tetapi metadata gagal: beri tahu dengan jelas agar dapat ditindaklanjuti admin.
      throw new Error(`Berkas terunggah ke penyimpanan, tetapi data bukti dukung gagal dicatat: ${error.message}`);
    }
    buktiSample = data ?? buktiSample;
    return mapBukti(data as any);
  },

  async signedUrl(path: string) {
    const { data, error } = await getSupabase().storage.from(STORAGE_BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
    if (error || !data?.signedUrl) throw new Error(`Akses berkas ditolak: ${error?.message ?? "tautan tidak tersedia"}`);
    return data.signedUrl;
  },
};

async function loadProfileFor(uid: string): Promise<Profil | null> {
  const sb = getSupabase();
  let lastError: string | null = null;
  for (const key of PROFIL_AUTH_KEYS) {
    const { data, error } = await sb.from(TABLES.profil).select("*").eq(key, uid).maybeSingle();
    if (error) {
      lastError = error.message;
      continue;
    }
    if (data) return mapProfil(data);
  }
  if (lastError && !/column/i.test(lastError)) throw new Error(`Profil pengguna tidak dapat dibaca: ${lastError}`);
  return null;
}

export const supabaseAuth: AuthApi = {
  async signIn(email, password) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      if (/invalid login credentials/i.test(error.message)) throw new Error("Email atau kata sandi tidak sesuai.");
      if (/email not confirmed/i.test(error.message)) throw new Error("Email belum dikonfirmasi. Periksa kotak masuk Anda.");
      throw new Error(`Masuk gagal: ${error.message}`);
    }
    const profil = await loadProfileFor(data.user.id);
    if (!profil) {
      await sb.auth.signOut();
      throw new Error("Akun ini belum terdaftar di profil pengguna SMI. Hubungi administrator.");
    }
    if (!profil.aktif) {
      await sb.auth.signOut();
      throw new Error("Akun Anda tidak aktif. Hubungi administrator untuk mengaktifkan akses.");
    }
    if (!LOGIN_ROLES.includes(profil.peran)) {
      await sb.auth.signOut();
      throw new Error("Login hanya untuk PIC unit kerja, verifikator, dan administrator. Seluruh informasi portal dapat dibaca tanpa login.");
    }
    return profil;
  },

  async signOut() {
    await getSupabase().auth.signOut();
  },

  async currentProfile() {
    const { data } = await getSupabase().auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) return null;
    const p = await loadProfileFor(uid);
    if (!p || !p.aktif || !LOGIN_ROLES.includes(p.peran)) {
      await getSupabase().auth.signOut();
      return null;
    }
    return p;
  },

  onChange(cb) {
    const { data } = getSupabase().auth.onAuthStateChange((evt) => {
      if (evt === "SIGNED_OUT" || evt === "SIGNED_IN" || evt === "USER_UPDATED") cb();
    });
    return () => data.subscription.unsubscribe();
  },
};
