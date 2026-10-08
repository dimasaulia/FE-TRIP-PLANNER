import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

// Declared once; referenced through the `font-sans` / `font-mono` tokens.
export const brandSans = Bricolage_Grotesque({
  variable: "--font-brand-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const brandMono = JetBrains_Mono({
  variable: "--font-brand-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
