import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn, FlaskConical, Settings2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { useAuth } from "@/auth/AuthProvider";
import { ROLE_LABEL, type Role } from "@/config/roles";

/** Akun uji pratinjau desain (tanpa Supabase). Peran ditentukan oleh akun, bukan dipilih pengguna. */
const AKUN_PRATINJAU: Record<string, Role> = {
  "pic@pratinjau.smi": "pic_unit",
  "verifikator@pratinjau.smi": "verifikator",
  "admin@pratinjau.smi": "admin",
};
import { useToast } from "@/components/ui/toast";

/** Login petugas (Supabase Auth). Pengunjung tidak perlu login untuk membaca portal. */
export function LoginDialog() {
  const { loginOpen, closeLogin, mode, signIn, signInPreview } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (!loginOpen) { setErr(null); setPassword(""); } }, [loginOpen]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setErr("Isi email dan kata sandi.");
    if (mode === "preview") {
      const role = AKUN_PRATINJAU[email.trim().toLowerCase()];
      if (!role) return setErr("Akun tidak dikenal pada pratinjau desain. Gunakan salah satu akun uji di bawah.");
      signInPreview(role);
      toast({ tone: "success", title: `Masuk sebagai ${ROLE_LABEL[role]} (pratinjau)` });
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await signIn(email.trim(), password);
      toast({ tone: "success", title: "Berhasil masuk", message: "Menu Pengelolaan kini tersedia di header." });
    } catch (e: any) {
      setErr(e?.message ?? "Masuk gagal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={loginOpen} onClose={closeLogin} title="Login petugas" description="Untuk PIC unit kerja, verifikator, dan administrator. Informasi portal dapat dibaca tanpa login.">
      {mode === "unconfigured" ? (
        <div className="flex gap-3 rounded-xl border border-warn/25 bg-warn-soft p-4 text-[13.5px] leading-6 text-navy">
          <Settings2 className="mt-1 size-4 shrink-0 text-warn" />
          <span>Koneksi Supabase belum dikonfigurasi. Isi <code className="font-mono text-[12.5px]">VITE_SUPABASE_PUBLISHABLE_KEY</code> pada berkas <code className="font-mono text-[12.5px]">.env.local</code>.</span>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          {mode === "preview" && (
            <div className="flex gap-3 rounded-xl border border-gold/30 bg-gold-soft p-3.5 text-[12.5px] leading-5 text-navy">
              <FlaskConical className="mt-0.5 size-4 shrink-0 text-gold-strong" />
              <span>Pratinjau desain tidak terhubung ke Supabase. Akun uji: <b>pic@pratinjau.smi</b>, <b>verifikator@pratinjau.smi</b>, atau <b>admin@pratinjau.smi</b> dengan kata sandi apa saja. Pada website mandiri, login memakai akun Supabase petugas.</span>
            </div>
          )}
          {(
            <>
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" autoComplete="username" placeholder="nama@kemendag.go.id" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="login-password">Kata sandi</Label>
                <div className="relative">
                  <Input id="login-password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-navy-400 hover:text-navy" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {err && (
                <div role="alert" className="flex gap-2.5 rounded-xl border border-bad/20 bg-bad-soft px-3.5 py-3 text-[13px] leading-5 text-bad">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" /> {err}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <LogIn />} Masuk</Button>
              <p className="text-center text-xs leading-5 text-navy-400">Lupa kata sandi atau akun belum aktif? Hubungi administrator SMI.</p>
            </>
          )}
        </form>
      )}
    </Dialog>
  );
}
