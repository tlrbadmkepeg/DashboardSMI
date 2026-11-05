/**
 * Konfigurasi lingkungan. Nilai dibaca dari variabel VITE_* saat build.
 * Hanya publishable/anon key yang boleh dipakai di frontend.
 */
const env = (import.meta as any).env ?? {};

export const SUPABASE_URL: string = env.VITE_SUPABASE_URL || "https://lfwchraqitqnxvtfnpho.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY: string = env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
/** Logo resmi Kementerian Perdagangan (aset yang diunggah pemilik portal); dapat diganti melalui VITE_LOGO_URL. */
export const LOGO_URL: string = env.VITE_LOGO_URL || "brand/logo-kemendag.png";
export const LOGO_SIMBOL_URL: string = env.VITE_LOGO_SIMBOL_URL || "brand/logo-kemendag-simbol.png";

/** Mode pratinjau desain: data ilustrasi, tanpa koneksi ke Supabase. Tidak boleh aktif di produksi. */
export const DESIGN_PREVIEW_ENABLED: boolean = String(env.VITE_ENABLE_DESIGN_PREVIEW) === "true";

export const isSupabaseConfigured = () => SUPABASE_PUBLISHABLE_KEY.length > 0;
