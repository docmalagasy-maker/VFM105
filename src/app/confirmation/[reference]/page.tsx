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
          {/* Dossiers déposés avant l'ajout du district : « VFM » seul */}
          Misaotra anao ny VFM{dossier.association.district ? ` ${dossier.association.district}` : ""}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Voaray ny momba anao sy ny fikambananao.
        </p>
        <p className="mt-4 text-sm text-zinc-600">Laharana</p>
        <p className="text-2xl font-bold tracking-wide text-vfm-marine sm:text-3xl">
          {dossier.reference}
        </p>
        <p className="mt-4 text-sm text-zinc-600">
          {/* Le SMS est désactivé (src/lib/sms.ts) : seul l'e-mail, s'il est parti, est annoncé */}
          {dossier.emailConfirmation === "envoye" && dossier.coordonnees.email
            ? `Nalefa tany amin'ny ${dossier.coordonnees.email} ny mailaka fanamarinana misy ity laharana ity.`
            : "Tehirizo ity laharana ity."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-vfm-marine underline"
        >
          Hiverina any amin&apos;ny fandraisana
        </Link>
      </div>
    </PublicShell>
  );
}
