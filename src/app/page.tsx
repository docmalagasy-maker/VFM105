import Link from "next/link";

export default function Accueil() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-zinc-900">VFM 105</h1>
      <p className="mt-3 max-w-md text-zinc-600">
        Déposez en ligne le dossier de votre association auprès du VFM — district
        d&apos;Ambohidratrimo.
      </p>
      <Link
        href="/deposer"
        className="mt-8 rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Déposer un dossier
      </Link>
    </div>
  );
}
