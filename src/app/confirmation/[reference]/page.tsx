import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenirDossierParReference } from "@/lib/repository";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const dossier = await obtenirDossierParReference(reference);

  if (!dossier) notFound();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full rounded-lg border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-zinc-900">
          Votre dossier a bien été enregistré.
        </h1>
        <p className="mt-4 text-sm text-zinc-600">Référence</p>
        <p className="text-2xl font-bold tracking-wide text-zinc-900">{dossier.reference}</p>
        <p className="mt-4 text-sm text-zinc-600">
          {dossier.statutSms === "envoye"
            ? `Un SMS de confirmation vous a été envoyé au numéro ${dossier.coordonnees.telephone}.`
            : "Votre dossier est enregistré, mais le SMS de confirmation n'a pas pu être envoyé pour le moment."}
        </p>
      </div>
      <Link href="/" className="mt-8 text-sm font-medium text-zinc-700 underline">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
