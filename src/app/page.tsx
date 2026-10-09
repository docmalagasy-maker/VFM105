import Link from "next/link";
import PublicShell from "@/components/PublicShell";

export default function Accueil() {
  return (
    <PublicShell cardClassName="max-w-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-vfm-marine sm:text-3xl">VFM 105</h1>
        <p className="mt-3 text-sm text-zinc-600 sm:text-base">
          Déposez en ligne le dossier de votre association auprès du VFM — district
          d&apos;Ambohidratrimo.
        </p>
        <Link
          href="/deposer"
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-vfm-vert px-6 py-4 text-base font-semibold text-white shadow-lg shadow-vfm-vert/25 transition-all hover:-translate-y-0.5 hover:bg-vfm-vert-dark"
        >
          Déposer un dossier
        </Link>
      </div>
    </PublicShell>
  );
}
