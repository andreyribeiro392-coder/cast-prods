import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cast-prods.vercel.app"),
  title: { default: "CAST.PRODS | Achados e ofertas", template: "%s | CAST.PRODS" },
  description: "cast.prods — achados de moda, casa, tecnologia, beleza, academia, ferramentas, esporte e muito mais.",
  other: { "cast-theme": "midnight-store-v4" },
  icons: {
    icon: [{ url: "/cast-prods-logo.svg", type: "image/svg+xml" }],
    shortcut: "/cast-prods-logo.svg",
    apple: "/cast-prods-logo.svg",
  },
  openGraph: {
    title: "CAST.PRODS | Seu próximo achado começa aqui",
    description: "Achados organizados de moda, tecnologia, casa, beleza, academia e muito mais.",
    locale: "pt_BR",
    siteName: "CAST.PRODS",
    type: "website",
    images: [{ url: "/cast-pod-logo.png", alt: "CAST.PRODS" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#070609",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-theme="dark" lang="pt-BR">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
