import type { Metadata } from "next";
import { Playfair_Display, Cinzel, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Two Valley — Luxury Fragrances & Artisanal Teas",
  description: "Sensory-rich luxury e-commerce platform bridging botanical perfume fields and mountain tea gardens.",
  icons: {
    icon: [
      { url: "/brand/two-valley-logo.png", type: "image/png" },
    ],
    shortcut: "/brand/two-valley-logo.png",
    apple: "/brand/two-valley-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${cinzel.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-brand-ivory text-brand-charcoal min-h-screen">
        {children}
      </body>
    </html>
  );
}
