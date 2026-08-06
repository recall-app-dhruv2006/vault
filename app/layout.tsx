import type { Metadata } from "next";
import { brand } from "@/lib/config/brand";
import { ToastProvider } from "@/components/ui/toaster";
import "./globals.css";

/**
 * Font: uses the system font stack defined in globals.css (--font-sans)
 * rather than next/font/google, so the app builds without requiring
 * network access to Google Fonts at build time. To use Inter (or Geist)
 * with automatic self-hosting, swap in `next/font/google` here — it works
 * out of the box on Vercel and any environment with normal internet access.
 */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: `${brand.name} — ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    siteName: brand.name,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: brand.name, description: brand.description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
