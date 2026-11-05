import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/config/env";

let client: SupabaseClient | null = null;

/**
 * Klien Supabase tunggal. Sesi disimpan oleh supabase-js (localStorage) dan diperbarui otomatis.
 * Tidak pernah memakai service role key.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Koneksi Supabase belum dikonfigurasi. Isi VITE_SUPABASE_PUBLISHABLE_KEY pada berkas .env.local.");
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  return client;
}
