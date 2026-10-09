import type { Metadata } from "next";
import Link from "next/link";
import FormulaireConnexion from "./FormulaireConnexion";

export const metadata: Metadata = { title: "Connexion — Administration VFM" };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite } = await searchParams;
  // Retour uniquement vers une page de l'administration (pas de redirection externe)
  const destination = suite?.startsWith("/admin") && !suite.startsWith("//") ? suite : "/admin";
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Administration VFM</h1>
        <p className="mt-1 text-sm text-zinc-500">Connectez-vous avec votre identifiant.</p>
        <FormulaireConnexion destination={destination} />
        <p className="mt-6 border-t border-zinc-100 pt-4 text-sm text-zinc-500">
          Administrateur de district sans compte ?{" "}
          <Link href="/admin/inscription" className="font-medium text-zinc-900 underline">
            Demander un accès
          </Link>
        </p>
      </div>
    </div>
  );
}
