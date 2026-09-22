import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenirDossierParReference } from "@/lib/repository";
import PublicShell from "@/components/PublicShell";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const dossier = await obtenirDossierParReference(reference);

  if (!dossier) notFound();

  return (
    <PublicShell cardClassName="max-w-xl">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-vfm-marine sm:text-2xl">
          Votre dossier a bien été enregistré.
        </h1>
        <p className="mt-4 text-sm text-zinc-600">Référence</p>
        <p className="text-2xl font-bold tracking-wide text-vfm-marine sm:text-3xl">
          {dossier.reference}
        </p>
        <p className="mt-4 text-sm text-zinc-600">
          {dossier.statutSms === "envoye" &&
            `Un SMS de confirmation vous a été envoyé au numéro ${dossier.coordonnees.telephone}.`}
          {dossier.statutSms === "a_envoyer" &&
            `Un SMS de confirmation va être envoyé sous peu au numéro ${dossier.coordonnees.telephone}.`}
          {dossier.statutSms === "echoue" &&
            "Votre dossier est enregistré, mais le SMS de confirmation n'a pas pu être envoyé pour le moment."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-vfm-marine underline"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </PublicShell>
  );
}
