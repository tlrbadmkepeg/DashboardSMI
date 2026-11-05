/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        navy: { DEFAULT: "#142D4E", 900: "#0B1C33", 800: "#11263F", 700: "#1E3A5F", 600: "#2E4767", 500: "#41536F", 400: "#5A6A83", 300: "#8E9AAE" },
        gold: { DEFAULT: "#D9A441", soft: "#FBF4E4", strong: "#A97A20", light: "#F2D9A2" },
        teal: { DEFAULT: "#0F766E", soft: "#EBF7F5", strong: "#0B5E58" },
        canvas: "#F8FAFC",
        line: "#E5EAF1",
        accent: { DEFAULT: "#2563EB", soft: "#EFF4FF", strong: "#1D4ED8" },
        ok: { DEFAULT: "#15803D", soft: "#ECFDF3", mid: "#4ADE80", chart: "#22A06B" },
        warn: { DEFAULT: "#B45309", soft: "#FFF7E6", chart: "#F5A524" },
        bad: { DEFAULT: "#B42318", soft: "#FEF1F0", chart: "#E5484D" },
        nodata: { DEFAULT: "#64748B", soft: "#F1F5F9", chart: "#CBD5E1" },
      },
      borderRadius: { xl: "12px", "2xl": "16px" },
      boxShadow: {
        card: "0 1px 2px rgba(23,43,77,0.04), 0 4px 16px -8px rgba(23,43,77,0.08)",
        lift: "0 2px 4px rgba(23,43,77,0.05), 0 12px 32px -12px rgba(23,43,77,0.18)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0.001", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-up": "fade-up .35s ease-out both",
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
