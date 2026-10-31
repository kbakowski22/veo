import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { SITE } from "@/lib/content/site";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · Klub inwestorów nieruchomości`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
  },
  // [DO UZUPEŁNIENIA] grafika Open Graph 1200×630 (app/opengraph-image.png).
};

export const viewport: Viewport = {
  themeColor: "#F5F3EF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl-PL" className={`${geist.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Animacje „przy przewijaniu” ukrywają treść tylko wtedy, gdy działa JavaScript. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#tresc"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-on-dark"
        >
          Przejdź do treści
        </a>
        {children}
        <RevealObserver />
        <CookieBanner />
      </body>
    </html>
  );
}
