import { LOGO_SIMBOL_URL, LOGO_URL } from "@/config/env";
import { cn } from "@/lib/utils";

/**
 * Logo resmi Kementerian Perdagangan, memakai aset asli yang diunggah pemilik portal
 * (latar dibuat transparan tanpa mengubah bentuk atau proporsi).
 * variant "penuh" = simbol + tulisan; "simbol" = simbol saja; "putih" = versi pada latar gelap.
 */
export function BrandMark({ className, variant = "penuh" }: { className?: string; variant?: "penuh" | "simbol" | "putih" }) {
  if (variant === "putih") {
    return (
      <span className={cn("inline-flex items-center rounded-xl bg-white px-3 py-2", className)}>
        <img src={LOGO_URL} alt="Logo Kementerian Perdagangan Republik Indonesia" className="h-9 w-auto object-contain" />
      </span>
    );
  }
  return (
    <img
      src={variant === "simbol" ? LOGO_SIMBOL_URL : LOGO_URL}
      alt="Logo Kementerian Perdagangan Republik Indonesia"
      className={cn("w-auto shrink-0 object-contain", variant === "simbol" ? "h-10" : "h-11", className)}
    />
  );
}
