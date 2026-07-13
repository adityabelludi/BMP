import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { BRAND } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF9933",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.name} — ${BRAND.fullName} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name} — ${BRAND.fullName}`,
  },
  description:
    "Premium, traditional Karnataka masalas and chutney powders — stone-ground, pure and authentic. Pulihora, Bisi Bele Bath, Sambar, Vangi Bath and more, delivered across India.",
  keywords: [
    "Karnataka masala",
    "Bisi Bele Bath powder",
    "Sambar powder",
    "chutney powder",
    "Indian spices",
    "Belludi Masala",
    "Pulihora powder",
  ],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.fullName}`,
    description: BRAND.tagline,
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-background font-sans">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: { fontFamily: "var(--font-inter)" },
          }}
        />
      </body>
    </html>
  );
}
