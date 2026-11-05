import { getSupabase } from "@/lib/supabase";
import { COLUMNS, STORAGE_BUCKET, TABLES } from "@/config/schema";
import { resolveKey } from "./normalize";

export interface FieldCheck {
  field: string;
  candidates: string[];
  matched: string | null;
}

export interface TableCheck {
  table: string;
  ok: boolean;
  rows: "ada" | "kosong" | "tidak-terbaca";
  message: string;
  fields: FieldCheck[];
  extraColumns: string[];
}

const TABLE_FIELDS: Record<string, keyof typeof COLUMNS> = {
  [TABLES.unit]: "unit",
  [TABLES.sasaran]: "sasaran",
  [TABLES.kontribusi]: "kontribusi",
  [TABLES.realisasi]: "realisasi",
  [TABLES.bukti]: "bukti",
  [TABLES.profil]: "profil",
};

/**
 * Pemeriksaan skema hanya-baca: membaca satu baris per tabel (sesuai RLS pengguna saat ini)
 * lalu mencocokkan nama kolom dengan pemetaan di config/schema.ts. Tidak ada penulisan.
 */
export async function checkSchema(): Promise<TableCheck[]> {
  const sb = getSupabase();
  const out: TableCheck[] = [];
  for (const [table, key] of Object.entries(TABLE_FIELDS)) {
    const { data, error } = await sb.from(table).select("*").limit(1);
    const cols = COLUMNS[key] as Record<string, string[]>;
    if (error) {
      out.push({ table, ok: false, rows: "tidak-terbaca", message: error.message, fields: [], extraColumns: [] });
      continue;
    }
    const row = data?.[0];
    if (!row) {
      out.push({
        table, ok: true, rows: "kosong",
        message: "Tabel terbaca tetapi tidak ada baris yang dapat dilihat akun ini, sehingga nama kolom belum dapat dicocokkan.",
        fields: Object.entries(cols).map(([field, candidates]) => ({ field, candidates, matched: null })),
        extraColumns: [],
      });
      continue;
    }
    const fields = Object.entries(cols).map(([field, candidates]) => ({ field, candidates, matched: resolveKey(row, candidates) }));
    const used = new Set(fields.map((f) => f.matched).filter(Boolean));
    out.push({
      table, ok: true, rows: "ada", message: "Terbaca",
      fields,
      extraColumns: Object.keys(row).filter((c) => !used.has(c)),
    });
  }
  const st = await sb.storage.from(STORAGE_BUCKET).list("", { limit: 1 });
  out.push({
    table: `storage: ${STORAGE_BUCKET}`,
    ok: !st.error,
    rows: st.error ? "tidak-terbaca" : (st.data?.length ? "ada" : "kosong"),
    message: st.error ? st.error.message : "Bucket dapat diakses sesuai kebijakan Storage.",
    fields: [],
    extraColumns: [],
  });
  return out;
}
