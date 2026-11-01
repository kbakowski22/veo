import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = { title: "Panel członka", robots: { index: false } };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader area="panel" />
      <main id="tresc" className="container-rp py-12 sm:py-16">
        {children}
      </main>
    </>
  );
}
