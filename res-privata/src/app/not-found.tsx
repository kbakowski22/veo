import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="tresc" className="container-rp py-24 sm:py-32">
        <p className="label-mono text-ink-3">Błąd 404</p>
        <h1 className="h2 mt-6">
          Tej strony nie ma.
          <span className="headline-soft">Wróćmy do konkretów.</span>
        </h1>
        <Link href="/" className="btn btn-primary mt-10">
          Strona główna
        </Link>
      </main>
      <Footer />
    </>
  );
}
