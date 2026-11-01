import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = { title: "Panel administratora", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader area="admin" />
      <main id="tresc" className="container-rp py-12 sm:py-16">
        {children}
      </main>
    </>
  );
}
