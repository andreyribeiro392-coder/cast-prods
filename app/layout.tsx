import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cast.prods",
  description: "cast.prods — achados de moda, casa, tecnologia, beleza, academia, ferramentas, esporte e muito mais.",
  other: { "codex-preview": "development", "cast-theme": "joker-v2" },
  icons: {
    icon: [{ url: "/cast-prods-logo.svg", type: "image/svg+xml" }],
    shortcut: "/cast-prods-logo.svg",
    apple: "/cast-prods-logo.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#070609",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-theme="dark" lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
